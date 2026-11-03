const bcrypt = require("bcryptjs");

class AutenticacaoService {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async autenticar(email, senha) {
        const usuario =
            await this.usuarioRepository.buscarPorEmail(email);

        if (usuario === null) {
            throw new Error("Usuário ou senha inválidos.");
        }

        if (!usuario.estaAtivo()) {
            throw new Error("Usuário inativo.");
        }

        const senhaValida = await bcrypt.compare(
            senha,
            usuario.senhaHash
        );

        if (!senhaValida) {
            throw new Error("Usuário ou senha inválidos.");
        }

        return usuario;
    }
}

module.exports = AutenticacaoService;