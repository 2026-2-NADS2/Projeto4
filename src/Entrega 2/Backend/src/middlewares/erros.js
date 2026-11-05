const ErroAplicacao = require("../errors/ErroAplicacao");

function rotaNaoEncontrada(req, res) {
    res.status(404).json({
        sucesso: false,
        erro: {
            codigo: "rota_nao_encontrada",
            mensagem: `A rota ${req.method} ${req.originalUrl} não existe.`
        }
    });
}

function tratarErros(erro, req, res, next) {
    if (res.headersSent) {
        return next(erro);
    }

    if (erro instanceof ErroAplicacao) {
        return res.status(erro.status).json({
            sucesso: false,
            erro: {
                codigo: erro.codigo,
                mensagem: erro.message,
                ...(erro.detalhes ? { detalhes: erro.detalhes } : {})
            }
        });
    }

    if (erro && erro.type === "entity.parse.failed") {
        return res.status(400).json({
            sucesso: false,
            erro: {
                codigo: "json_invalido",
                mensagem: "O corpo da requisição não contém um JSON válido."
            }
        });
    }

    if (erro && erro.type === "entity.too.large") {
        return res.status(413).json({
            sucesso: false,
            erro: {
                codigo: "corpo_muito_grande",
                mensagem: "O corpo da requisição excede o limite permitido."
            }
        });
    }

    const codigosBanco = [
        "ECONNREFUSED",
        "ETIMEDOUT",
        "ENOTFOUND",
        "EHOSTUNREACH",
        "28P01",
        "3D000"
    ];

    if (
        erro &&
        (codigosBanco.includes(erro.code) ||
            erro.message === "As configurações de conexão com o banco estão incompletas.")
    ) {
        console.error("Banco de dados indisponível:", erro.message);

        return res.status(503).json({
            sucesso: false,
            erro: {
                codigo: "banco_indisponivel",
                mensagem:
                    "Não foi possível acessar o banco de dados. Tente novamente mais tarde."
            }
        });
    }

    console.error("Erro não tratado:", erro);

    return res.status(500).json({
        sucesso: false,
        erro: {
            codigo: "erro_interno",
            mensagem: "Erro interno do servidor."
        }
    });
}

module.exports = {
    rotaNaoEncontrada,
    tratarErros
};
