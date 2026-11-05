const ErroAplicacao = require("../errors/ErroAplicacao");

class AlunoService {
    constructor(alunoRepository) {
        this.alunoRepository = alunoRepository;
    }

    mapear(aluno) {
        return {
            id: aluno.idAluno,
            nome: aluno.nome,
            dataNascimento: aluno.dataNascimento,
            matricula: aluno.matricula,
            ativo: aluno.ativo
        };
    }

    async listar(usuario) {
        let alunos;

        if (usuario.perfil === "administrador") {
            alunos = await this.alunoRepository.listarAlunos();
        } else if (usuario.perfil === "professor") {
            if (!usuario.professorId) {
                throw new ErroAplicacao(
                    "sem_vinculo_professor",
                    "Esta conta ainda não está vinculada a um professor.",
                    403
                );
            }

            alunos = await this.alunoRepository.listarPorProfessor(
                usuario.professorId
            );
        } else if (usuario.perfil === "responsavel") {
            if (!usuario.responsavelId) {
                return [];
            }

            alunos = await this.alunoRepository.listarPorResponsavel(
                usuario.responsavelId
            );
        } else {
            throw new ErroAplicacao(
                "perfil_sem_permissao",
                "Perfil sem permissão para consultar alunos.",
                403
            );
        }

        return alunos.map((aluno) => this.mapear(aluno));
    }

    async buscarPorId(idAluno, usuario) {
        const aluno = await this.alunoRepository.buscarPorId(idAluno);

        if (!aluno) {
            throw new ErroAplicacao(
                "aluno_nao_encontrado",
                "Aluno não encontrado.",
                404
            );
        }

        if (usuario.perfil === "professor") {
            const permitido =
                usuario.professorId &&
                (await this.alunoRepository.pertenceAoProfessor(
                    idAluno,
                    usuario.professorId
                ));

            if (!permitido) {
                throw new ErroAplicacao(
                    "acesso_negado",
                    "Você não tem acesso a este aluno.",
                    403
                );
            }
        }

        if (usuario.perfil === "responsavel") {
            const permitido =
                usuario.responsavelId &&
                (await this.alunoRepository.pertenceAoResponsavel(
                    idAluno,
                    usuario.responsavelId
                ));

            if (!permitido) {
                throw new ErroAplicacao(
                    "acesso_negado",
                    "Você não tem acesso a este aluno.",
                    403
                );
            }
        }

        if (usuario.perfil !== "administrador" &&
            usuario.perfil !== "professor" &&
            usuario.perfil !== "responsavel") {
            throw new ErroAplicacao(
                "perfil_sem_permissao",
                "Perfil sem permissão para consultar alunos.",
                403
            );
        }

        return this.mapear(aluno);
    }
}

module.exports = AlunoService;
