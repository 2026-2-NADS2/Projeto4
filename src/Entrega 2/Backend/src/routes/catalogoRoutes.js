const express = require("express");
const asyncHandler = require("../utils/asyncHandler");

function criarCatalogoRoutes(bimestreRepository, autenticar, adminService) {
    const router = express.Router();

    router.use(autenticar);

    router.get(
        "/bimestres",
        asyncHandler(async (req, res) => {
            const bimestres = await bimestreRepository.listar();

            res.json({
                sucesso: true,
                dados: bimestres
            });
        })
    );

    router.get(
        "/tags",
        asyncHandler(async (req, res) => {
            res.json({
                sucesso: true,
                dados: await adminService.listarTags()
            });
        })
    );

    router.get(
        "/areas",
        asyncHandler(async (req, res) => {
            res.json({
                sucesso: true,
                dados: await adminService.listarAreas()
            });
        })
    );

    router.get(
        "/disciplinas",
        asyncHandler(async (req, res) => {
            res.json({
                sucesso: true,
                dados: await adminService.listarDisciplinas()
            });
        })
    );

    return router;
}

module.exports = criarCatalogoRoutes;
