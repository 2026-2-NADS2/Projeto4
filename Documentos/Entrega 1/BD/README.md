# KFKA — Plataforma de Acompanhamento Escolar

Projeto Interdisciplinar desenvolvido no curso de **Análise e Desenvolvimento de Sistemas da FECAP**, durante o 2º semestre de 2026.

O KFKA é uma plataforma de acompanhamento escolar voltada para o registro e consulta de informações acadêmicas, permitindo a interação entre administração, professores e responsáveis.

## Banco de Dados

O projeto utiliza **PostgreSQL 18**.

O banco foi desenvolvido inicialmente em ambiente local utilizando PostgreSQL e pgAdmin 4. Posteriormente, a base foi migrada para o **Neon**, permitindo o acesso remoto ao mesmo banco por diferentes máquinas e preparando o projeto para a futura integração com o backend.

A estrutura atual possui:

- 19 tabelas;
- chaves primárias e estrangeiras;
- constraints de integridade;
- trigger para validação dos acompanhamentos;
- dados fictícios para testes;
- índices para melhoria de consultas;
- controle de acesso através de roles do PostgreSQL.

## Acesso ao Banco

As credenciais reais de acesso ao banco não são armazenadas neste repositório.

Foram definidos diferentes usuários de acordo com a necessidade de acesso:

- `KFKA_owner` — administração do banco;
- `caua_dev` — desenvolvimento e manipulação dos dados;
- `kfka_grupo` — acesso compartilhado de leitura para os integrantes do grupo.

O usuário `kfka_grupo` possui apenas permissão de consulta (`SELECT`), não podendo inserir, alterar ou excluir dados.

As credenciais completas são compartilhadas de forma privada entre os integrantes que precisam acessar o banco.

## Variáveis de Ambiente

O arquivo `.env.example` apresenta a estrutura necessária para configurar a conexão com o PostgreSQL.

Exemplo:

```env
# PostgreSQL - Neon

DATABASE_HOST=HOST_DO_NEON
DATABASE_PORT=5432
DATABASE_NAME=KFKA
DATABASE_USER=kfka_grupo
DATABASE_PASSWORD=SENHA_DO_BANCO
DATABASE_SSL=require
