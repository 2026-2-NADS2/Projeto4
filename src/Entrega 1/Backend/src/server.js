// Carrega as variáveis do arquivo .env (DB_HOST, DB_PASSWORD, PORT, etc.)
require("dotenv").config();

// Importa o Express, framework que cria o servidor e as rotas
const express = require("express");

// Importa o CORS, que permite o frontend (outra origem/porta) chamar esta API
const cors = require("cors");

// Importa o driver mysql2, usado para conectar ao banco de dados
const mysql = require("mysql2");

// Cria a aplicação Express
const app = express();

// Habilita o CORS para todas as rotas
app.use(cors());

// Permite que o Express entenda requisições com corpo em JSON (ex: dados de um formulário)
app.use(express.json());

// Cria a conexão com o banco de dados MySQL, usando os dados do .env
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Testa a conexão com o banco assim que o servidor inicia
connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
        return;
    }
    console.log('Conectado ao banco de dados MySQL com sucesso!');
});

// Rota simples de teste, só para confirmar que o servidor está de pé
app.get('/', (req, res) => {
    res.send('API do KFKA está rodando.');
});

// Define a porta em que o servidor vai escutar (vem do .env, com um valor padrão caso não exista)
const PORT = process.env.PORT || 3000;

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});


