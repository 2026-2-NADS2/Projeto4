const ErroAplicacao = require("../errors/ErroAplicacao");

const UNICOS = {
    uq_usuario_email: {
        campo: "email",
        mensagem: "Já existe uma conta com este e-mail."
    },
    uq_aluno_matricula: {
        campo: "matricula",
        mensagem: "Já existe um aluno com esta matrícula."
    },
    uq_professor_matricula: {
        campo: "matricula",
        mensagem: "Já existe um professor com esta matrícula."
    },
    uq_admin_matricula: {
        campo: "matricula",
        mensagem: "Já existe um administrador com esta matrícula."
    },
    uq_area_nome: {
        campo: "nome",
        mensagem: "Já existe uma área com este nome."
    },
    uq_ano_letivo_ano: {
        campo: "ano",
        mensagem: "Já existe um ano letivo cadastrado com este ano."
    },
    uq_bimestre_ano_numero: {
        campo: "numero",
        mensagem: "Este bimestre já está cadastrado para o ano letivo."
    },
    uq_tdp_vinculo: {
        campo: "vinculo",
        mensagem:
            "Este professor já leciona esta disciplina nesta turma para o ano letivo informado."
    }
};

const CHECKS = {
    ck_usuario_perfil: {
        campo: "perfil",
        mensagem: "Perfil inválido. Use ADMIN, PROFESSOR ou RESPONSAVEL."
    },
    ck_acompanhamento_status: {
        campo: "status",
        mensagem:
            "Status inválido. Use RASCUNHO, ENVIADO_REVISAO, EM_REVISAO, DEVOLVIDO, PUBLICADO ou CANCELADO."
    },
    ck_acompanhamento_media: {
        campo: "media",
        mensagem: "A média deve estar entre 0 e 10."
    },
    ck_ano_letivo_datas: {
        campo: "dataFim",
        mensagem: "A data de início do ano letivo deve ser anterior à data de fim."
    },
    ck_bimestre_datas: {
        campo: "dataFim",
        mensagem: "A data de início do bimestre não pode ser posterior à data de fim."
    },
    ck_bimestre_horarios: {
        campo: "horaFim",
        mensagem: "O horário de início do bimestre deve ser anterior ao horário de fim."
    },
    ck_bimestre_numero: {
        campo: "numero",
        mensagem: "O número do bimestre deve estar entre 1 e 4."
    },
    ck_turma_aluno_datas: {
        campo: "dataFim",
        mensagem: "A data de início da matrícula não pode ser posterior à data de fim."
    }
};

function responderErroBanco(erro, res) {
    if (erro.code === "23505") {
        const dados = UNICOS[erro.constraint];

        return res.status(409).json({
            sucesso: false,
            erro: {
                codigo: "registro_duplicado",
                mensagem:
                    dados?.mensagem ||
                    "Já existe um registro com estes dados.",
                ...(dados ? { detalhes: { [dados.campo]: dados.mensagem } } : {})
            }
        });
    }

    if (erro.code === "23503") {
        const detalhe = String(erro.detail || "");
        const referenciaAusente = detalhe.includes("is not present in table");

        return res.status(referenciaAusente ? 422 : 409).json({
            sucesso: false,
            erro: {
                codigo: referenciaAusente
                    ? "referencia_inexistente"
                    : "registro_em_uso",
                mensagem: referenciaAusente
                    ? "Um dos registros referenciados não existe."
                    : "Este registro está vinculado a outros dados e não pode ser removido ou alterado."
            }
        });
    }

    if (erro.code === "23514") {
        const dados = CHECKS[erro.constraint];

        return res.status(422).json({
            sucesso: false,
            erro: {
                codigo: "valor_invalido",
                mensagem:
                    dados?.mensagem ||
                    "Um dos valores informados não é permitido.",
                ...(dados ? { detalhes: { [dados.campo]: dados.mensagem } } : {})
            }
        });
    }

    if (erro.code === "23502") {
        return res.status(422).json({
            sucesso: false,
            erro: {
                codigo: "campo_obrigatorio",
                mensagem: "Um campo obrigatório não foi informado.",
                ...(erro.column
                    ? { detalhes: { [erro.column]: "Preencha este campo." } }
                    : {})
            }
        });
    }

    if (erro.code === "22P02") {
        return res.status(400).json({
            sucesso: false,
            erro: {
                codigo: "valor_invalido",
                mensagem: "Um dos valores enviados está em formato inválido."
            }
        });
    }

    if (erro.code === "P0001") {
        return res.status(409).json({
            sucesso: false,
            erro: {
                codigo: "regra_de_negocio",
                mensagem: erro.message
            }
        });
    }

    if (erro.code === "40001" || erro.code === "40P01") {
        return res.status(409).json({
            sucesso: false,
            erro: {
                codigo: "conflito_concorrencia",
                mensagem:
                    "A operação conflitou com outra alteração simultânea. Tente novamente."
            }
        });
    }

    return null;
}

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

    if (erro && erro.code) {
        const respostaBanco = responderErroBanco(erro, res);

        if (respostaBanco) {
            return respostaBanco;
        }
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
