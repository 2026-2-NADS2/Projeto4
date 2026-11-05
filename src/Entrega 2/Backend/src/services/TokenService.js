const jwt = require("jsonwebtoken");
const ErroAplicacao = require("../errors/ErroAplicacao");

class TokenService {
    constructor(segredo, expiracao = "8h") {
        if (!segredo || String(segredo).trim().length < 32) {
            throw new Error(
                "JWT_SECRET ausente ou curto. Defina um segredo com pelo menos 32 caracteres no ambiente."
            );
        }

        this.segredo = segredo;
        this.expiracao = expiracao;
    }

    emitir(usuario) {
        return jwt.sign(
            {
                perfil: usuario.perfil,
                nome: usuario.nome,
                email: usuario.email
            },
            this.segredo,
            {
                subject: String(usuario.idUsuario),
                expiresIn: this.expiracao,
                issuer: "kfka-api"
            }
        );
    }

    verificar(token) {
        try {
            return jwt.verify(token, this.segredo, {
                issuer: "kfka-api"
            });
        } catch {
            throw new ErroAplicacao(
                "token_invalido",
                "Sessão inválida ou expirada. Entre novamente.",
                401
            );
        }
    }
}

module.exports = TokenService;
