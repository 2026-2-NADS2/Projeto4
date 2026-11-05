const express = require("express");
const asyncHandler = require("../utils/asyncHandler");

function criarCatalogoRoutes(bimestreRepository, autenticar) {
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

    return router;
}

module.exports = criarCatalogoRoutes;
