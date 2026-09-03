# Projeto4
Projeto 4

# FECAP - Fundação de Comércio Álvares Penteado
 
<p align="center">
  <img width="225" height="225" alt="Fecap_imagem" src="https://github.com/user-attachments/assets/24c0ce36-f452-400a-9a6b-e71baa5f05f4" />
</p>
## KFKA - Plataforma de Acompanhamento Escolar
 
## Grupo [N] / Projeto Interdisciplinar
 
**Integrantes:** [Paulo Miguel Miranda Marcelli](https://www.linkedin.com/in/paulo-marcelli-06a7bb304/), [Nome do Integrante 2](#), [Nome do Integrante 3](#)
 
**Professores Orientadores:** [Nome do Professor 1](#), [Nome do Professor 2](#), [Nome do Professor 3](#), [Nome do Professor 4](#), [Nome do Professor 5](#)
 
---
 
## Descrição
 
A KFKA é uma empresa de desenvolvimento de software que propõe às equipes do 2º semestre do curso de Análise e Desenvolvimento de Sistemas a criação de uma aplicação web responsiva destinada a escolas de Ensino Fundamental.
 
Este projeto tem como objetivo desenvolver uma plataforma web responsiva que apoie o acompanhamento acadêmico bimestral e estabeleça um fluxo claro de comunicação entre professores, administração escolar e pais/responsáveis. O professor registra o andamento do aluno em cada disciplina — descrição qualitativa, média do bimestre e tags de acompanhamento. Antes de chegar à família, o registro passa pela revisão do Administrador da Escola, que pode alterar, devolver para ajustes ou publicar. O responsável visualiza apenas os relatórios publicados dos alunos aos quais está vinculado e pode gerar o documento em PDF.
 
## 🛠 Estrutura de pastas
 
---
```text
Raiz
|
|--> documentos
|   |--> PI_2ADS_202602_KFKA.pdf (Documento do projeto interdisciplinar)
|   |--> modelo-dados (Modelo conceitual/lógico/físico do banco)
|   |--> arquitetura (Diagramas de arquitetura e classes)
|   |--> backlog.md (Backlog e critérios de aceitação)
|
|--> design
|   |--> figma (Link/export do protótipo e design system)
|   |--> guia-de-estilo.pdf
|
|--> backend
|   |--> src (API Node.js/Express)
|   |--> database (schema.sql e scripts de carga)
|   |--> .env.example
|   |--> postman (Collection exportada .json)
|
|--> frontend
|   |--> src (Componentes, páginas e serviços de API)
|   |--> public
|   |--> .env.example
|
|--> testes
|   |--> evidencias (prints/vídeos de execução)
|
|--> README.md (Guia geral do projeto)
```
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
Modelo conceitual/lógico/físico documentado na pasta `documentos/modelo-dados`.
 
---
 
## 🎨 Design
 
Protótipo navegável e design system desenvolvidos no Figma, cobrindo:
- Landing pública, seleção de perfil e login
- Módulo Administrador (cadastros, fila de revisão, relatórios)
- Módulo Professor (registro de acompanhamento)
- Módulo Pai/Responsável (consulta e geração de PDF)
Link do protótipo: `[inserir link do Figma]`
 
---
 
## 🚀 Como executar
 
```bash
# Backend
cd backend
npm install
cp .env.example .env   # configurar credenciais do MySQL
npm run dev
 
# Frontend
cd frontend
npm install
cp .env.example .env   # configurar URL base da API
npm run dev
```
 
---
