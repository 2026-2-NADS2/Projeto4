# Frontend — KFKA

Aplicação React com Vite e React Router. Esta entrega usa uma API simulada, sem depender do backend.

## Executar

Com Node.js compatível com o Vite instalado, execute dentro desta pasta:

```bash
npm install
npm run dev
```

Abra o endereço informado no terminal (normalmente `http://localhost:5173`). Para conferir a versão de produção:

```bash
npm run build
npm run preview
```

## Acesso e rotas

| Rota | Acesso |
| --- | --- |
| `/` | Página inicial pública |
| `/perfil` | Seleção de perfil |
| `/login` | Login após selecionar perfil |
| `/responsavel` | Responsável autenticado |
| `/professor` | Professor autenticado |
| `/admin` | Administrador autenticado |
| Qualquer outra rota | Página não encontrada |

O login é demonstrativo: aceita qualquer e-mail/matrícula não vazio e senha de pelo menos seis caracteres. Não consulta contas reais e não guarda senhas. Sem sessão válida, os painéis redirecionam para a seleção de perfil; ao tentar outro painel, o usuário volta ao painel do próprio perfil.

“Lembrar de mim” salva a sessão no `localStorage`; desmarcado, usa `sessionStorage`, limitado à sessão da aba. “Sair” limpa as duas formas de sessão. Esse controle existe apenas no navegador e não substitui autenticação e autorização no backend.

As rotas usam `BrowserRouter`, sem `#`. Ao publicar, configure o servidor para devolver `index.html` nas rotas da aplicação, permitindo abrir ou atualizar endereços como `/professor` diretamente.

## Funcionalidades desta etapa

- **Professor:** consulta a turma de exemplo, envia acompanhamento de Matemática para revisão e consulta os registros/status. Aluno e descrição são obrigatórios; média aceita ponto ou vírgula entre 0 e 10, incluindo zero, mas rejeita campo vazio. Durante o envio, o formulário fica desabilitado e mostra o resultado.
- **Administrador:** consulta alunos/professores dos registros de demonstração, publica ou devolve acompanhamentos em revisão, consulta relatórios e baixa CSV compatível com Excel. Os contadores refletem os dados salvos.
- **Responsável:** consulta somente relatórios publicados de Laura Martins e pode confirmar a leitura em “Ciência / retorno”.
- **Interface:** tema claro/escuro, navegação adaptada a telas pequenas, formulários e cartões flexíveis. No celular, a tabela administrativa permite rolagem horizontal dentro da própria tabela.

Para manter esta rodada pequena, cadastros são somente consulta, exportação usa CSV (não XLSX) e ciência registra apenas confirmação de leitura. Edição de cadastros, alteração/reenvio de registros devolvidos, comentários de retorno e geração de PDF ficam para etapas futuras.

## API simulada e persistência

`src/servicos/mock-api.js` simula autenticação, consulta, envio, revisão e ciência com operações assíncronas. Os painéis exibem carregamento e erro; as operações de escrita também informam falhas.

Os três perfis compartilham os registros salvos na chave `kfka-records-v1` do `localStorage`. É possível enviar como professor, sair, entrar como administrador, publicar e depois consultar como responsável. Trocas de perfil e recargas preservam os registros no mesmo navegador e endereço. Não há sincronização entre dispositivos nem atualização automática entre abas.

Para simular falha da API, execute no console do navegador e recarregue um painel:

```js
sessionStorage.setItem("kfka-force-api-error", "true");
```

Para voltar ao funcionamento normal, remova a flag e recarregue:

```js
sessionStorage.removeItem("kfka-force-api-error");
```

Para reiniciar somente os dados de demonstração, remova a chave abaixo e recarregue. Isso apaga os acompanhamentos e confirmações criados localmente:

```js
localStorage.removeItem("kfka-records-v1");
```

## Organização

- `src/App.jsx`: rotas da aplicação.
- `src/paginas/`: telas públicas e painéis de cada perfil.
- `src/componentes/`: layouts, proteção de rotas, cartões, status e tema.
- `src/servicos/access-control.js`: perfis, navegação e sessão.
- `src/servicos/mock-api.js`: operações e registros da demonstração.
- `src/servicos/theme.js`: preferência de tema e sincronização entre abas/sistema.
- `src/dados/constantes.js`: rótulos de status e filtros.
- `src/styles.css`: layout, componentes e adaptações de largura.
- `src/estilos/themes.css`: paletas de cores.
- `assets/`: imagens de avatar.

## Roteiro de verificação

1. Abra `/admin` sem login: deve ir para `/perfil`. Acesse uma rota inexistente: deve aparecer a página de erro com retorno ao início.
2. No login, envie campos vazios e senha curta; confirme as mensagens. Entre como professor e tente abrir `/admin`: deve retornar a `/professor`.
3. No acompanhamento, teste média vazia, negativa, acima de 10, zero e `8,4`. Somente valores válidos, com aluno e descrição, devem ser enviados.
4. Envie um registro de Laura, recarregue e confira “Enviados / status”. Entre como administrador, publique-o e confira os contadores e relatórios.
5. Entre como responsável, confira a publicação e confirme sua leitura. Recarregue para verificar a persistência.
6. No administrador, consulte cadastros e exporte o CSV. Confira o arquivo no Excel ou em um editor de texto.
7. Confira telas de 320, 375, 768, 1024 e 1440 pixels, incluindo navegação, formulários, cartões e rolagem da tabela.
8. Teste carregamento e falha simulada; remova a flag após a verificação.

## Tema claro e escuro

O botão de tema aparece nas telas públicas, nos painéis e na página não encontrada. Na primeira visita segue o sistema; a escolha manual fica salva em `kfka-theme`, inclusive após sair da conta. Sem escolha salva, acompanha mudanças do sistema. Abas abertas sincronizam a preferência.

O script inicial em `index.html` aplica a preferência antes do React. Para novas seções, use as variáveis das paletas: `--paper`, `--surface`, `--text`, `--ink`, `--paper-line`, `--button-bg` e `--on-brand`.
