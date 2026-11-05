const ErroAplicacao = require("../errors/ErroAplicacao");
const { validarStatus } = require("../utils/validacao");

const STATUS_LISTA = [
    "RASCUNHO",
    "ENVIADO",
    "EM_REVISAO",
    "PUBLICADO",
    "DEVOLVIDO",
    "CANCELADO"
];

const STATUS_EDITAVEIS = ["RASCUNHO", "DEVOLVIDO"];
const STATUS_ENVIO = ["RASCUNHO", "ENVIADO"];

class AcompanhamentoService {
    constructor(
        acompanhamentoRepository,
        professorRepository,
        opcoes = {}
    ) {
        this.acompanhamentoRepository =
            acompanhamentoRepository;

        this.professorRepository =
            professorRepository;

        this.alunoRepository = opcoes.alunoRepository || null;
        this.bimestreRepository = opcoes.bimestreRepository || null;
    }

    validarMedia(media) {
        const valor = Number(media);

        if (
            Number.isNaN(valor) ||
            valor < 0 ||
            valor > 10
        ) {
            throw new ErroAplicacao(
                "media_invalida",
                "A média deve estar entre 0 e 10.",
                422,
                { media: "Use um valor entre 0 e 10." }
            );
        }

        return valor;
    }

    async validarVinculoProfessor(
        idProfessor,
        idVinculo
    ) {
        const vinculos =
            await this.professorRepository
                .listarVinculos(idProfessor);

        const vinculoEncontrado =
            vinculos.find(
                (vinculo) =>
                    Number(vinculo.id_vinculo) ===
                    Number(idVinculo)
            );

        if (!vinculoEncontrado) {
            throw new ErroAplicacao(
                "vinculo_invalido",
                "O professor não possui este vínculo acadêmico.",
                403
            );
        }

        if (!vinculoEncontrado.vinculo_ativo) {
            throw new ErroAplicacao(
                "vinculo_inativo",
                "O vínculo acadêmico está inativo.",
                409
            );
        }

        return vinculoEncontrado;
    }

    async validarNovoAcompanhamento(
        idProfessor,
        dados
    ) {
        const media =
            this.validarMedia(dados.media);

        const vinculo =
            await this.validarVinculoProfessor(
                idProfessor,
                dados.idVinculo
            );

        return {
            idAluno: dados.idAluno,
            idVinculo: dados.idVinculo,
            idBimestre: dados.idBimestre,
            descricao: dados.descricao,
            media: media,
            status: "RASCUNHO",
            vinculo: vinculo
        };
    }

    mapear(linha, incluirHistorico = null) {
        const saida = {
            id: linha.id_acompanhamento,
            aluno: {
                id: linha.id_aluno,
                nome: linha.aluno,
                matricula: linha.matricula_aluno
            },
            turma: {
                id: linha.id_turma,
                nome: linha.turma,
                anoSerie: linha.ano_serie,
                turno: linha.turno
            },
            disciplina: {
                id: linha.id_disciplina,
                nome: linha.disciplina
            },
            professor: {
                id: linha.id_professor,
                matricula: linha.matricula_professor
            },
            idBimestre: linha.id_bimestre,
            bimestre: linha.bimestre,
            anoLetivo: linha.ano_letivo,
            descricao: linha.descricao,
            media: linha.media === null ? null : Number(linha.media),
            situacao: linha.situacao_media,
            status: String(linha.status).toLowerCase(),
            criadoEm: linha.data_criacao,
            atualizadoEm: linha.data_atualizacao
        };

        if (incluirHistorico) {
            saida.historico = incluirHistorico.map((item) => ({
                id: item.id_historico,
                usuario: item.usuario,
                perfil: item.perfil,
                estadoAnterior: item.estado_anterior,
                estadoNovo: item.estado_novo,
                dataHora: item.data_hora,
                observacao: item.observacao
            }));
        }

        return saida;
    }

    escopoDoUsuario(usuario) {
        if (usuario.perfil === "administrador") {
            return {};
        }

        if (usuario.perfil === "professor") {
            if (!usuario.professorId) {
                throw new ErroAplicacao(
                    "sem_vinculo_professor",
                    "Esta conta ainda não está vinculada a um professor.",
                    403
                );
            }

            return { idProfessor: usuario.professorId };
        }

        if (usuario.perfil === "responsavel") {
            if (!usuario.responsavelId) {
                return null;
            }

            return { idResponsavel: usuario.responsavelId };
        }

        throw new ErroAplicacao(
            "perfil_sem_permissao",
            "Perfil sem permissão para consultar acompanhamentos.",
            403
        );
    }

    async listar(usuario, filtros = {}) {
        const escopo = this.escopoDoUsuario(usuario);

        if (escopo === null) {
            return [];
        }

        const consulta = { ...filtros, ...escopo };

        if (consulta.status) {
            consulta.status = validarStatus(consulta.status, STATUS_LISTA);
        }

        const linhas =
            await this.acompanhamentoRepository.listarCompletos(consulta);

        return linhas.map((linha) => this.mapear(linha));
    }

    async buscarPorId(idAcompanhamento, usuario) {
        const escopo = this.escopoDoUsuario(usuario);

        if (escopo === null) {
            throw new ErroAplicacao(
                "acesso_negado",
                "Você não tem acesso a este acompanhamento.",
                403
            );
        }

        const linha =
            await this.acompanhamentoRepository.buscarCompletoPorId(
                idAcompanhamento,
                escopo
            );

        if (!linha) {
            throw new ErroAplicacao(
                "acompanhamento_nao_encontrado",
                "Acompanhamento não encontrado.",
                404
            );
        }

        let historico = null;

        if (usuario.perfil !== "responsavel") {
            historico =
                await this.acompanhamentoRepository.listarHistorico(
                    idAcompanhamento
                );
        }

        return this.mapear(linha, historico);
    }

    async criar(usuario, dados) {
        if (usuario.perfil !== "professor") {
            throw new ErroAplicacao(
                "perfil_sem_permissao",
                "Apenas professores podem criar acompanhamentos.",
                403
            );
        }

        if (!usuario.professorId) {
            throw new ErroAplicacao(
                "sem_vinculo_professor",
                "Esta conta ainda não está vinculada a um professor.",
                403
            );
        }

        const media = this.validarMedia(dados.media);

        await this.validarVinculoProfessor(
            usuario.professorId,
            dados.idVinculo
        );

        if (this.alunoRepository) {
            const aluno = await this.alunoRepository.buscarPorId(
                dados.idAluno
            );

            if (!aluno) {
                throw new ErroAplicacao(
                    "aluno_nao_encontrado",
                    "Aluno não encontrado.",
                    404
                );
            }
        }

        if (this.bimestreRepository) {
            const bimestre = await this.bimestreRepository.buscarPorId(
                dados.idBimestre
            );

            if (!bimestre) {
                throw new ErroAplicacao(
                    "bimestre_nao_encontrado",
                    "Bimestre não encontrado.",
                    404
                );
            }
        }

        const duplicado =
            await this.acompanhamentoRepository.existeDuplicado(
                dados.idAluno,
                dados.idVinculo,
                dados.idBimestre
            );

        if (duplicado) {
            throw new ErroAplicacao(
                "acompanhamento_duplicado",
                "Já existe um acompanhamento deste aluno para este vínculo e bimestre.",
                409
            );
        }

        const idAcompanhamento =
            await this.acompanhamentoRepository.criar(
                {
                    idAluno: dados.idAluno,
                    idVinculo: dados.idVinculo,
                    idBimestre: dados.idBimestre,
                    descricao: dados.descricao,
                    media: media,
                    status: "RASCUNHO"
                },
                usuario.idUsuario
            );

        return await this.buscarPorId(idAcompanhamento, usuario);
    }

    async atualizar(usuario, idAcompanhamento, dados) {
        if (usuario.perfil !== "professor") {
            throw new ErroAplicacao(
                "perfil_sem_permissao",
                "Apenas professores podem alterar acompanhamentos.",
                403
            );
        }

        if (!usuario.professorId) {
            throw new ErroAplicacao(
                "sem_vinculo_professor",
                "Esta conta ainda não está vinculada a um professor.",
                403
            );
        }

        const atual =
            await this.acompanhamentoRepository.buscarPorId(idAcompanhamento);

        if (!atual) {
            throw new ErroAplicacao(
                "acompanhamento_nao_encontrado",
                "Acompanhamento não encontrado.",
                404
            );
        }

        await this.validarVinculoProfessor(
            usuario.professorId,
            atual.idVinculo
        );

        if (!atual.podeSerEditado()) {
            throw new ErroAplicacao(
                "acompanhamento_nao_editavel",
                "Este acompanhamento não pode mais ser editado neste status.",
                409,
                { status: atual.status }
            );
        }

        const campos = {};

        if (dados.descricao !== undefined) {
            campos.descricao = dados.descricao;
        }

        if (dados.media !== undefined) {
            campos.media = this.validarMedia(dados.media);
        }

        if (dados.status !== undefined) {
            campos.status = validarStatus(dados.status, STATUS_ENVIO);
        }

        if (Object.keys(campos).length === 0) {
            throw new ErroAplicacao(
                "nada_para_atualizar",
                "Informe ao menos um campo para atualizar.",
                422
            );
        }

        const statusMudou =
            campos.status !== undefined &&
            campos.status !== String(atual.status).toUpperCase();

        await this.acompanhamentoRepository.atualizar(
            idAcompanhamento,
            campos,
            {
                registrarHistorico: statusMudou,
                idUsuario: usuario.idUsuario,
                estadoAnterior: atual.status,
                observacao: statusMudou
                    ? `Status alterado de ${atual.status} para ${campos.status}`
                    : null
            }
        );

        return await this.buscarPorId(idAcompanhamento, usuario);
    }
}

module.exports = AcompanhamentoService;
