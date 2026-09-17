# KFKA — Entrega 1 de Banco de Dados

Esta pasta reúne os materiais da primeira entrega de Banco de Dados do projeto **KFKA — Plataforma de Acompanhamento Escolar**.

## Objetivo da entrega

A proposta da E1 foi criar índices para melhorar o desempenho das consultas do banco de dados e justificar a escolha de cada índice.

Os índices foram pensados com base nas consultas que o sistema deverá realizar com frequência, como:

- consulta de acompanhamentos por aluno e bimestre;
- consulta de histórico de alterações;
- vínculos de professores com turmas e disciplinas;
- alunos vinculados a responsáveis;
- relatórios por tags;
- consulta de matrículas por ano letivo;
- registro de ciência dos responsáveis.

## Índices criados

Foram criados 8 índices específicos para melhorar consultas do sistema:

1. `idx_acompanhamento_aluno_bimestre_status`
2. `idx_historico_acompanhamento_data`
3. `idx_tdp_professor_ativo`
4. `idx_aluno_responsavel_responsavel_autorizado`
5. `idx_acompanhamento_tag_tag`
6. `idx_acompanhamento_vinculo_bimestre`
7. `idx_turma_aluno_aluno_ano`
8. `idx_ciencia_acompanhamento_responsavel`

Além desses, o PostgreSQL já possuía índices criados automaticamente pelas chaves primárias e restrições `UNIQUE`.

## Testes realizados

Os índices foram analisados utilizando `EXPLAIN ANALYZE`.

Como a base de testes ainda possui poucos registros, em várias consultas o PostgreSQL optou por `Seq Scan`, pois nesse volume a leitura direta da tabela pode ser mais rápida.

Também foram feitos testes controlados para confirmar que os índices criados podem ser utilizados pelo PostgreSQL quando necessário.

## Arquivos

- `E1_Indices_KFKA_Final.pdf` — documento principal da entrega;
- `Registro_Uso_IA_KFKA.pdf` — registro resumido do uso de IA durante o desenvolvimento;

## Banco de dados

O projeto utiliza PostgreSQL.

Durante o desenvolvimento inicial, o banco foi criado localmente utilizando PostgreSQL 18 e pgAdmin 4.

Posteriormente, foi iniciada a migração do banco para um servidor PostgreSQL remoto no Neon, permitindo o acesso ao mesmo banco por diferentes máquinas e preparando a integração futura com o backend.

## Projeto

Curso: Análise e Desenvolvimento de Sistemas  
Instituição: FECAP  
Projeto Interdisciplinar — 2º semestre de 2026
