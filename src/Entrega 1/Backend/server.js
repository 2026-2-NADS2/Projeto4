const express = require("express");

const ConexaoBanco = require("./src/data/ConexaoBanco");
const AlunoRepository = require("./src/data/AlunoRepository");
const SistemaEscolar = require("./src/services/SistemaEscolar");

const app = express();
const PORT = 3000;

// Criação dos objetos que serão utilizados pelo sistema.
const banco = new ConexaoBanco();
const alunoRepository = new AlunoRepository(banco);
const sistemaEscolar = new SistemaEscolar(alunoRepository);

// Permite que o servidor receba informações no formato JSON.
app.use(express.json());

// Rota principal: apresenta informações sobre o sistema.
app.get("/", (req, res) => {
    const informacoes = sistemaEscolar.obterInformacoes();

    res.json(informacoes);
});

// Rota de consulta dos alunos cadastrados.
app.get("/alunos", async (req, res) => {
    try {
        const alunos = await sistemaEscolar.listarAlunos();

        res.json(alunos);
    } catch (erro) {
        console.error("Erro ao consultar alunos:", erro.message);

        res.status(503).json({
            erro: "Não foi possível consultar os alunos. Verifique a conexão com o banco de dados."
        });
    }
});

// Inicia o servidor local.
app.listen(PORT, () => {
    console.log(`Servidor KFKA iniciado em http://localhost:${PORT}`);
});