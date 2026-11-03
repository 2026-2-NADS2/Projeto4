const ConexaoBanco = require("./src/data/ConexaoBanco");
const AlunoRepository = require("./src/data/AlunoRepository");
const UsuarioRepository = require("./src/data/UsuarioRepository");
const ProfessorRepository = require("./src/data/ProfessorRepository");

const SistemaEscolar =
    require("./src/services/SistemaEscolar");

const AutenticacaoService =
    require("./src/services/AutenticacaoService");

async function testarProfessor() {
    try {
        const banco = new ConexaoBanco();

        const alunoRepository =
            new AlunoRepository(banco);

        const usuarioRepository =
            new UsuarioRepository(banco);

        const professorRepository =
            new ProfessorRepository(banco);

        const autenticacaoService =
            new AutenticacaoService(usuarioRepository);

        const sistemaEscolar =
            new SistemaEscolar(
                alunoRepository,
                usuarioRepository,
                professorRepository,
                autenticacaoService
            );

        const professor =
            await sistemaEscolar.buscarProfessorPorId(1);

        if (professor === null) {
            console.log("Professor não encontrado.");
            return;
        }

        console.log("Professor encontrado:");
        console.log({
            idProfessor: professor.idProfessor,
            nome: professor.nome,
            email: professor.email,
            matricula: professor.matricula,
            perfil: professor.perfil,
            ativo: professor.estaAtivo()
        });

        const vinculos =
            await sistemaEscolar.listarVinculosProfessor(
                professor.idProfessor
            );

        console.log("\nVínculos acadêmicos:");
        console.table(vinculos);

    } catch (erro) {
        console.error(
            "Erro durante o teste:",
            erro.message
        );
    }
}

testarProfessor();