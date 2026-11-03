const ConexaoBanco = require("./src/data/ConexaoBanco");
const AlunoRepository = require("./src/data/AlunoRepository");
const UsuarioRepository = require("./src/data/UsuarioRepository");

const SistemaEscolar =
    require("./src/services/SistemaEscolar");

const AutenticacaoService =
    require("./src/services/AutenticacaoService");

async function testarAutenticacao() {
    try {
        const banco = new ConexaoBanco();

        const alunoRepository =
            new AlunoRepository(banco);

        const usuarioRepository =
            new UsuarioRepository(banco);

        const autenticacaoService =
            new AutenticacaoService(usuarioRepository);

        const sistemaEscolar =
            new SistemaEscolar(
                alunoRepository,
                usuarioRepository,
                autenticacaoService
            );

        const usuario =
            await sistemaEscolar.autenticarUsuario(
                "admin@kfka.com",
                "Admin@123"
            );

        console.log("Login realizado com sucesso.");

        console.log({
            idUsuario: usuario.idUsuario,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil,
            ativo: usuario.ativo
        });

    } catch (erro) {
        console.error(
            "Erro na autenticação:",
            erro.message
        );
    }
}

testarAutenticacao();