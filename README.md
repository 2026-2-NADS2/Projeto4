# Projeto4
Projeto 4

# FECAP - Fundação de Comércio Álvares Penteado
 
<p align="center">
  <img width="225" height="225" alt="Fecap_imagem" src="https://github.com/user-attachments/assets/24c0ce36-f452-400a-9a6b-e71baa5f05f4" />
</p>
## KFKA - Plataforma de Acompanhamento Escolar
 
## Grupo COMMIT / Projeto Interdisciplinar
 
**Integrantes:** [Paulo Miguel Miranda Marcelli](https://www.linkedin.com/in/paulo-marcelli-06a7bb304/), [Cauã Santos Nascimento](https://www.linkedin.com/in/caua-nascimento/), [Pedro Henrique Santos da Silva](https://www.linkedin.com/in/pedrossilva15/), [Leonardo Zachello Encinas](https://www.linkedin.com/in/leonardozachello/) 
 
**Professores Orientadores:** [Eduardo Savino Gomes](https://www.linkedin.com/in/eduardo-savino-gomes-77833a10/), [Ronaldo Araujo Pinto](https://www.linkedin.com/in/ronaldo-araujo-pinto-3542811a/), [José Buesso](https://www.linkedin.com/in/jbuesso/), [Francisco (Chico) Escobar](https://www.linkedin.com/in/francisco-escobar/) e [Adriano Valente](https://www.linkedin.com/in/adriano-valente/).
 
---
 
## Descrição
 
A KFKA é uma empresa de desenvolvimento de software que propõe às equipes do 2º semestre do curso de Análise e Desenvolvimento de Sistemas a criação de uma aplicação web responsiva destinada a escolas de Ensino Fundamental.
 
Este projeto tem como objetivo desenvolver uma plataforma web responsiva que apoie o acompanhamento acadêmico bimestral e estabeleça um fluxo claro de comunicação entre professores, administração escolar e pais/responsáveis. O professor registra o andamento do aluno em cada disciplina — descrição qualitativa, média do bimestre e tags de acompanhamento. Antes de chegar à família, o registro passa pela revisão do Administrador da Escola, que pode alterar, devolver para ajustes ou publicar. O responsável visualiza apenas os relatórios publicados dos alunos aos quais está vinculado e pode gerar o documento em PDF.
 
## 🛠 Estrutura de pastas
 
---
```text
Raiz
├── Documentos/
│   ├── Entrega 1/
│   │   ├── BD/
│   │   ├── Desenvolvimento web fullstack/
│   │   ├── Design de Interface Digital/
│   │   ├── Estrutura de dados/
│   │   └── POO/
│   └── Entrega 2/
│       ├── BD/
│       ├── Desenvolvimento web fullstack/
│       ├── Design de Interface Digital/
│       ├── Estrutura de dados/
│       └── POO/
├── Imagens/
├── src/
│   ├── Entrega 1/
│   │   ├── Backend/    # Node.js + Express + PostgreSQL
│   │   └── Frontend/   # React + Vite (dados simulados)
│   └── Entrega 2/
│       ├── Backend/    # Node.js + Express + PostgreSQL + JWT
│       ├── Frontend/   # React + Vite integrado à API
│       └── DEPLOY.md   # como o deploy foi feito
├── .gitignore
└── README.md (Guia geral do projeto)
```

Os dois backends usam **Node.js com Express** e **PostgreSQL**. Na Entrega 2, o frontend React
consome a API e os dados persistem no banco; a Entrega 1 mantém a camada simulada do protótipo.

---
 
## 🔄 Fluxo do Sistema
 
**Administrador:**
Cadastra a estrutura escolar (alunos, professores, turmas, disciplinas, tags) e define os períodos de abertura/encerramento de cada bimestre.
 
**Professor:**
Registra o acompanhamento bimestral do aluno (descrição, média e tags) dentro do período autorizado, salva como rascunho e envia para revisão.
 
**Administrador (revisão):**
Recebe o registro enviado, revisa, altera se necessário, devolve para ajustes ou publica para a família — com rastreabilidade completa (usuário, data/hora, estado anterior e posterior).
 
**Pai/Responsável:**
Visualiza somente os relatórios publicados dos alunos vinculados ao seu cadastro, gera o PDF e pode registrar ciência/observação.
 
---
 
## 🎯 Objetivos
 
**Objetivo Geral:**
Desenvolver uma aplicação web responsiva, segura e integrada que permita registrar, revisar, publicar e acompanhar informações acadêmicas bimestrais de alunos do Ensino Fundamental, fortalecendo a comunicação entre escola, professores e responsáveis.
 
**Objetivos Específicos:**
- Implementar autenticação e controle de acesso por perfil (Administrador, Professor, Pai/Responsável)
- Estruturar cadastros de alunos, responsáveis, professores, disciplinas, turmas e tags
- Permitir configuração dos quatro bimestres e seus períodos de digitação
- Implementar o fluxo editorial: Rascunho → Enviado → Em revisão → Publicado (com Devolvido/Cancelado como alternativas)
- Oferecer relatórios gerenciais, geração de PDF e exportação de dados compatível com Excel
- Aplicar conceitos de Estrutura de Dados, Desenvolvimento Web Full Stack, Design de Interface Digital, Banco de Dados e Programação Orientada a Objetos em uma solução única
---
 
## 🗄 Banco de Dados
 
Entidades principais:
- Aluno
- Responsável
- Professor
- Turma
- Disciplina
- Área de Disciplina
- Acompanhamento (registro bimestral)
- Tag
- Bimestre
- Histórico/Auditoria
Relacionamentos:
- Responsável está vinculado a um ou mais Alunos (e um Aluno pode ter mais de um Responsável)
- Professor leciona Disciplinas em Turmas específicas
- Acompanhamento está associado a um único Aluno, Turma, Disciplina, Professor, Bimestre e Ano Letivo
- Acompanhamento pode possuir múltiplas Tags
- Histórico registra as transições de estado de cada Acompanhamento
Modelo conceitual/lógico/físico e scripts SQL documentados em
`Documentos/Entrega 1/BD` e `Documentos/Entrega 2/BD`.
 
---
 
## 🎨 Design
 
Protótipo navegável e design system desenvolvidos no Figma, cobrindo:
- Landing pública, seleção de perfil e login
- Módulo Administrador (cadastros, fila de revisão, relatórios)
- Módulo Professor (registro de acompanhamento)
- Módulo Pai/Responsável (consulta e geração de PDF)
Links do Figma: [Design de Interface Digital — Entrega 2](<Documentos/Entrega 2/Design de Interface Digital/README.md>).
 
---
 
## 🚀 Como executar
 
```bash
# Backend (Entrega 2)
cd "src/Entrega 2/Backend"
npm install
cp .env.example .env   # configurar PostgreSQL e JWT_SECRET
npm start
 
# Frontend (Entrega 2)
cd "src/Entrega 2/Frontend"
npm install
npm run dev
```
 
---

## 🌐 Aplicação publicada

- **Frontend (Vercel):** <https://project-kfka.vercel.app>
- **API (Railway):** <https://projeto4-production.up.railway.app/api>
- **Banco:** PostgreSQL no Neon

O registro de como o deploy foi feito (arquitetura, configuração e verificações) está em
[`src/Entrega 2/DEPLOY.md`](<src/Entrega 2/DEPLOY.md>).

---
