## POO - Regras de Negócio

A camada de POO do backend concentra as principais regras de negócio da plataforma KFKA.

### Acompanhamentos

O sistema realiza validações antes da criação e alteração de acompanhamentos:

- média deve estar entre 0 e 10;
- o vínculo acadêmico deve pertencer ao professor;
- o vínculo deve estar ativo;
- o aluno deve pertencer à turma e ao ano letivo do vínculo;
- o bimestre deve existir e ser compatível com o ano letivo;
- acompanhamentos duplicados são bloqueados.

### Fluxo de status

Os acompanhamentos seguem um fluxo controlado:

- RASCUNHO → ENVIADO_REVISAO
- ENVIADO_REVISAO → EM_REVISAO
- EM_REVISAO → PUBLICADO
- acompanhamentos também podem ser DEVOLVIDOS ou CANCELADOS conforme o estado atual.

Transições inválidas são bloqueadas pela camada de serviço.

### Permissões

As operações também consideram o perfil do usuário:

- PROFESSOR: cria, edita e envia acompanhamentos vinculados às suas turmas;
- ADMINISTRADOR: realiza revisão, devolução e publicação;
- RESPONSÁVEL: possui acesso de consulta, sem permissão para alterar o workflow.

### Histórico

Mudanças relevantes de status são registradas no histórico do acompanhamento, contendo:

- usuário responsável;
- estado anterior;
- novo estado;
- data e hora;
- observação da alteração.

### Estrutura

A aplicação utiliza separação entre:

- Models: representação das entidades;
- Repositories: acesso e persistência no PostgreSQL;
- Services: regras de negócio e validações;
- Routes/Middlewares: integração HTTP e autenticação do backend.

O backend utiliza PostgreSQL hospedado no Neon.
