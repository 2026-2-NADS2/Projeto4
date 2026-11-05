const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { validarId } = require("../utils/validacao");

function criarAlunoRoutes(alunoService, autenticar) {
    const router = express.Router();

    router.use(autenticar);

    router.get(
        "/",
        asyncHandler(async (req, res) => {
            const alunos = await alunoService.listar(req.usuario);

            res.json({
                sucesso: true,
                dados: alunos
            });
        })
    );

    router.get(
        "/:id",
        asyncHandler(async (req, res) => {
            const id = validarId(req.params.id, "id");
            const aluno = await alunoService.buscarPorId(id, req.usuario);

            res.json({
                sucesso: true,
                dados: aluno
            });
        })
    );

    return router;
}

module.exports = criarAlunoRoutes;
