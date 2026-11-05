# KFKA — API da Entrega 2

API REST da **Plataforma de Acompanhamento Escolar KFKA**, desenvolvida em
Node.js + Express 5 + PostgreSQL para a Entrega 2 de Programação Orientada a
Objetos.

## Requisitos da entrega e onde estão atendidos

| Requisito | Implementação |
| --- | --- |
| API funcional com operações principais | Rotas de listagem, detalhe, criação e atualização de acompanhamentos; alunos, professores e bimestres |
| Persistência em banco | PostgreSQL (Neon) via `pg`, com repositórios SQL parametrizados |
| Autenticação e rota protegida | Cadastro/login com bcrypt + JWT; todas as rotas de dados exigem `Bearer` token |
| Validação e erros padronizados | Validação acumulada por campo (HTTP 422) e envelope único de erro |
| Segredos fora do código | `.env` + `.env.example`; `JWT_SECRET` obrigatório com 32+ caracteres |
| Aplicação publicada | Front e back no mesmo processo: o Express serve `Frontend/dist` |

## Stack

- **Node.js 20+** (testado com Node 24)
- **Express 5**
- **PostgreSQL** (Neon) com `pg`
- **bcryptjs** para hash de senhas (custo 12)
- **jsonwebtoken** para tokens JWT
- **dotenv**, **cors** e **helmet**

## Arquitetura

```text
Requisição HTTP
   └── routes/        validação de entrada + resposta HTTP
        └── services/ regras de negócio e autorização por perfil
             └── data/ repositórios SQL (queries parametrizadas)
                  └── PostgreSQL / views
```

- `models/` representa as entidades usadas nas regras (ex.: `Acompanhamento`).
- `middlewares/` concentra autenticação JWT, autorização por perfil e erros.
- `utils/validacao.js` valida e normaliza os campos; os erros são acumulados.
- `utils/asyncHandler.js` encaminha rejeições assíncronas ao middleware de erro.

## Estrutura

```text
Backend/
├── src/
│   ├── app.js                  # Monta middlewares, rotas e o frontend em dist/
│   ├── data/                   # Repositórios SQL e ConexaoBanco
│   ├── errors/ErroAplicacao.js # Erro com código, status e detalhes
│   ├── middlewares/            # autenticacao.js e erros.js
│   ├── models/                 # Usuario, Aluno, Acompanhamento
│   ├── routes/                 # auth, alunos, acompanhamentos, professores, catálogo
│   ├── services/               # Regras de negócio, JWT e autorização
│   └── utils/                  # Validação e asyncHandler
├── test/api.test.js            # Testes HTTP com repositórios em memória
├── .env.example
├── package.json
└── server.js                   # Composição das dependências e listen
```

## Como executar

**1.** Instale as dependências:

```bash
npm install
```

**2.** Crie o `.env` a partir do modelo e preencha os dados do PostgreSQL:

```bash
cp .env.example .env
```

**3.** Gere um segredo JWT aleatório e coloque em `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**4.** Inicie a API:

```bash
npm start        # produção/local
npm run dev      # desenvolvimento com --watch
```

A API fica em `http://localhost:3000/api`. O `.env` contém credenciais e
**nunca deve ser versionado**; use as variáveis de ambiente do provedor em
produção.

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `JWT_SECRET` | Sim | Segredo de assinatura, mínimo de 32 caracteres |
| `DATABASE_HOST` / `PORT` / `NAME` / `USER` / `PASSWORD` | Sim | Conexão PostgreSQL |
| `DATABASE_SSL` | Não | `true` (padrão) para Neon; `false` para Postgres local sem SSL |
| `PORT` | Não | Porta HTTP (padrão `3000`; provedores costumam definir) |
| `JWT_EXPIRES_IN` | Não | Validade do token (padrão `8h`) |
| `CORS_ORIGIN` | Não | Origens permitidas, separadas por vírgula; `*` reflete a origem |

## Scripts

| Script | O que faz |
| --- | --- |
| `npm start` | Inicia a API |
| `npm run dev` | Inicia com reinício automático |
| `npm test` | Executa os testes com o runner nativo do Node |

## Rotas

Todas as rotas de dados exigem `Authorization: Bearer <token>`. Os caminhos
abaixo incluem o prefixo `/api`.

### Públicas

| Método | Rota | Função |
| --- | --- | --- |
| `GET` | `/api/status` | Verificação de disponibilidade |
| `POST` | `/api/auth/registro` | Cadastro público de responsável |
| `POST` | `/api/auth/login` | Login e emissão do JWT |

### Protegidas

| Método | Rota | Perfis | Função |
| --- | --- | --- | --- |
| `GET` | `/api/auth/me` | Todos | Dados do usuário autenticado |
| `GET` | `/api/alunos` | Todos (escopo por perfil) | Lista alunos |
| `GET` | `/api/alunos/:id` | Todos (escopo por perfil) | Detalha aluno |
| `GET` | `/api/acompanhamentos` | Todos (escopo por perfil) | Lista acompanhamentos |
| `GET` | `/api/acompanhamentos/:id` | Todos (escopo por perfil) | Detalha acompanhamento |
| `POST` | `/api/acompanhamentos` | Professor | Cria acompanhamento como rascunho |
| `PATCH` | `/api/acompanhamentos/:id` | Professor | Edita descrição/média e envia |
| `GET` | `/api/professores` | Administrador | Lista professores |
| `GET` | `/api/professores/me/vinculos` | Professor | Vínculos do próprio docente |
| `GET` | `/api/professores/:id/vinculos` | Administrador ou o próprio professor | Vínculos do docente |
| `GET` | `/api/bimestres` | Todos autenticados | Lista bimestres |

**Filtros de `GET /api/acompanhamentos`:** `idAluno`, `idBimestre`, `idTurma`,
`idDisciplina`, `idProfessor` e `status`.

### Escopo por perfil

- **administrador:** vê todos os dados.
- **professor:** vê apenas alunos e acompanhamentos dos próprios vínculos.
- **responsavel:** vê apenas alunos vinculados e acompanhamentos `PUBLICADO`;
  o histórico interno não é devolvido.

### Corpo de criação de acompanhamento

```json
{
  "idAluno": 1,
  "idVinculo": 10,
  "idBimestre": 2,
  "descricao": "Texto entre 10 e 2000 caracteres.",
  "media": 8.5
}
```

`PATCH /api/acompanhamentos/:id` aceita `descricao`, `media` e `status`
(`rascunho` ou `enviado`). Só acompanhamentos em `RASCUNHO` ou `DEVOLVIDO`
podem ser editados; o envio registra a mudança em `historico_acompanhamento`.

## Autenticação

- `POST /api/auth/login` recebe `{ email, senha, perfil? }` e devolve
  `{ token, usuario }`.
- O perfil é opcional no login. Quando informado e diferente do perfil da conta,
  a API responde `403 outro_perfil` com o perfil correto em `detalhes.perfil`.
- O token usa `HS256`, `issuer: kfka-api`, `subject: <idUsuario>` e expira
  conforme `JWT_EXPIRES_IN`.
- O cadastro público cria **apenas** contas de `responsavel`; administradores e
  professores são cadastrados pela escola.
- Senhas usam bcrypt com custo 12 e limite de 72 bytes.

## Formato das respostas

Sucesso:

```json
{ "sucesso": true, "dados": {} }
```

Erro:

```json
{
  "sucesso": false,
  "erro": {
    "codigo": "dados_invalidos",
    "mensagem": "Verifique os campos informados.",
    "detalhes": { "media": "O valor máximo é 10." }
  }
}
```

### Principais códigos de erro

| HTTP | Código | Situação |
| --- | --- | --- |
| 400 | `parametro_invalido` / `json_invalido` | ID inválido ou JSON malformado |
| 401 | `token_ausente` / `token_invalido` | Sem token ou token expirado |
| 401 | `sem_conta` / `senha` | Credenciais incorretas |
| 403 | `acesso_negado` / `perfil_sem_permissao` | Perfil sem permissão |
| 403 | `outro_perfil` / `usuario_inativo` | Perfil divergente ou conta inativa |
| 404 | `*_nao_encontrado` | Recurso inexistente |
| 409 | `email_em_uso` / `acompanhamento_duplicado` | Conflito de unicidade |
| 413 | `corpo_muito_grande` | Corpo acima de 100 kB |
| 422 | `dados_invalidos` / `status_invalido` | Validação de campos |
| 503 | `banco_indisponivel` | Falha de conexão com PostgreSQL |
| 500 | `erro_interno` | Erro não tratado (sem detalhes internos) |

## Banco de dados

A API usa as tabelas `usuario`, `professor`, `responsavel`, `aluno`,
`aluno_responsavel`, `turma`, `disciplina`, `turma_disciplina_professor`,
`ano_letivo`, `bimestre`, `acompanhamento` e `historico_acompanhamento`, além
das views:

- `vw_acompanhamento_completo`
- `vw_acompanhamentos_publicados_responsavel`
- `vw_professor_turmas_disciplinas`
- `vw_historico_acompanhamento_detalhado`
- `vw_resumo_aluno_bimestre`

As consultas são parametrizadas e a criação/atualização de acompanhamento grava
o histórico na mesma operação (CTE), evitando estado parcial.

> A integração com o PostgreSQL não foi executada neste ambiente por ausência das
> credenciais reais. Os testes automatizados usam repositórios em memória.

## Testes

```bash
npm test
```

A suíte `test/api.test.js` sobe o Express em porta efêmera com repositórios
falsos e cobre:

- status público e bloqueio de rota sem token;
- login por perfil, perfil divergente e cadastro público;
- hash de senha e e-mail duplicado;
- escopo do responsável (apenas publicados);
- criação, envio e detalhe de acompanhamento pelo professor;
- validação 422 com detalhes por campo;
- vínculos do próprio professor.

Resultado atual: **11 testes, 11 aprovados** (`node --test`).

Os scripts `teste*.js` na raiz são verificações manuais antigas da Entrega 1 e
dependem de conexão real com o banco; não fazem parte de `npm test`.

## Frontend e publicação

O `app.js` serve o build do frontend quando `Frontend/dist/index.html` existe:

1. Gere o build na pasta do frontend:

   ```bash
   cd ../Frontend
   npm install
   npm run build
   ```

2. Inicie a API na pasta do backend: `npm start`.
3. Acesse `http://localhost:3000` — o Express entrega o React e mantém `/api`
   para a API. Qualquer rota interna do React cai no `index.html` (fallback de
   SPA compatível com Express 5).

Para publicar, configure um serviço Node (Render, Railway, Fly.io ou VPS) com o
build de `Frontend/dist` presente e as variáveis sensíveis no painel do
provedor. Use a mesma origem para front e back, ou defina `CORS_ORIGIN` com o
domínio exato do frontend. Nenhuma publicação externa foi feita automaticamente
por este repositório.

## Segurança

- Segredos apenas em variáveis de ambiente; `.env` ignorado pelo Git.
- Senhas nunca são devolvidas pelas rotas.
- Erros internos não expõem stack trace nem detalhes do banco.
- `helmet` adiciona cabeçalhos de segurança; CORS é restrito às origens
  configuradas.
- Consultas SQL usam parâmetros (`$1`, `$2`, ...), sem interpolação de entrada.
- A autorização é aplicada no servidor; o frontend não é a barreira de segurança.
