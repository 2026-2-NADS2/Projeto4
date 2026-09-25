# KFKA — Backend | Entrega 1 de POO

Backend da **Plataforma de Acompanhamento Escolar KFKA**, desenvolvido em JavaScript com Node.js e Express para a Entrega 1 de Programação Orientada a Objetos.

## Objetivo

Implementar a estrutura básica do backend, com classes responsáveis pela organização do sistema e integração com o banco de dados PostgreSQL.

A classe principal `SistemaEscolar` coordena as funcionalidades disponíveis e utiliza o `AlunoRepository` para solicitar a consulta de alunos.

## Tecnologias

* JavaScript e Node.js
* Express — servidor HTTP local
* PostgreSQL — banco de dados
* Neon — hospedagem do banco de dados
* `pg` — comunicação do Node.js com o PostgreSQL
* `dotenv` — leitura das configurações de ambiente

## Estrutura do projeto

```text
Backend/
├── src/
│   ├── data/
│   │   ├── AlunoRepository.js
│   │   └── ConexaoBanco.js
│   ├── models/
│   │   └── Aluno.js
│   └── services/
│       └── SistemaEscolar.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

**Responsabilidades das classes:**

* `SistemaEscolar`: classe principal que coordena as operações do sistema.
* `Aluno`: representa os dados de um aluno.
* `AlunoRepository`: executa a consulta SQL e transforma os registros retornados em objetos `Aluno`.
* `ConexaoBanco`: configura e fornece a conexão com o PostgreSQL.
* `server.js`: inicia o servidor local e disponibiliza as rotas HTTP.

## Como executar

**1.** Abra a pasta `Backend` no VS Code.

**2.** Instale as dependências pelo terminal:

```bash
npm install
```

**3.** Crie um arquivo `.env` na pasta `Backend`, utilizando o `.env.example` como modelo. Preencha o arquivo com os dados de conexão do PostgreSQL.

O arquivo `.env` contém informações privadas e **não deve ser enviado ao GitHub**.

**4.** Inicie o servidor:

```bash
npm start
```

O servidor será iniciado em `http://localhost:3000`.

## Rotas disponíveis

| Método | Rota      | Função                                                                        |
| ------ | --------- | ----------------------------------------------------------------------------- |
| GET    | `/`       | Retorna as informações gerais do sistema.                                     |
| GET    | `/alunos` | Consulta os alunos cadastrados no PostgreSQL e retorna os resultados em JSON. |

Para testar, abra no navegador:

* `http://localhost:3000`
* `http://localhost:3000/alunos`

A rota `/alunos` precisa de uma conexão válida com o banco de dados para retornar os registros.

## Situação dos testes

O backend foi executado localmente com Node.js e Express por meio
do comando `npm start`, ficando disponível em `http://localhost:3000`.

Testes realizados com sucesso:

- `GET /`: retornou as informações gerais do KFKA por meio da
  classe principal `SistemaEscolar`.
- `GET /alunos`: realizou uma consulta ao PostgreSQL hospedado no
  Neon e retornou, em formato JSON, os 12 alunos fictícios
  cadastrados no banco de dados.

A consulta de alunos utiliza a integração entre `server.js`,
`SistemaEscolar`, `AlunoRepository`, `ConexaoBanco` e a classe `Aluno`.

Esta é a estrutura inicial do backend para a Entrega 1 de POO.
As funcionalidades de acompanhamento escolar, histórico,
autenticação e demais operações do sistema ainda serão desenvolvidas
nas próximas etapas do projeto.

<img width="1600" height="869" alt="image" src="https://github.com/user-attachments/assets/dc26e786-de8f-48bc-a135-c4cdd1489b57" />

## ⚠️ Atenção — Teste fora da rede da FECAP

**Para testar a conexão com o banco de dados, execute o backend em um computador fora da rede da FECAP.**

Durante os testes realizados na faculdade, não foi possível estabelecer conexão com o PostgreSQL hospedado no Neon pela porta TCP 5432. Por esse motivo, a rota `/alunos` apresenta erro de tempo limite de conexão quando executada nessa rede.

Conforme orientação do professor, a avaliação da integração com o banco deve ser realizada **fora da rede da FECAP**, com acesso à internet e com o arquivo `.env` configurado com as credenciais corretas.

**O funcionamento já foi confirmado em um computador pessoal, fora da rede da FECAP:** a rota `http://localhost:3000/alunos` retornou os 12 alunos fictícios cadastrados no PostgreSQL.

A conexão também foi testada com sucesso no notebook de outro integrante, fora da rede da FECAP, confirmando que a consulta ao Neon não depende do computador utilizado no desenvolvimento.

