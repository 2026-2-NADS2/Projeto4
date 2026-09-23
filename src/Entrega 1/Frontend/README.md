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

## Tema claro e escuro

O botão **Tema: claro / escuro** aparece nas telas de acesso, nos três dashboards e na página não encontrada. Na primeira visita, segue a preferência do sistema. Ao clicar, salva a escolha neste navegador e a mantém nas próximas visitas, inclusive após sair da conta. Sem uma escolha salva, acompanha mudanças do tema do sistema. Abas abertas também sincronizam a preferência.

- `src/estilos/themes.css`: paletas centralizadas dos dois temas. Para mudar o design, ajuste as cores aqui.
- `src/styles.css`: layout e estilos dos componentes, usando as variáveis das paletas.
- `src/componentes/ThemeToggle.jsx`: botão reutilizável e acessível por teclado.
- `src/servicos/theme.js`: preferência salva (`kfka-theme`), atualização do HTML e sincronização com sistema/abas. O pequeno script em `index.html` aplica a mesma preferência antes de carregar o React.

Para novas seções, use `var(--paper)` no fundo, `var(--surface)` nos cartões, `var(--text)` nos textos, `var(--ink)` nos títulos e `var(--paper-line)` nas bordas. Use `var(--button-bg)` e `var(--on-brand)` nos botões: as cores de ação são separadas das cores de títulos e status para manter o contraste nos dois temas. A preferência visual não interfere na autenticação nem nas permissões.
