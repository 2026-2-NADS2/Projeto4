const ErroAplicacao = require("../errors/ErroAplicacao");
const { perfilParaApi } = require("../utils/perfil");

class ProfessorService {
    constructor(professorRepository) {
        this.professorRepository = professorRepository;
    }

    mapearVinculo(vinculo) {
        return {
            id: vinculo.id_vinculo,
            professor: {
                id: vinculo.id_professor,
                nome: vinculo.professor,
                email: vinculo.email_professor,
                matricula: vinculo.matricula_professor
            },
            turma: {
                id: vinculo.id_turma,
                nome: vinculo.turma,
                anoSerie: vinculo.ano_serie,
                turno: vinculo.turno
            },
            disciplina: {
                id: vinculo.id_disciplina,
                nome: vinculo.disciplina
            },
            anoLetivo: vinculo.ano_letivo,
            ativo: vinculo.vinculo_ativo
        };
    }

    async listar(usuario) {
        if (perfilParaApi(usuario.perfil) !== "administrador") {
            throw new ErroAplicacao(
                "acesso_negado",
                "Apenas a coordenação pode listar todos os professores.",
                403
            );
        }

        const professores = await this.professorRepository.listar();

        return professores.map((professor) => ({
            id: professor.id_professor,
            nome: professor.nome,
            email: professor.email,
            matricula: professor.matricula
        }));
    }

    async listarVinculos(usuario, idProfessor) {
        const perfil = perfilParaApi(usuario.perfil);
        const proprio =
            perfil === "professor" &&
            Number(usuario.professorId) === Number(idProfessor);

        if (perfil !== "administrador" && !proprio) {
            throw new ErroAplicacao(
                "acesso_negado",
                "Você não tem acesso aos vínculos deste professor.",
                403
            );
        }

        const vinculos =
            await this.professorRepository.listarVinculos(idProfessor);

        return vinculos.map((vinculo) => this.mapearVinculo(vinculo));
    }
}

module.exports = ProfessorService;
