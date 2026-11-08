# Deploy — Frontend na Vercel + Backend no Railway

Passo a passo para publicar a Entrega 2. O frontend (React/Vite) vai para a Vercel e a API
(Express/PostgreSQL) para o Railway. O banco continua no Neon.

> Faça nesta ordem: **Railway primeiro** (para descobrir a URL da API), depois **Vercel**, e por
> último ajuste o `CORS_ORIGIN` no Railway com o domínio da Vercel.

---

## 1. Backend no Railway

1. Acesse <https://railway.com> e entre com a conta do GitHub.
2. **New Project → Deploy from GitHub repo** e escolha o repositório do projeto.
3. Abra o serviço criado → **Settings → Source → Root Directory** e informe:

   ```text
   src/Entrega 2/Backend
   ```

   O arquivo `railway.json` dessa pasta já define `npm start` e o healthcheck em `/api/status`.
4. Ainda em **Variables**, adicione (uma por linha):

   | Variável | Valor |
   | --- | --- |
   | `DATABASE_HOST` | host do Neon, ex.: `ep-xxx.us-east-2.aws.neon.tech` |
   | `DATABASE_PORT` | `5432` |
   | `DATABASE_NAME` | nome do banco (`neondb`, salvo se você criou outro) |
   | `DATABASE_USER` | usuário da aplicação (`kfka_app`) |
   | `DATABASE_PASSWORD` | senha do usuário da aplicação |
   | `DATABASE_SSL` | `true` |
   | `JWT_SECRET` | segredo de 32+ caracteres (veja abaixo) |
   | `JWT_EXPIRES_IN` | `8h` |

   Para gerar o `JWT_SECRET`:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

   Não defina `PORT`: o Railway injeta essa variável e o `server.js` já usa `process.env.PORT`.

5. Em **Settings → Networking**, clique em **Generate Domain**. Anote a URL, algo como:

   ```text
   https://kfka-api-production.up.railway.app
   ```

6. Teste no navegador:

   ```text
   https://<sua-url>.up.railway.app/api/status
   ```

   Deve responder `{"sucesso":true,"dados":{...}}`.

7. O `CORS_ORIGIN` fica pendente: volte aqui depois de criar o projeto na Vercel.

---

## 2. Frontend na Vercel

1. Acesse <https://vercel.com> e entre com a conta do GitHub.
2. **Add New → Project**, importe o mesmo repositório.
3. Em **Root Directory**, selecione:

   ```text
   src/Entrega 2/Frontend
   ```

   A Vercel reconhece o Vite automaticamente; o `vercel.json` já fixa o build (`npm run build`),
   a saída (`dist`) e o rewrite de SPA (necessário para F5 em rotas como `/admin/revisao`).
4. Em **Environment Variables**, adicione:

   | Variável | Valor |
   | --- | --- |
   | `VITE_API_URL` | `https://<sua-url-do-railway>.up.railway.app/api` |

   Sem barra no final. Essa variável é embutida no build; se mudar depois, refaça o deploy.
5. Clique em **Deploy**. Ao terminar, anote o domínio, algo como:

   ```text
   https://kfka-entrega2.vercel.app
   ```

---

## 3. Liberar o CORS no Railway

1. Volte ao Railway → serviço da API → **Variables**.
2. Adicione ou edite:

   ```text
   CORS_ORIGIN=https://kfka-entrega2.vercel.app
   ```

   Para liberar também os deploys de preview da Vercel, separe por vírgula:

   ```text
   CORS_ORIGIN=https://kfka-entrega2.vercel.app,https://kfka-entrega2-git-main-seu-usuario.vercel.app
   ```

3. O Railway reinicia o serviço ao salvar a variável.

---

## 4. Conferência final

No navegador, abra o domínio da Vercel e teste:

1. Login com um usuário real do banco.
2. Recarregar a página (F5) em uma rota interna — deve continuar na tela, sem 404.
3. Abrir o console: não pode haver erro de CORS nem `Falha na requisição`.
4. Alterar um dado (ex.: telefone no perfil) e confirmar que persiste após F5.

Se aparecer erro de CORS, confira se o `CORS_ORIGIN` no Railway é **exatamente** o domínio da
Vercel (com `https://` e sem barra no final) e se o serviço foi reiniciado.

---

## Observações

- **Senhas e segredos** ficam só nas variáveis de ambiente do Railway; nada de `.env` no Git.
- **Neon**: se aparecer erro de muitas conexões, use o host *pooled* do Neon (termina em
  `-pooler`) no `DATABASE_HOST`. O pool da aplicação está limitado a 5 conexões.
- **Custo**: Railway e Vercel têm planos gratuitos/Hobby suficientes para a entrega; o Neon
  suspende o banco por inatividade e a primeira consulta pode demorar alguns segundos.
- **Frontend servido pelo Express**: localmente o `server.js` serve `Frontend/dist` quando ele
  existe. No Railway isso não acontece (root directory é só o Backend), e não precisa: o
  frontend é servido pela Vercel.
