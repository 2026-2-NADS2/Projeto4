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

O servidor local e a integração da rota `/` com a classe `SistemaEscolar` foram testados com sucesso.

A rota `/alunos` foi testada **sem as credenciais do banco**, confirmando o tratamento de erro quando a conexão não está configurada.

**Pendente:** configurar a conexão com o Neon e confirmar que `/alunos` retorna os registros fictícios cadastrados no PostgreSQL. Este README será atualizado após o teste.
