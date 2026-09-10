# Frontend — KFKA

Aplicação estática em HTML, CSS e JavaScript modular, sem dependências externas.

## Executar

No terminal integrado, dentro desta pasta, execute:

```bash
npm run dev
```

Acesse `http://localhost:5173`.

## Fluxo de demonstração

1. Na landing, selecione **Acessar minha conta**.
2. Escolha um perfil.
3. Informe qualquer e-mail/matrícula e uma senha com ao menos seis caracteres.
4. A home mostrada será a correspondente ao perfil selecionado.

## Rotas

| Rota | Acesso |
| --- | --- |
| `#/` | Pública |
| `#/perfil` | Pública |
| `#/login` | Pública, após a seleção de perfil |
| `#/responsavel` | Perfil responsável |
| `#/professor` | Perfil professor |
| `#/admin` | Perfil administrador |

## Organização

- `app.js`: renderização, navegação, formulários e estados da interface.
- `js/access-control.js`: catálogo de perfis, rotas permitidas e guarda de rota.
- `js/mock-api.js`: serviço assíncrono que simula autenticação e consulta de dados.
- `assets/`: recursos exportados do Figma.

O controle de rota no cliente melhora a experiência de navegação. Na integração com a API real, a mesma política deve ser validada também no backend, a partir do usuário autenticado e de suas permissões.
