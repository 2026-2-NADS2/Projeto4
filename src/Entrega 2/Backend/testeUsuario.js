const ConexaoBanco = require("./src/data/ConexaoBanco");
const AlunoRepository = require("./src/data/AlunoRepository");
const UsuarioRepository = require("./src/data/UsuarioRepository");
const SistemaEscolar = require("./src/services/SistemaEscolar");

async function testarUsuario() {
    try {
        const banco = new ConexaoBanco();

        const alunoRepository = new AlunoRepository(banco);
        const usuarioRepository = new UsuarioRepository(banco);

        const sistemaEscolar = new SistemaEscolar(
            alunoRepository,
            usuarioRepository
        );

        const usuarioPorId =
            await sistemaEscolar.buscarUsuarioPorId(1);

        if (usuarioPorId === null) {
            console.log("Usuário não encontrado.");
            return;
        }

        console.log("Usuário encontrado por ID:");
        console.log({
            idUsuario: usuarioPorId.idUsuario,
            nome: usuarioPorId.nome,
            email: usuarioPorId.email,
            perfil: usuarioPorId.perfil,
            ativo: usuarioPorId.estaAtivo()
        });

        const usuarioPorEmail =
            await sistemaEscolar.buscarUsuarioPorEmail(
                usuarioPorId.email
            );

        console.log("\nUsuário encontrado por e-mail:");
        console.log({
            idUsuario: usuarioPorEmail.idUsuario,
            nome: usuarioPorEmail.nome,
            perfil: usuarioPorEmail.perfil
        });

    } catch (erro) {
        console.error("Erro durante o teste:", erro.message);
    }
}

testarUsuario();