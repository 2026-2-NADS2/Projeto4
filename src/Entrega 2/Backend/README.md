# KFKA — API da Entrega 2

API REST da **Plataforma de Acompanhamento Escolar KFKA**, desenvolvida em Node.js + Express 5 + PostgreSQL para a Entrega 2.

---

## Requisitos da entrega e onde estão atendidos

| Requisito | Implementação |
| --- | --- |
| API funcional com operações principais | Rotas de listagem, detalhe, criação e atualização de acompanhamentos; alunos, professores, bimestres e backoffice administrativo |
| Persistência em banco | PostgreSQL (Neon) via `pg`, com repositórios SQL parametrizados |
| Autenticação e rota protegida | Cadastro/login com bcrypt + JWT; rotas de dados exigem `Bearer` token |
| Validação e erros padronizados | Validação por campo e envelope padronizado de erro |
| Segredos fora do código | `.env` + `.env.example`; `JWT_SECRET` obrigatório |
| Integração front + back preparada para publicação | Front e back podem funcionar no mesmo processo; o Express serve `Frontend/dist` quando o build existe |
| Regras de negócio em POO | Services, Models e Repositories concentram validações, fluxo de acompanhamento, permissões e persistência |

---

## Stack

- **Node.js 20+** (testado também com Node 24)
- **Express 5**
- **PostgreSQL** hospedado no Neon
- **pg**
- **bcryptjs**
- **jsonwebtoken**
- **dotenv**
- **cors**
- **helmet**

---

## Arquitetura

```text
Requisição HTTP
   └── routes/
        validação de entrada + resposta HTTP
            └── services/
                 regras de negócio + autorização por perfil
                     └── data/
                          repositórios SQL
                              └── PostgreSQL / views
```

Responsabilidades principais:

- `models/`: representa as entidades utilizadas pelo domínio.
- `data/`: contém os repositórios responsáveis pelo acesso ao PostgreSQL.
- `services/`: concentra regras de negócio e coordenação das operações.
- `routes/`: recebe e responde requisições HTTP.
- `middlewares/`: autenticação JWT, tratamento de erros e controles HTTP.
- `utils/`: funções auxiliares de validação e normalização.
- `errors/`: erros de aplicação com código, status HTTP e detalhes.

Essa separação evita que regras de negócio fiquem diretamente nas rotas ou misturadas às consultas SQL.

---

## Regras de negócio — POO

A camada de POO do backend concentra as principais regras relacionadas aos acompanhamentos escolares.

### Validações de acompanhamento

Antes da criação ou alteração de um acompanhamento, o sistema realiza validações como:

- a média deve estar entre `0` e `10`;
- o vínculo acadêmico deve pertencer ao professor autenticado;
- o vínculo precisa estar ativo;
- o aluno deve pertencer à turma do vínculo;
- a matrícula deve ser compatível com o ano letivo do vínculo;
- o bimestre informado deve existir;
- quando a informação de ano letivo está disponível, o bimestre deve corresponder ao mesmo ano do vínculo;
- não pode existir acompanhamento duplicado para a mesma combinação de aluno, vínculo e bimestre.

As validações são realizadas na camada de serviço antes da persistência.

### Fluxo de status

Os acompanhamentos seguem um fluxo controlado.

Fluxo principal:

```text
RASCUNHO
   ↓
ENVIADO_REVISAO
   ↓
EM_REVISAO
   ↓
PUBLICADO
```

Também existem os estados:

```text
DEVOLVIDO
CANCELADO
```

Regras principais:

- `RASCUNHO` pode ser enviado para revisão ou cancelado;
- `ENVIADO_REVISAO` pode entrar em revisão, ser devolvido ou cancelado;
- `EM_REVISAO` pode ser publicado, devolvido ou cancelado;
- `DEVOLVIDO` pode voltar para rascunho, ser reenviado ou cancelado;
- `PUBLICADO` encerra o fluxo normal;
- `CANCELADO` encerra o fluxo.

Transições incompatíveis com o estado atual são rejeitadas pela camada de serviço.

Para compatibilidade com o frontend, o valor `enviado` é normalizado internamente para `ENVIADO_REVISAO`.

### Permissões por perfil

**Professor**

O professor pode:

- consultar dados dentro do próprio escopo;
- visualizar os próprios vínculos;
- criar acompanhamentos dos próprios vínculos;
- editar acompanhamentos permitidos;
- alterar descrição e média enquanto o acompanhamento estiver editável;
- enviar o acompanhamento para revisão.

O professor não pode publicar acompanhamentos.

**Administrador**

O administrador possui acesso ao backoffice e pode:

- consultar os dados administrativos;
- acompanhar o fluxo dos acompanhamentos;
- colocar acompanhamento em revisão;
- devolver acompanhamento;
- publicar acompanhamento;
- cancelar acompanhamento conforme o estado atual;
- consultar a auditoria.

**Responsável**

O responsável possui acesso de consulta.

Ele pode visualizar apenas:

- alunos aos quais está vinculado;
- acompanhamentos publicados desses alunos.

O responsável não possui permissão para alterar o fluxo dos acompanhamentos.

### Histórico e auditoria

Mudanças relevantes de status são registradas no histórico.

Os registros podem conter:

- acompanhamento alterado;
- usuário responsável;
- estado anterior;
- novo estado;
- data e hora;
- observação.

Isso permite rastrear o fluxo de revisão e publicação.

---

## Estrutura

```text
Backend/
├── src/
│   ├── app.js
│   ├── data/
│   │   ├── AcompanhamentoRepository.js
│   │   ├── AdminRepository.js
│   │   ├── AlunoRepository.js
│   │   ├── BimestreRepository.js
│   │   ├── ConexaoBanco.js
│   │   ├── HistoricoAcompanhamentoRepository.js
│   │   ├── ProfessorRepository.js
│   │   ├── ResponsavelRepository.js
│   │   └── UsuarioRepository.js
│   ├── errors/
│   │   └── ErroAplicacao.js
│   ├── middlewares/
│   │   ├── autenticacao.js
│   │   └── erros.js
│   ├── models/
│   │   ├── Acompanhamento.js
│   │   ├── Aluno.js
│   │   ├── Professor.js
│   │   └── Usuario.js
│   ├── routes/
│   │   └── rotas da API
│   ├── services/
│   │   ├── AcompanhamentoService.js
│   │   ├── AdminService.js
│   │   ├── AlunoService.js
│   │   ├── AutenticacaoService.js
│   │   ├── ProfessorService.js
│   │   ├── SistemaEscolar.js
│   │   └── TokenService.js
│   └── utils/
├── test/
│   └── api.test.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

---

## Como executar

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar o `.env`

Use `.env.example` como modelo.

O `.env` real deve permanecer apenas na máquina local e **não deve ser versionado**.

Exemplo:

```env
PORT=3000

DATABASE_HOST=seu-host
DATABASE_PORT=5432
DATABASE_NAME=seu-banco
DATABASE_USER=seu-usuario
DATABASE_PASSWORD=sua-senha
DATABASE_SSL=true

JWT_SECRET=seu-segredo
JWT_EXPIRES_IN=8h

CORS_ORIGIN=http://localhost:5173
```

### 3. Gerar um `JWT_SECRET`

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copie o resultado para:

```env
JWT_SECRET=
```

O segredo real não deve ser colocado no GitHub.

### 4. Iniciar a API

```bash
npm start
```

Durante o desenvolvimento:

```bash
npm run dev
```

Também é possível executar diretamente:

```bash
node server.js
```

Por padrão:

```text
http://localhost:3000
```

A API utiliza:

```text
http://localhost:3000/api
```

> **Observação sobre a rede da FECAP:** em testes realizados na rede da instituição, conexões externas diretas ao PostgreSQL/Neon pela porta `5432` podem ser bloqueadas. Caso ocorra timeout de conexão, teste o backend em outra rede. Essa restrição é da rede utilizada e não da configuração da aplicação.

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `JWT_SECRET` | Sim | Segredo utilizado na assinatura dos tokens JWT |
| `DATABASE_HOST` | Sim | Host PostgreSQL |
| `DATABASE_PORT` | Sim | Porta PostgreSQL |
| `DATABASE_NAME` | Sim | Nome do banco |
| `DATABASE_USER` | Sim | Usuário do banco |
| `DATABASE_PASSWORD` | Sim | Senha do banco |
| `DATABASE_SSL` | Não | `true` para Neon; pode ser `false` em PostgreSQL local |
| `PORT` | Não | Porta HTTP, padrão `3000` |
| `JWT_EXPIRES_IN` | Não | Validade do JWT, padrão `8h` |
| `CORS_ORIGIN` | Não | Origens permitidas |

---

## Scripts

| Script | Função |
| --- | --- |
| `npm start` | Inicia a API |
| `npm run dev` | Inicia em modo de desenvolvimento |
| `npm test` | Executa a suíte automatizada |

---

## Rotas

As rotas protegidas utilizam:

```text
Authorization: Bearer <token>
```

Os caminhos utilizam o prefixo:

```text
/api
```

### Públicas

| Método | Rota | Função |
| --- | --- | --- |
| `GET` | `/api/status` | Verifica disponibilidade da API |
| `POST` | `/api/auth/registro` | Cadastro público de responsável |
| `POST` | `/api/auth/login` | Login e emissão do JWT |

### Protegidas

| Método | Rota | Perfis | Função |
| --- | --- | --- | --- |
| `GET` | `/api/auth/me` | Todos | Dados do usuário autenticado |
| `GET` | `/api/alunos` | Todos, com escopo | Lista alunos |
| `GET` | `/api/alunos/:id` | Todos, com escopo | Detalha aluno |
| `GET` | `/api/acompanhamentos` | Todos, com escopo | Lista acompanhamentos |
| `GET` | `/api/acompanhamentos/:id` | Todos, com escopo | Detalha acompanhamento |
| `POST` | `/api/acompanhamentos` | Professor | Cria acompanhamento |
| `PATCH` | `/api/acompanhamentos/:id` | Professor | Edita acompanhamento e permite envio |
| `GET` | `/api/professores` | Administrador | Lista professores |
| `GET` | `/api/professores/me/vinculos` | Professor | Lista os próprios vínculos |
| `GET` | `/api/professores/:id/vinculos` | Administrador ou próprio professor | Lista vínculos |
| `GET` | `/api/bimestres` | Autenticados | Lista bimestres |

### Filtros de acompanhamentos

`GET /api/acompanhamentos` aceita:

```text
idAluno
idBimestre
idTurma
idDisciplina
idProfessor
status
```

---

## Backoffice administrativo

As rotas administrativas exigem perfil `administrador`.

| Recurso | Rota | Operações |
| --- | --- | --- |
| Alunos | `/api/admin/alunos` | listar, criar, detalhar, atualizar e desativar |
| Responsáveis do aluno | `/api/admin/alunos/:id/responsaveis` | listar, vincular e desvincular |
| Matrículas do aluno | `/api/admin/alunos/:id/matriculas` | listar, matricular e desmatricular |
| Professores | `/api/admin/professores` | listar, criar, detalhar, atualizar e desativar |
| Responsáveis | `/api/admin/responsaveis` | listar, criar, detalhar, atualizar e desativar |
| Turmas | `/api/admin/turmas` | listar, criar, detalhar, atualizar e desativar |
| Alunos da turma | `/api/admin/turmas/:id/alunos` | listar |
| Vínculos da turma | `/api/admin/turmas/:id/vinculos` | listar |
| Áreas | `/api/admin/areas` | listar, criar, detalhar, atualizar e desativar |
| Disciplinas | `/api/admin/disciplinas` | listar, criar, detalhar, atualizar e desativar |
| Vínculos pedagógicos | `/api/admin/vinculos` | listar, criar, detalhar, atualizar e desativar |
| Anos letivos | `/api/admin/anos-letivos` | listar, criar, detalhar, atualizar e desativar |
| Bimestres | `/api/admin/bimestres` | listar, criar, detalhar, atualizar e excluir |
| Revisão | `PATCH /api/admin/acompanhamentos/:id/status` | Altera status |
| Auditoria | `GET /api/admin/auditoria` | Consulta histórico |

O status administrativo aceita:

```text
em_revisao
devolvido
publicado
cancelado
```

---

## Escopo por perfil

- **Administrador:** visualiza e administra os dados do backoffice.
- **Professor:** visualiza alunos e acompanhamentos associados aos próprios vínculos.
- **Responsável:** visualiza alunos vinculados e acompanhamentos com status `PUBLICADO`.

O histórico interno não é retornado para o responsável.

---

## Criação de acompanhamento

Exemplo:

```json
{
  "idAluno": 9,
  "idVinculo": 1,
  "idBimestre": 1,
  "descricao": "Descrição do acompanhamento escolar.",
  "media": 8.5
}
```

A criação gera inicialmente:

```text
RASCUNHO
```

A API valida as regras de negócio antes da persistência.

---

## Atualização de acompanhamento

A rota:

```text
PATCH /api/acompanhamentos/:id
```

permite alterações previstas pela API, como:

```text
descricao
media
status
```

O professor só pode editar acompanhamentos em estados permitidos, como:

```text
RASCUNHO
DEVOLVIDO
```

O envio para revisão registra a mudança no histórico.

---

## Autenticação

`POST /api/auth/login` recebe:

```json
{
  "email": "usuario@email.com",
  "senha": "senha",
  "perfil": "professor"
}
```

Em caso de sucesso:

```json
{
  "token": "...",
  "usuario": {}
}
```

Os tokens utilizam JWT e possuem tempo de expiração configurável por:

```env
JWT_EXPIRES_IN=
```

O cadastro público permite a criação de contas de responsável.

Professores e administradores são cadastrados pela escola/backoffice.

As senhas são armazenadas com bcrypt.

---

## Formato das respostas

### Sucesso

```json
{
  "sucesso": true,
  "dados": {}
}
```

### Erro

```json
{
  "sucesso": false,
  "erro": {
    "codigo": "dados_invalidos",
    "mensagem": "Verifique os campos informados.",
    "detalhes": {
      "media": "O valor máximo é 10."
    }
  }
}
```

---

## Principais códigos de erro

| HTTP | Código | Situação |
| --- | --- | --- |
| `400` | `parametro_invalido` / `json_invalido` | ID inválido ou JSON malformado |
| `401` | `token_ausente` / `token_invalido` | Token ausente ou inválido |
| `401` | `sem_conta` / `senha` | Credenciais incorretas |
| `403` | `acesso_negado` / `perfil_sem_permissao` | Perfil sem permissão |
| `403` | `outro_perfil` / `usuario_inativo` | Perfil divergente ou conta inativa |
| `404` | `*_nao_encontrado` | Recurso inexistente |
| `409` | `email_em_uso` / `acompanhamento_duplicado` | Conflito |
| `413` | `corpo_muito_grande` | Corpo acima do limite |
| `422` | `dados_invalidos` / `status_invalido` | Validação |
| `503` | `banco_indisponivel` | Falha de conexão com PostgreSQL |
| `500` | `erro_interno` | Erro interno não tratado |

---

## Banco de dados

A aplicação utiliza PostgreSQL e trabalha com tabelas como:

```text
usuario
professor
responsavel
aluno
aluno_responsavel
turma
disciplina
turma_disciplina_professor
ano_letivo
bimestre
acompanhamento
historico_acompanhamento
```

Views utilizadas:

```text
vw_acompanhamento_completo
vw_acompanhamentos_publicados_responsavel
vw_professor_turmas_disciplinas
vw_historico_acompanhamento_detalhado
vw_resumo_aluno_bimestre
```

As consultas utilizam parâmetros como:

```text
$1
$2
$3
```

evitando interpolação direta de entrada do usuário.

---

## Testes

Execute:

```bash
npm test
```

Resultado validado após a integração da camada de POO com o backend:

```text
tests 16
pass 16
fail 0
```

**16 testes executados e 16 aprovados.**

A suíte automatizada cobre:

- status público;
- bloqueio de rota sem token;
- normalização de perfil;
- listagem de alunos pelo administrador;
- cadastro público de responsável;
- hash de senha;
- login;
- escopo do responsável;
- criação e envio de acompanhamento pelo professor;
- validação de campos;
- consulta dos próprios vínculos pelo professor;
- proteção das rotas administrativas;
- criação de alunos;
- validação de matrícula duplicada;
- criação de professor pelo backoffice;
- autenticação da conta criada.

Os arquivos `teste*.js` existentes na raiz são verificações manuais antigas e podem depender de conexão real com PostgreSQL.

A suíte automatizada oficial está em:

```text
test/api.test.js
```

---

## Frontend e publicação

Quando existe:

```text
Frontend/dist/index.html
```

o Express pode servir o build do frontend.

Para gerar o build:

```bash
cd ../Frontend
npm install
npm run build
```

Depois, no backend:

```bash
npm start
```

A API permanece disponível em:

```text
/api
```

Para publicação externa, configure um serviço Node com as variáveis de ambiente necessárias.

Exemplos:

- Render
- Railway
- Fly.io
- VPS

---

## Segurança

Medidas utilizadas:

- `.env` ignorado pelo Git;
- segredos armazenados em variáveis de ambiente;
- senhas armazenadas com bcrypt;
- senhas não são devolvidas pelas rotas;
- autenticação JWT;
- autorização aplicada no backend;
- consultas SQL parametrizadas;
- CORS configurável;
- `helmet` para cabeçalhos HTTP;
- erros internos não expõem detalhes do banco ao cliente;
- validações de perfil feitas no servidor;
- regras de negócio mantidas na camada de serviços.

O frontend não é considerado uma barreira de segurança; a autorização é validada pelo backend.