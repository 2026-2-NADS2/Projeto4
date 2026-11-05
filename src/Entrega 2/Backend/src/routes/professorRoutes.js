const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const ErroAplicacao = require("../errors/ErroAplicacao");
const { validarId } = require("../utils/validacao");

function criarProfessorRoutes(professorService, autenticar) {
    const router = express.Router();

    router.use(autenticar);

    router.get(
        "/",
        asyncHandler(async (req, res) => {
            const professores = await professorService.listar(req.usuario);

            res.json({
                sucesso: true,
                dados: professores
            });
        })
    );

    router.get(
        "/me/vinculos",
        asyncHandler(async (req, res) => {
            if (!req.usuario.professorId) {
                throw new ErroAplicacao(
                    "sem_vinculo_professor",
                    "Esta conta ainda não está vinculada a um professor.",
                    403
                );
            }

            const vinculos = await professorService.listarVinculos(
                req.usuario,
                req.usuario.professorId
            );

            res.json({
                sucesso: true,
                dados: vinculos
            });
        })
    );

    router.get(
        "/:id/vinculos",
        asyncHandler(async (req, res) => {
            const id = validarId(req.params.id, "id");
            const vinculos = await professorService.listarVinculos(
                req.usuario,
                id
            );

            res.json({
                sucesso: true,
                dados: vinculos
            });
        })
    );

    return router;
}

module.exports = criarProfessorRoutes;
