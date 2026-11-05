const ErroAplicacao =
    require("../errors/ErroAplicacao");

const { validarStatus } =
    require("../utils/validacao");

const {
    perfilParaApi
} = require("../utils/perfil");


const STATUS_LISTA = [
    "RASCUNHO",
    "ENVIADO_REVISAO",
    "EM_REVISAO",
    "PUBLICADO",
    "DEVOLVIDO",
    "CANCELADO"
];

const STATUS_ENVIO = [
    "RASCUNHO",
    "ENVIADO_REVISAO"
];


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

        this.alunoRepository =
            opcoes.alunoRepository || null;

        this.bimestreRepository =
            opcoes.bimestreRepository || null;
    }


    // =====================================================
    // NORMALIZAÇÕES
    // =====================================================

    normalizarPerfil(perfil) {
        return perfilParaApi(perfil);
    }


    normalizarStatus(status) {
        if (status === null || status === undefined) {
            return status;
        }

        const valor =
            String(status)
                .trim()
                .toUpperCase();

        // Compatibilidade com o Fullstack.
        if (valor === "ENVIADO") {
            return "ENVIADO_REVISAO";
        }

        return valor;
    }


    statusParaSaida(status) {
        const valor =
            this.normalizarStatus(status);

        // O frontend já utilizava "enviado".
        if (valor === "ENVIADO_REVISAO") {
            return "enviado";
        }

        return String(valor).toLowerCase();
    }


    // =====================================================
    // VALIDAÇÕES DE NEGÓCIO
    // =====================================================

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
                {
                    media:
                        "Use um valor entre 0 e 10."
                }
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


    async validarAlunoNoVinculo(
        idAluno,
        vinculo
    ) {
        if (!this.alunoRepository) {
            return true;
        }

        if (
            typeof this.alunoRepository
                .buscarPorId === "function"
        ) {
            const aluno =
                await this.alunoRepository
                    .buscarPorId(idAluno);

            if (!aluno) {
                throw new ErroAplicacao(
                    "aluno_nao_encontrado",
                    "Aluno não encontrado.",
                    404
                );
            }
        }

        const alunoMatriculado =
            await this.alunoRepository
                .verificarMatriculaEmTurma(
                    idAluno,
                    vinculo.id_turma,
                    vinculo.id_ano_letivo
                );

        if (!alunoMatriculado) {
            throw new ErroAplicacao(
                "aluno_fora_da_turma",
                "O aluno não pertence à turma deste vínculo acadêmico.",
                409
            );
        }

        return true;
    }


    async validarBimestreNoAno(
        idBimestre,
        vinculo
    ) {
        if (!this.bimestreRepository) {
            return null;
        }

        const bimestre =
            await this.bimestreRepository
                .buscarPorId(idBimestre);

        if (!bimestre) {
            throw new ErroAplicacao(
                "bimestre_nao_encontrado",
                "Bimestre não encontrado.",
                404
            );
        }

        const idAnoBimestre =
            bimestre.id_ano_letivo ??
            bimestre.idAnoLetivo ??
            bimestre.anoLetivoId;

        /*
         * Se o repository fornecer o ano letivo,
         * validamos também a compatibilidade com
         * o vínculo acadêmico.
         */
        if (
            idAnoBimestre !== undefined &&
            idAnoBimestre !== null &&
            Number(idAnoBimestre) !==
                Number(vinculo.id_ano_letivo)
        ) {
            throw new ErroAplicacao(
                "bimestre_ano_invalido",
                "O bimestre não pertence ao mesmo ano letivo do vínculo acadêmico.",
                409
            );
        }

        return bimestre;
    }


    async validarNovoAcompanhamento(
        idProfessor,
        dados
    ) {
        const media =
            this.validarMedia(
                dados.media
            );

        const vinculo =
            await this.validarVinculoProfessor(
                idProfessor,
                dados.idVinculo
            );

        await this.validarAlunoNoVinculo(
            dados.idAluno,
            vinculo
        );

        const bimestre =
            await this.validarBimestreNoAno(
                dados.idBimestre,
                vinculo
            );

        return {
            idAluno: dados.idAluno,
            idVinculo: dados.idVinculo,
            idBimestre: dados.idBimestre,
            descricao: dados.descricao,
            media: media,
            status: "RASCUNHO",
            vinculo: vinculo,
            bimestre: bimestre
        };
    }


    // =====================================================
    // MAPEAMENTO / CONSULTAS
    // =====================================================

    mapear(
        linha,
        incluirHistorico = null
    ) {
        const saida = {
            id: linha.id_acompanhamento,

            aluno: {
                id: linha.id_aluno,
                nome: linha.aluno,
                matricula:
                    linha.matricula_aluno
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
                matricula:
                    linha.matricula_professor
            },

            idBimestre:
                linha.id_bimestre,

            bimestre:
                linha.bimestre,

            anoLetivo:
                linha.ano_letivo,

            descricao:
                linha.descricao,

            media:
                linha.media === null
                    ? null
                    : Number(linha.media),

            situacao:
                linha.situacao_media,

            status:
                this.statusParaSaida(
                    linha.status
                ),

            criadoEm:
                linha.data_criacao,

            atualizadoEm:
                linha.data_atualizacao
        };

        if (incluirHistorico) {
            saida.historico =
                incluirHistorico.map(
                    (item) => ({
                        id:
                            item.id_historico,

                        usuario:
                            item.usuario,

                        perfil:
                            perfilParaApi(
                                item.perfil
                            ),

                        estadoAnterior:
                            item.estado_anterior,

                        estadoNovo:
                            item.estado_novo,

                        dataHora:
                            item.data_hora,

                        observacao:
                            item.observacao
                    })
                );
        }

        return saida;
    }


    escopoDoUsuario(usuario) {
        const perfil =
            this.normalizarPerfil(
                usuario.perfil
            );

        if (perfil === "administrador") {
            return {};
        }

        if (perfil === "professor") {
            if (!usuario.professorId) {
                throw new ErroAplicacao(
                    "sem_vinculo_professor",
                    "Esta conta ainda não está vinculada a um professor.",
                    403
                );
            }

            return {
                idProfessor:
                    usuario.professorId
            };
        }

        if (perfil === "responsavel") {
            if (!usuario.responsavelId) {
                return null;
            }

            return {
                idResponsavel:
                    usuario.responsavelId
            };
        }

        throw new ErroAplicacao(
            "perfil_sem_permissao",
            "Perfil sem permissão para consultar acompanhamentos.",
            403
        );
    }


    async listar(
        usuario,
        filtros = {}
    ) {
        const escopo =
            this.escopoDoUsuario(
                usuario
            );

        if (escopo === null) {
            return [];
        }

        const consulta = {
            ...filtros,
            ...escopo
        };

        if (consulta.status) {
            consulta.status =
                validarStatus(
                    this.normalizarStatus(
                        consulta.status
                    ),
                    STATUS_LISTA
                );
        }

        const linhas =
            await this
                .acompanhamentoRepository
                .listarCompletos(
                    consulta
                );

        return linhas.map(
            (linha) =>
                this.mapear(linha)
        );
    }


    async buscarPorId(
        idAcompanhamento,
        usuario
    ) {
        const escopo =
            this.escopoDoUsuario(
                usuario
            );

        if (escopo === null) {
            throw new ErroAplicacao(
                "acesso_negado",
                "Você não tem acesso a este acompanhamento.",
                403
            );
        }

        const linha =
            await this
                .acompanhamentoRepository
                .buscarCompletoPorId(
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

        if (
            this.normalizarPerfil(
                usuario.perfil
            ) !== "responsavel"
        ) {
            historico =
                await this
                    .acompanhamentoRepository
                    .listarHistorico(
                        idAcompanhamento
                    );
        }

        return this.mapear(
            linha,
            historico
        );
    }


    // =====================================================
    // CRIAÇÃO
    // =====================================================

    async criar(
        usuario,
        dados
    ) {
        if (
            this.normalizarPerfil(
                usuario.perfil
            ) !== "professor"
        ) {
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

        const media =
            this.validarMedia(
                dados.media
            );

        const vinculo =
            await this.validarVinculoProfessor(
                usuario.professorId,
                dados.idVinculo
            );

        await this.validarAlunoNoVinculo(
            dados.idAluno,
            vinculo
        );

        await this.validarBimestreNoAno(
            dados.idBimestre,
            vinculo
        );

        const duplicado =
            await this
                .acompanhamentoRepository
                .existeDuplicado(
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
            await this
                .acompanhamentoRepository
                .criar(
                    {
                        idAluno:
                            dados.idAluno,

                        idVinculo:
                            dados.idVinculo,

                        idBimestre:
                            dados.idBimestre,

                        descricao:
                            dados.descricao,

                        media: media,

                        status:
                            "RASCUNHO"
                    },

                    usuario.idUsuario
                );

        return await this.buscarPorId(
            idAcompanhamento,
            usuario
        );
    }


    // =====================================================
    // EDIÇÃO PELO PROFESSOR
    // =====================================================

    async atualizar(
        usuario,
        idAcompanhamento,
        dados
    ) {
        if (
            this.normalizarPerfil(
                usuario.perfil
            ) !== "professor"
        ) {
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
            await this
                .acompanhamentoRepository
                .buscarPorId(
                    idAcompanhamento
                );

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
                {
                    status:
                        atual.status
                }
            );
        }

        const campos = {};

        if (
            dados.descricao !==
            undefined
        ) {
            campos.descricao =
                dados.descricao;
        }

        if (
            dados.media !==
            undefined
        ) {
            campos.media =
                this.validarMedia(
                    dados.media
                );
        }

        if (
            dados.status !==
            undefined
        ) {
            campos.status =
                validarStatus(
                    this.normalizarStatus(
                        dados.status
                    ),
                    STATUS_ENVIO
                );
        }

        if (
            Object.keys(campos)
                .length === 0
        ) {
            throw new ErroAplicacao(
                "nada_para_atualizar",
                "Informe ao menos um campo para atualizar.",
                422
            );
        }

        const statusAtual =
            this.normalizarStatus(
                atual.status
            );

        const statusMudou =
            campos.status !== undefined &&
            campos.status !== statusAtual;

        if (statusMudou) {
            this.validarTransicaoStatus(
                statusAtual,
                campos.status
            );
        }

        await this
            .acompanhamentoRepository
            .atualizar(
                idAcompanhamento,
                campos,
                {
                    registrarHistorico:
                        statusMudou,

                    idUsuario:
                        usuario.idUsuario,

                    estadoAnterior:
                        atual.status,

                    observacao:
                        statusMudou
                            ? `Status alterado de ${atual.status} para ${campos.status}`
                            : null
                }
            );

        return await this.buscarPorId(
            idAcompanhamento,
            usuario
        );
    }


    // =====================================================
    // WORKFLOW
    // =====================================================

    validarTransicaoStatus(
        statusAtual,
        novoStatus
    ) {
        const atual =
            this.normalizarStatus(
                statusAtual
            );

        const novo =
            this.normalizarStatus(
                novoStatus
            );

        const transicoesPermitidas = {
            RASCUNHO: [
                "ENVIADO_REVISAO",
                "CANCELADO"
            ],

            ENVIADO_REVISAO: [
                "EM_REVISAO",
                "DEVOLVIDO",
                "CANCELADO"
            ],

            EM_REVISAO: [
                "PUBLICADO",
                "DEVOLVIDO",
                "CANCELADO"
            ],

            DEVOLVIDO: [
                "RASCUNHO",
                "ENVIADO_REVISAO",
                "CANCELADO"
            ],

            PUBLICADO: [],

            CANCELADO: []
        };

        const permitidos =
            transicoesPermitidas[
                atual
            ];

        if (!permitidos) {
            throw new ErroAplicacao(
                "status_atual_invalido",
                "Status atual inválido.",
                409
            );
        }

        if (
            !permitidos.includes(
                novo
            )
        ) {
            throw new ErroAplicacao(
                "transicao_invalida",
                `Transição de ${atual} para ${novo} não permitida.`,
                409
            );
        }

        return novo;
    }


    async validarPermissaoAlteracaoStatus(
        usuario,
        acompanhamento,
        novoStatus
    ) {
        if (!usuario) {
            throw new ErroAplicacao(
                "usuario_nao_encontrado",
                "Usuário não encontrado.",
                401
            );
        }

        if (usuario.ativo === false) {
            throw new ErroAplicacao(
                "usuario_inativo",
                "Usuário inativo.",
                403
            );
        }

        const perfil =
            this.normalizarPerfil(
                usuario.perfil
            );

        const novo =
            this.normalizarStatus(
                novoStatus
            );


        // ADMINISTRADOR
        if (
            perfil ===
            "administrador"
        ) {
            const statusPermitidos = [
                "EM_REVISAO",
                "DEVOLVIDO",
                "PUBLICADO",
                "CANCELADO"
            ];

            if (
                !statusPermitidos
                    .includes(novo)
            ) {
                throw new ErroAplicacao(
                    "alteracao_nao_permitida",
                    "O administrador não possui permissão para realizar esta alteração.",
                    403
                );
            }

            return true;
        }


        // PROFESSOR
        if (
            perfil ===
            "professor"
        ) {
            if (!usuario.professorId) {
                throw new ErroAplicacao(
                    "sem_vinculo_professor",
                    "Esta conta ainda não está vinculada a um professor.",
                    403
                );
            }

            await this
                .validarVinculoProfessor(
                    usuario.professorId,
                    acompanhamento.idVinculo
                );

            const statusPermitidos = [
                "ENVIADO_REVISAO",
                "CANCELADO"
            ];

            if (
                !statusPermitidos
                    .includes(novo)
            ) {
                throw new ErroAplicacao(
                    "alteracao_nao_permitida",
                    "O professor não possui permissão para realizar esta alteração.",
                    403
                );
            }

            return true;
        }


        throw new ErroAplicacao(
            "perfil_sem_permissao",
            "Este perfil não possui permissão para alterar o status de acompanhamentos.",
            403
        );
    }


    async alterarStatus(
        usuario,
        idAcompanhamento,
        novoStatus,
        observacao = null
    ) {
        const acompanhamento =
            await this
                .acompanhamentoRepository
                .buscarPorId(
                    idAcompanhamento
                );

        if (!acompanhamento) {
            throw new ErroAplicacao(
                "acompanhamento_nao_encontrado",
                "Acompanhamento não encontrado.",
                404
            );
        }

        const novo =
            this.validarTransicaoStatus(
                acompanhamento.status,
                novoStatus
            );

        await this
            .validarPermissaoAlteracaoStatus(
                usuario,
                acompanhamento,
                novo
            );

        await this
            .acompanhamentoRepository
            .atualizar(
                idAcompanhamento,
                {
                    status: novo
                },
                {
                    registrarHistorico:
                        true,

                    idUsuario:
                        usuario.idUsuario,

                    estadoAnterior:
                        acompanhamento.status,

                    observacao:
                        observacao ||
                        `Status alterado de ${acompanhamento.status} para ${novo}`
                }
            );

        return await this.buscarPorId(
            idAcompanhamento,
            usuario
        );
    }
}


module.exports =
    AcompanhamentoService;