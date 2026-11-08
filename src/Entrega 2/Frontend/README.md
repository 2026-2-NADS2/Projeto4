# KFKA — Frontend da Entrega 2

Versão em **React + Vite** do protótipo navegável do KFKA (acompanhamento escolar
bimestral). A identidade visual, os fluxos e os dados fictícios da Entrega 2 foram
preservados; a navegação passou de hash (`#/...`) para URLs reais com React Router.

> **Estado atual:** frontend funcional com dados simulados em memória. A API
> Express/PostgreSQL da Entrega 2 já está implementada em `../Backend`, mas as telas
> ainda não consomem esses endpoints — a camada de dados é o ponto de troca para a
> integração (veja [Integração com o back-end](#integração-com-o-back-end)).

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
│   ├── dados.js             # "API" simulada + dados fictícios da escola
│   └── status.js            # Rótulos, ícones e cores dos status
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

## Contas de teste

Senha de todas as contas fictícias: **`kfka2026`**.

| Perfil | E-mail | Observação |
| --- | --- | --- |
| Administrador | `marina.rocha@aurora.edu.br` | Coordenação pedagógica |
| Professor | `carlos.lima@aurora.edu.br` | Matemática e Geografia (p1) |
| Responsável | `ana.souza@email.com` | Ana Souza, responsável por Lucas e Júlia |

Essas credenciais valem apenas para o **mock do frontend**. O back-end não possui
seed embutido: as contas reais dependem dos dados já existentes no PostgreSQL.
O login é específico por perfil: entrar com as credenciais certas na aba errada é
recusado pelo mock e também pela API (`outro_perfil`). Contas criadas em
`/criar-conta` no mock existem apenas em memória; na API, o cadastro público cria
somente `responsavel` e persiste no banco.

---

## Autenticação e dados (simulação)

- `src/dados/dados.js` concentra os dados fictícios (escola Aurora 2026, turmas,
  alunos, relatórios etc.) e uma API síncrona (`api.*`) que imita o futuro back-end.
- O contexto de autenticação valida e-mail/senha na lista em memória e grava a sessão
  em `sessionStorage` na chave `kfka-sessao`.
- `RotaProtegida` bloqueia rotas por perfil; sem sessão, redireciona para
  `/entrar/:perfil`.
- Preferências de tema/texto ficam em `localStorage` na chave `kfka-prefs`.
- **Nada é persistido em servidor.** Recarregar a página restaura os dados originais
  do mock (a sessão e as preferências permanecem).

Esse comportamento é intencional para a demonstração. A senha de teste e a "API"
local não são um modelo de segurança e devem ser substituídas na integração.

---

## Integração com o back-end

Pontos de troca previstos:

1. **Camada de dados** — substituir as chamadas síncronas de `src/dados/dados.js`
   por `fetch` para as rotas Express, preferencialmente com um cliente HTTP único
   (`src/servicos/api.js`) que:
   - injeta `Authorization: Bearer <token>`;
   - converte o envelope de erro (`{ sucesso: false, erro: { codigo, mensagem,
     detalhes } }`) em exceções;
   - centraliza a URL base (`import.meta.env.VITE_API_URL`);
   - limpa a sessão e redireciona para `/entrar/:perfil` ao receber 401.
2. **Autenticação** — `AutenticacaoContexto` deve chamar
   `POST /api/auth/login` com `{ email, senha, perfil }`, guardar o token e buscar
   o usuário em `GET /api/auth/me`. O back-end devolve `professorId` ou
   `responsavelId` no usuário. Mapear os códigos `sem_conta`, `senha`,
   `outro_perfil` e `usuario_inativo` para os códigos internos já usados nas telas
   (`sem-conta`, `senha`, `outro-perfil`).
3. **Sessão** — trocar `kfka-sessao` (objeto completo do mock) por token + dados
   mínimos do usuário. O guard `RotaProtegida` continua igual.
4. **Dados** — os endpoints disponíveis hoje são `GET/POST /api/acompanhamentos`,
   `GET /api/acompanhamentos/:id`, `PATCH /api/acompanhamentos/:id`,
   `GET /api/alunos`, `GET /api/alunos/:id`, `GET /api/professores`,
   `GET /api/professores/me/vinculos` e `GET /api/bimestres`. A criação de
   acompanhamento exige `idAluno`, `idVinculo`, `idBimestre`, `descricao` e
   `media`; o vínculo vem de `/api/professores/me/vinculos`.
5. **Família** — manter a regra de visibilidade no servidor: o endpoint de
   acompanhamentos do responsável só devolve alunos vinculados e registros
   `PUBLICADO`. O frontend não deve ser a única barreira.
6. **Formatação** — o back-end já normaliza `media` para número (ou `null`),
   `status` para minúsculo e datas para ISO. Ainda assim, normalize no cliente
   HTTP antes de renderizar (`fmtMedia`, `fmtData`) para não depender do formato
   da coluna `numeric` do PostgreSQL.

### Conflitos e cuidados previstos

- **URLs antigas com hash** (`#/entrar`) deixam de funcionar; links e favoritos
  precisam usar as rotas novas.
- **SPA fallback em produção:** o `BrowserRouter` exige que o servidor devolva
  `index.html` para rotas desconhecidas. Isso já está implementado em
  `../Backend/src/app.js` com `express.static(dist)` + middleware após as rotas.
  Não use `app.get("*")`: a sintaxe é inválida no Express 5.
- **Prefixo `/api`:** o proxy do Vite e o Express usam `/api` sem `rewrite`. Se um
  dos dois mudar, ajuste o outro; caso contrário o front chamará caminhos errados.
- **CORS:** com proxy no desenvolvimento e front/back no mesmo domínio em produção,
  não é necessário. Se os domínios forem diferentes, configure `CORS_ORIGIN` no
  back-end com a origem exata; não use `*` com cookies.
- **Login por perfil:** o back-end já recusa o perfil errado com
  `403 outro_perfil` e devolve o perfil correto em `detalhes.perfil`. Traduza esse
  código para a mensagem de "outro perfil" já exibida pelas telas.
- **Cadastro:** o back-end só permite cadastro público de `responsavel`; as telas
  de cadastro de administrador/professor do mock não têm endpoint correspondente.
- **Formato dos dados:** o back-end devolve DTOs aninhados e camelCase, diferentes
  do mock. Faça um mapeamento explícito por endpoint em vez de espalhar `if` pelas
  páginas.
- **`?dados=pior`:** `dados.js` lê `location.search` no carregamento do módulo para
  alternar o cenário de demonstração. Esse acesso deve sair quando a camada mock for
  removida.
- **Bundle:** o build atual gera um chunk JS >500 kB (aviso do Vite, não erro).
  Considere `React.lazy` por área ou ajuste de `build.chunkSizeWarningLimit`.
- **`.env` do repositório:** o back-end usa um `.env` real que não deve ser
  versionado nem exposto. O frontend deve ter seu próprio `.env` baseado em
  `.env.example`, sem segredos.

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

Para publicar com o back-end:

1. Gere `dist/` (`VITE_API_URL` definida no ambiente de build; com front e back no
   mesmo domínio, mantenha `/api`).
2. O Express da Entrega 2 já serve `../Frontend/dist` com `express.static` e
   fallback de SPA (`../Backend/src/app.js`). Basta iniciar o back-end.
3. Garanta que o processo Node receba as variáveis sensíveis por variáveis de
   ambiente do provedor (nunca no repositório).
4. Teste o login, as rotas protegidas e o recarregamento direto de uma URL interna
   (ex.: `/familia/relatorios/rel-102`) para validar o fallback.

Enquanto a integração com a API não for feita, o site publicado continua usando os
dados simulados do bundle.
