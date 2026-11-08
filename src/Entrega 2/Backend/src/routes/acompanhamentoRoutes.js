const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const ErroAplicacao = require("../errors/ErroAplicacao");
const { autorizar } = require("../middlewares/autenticacao");
const {
    validarCampos,
    validarId
} = require("../utils/validacao");

function listaDeIds(valor, campo) {
    if (valor === undefined) {
        return undefined;
    }

    if (!Array.isArray(valor)) {
        throw new ErroAplicacao(
            "dados_invalidos",
            "Verifique os campos informados.",
            422,
            {
                [campo]: "Envie uma lista de identificadores."
            }
        );
    }

    return [...new Set(valor.map((item) => Number(item)))];
}

function opcional(req, campo) {
    const valor = req.query[campo];

    if (valor === undefined || valor === "") {
        return undefined;
    }

    return validarId(valor, campo);
}

function criarAcompanhamentoRoutes(acompanhamentoService, autenticar) {
    const router = express.Router();

    router.use(autenticar);

    router.get(
        "/",
        asyncHandler(async (req, res) => {
            const filtros = {
                idAluno: opcional(req, "idAluno"),
                idBimestre: opcional(req, "idBimestre"),
                idTurma: opcional(req, "idTurma"),
                idDisciplina: opcional(req, "idDisciplina"),
                idProfessor: opcional(req, "idProfessor"),
                status:
                    typeof req.query.status === "string"
                        ? req.query.status
                        : undefined
            };

            const acompanhamentos = await acompanhamentoService.listar(
                req.usuario,
                filtros
            );

            res.json({
                sucesso: true,
                dados: acompanhamentos
            });
        })
    );

    router.get(
        "/:id",
        asyncHandler(async (req, res) => {
            const id = validarId(req.params.id, "id");
            const acompanhamento =
                await acompanhamentoService.buscarPorId(id, req.usuario);

            res.json({
                sucesso: true,
                dados: acompanhamento
            });
        })
    );

    router.post(
        "/",
        autorizar("professor"),
        asyncHandler(async (req, res) => {
            const rascunho = req.body.rascunho === true;

            const dados = validarCampos(req.body, {
                idAluno: { tipo: "inteiro", obrigatorio: true },
                idVinculo: { tipo: "inteiro", obrigatorio: true },
                idBimestre: { tipo: "inteiro", obrigatorio: true },
                descricao: rascunho
                    ? { tipo: "texto", max: 2000 }
                    : {
                          tipo: "texto",
                          obrigatorio: true,
                          min: 10,
                          max: 2000
                      },
                media: rascunho
                    ? { tipo: "numero", min: 0, max: 10 }
                    : {
                          tipo: "numero",
                          obrigatorio: true,
                          min: 0,
                          max: 10
                      }
            });

            dados.idTags = listaDeIds(
                req.body.idTags,
                "idTags"
            );

            const acompanhamento = await acompanhamentoService.criar(
                req.usuario,
                dados
            );

            res.status(201).json({
                sucesso: true,
                dados: acompanhamento
            });
        })
    );

    router.patch(
        "/:id",
        autorizar("professor"),
        asyncHandler(async (req, res) => {
            const id = validarId(req.params.id, "id");
            const rascunho = req.body.rascunho === true;

            const dados = validarCampos(req.body, {
                descricao: {
                    tipo: "texto",
                    ...(rascunho ? {} : { min: 10 }),
                    max: 2000
                },
                media: {
                    tipo: "numero",
                    min: 0,
                    max: 10
                },
                status: {
                    tipo: "enum",
                    valores: ["rascunho", "enviado"]
                }
            });

            dados.idTags = listaDeIds(
                req.body.idTags,
                "idTags"
            );

            const acompanhamento =
                await acompanhamentoService.atualizar(
                    req.usuario,
                    id,
                    dados
                );

            res.json({
                sucesso: true,
                dados: acompanhamento
            });
        })
    );

    return router;
}

module.exports = criarAcompanhamentoRoutes;
