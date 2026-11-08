# KFKA — Frontend da Entrega 2

Aplicação em **React + Vite** do KFKA (acompanhamento escolar bimestral), migrada do
protótipo navegável da Entrega 2. A identidade visual e os fluxos foram preservados; a
navegação usa URLs reais com React Router.

> **Estado atual:** integrado à API Express/PostgreSQL de `../Backend`. Login, perfil,
> Estrutura, Registros, Revisão e CRUD de alunos persistem no banco; os arrays de
> `src/dados/dados.js` servem apenas de fallback até a hidratação inicial
> (`src/dados/carregarDados.js`). Publicado na Vercel.

---

## Stack

| Item | Versão |
| --- | --- |
| React / React DOM | 19 |
| React Router DOM | 7 |
| Vite | 8 |
| Prettier | 3 |

Requisitos: **Node.js 20+** e npm.

---

## Como rodar

```bash
npm install
npm run dev       # http://localhost:5173
```

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Serve localmente o conteúdo de `dist/` |
| `npm run format` | Formata `src/` e `index.html` com Prettier |
| `npm run format:check` | Verifica a formatação sem alterar arquivos |

### Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste:

```env
VITE_API_URL=/api
```

- Apenas variáveis com prefixo `VITE_` são expostas ao navegador.
- Em desenvolvimento, `/api` é encaminhado pelo proxy do Vite para
  `http://localhost:3000` (veja `vite.config.js`).
- **Nunca** coloque credenciais de banco ou chaves secretas em variáveis `VITE_*`:
  tudo isso vai para o bundle do cliente. Segredos pertencem ao back-end.

O proxy repassa o caminho **sem remover** o prefixo: o front chama `/api/...` e o
Express também monta as rotas em `/api/...` (veja `../Backend/src/app.js`).
Mantenha os dois alinhados para não gerar caminhos duplicados.

---

## Estrutura

```text
src/
├── App.jsx                  # Mapa de rotas e proteção por perfil
├── main.jsx                 # Providers globais (tema, avisos, autenticação)
├── componentes/             # Design system reutilizável
│   ├── LayoutApp.jsx        # Shell autenticado (sidebar, topbar, tabbar mobile)
│   ├── LayoutAuth.jsx       # Shell das telas de login/cadastro
│   ├── LayoutPublico.jsx    # Shell do site público
│   ├── RotaProtegida.jsx    # Guarda de rota por perfil
│   ├── BimTabs.jsx, LineChart.jsx, PageHead.jsx, StatusBadge.jsx, ...
│   └── icones.js            # Biblioteca interna de ícones SVG
├── contextos/
│   ├── AutenticacaoContexto.jsx  # Sessão, entrar, sair, cadastro
│   ├── AvisoContexto.jsx         # Toasts globais
│   └── TemaContexto.jsx          # Tema claro/escuro/sistema e acessibilidade
├── dados/
│   ├── dados.js             # Dados de fallback + helpers de leitura (api.*)
│   ├── carregarDados.js     # Hidratação dos arrays com os dados da API
│   └── status.js            # Rótulos, ícones e cores dos status
├── servicos/
│   └── api.js               # Cliente HTTP (token, envelope de erro, VITE_API_URL)
├── paginas/
│   ├── publico/             # Início, login, cadastro, documentos, erros
│   ├── admin/               # Coordenação
│   ├── professor/           # Docente
│   ├── familia/             # Responsável
│   └── comuns/              # Perfil e Configurações (compartilhados)
├── estilos/                 # tokens, base, layout, componentes e páginas
└── utilitarios/             # Formatadores, hooks e regras de família/professor
```

---

## Rotas

### Públicas

| Rota | Tela |
| --- | --- |
| `/` | Página inicial |
| `/entrar` | Escolha de perfil para entrar |
| `/entrar/:perfil` | Login do perfil (`administrador`, `professor`, `responsavel`) |
| `/criar-conta` | Escolha de perfil para cadastro |
| `/criar-conta/:perfil` | Formulário de cadastro |
| `/recuperar-senha` | Recuperação de senha (demonstração) |
| `/privacidade` | Política de privacidade / LGPD |
| `/documentacao` | Documentação do produto |
| `/sessao-expirada` | Aviso de sessão encerrada |
| `/acesso-negado` | Acesso não autorizado |
| `*` | Página 404 |

### Coordenação (`administrador`)

| Rota | Tela |
| --- | --- |
| `/admin/painel` | Painel geral |
| `/admin/alunos` | Lista de alunos |
| `/admin/alunos/novo` · `/admin/alunos/:id/editar` | Cadastro/edição de aluno |
| `/admin/professores` (+ `novo`, `:id/editar`) | Professores |
| `/admin/responsaveis` (+ `novo`, `:id/editar`) | Responsáveis |
| `/admin/turmas` · `/admin/turmas/:id` | Turmas e detalhe |
| `/admin/disciplinas` | Disciplinas |
| `/admin/vinculos` | Vínculos professor–turma–disciplina |
| `/admin/periodos` | Bimestres |
| `/admin/revisao` · `/admin/revisao/:id` | Fila de revisão e parecer |
| `/admin/relatorios` | Todos os relatórios |
| `/admin/auditoria` | Trilha de auditoria |
| `/admin/perfil` · `/admin/configuracoes` | Perfil e preferências |

### Professor (`professor`)

| Rota | Tela |
| --- | --- |
| `/professor/painel` | Início do professor |
| `/professor/turmas` · `/professor/turmas/:id` | Turmas e alunos |
| `/professor/alunos/:id` | Ficha do aluno |
| `/professor/registros` · `/professor/registros/:id` | Relatórios do docente |
| `/professor/registro/novo` | Novo acompanhamento |
| `/professor/registro/:id/editar` | Edição/rascunho |
| `/professor/registro/:id/previa` | Prévia antes do envio |
| `/professor/perfil` · `/professor/configuracoes` | Perfil e preferências |

### Família (`responsavel`)

| Rota | Tela |
| --- | --- |
| `/familia/selecionar` | Escolha do aluno (quando há mais de um) |
| `/familia/painel` | Acompanhamento do aluno |
| `/familia/relatorios` | Relatórios publicados (filtros por bimestre, disciplina e leitura) |
| `/familia/relatorios/:id` | Detalhe, ciência e observação |
| `/familia/historico` | Histórico por disciplina e bimestre |
| `/familia/imprimir/:id` | Versão para impressão/PDF |
| `/familia/perfil` · `/familia/configuracoes` | Perfil e preferências |

O aluno selecionado viaja em `?aluno=<id>` e é lembrado em `sessionStorage`
(`kfka-aluno-familia`). As telas de família só exibem registros de alunos vinculados
ao responsável e com status `publicado`; qualquer outro caso redireciona para
`/acesso-negado`.

---

## Contas de acesso

Não há contas embutidas no frontend. O login valida e-mail e senha na API; as contas
precisam existir no PostgreSQL — criadas pelo cadastro público de responsável ou pelo
backoffice de administrador (`npm run criar-admin` no backend).

O login é específico por perfil: credenciais usadas na aba errada são recusadas pela API
com o código `outro_perfil`. O cadastro público cria apenas usuários do tipo
`responsavel`.

---

## Autenticação e dados

- `src/servicos/api.js` é o cliente HTTP único: injeta `Authorization: Bearer <token>`,
  centraliza a URL base (`VITE_API_URL`) e converte o envelope de erro da API em exceção.
- `AutenticacaoContexto` chama `POST /auth/login`, guarda o token (`kfka.token`) e a
  sessão (`kfka-sessao`, em `sessionStorage` e, com "Lembrar de mim", `localStorage`).
- `src/dados/carregarDados.js` hidrata os arrays de `dados.js` com os endpoints da API
  (alunos, acompanhamentos, turmas, disciplinas, bimestres, tags e vínculos).
- `RotaProtegida` bloqueia rotas por perfil; sem sessão, redireciona para
  `/entrar/:perfil`.
- Preferências de tema/texto ficam em `localStorage` na chave `kfka-prefs`.
- O array de `dados.js` permanece como fallback até a primeira hidratação; depois disso,
  o que aparece na tela vem do banco.

---

## Integração com a API

A integração está implementada:

- **Camada HTTP:** `src/servicos/api.js`.
- **Hidratação:** `src/dados/carregarDados.js` (`hidratar(sessao)`) substitui os arrays
  fictícios pelos dados reais após o login.
- **Fluxos persistidos:** login/perfil (incluindo telefone), Estrutura (turmas,
  disciplinas, vínculos e períodos), Registros do professor (rascunho, envio e tags),
  Revisão do administrador (iniciar, ajustar conteúdo, devolver, cancelar e publicar) e
  CRUD de alunos (criar/editar/inativar/ativar, matrícula e responsáveis).
- **Família:** a API só devolve acompanhamentos publicados dos alunos vinculados ao
  responsável; o frontend não é a única barreira.
- **Formato:** a API devolve DTOs aninhados em camelCase; o mapeamento para o formato das
  telas fica em `carregarDados.js`.
- **Sessão:** token em `kfka.token` e dados mínimos do usuário em `kfka-sessao`; o guard
  `RotaProtegida` continua igual.

### Cuidados de produção

- **SPA fallback:** as rotas usam `BrowserRouter`, então o servidor precisa devolver
  `index.html` para URLs internas. Na Vercel isso é feito pelo `vercel.json`; localmente,
  pelo `express.static(dist)` em `../Backend/src/app.js`. Não use `app.get("*")`: a
  sintaxe é inválida no Express 5.
- **Prefixo `/api`:** o proxy do Vite e as rotas do Express usam `/api` sem `rewrite`.
  Mantenha os dois alinhados.
- **CORS:** com o frontend na Vercel e a API no Railway, configure `CORS_ORIGIN` no
  back-end com a origem exata (sem barra no final); não use `*`.
- **Cadastro:** a API só permite cadastro público de `responsavel`; contas de
  administrador/professor são criadas pelo backoffice.
- **`?dados=pior`:** `dados.js` lê `location.search` no carregamento do módulo para
  alternar o cenário de teste de design. É um recurso de desenvolvimento, fora do uso normal.
- **Bundle:** as rotas usam `React.lazy`/`Suspense`, então cada tela tem seu próprio
  chunk; o pacote inicial fica em torno de 308 kB (98 kB gzip).
- **`.env`:** o repositório mantém apenas `.env.example`; credenciais e segredos ficam
  nas variáveis dos provedores, nunca no bundle.

---

## Acessibilidade

O frontend mantém os recursos do protótipo:

- link "pular para o conteúdo" nas telas principais;
- foco visível e navegação por teclado;
- landmarks, `aria-*`, rótulos e mensagens `aria-live`;
- temas claro, escuro e automático (`html[data-theme]`);
- tamanho do texto em 4 níveis, espaçamento de leitura, links sublinhados e redução
  de animações;
- status nunca dependem só de cor (ícone + texto).

---

## Build e publicação

```bash
npm run build     # saída em dist/
npm run preview   # conferência local
```

**Deploy atual:** <https://project-kfka.vercel.app> (Vercel, root `src/Entrega 2/Frontend`).

- A API está no Railway em <https://projeto4-production.up.railway.app/api> e o frontend a
  encontra por `VITE_API_URL` (tipo **Config**, embutida no build — ao mudar o valor, faça
  Redeploy).
- O `vercel.json` define o build (`npm run build`), a saída (`dist`) e o rewrite de SPA,
  necessário para recarregar rotas internas como `/admin/revisao`.
- O Express da Entrega 2 também consegue servir `../Frontend/dist` localmente, com
  `express.static` e fallback de SPA (`../Backend/src/app.js`), mas em produção o frontend é
  servido pela Vercel.
- O registro de como o deploy foi feito está em [`../DEPLOY.md`](../DEPLOY.md).
