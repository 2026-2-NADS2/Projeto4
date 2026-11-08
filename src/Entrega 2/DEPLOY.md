# Deploy — como foi feito

Registro de como a aplicação foi publicada. O frontend está na Vercel, a API no Railway e o
banco PostgreSQL no Neon. **Nenhum valor sensível** (senhas, segredos ou credenciais) está
documentado aqui: tudo fica nas variáveis de ambiente configuradas nos painéis dos provedores.

## Arquitetura publicada

- **Frontend (Vercel):** build estático do React/Vite, com rewrite de SPA para que rotas
  internas continuem funcionando ao recarregar (`vercel.json`).
- **API (Railway):** processo Node.js/Express iniciado com `npm start`, healthcheck em
  `/api/status` e domínio público gerado pelo Railway.
- **Banco (Neon):** PostgreSQL acessado apenas pela API, com SSL.
- **CORS:** a API aceita somente as origens do frontend, configuradas por variável de ambiente.

## Como o deploy foi configurado

### API no Railway

1. Projeto criado a partir do repositório, com o **Root Directory** apontando para a pasta do
   backend da Entrega 2.
2. Credenciais do banco, segredo JWT e origens permitidas cadastrados em **Variables** no
   painel do Railway — nada disso é versionado no repositório.
3. Build com Railpack (detecção automática de Node.js) e start `npm start`.
4. Healthcheck configurado em `/api/status`.
5. Domínio público gerado em **Settings → Networking**.

### Frontend na Vercel

1. Projeto importado do repositório, com **Root Directory** na pasta do frontend e preset
   **Vite**.
2. Variável `VITE_API_URL` apontando para a URL pública da API, com o sufixo `/api`,
   cadastrada como **Config** (a URL é pública e é embutida no bundle).
3. Build `npm run build`, saída `dist`, rewrite de SPA pelo `vercel.json`.
4. O domínio de produção foi adicionado ao CORS da API no Railway.

## Verificação realizada

- `/api/status` responde com `sucesso: true`.
- Login pela URL da Vercel funciona com usuários do banco.
- Recarregar uma rota interna (F5) mantém a tela, sem 404.
- Console sem erro de CORS.
- Alterações (ex.: telefone no perfil) persistem após recarregar.

## Segurança

- Segredos apenas nas variáveis de ambiente dos provedores (Railway e Vercel).
- `.env` fora do Git; o repositório mantém somente `.env.example`, sem valores reais.
- `CORS_ORIGIN` restrito aos domínios do frontend, sem `*`.
- Banco acessível somente pela API, com SSL.

## Observações

- Mudanças em `VITE_API_URL` exigem um novo deploy na Vercel (o valor entra no build).
- No CORS, o domínio deve ser cadastrado sem barra no final.
- O Railway injeta a porta via `PORT`; não é preciso defini-la.
- O deploy é feito a partir de um fork do repositório da organização; o fork precisa ser
  sincronizado para disparar novos builds.
