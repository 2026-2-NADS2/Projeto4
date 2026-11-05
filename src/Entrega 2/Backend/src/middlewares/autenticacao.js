const ErroAplicacao = require("../errors/ErroAplicacao");

function criarAutenticacaoMiddleware(autenticacaoService) {
    return async function autenticar(req, res, next) {
        try {
            const cabecalho = req.get("Authorization") || "";
            const [tipo, token] = cabecalho.split(" ");

            if (tipo !== "Bearer" || !token) {
                throw new ErroAplicacao(
                    "token_ausente",
                    "Informe o token de acesso no cabeçalho Authorization.",
                    401
                );
            }

            req.usuario = await autenticacaoService.autenticarToken(token);
            next();
        } catch (erro) {
            next(erro);
        }
    };
}

function autorizar(...perfis) {
    return function verificarPerfil(req, res, next) {
        if (!req.usuario || !perfis.includes(req.usuario.perfil)) {
            return next(
                new ErroAplicacao(
                    "acesso_negado",
                    "Seu perfil não tem permissão para esta operação.",
                    403
                )
            );
        }

        next();
    };
}

module.exports = {
    criarAutenticacaoMiddleware,
    autorizar
};
