# Projeto 4 — COMMIT

<p align="center">
  <img width="225" height="225" alt="FECAP" src="https://github.com/user-attachments/assets/24c0ce36-f452-400a-9a6b-e71baa5f05f4" />
</p>

<h1 align="center">KFKA — Plataforma de Acompanhamento Escolar</h1>

<p align="center">
  Projeto Interdisciplinar desenvolvido no 2º semestre do curso de Análise e Desenvolvimento de Sistemas da FECAP.
</p>

---

## 👥 Grupo COMMIT

### Integrantes

- [Paulo Miguel Miranda Marcelli](https://www.linkedin.com/in/paulo-marcelli-06a7bb304/)
- [Cauã Santos Nascimento](https://www.linkedin.com/in/caua-nascimento/)
- [Pedro Henrique Santos da Silva](https://www.linkedin.com/in/pedrossilva15/)
- [Leonardo Zachello Encinas](https://www.linkedin.com/in/leonardozachello/)

### Professores orientadores

- [Eduardo Savino Gomes](https://www.linkedin.com/in/eduardo-savino-gomes-77833a10/)
- [Ronaldo Araujo Pinto](https://www.linkedin.com/in/ronaldo-araujo-pinto-3542811a/)
- [José Buesso](https://www.linkedin.com/in/jbuesso/)
- [Francisco (Chico) Escobar](https://www.linkedin.com/in/francisco-escobar/)
- [Adriano Valente](https://www.linkedin.com/in/adriano-valente/)

---

# 📚 Sobre o projeto

O **KFKA — Acompanhamento Escolar** é uma plataforma web desenvolvida para apoiar o acompanhamento acadêmico bimestral de alunos do Ensino Fundamental.

A solução centraliza em um único ambiente digital o fluxo de comunicação entre **professores, coordenação escolar e responsáveis**, permitindo registrar, revisar, publicar e acompanhar informações sobre o desenvolvimento dos alunos.

O professor registra o acompanhamento de cada aluno com informações como descrição qualitativa, média e dados acadêmicos relacionados ao bimestre.

Antes de chegar à família, o registro passa por um fluxo de revisão realizado pela administração ou coordenação escolar. O acompanhamento pode ser revisado, devolvido para ajustes, publicado ou cancelado.

Depois da publicação, o responsável consegue consultar somente os relatórios dos alunos aos quais possui vínculo autorizado.

---

# 💡 Por que o projeto é importante?

O acompanhamento escolar envolve informações distribuídas entre professores, coordenação e famílias.

O KFKA busca tornar esse processo mais organizado, rastreável e acessível ao:

- centralizar os registros acadêmicos;
- melhorar a comunicação entre escola e família;
- organizar o acompanhamento bimestral dos alunos;
- controlar o fluxo de revisão e publicação;
- manter histórico das alterações realizadas;
- restringir o acesso às informações de acordo com cada perfil;
- facilitar a consulta do desenvolvimento escolar ao longo do ano.

---

# 🎯 Objetivos

## Objetivo geral

Desenvolver uma aplicação web responsiva, segura e integrada que permita registrar, revisar, publicar e acompanhar informações acadêmicas bimestrais de alunos do Ensino Fundamental.

## Objetivos específicos

- Implementar autenticação e controle de acesso por perfil;
- Permitir os perfis **Administrador, Professor e Responsável**;
- Estruturar cadastros de alunos, responsáveis, professores, disciplinas e turmas;
- Controlar vínculos entre professores, disciplinas e turmas;
- Organizar os quatro bimestres do ano letivo;
- Permitir ao professor registrar acompanhamentos;
- Implementar o fluxo de revisão antes da publicação;
- Disponibilizar ao responsável apenas os acompanhamentos publicados;
- Registrar histórico e auditoria das alterações;
- Persistir os dados em PostgreSQL;
- Integrar frontend, backend e banco de dados;
- Aplicar os conhecimentos das disciplinas do Projeto Interdisciplinar em uma única solução.

---

# 🔄 Fluxo do sistema

```text
PROFESSOR
   │
   │ cria o acompanhamento
   ▼
RASCUNHO
   │
   │ envia para revisão
   ▼
ENVIADO_REVISÃO
   │
   ▼
EM_REVISÃO
   │
   ├──────────────► DEVOLVIDO
   │                   │
   │                   └── professor ajusta e reenvia
   │
   ├──────────────► CANCELADO
   │
   ▼
PUBLICADO
   │
   ▼
RESPONSÁVEL
visualiza o acompanhamento
```

### Administrador / Coordenação

Responsável pela administração da estrutura escolar e pelo fluxo de revisão dos acompanhamentos.

Pode realizar operações relacionadas a:

- alunos;
- professores;
- responsáveis;
- turmas;
- disciplinas;
- vínculos acadêmicos;
- anos letivos;
- bimestres;
- revisão dos acompanhamentos;
- auditoria.

### Professor

Pode:

- visualizar seus vínculos acadêmicos;
- consultar seus alunos;
- registrar acompanhamentos;
- salvar registros como rascunho;
- editar registros permitidos;
- enviar acompanhamentos para revisão.

### Responsável

Pode:

- visualizar os alunos aos quais possui vínculo;
- consultar acompanhamentos publicados;
- acompanhar o histórico acadêmico disponibilizado pela escola.

---

# 🛠 Tecnologias utilizadas

## Frontend

- HTML5
- CSS3
- JavaScript
- React
- Vite

## Backend

- Node.js
- Express
- JavaScript
- JWT
- bcrypt

## Banco de Dados

- PostgreSQL
- Neon
- pg

## Design

- Figma

## Desenvolvimento e publicação

- Git
- GitHub
- Vercel
- Railway

---

# 🏗 Arquitetura

A aplicação da Entrega 2 funciona de forma integrada:

```text
┌─────────────────────┐
│      Frontend       │
│    React + Vite     │
└──────────┬──────────┘
           │
           │ HTTP / JSON
           ▼
┌─────────────────────┐
│       Backend       │
│  Node.js + Express  │
│     API REST        │
└──────────┬──────────┘
           │
           │ SQL
           ▼
┌─────────────────────┐
│     PostgreSQL      │
│       Neon          │
└─────────────────────┘
```

As regras de negócio são mantidas principalmente na camada de serviços do backend, enquanto os repositórios realizam o acesso ao PostgreSQL.

---

# 🗄 Banco de Dados

O banco de dados foi desenvolvido em PostgreSQL e contempla as entidades e relacionamentos necessários para o funcionamento da plataforma.

Entre as principais estruturas estão:

- Usuário;
- Administrador;
- Professor;
- Responsável;
- Aluno;
- Turma;
- Disciplina;
- Área;
- Ano Letivo;
- Bimestre;
- Vínculo entre professor, turma e disciplina;
- Matrícula de aluno em turma;
- Acompanhamento;
- Tags;
- Histórico do acompanhamento;
- Retorno do acompanhamento;
- Ciência do responsável.

O banco também possui:

- chaves primárias e estrangeiras;
- restrições de integridade;
- validações com `CHECK`;
- índices para consultas recorrentes;
- trigger para validação contextual dos acompanhamentos;
- views para consultas acadêmicas e relatórios;
- histórico para auditoria das alterações.

Os modelos, scripts e documentos das duas entregas estão disponíveis em:

```text
Documentos/Entrega 1/BD
Documentos/Entrega 2/BD
```

---

# 💻 Programação Orientada a Objetos

A camada de backend foi estruturada utilizando separação de responsabilidades entre:

```text
Models
   ↓
Repositories
   ↓
Services
   ↓
Routes
```

Entre as principais regras implementadas estão:

- validação da média entre 0 e 10;
- validação do vínculo acadêmico do professor;
- validação da matrícula do aluno na turma;
- compatibilidade entre vínculo, ano letivo e bimestre;
- controle do workflow dos acompanhamentos;
- controle de permissões por perfil;
- histórico e auditoria das alterações;
- integração com PostgreSQL.

---

# 🎨 Design de Interface Digital

O projeto possui interface responsiva para os diferentes perfis da plataforma.

Foram desenvolvidos fluxos e telas para:

- página pública;
- criação e acesso à conta;
- perfil administrativo;
- perfil professor;
- perfil responsável;
- cadastros;
- acompanhamento acadêmico;
- fila de revisão;
- relatórios;
- histórico.

A documentação de Design de Interface Digital está disponível em:

[Documentos/Entrega 2/Design de Interface Digital](Documentos/Entrega%202/Design%20de%20Interface%20Digital/)

---

# 📂 Estrutura do repositório

```text
Projeto4/
│
├── Documentos/
│   │
│   ├── Entrega 1/
│   │   ├── BD/
│   │   ├── Desenvolvimento web fullstack/
│   │   ├── Design de Interface Digital/
│   │   ├── Estrutura de dados/
│   │   └── POO/
│   │
│   ├── Entrega 2/
│   │   ├── BD/
│   │   ├── Desenvolvimento web fullstack/
│   │   ├── Design de Interface Digital/
│   │   ├── Estrutura de dados/
│   │   └── POO/
│   │
│   ├── README.md
│   ├── banner-commit.pdf
│   └── banner-commit.pptx
│
├── Imagens/
│
├── src/
│   │
│   ├── Entrega 1/
│   │   ├── Backend/
│   │   └── Frontend/
│   │
│   ├── Entrega 2/
│   │   ├── Backend/
│   │   ├── Frontend/
│   │   └── DEPLOY.md
│   │
│   └── README.md
│
├── .env.example
├── .gitignore
└── README.md
```

---



# 🚀 Como executar localmente

## Backend — Entrega 2

```bash
cd "src/Entrega 2/Backend"

npm install
```

Crie o arquivo `.env` utilizando `.env.example` como referência.

Depois execute:

```bash
npm start
```

A API ficará disponível, por padrão, em:

```text
http://localhost:3000/api
```

---

## Frontend — Entrega 2

Em outro terminal:

```bash
cd "src/Entrega 2/Frontend"

npm install
npm run dev
```

O Vite utilizará a configuração do projeto para comunicação com a API durante o desenvolvimento.

---

# 🌐 Aplicação publicada

A versão final da Entrega 2 está publicada nos seguintes serviços:

### Frontend — Vercel

https://project-kfka.vercel.app

### API — Railway

https://projeto4-production.up.railway.app/api

### Banco de Dados — Neon

PostgreSQL hospedado no Neon.

A documentação do processo de publicação está disponível em:

[`src/Entrega 2/DEPLOY.md`](src/Entrega%202/DEPLOY.md)

---


# 🤖 Uso de Inteligência Artificial

O uso de ferramentas de Inteligência Artificial no desenvolvimento foi documentado de acordo com o **Guia para o Uso Responsável de Inteligência Artificial na FECAP**.

O repositório contém declarações específicas sobre os usos realizados em cada disciplina e entrega.

O resumo geral e os links para as declarações completas estão disponíveis em:

[Documentos — Declarações de Uso de IA](Documentos/README.md)

As ferramentas de IA foram utilizadas como apoio em atividades como:

- discussão e estruturação de soluções;
- explicação de conceitos;
- revisão de código;
- identificação e correção de erros;
- validação de regras;
- interpretação de resultados;
- organização de testes;
- revisão de documentação.

As decisões finais, execução, testes e validação dos resultados permaneceram sob responsabilidade dos integrantes do projeto.

---

# 📄 Documentação

A documentação completa das disciplinas está organizada em:

- [Entrega 1](Documentos/Entrega%201/)
- [Entrega 2](Documentos/Entrega%202/)

Também estão disponíveis na pasta `Documentos`:

- declaração de uso de IA;
- documentos de Banco de Dados;
- materiais de POO;
- documentação Fullstack;
- materiais de Design;
- Estrutura de Dados;
- banner final do projeto.

---

