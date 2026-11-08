const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const criarAuthRoutes = require("./routes/authRoutes");
const criarAlunoRoutes = require("./routes/alunoRoutes");
const criarAcompanhamentoRoutes = require("./routes/acompanhamentoRoutes");
const criarProfessorRoutes = require("./routes/professorRoutes");
const criarCatalogoRoutes = require("./routes/catalogoRoutes");
const criarAdminRoutes = require("./routes/adminRoutes");
const {
    criarAutenticacaoMiddleware
} = require("./middlewares/autenticacao");
const { rotaNaoEncontrada, tratarErros } = require("./middlewares/erros");

function criarApp(dependencias) {
    const {
        autenticacaoService,
        alunoService,
        acompanhamentoService,
        professorService,
        adminService,
        bimestreRepository,
        config = {}
    } = dependencias;

    const app = express();
    const autenticar = criarAutenticacaoMiddleware(autenticacaoService);

    app.disable("x-powered-by");
    app.use(helmet());
    app.use(
        cors({
            origin: config.corsOrigin || "http://localhost:5173",
            credentials: true
        })
    );
    app.use(express.json({ limit: "100kb" }));

    app.get("/api/status", (req, res) => {
        res.json({
            sucesso: true,
            dados: {
                sistema: "KFKA - Plataforma de Acompanhamento Escolar",
                versao: "2.0.0",
                status: "Funcionando"
            }
        });
    });

    app.use("/api/auth", criarAuthRoutes(autenticacaoService, autenticar));
    app.use(
        "/api/alunos",
        criarAlunoRoutes(alunoService, autenticar)
    );
    app.use(
        "/api/acompanhamentos",
        criarAcompanhamentoRoutes(acompanhamentoService, autenticar)
    );
    app.use(
        "/api/professores",
        criarProfessorRoutes(professorService, autenticar)
    );
    app.use(
        "/api/admin",
        criarAdminRoutes(adminService, autenticar)
    );
    app.use(
        "/api",
        criarCatalogoRoutes(bimestreRepository, autenticar, adminService)
    );

    const caminhoFrontend =
        config.frontendDist ||
        path.resolve(__dirname, "../../Frontend/dist");
    const indexHtml = path.join(caminhoFrontend, "index.html");

    if (fs.existsSync(indexHtml)) {
        app.use(express.static(caminhoFrontend));

        app.use((req, res, next) => {
            if (req.path.startsWith("/api")) {
                return next();
            }

            res.sendFile(indexHtml);
        });
    }

    app.use("/api", rotaNaoEncontrada);
    app.use(rotaNaoEncontrada);
    app.use(tratarErros);

    return app;
}

module.exports = criarApp;
