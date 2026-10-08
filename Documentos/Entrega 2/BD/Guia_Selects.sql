-- Consultar todos os acompanhamentos
SELECT *
FROM vw_acompanhamento_completo;

-- Consultar acompanhamentos de um aluno
SELECT *
FROM vw_acompanhamento_completo
WHERE aluno = 'João Santos';

-- Consultar somente registros publicados para responsáveis
SELECT *
FROM vw_acompanhamentos_publicados_responsavel
ORDER BY responsavel, aluno;

-- Consultar vínculos de professores
SELECT *
FROM vw_professor_turmas_disciplinas
WHERE professor = 'Carlos Silva';

-- Consultar o histórico de um acompanhamento
SELECT *
FROM vw_historico_acompanhamento_detalhado
WHERE id_acompanhamento = 15
ORDER BY data_hora;

-- Consultar resumo de um aluno por bimestre
SELECT *
FROM vw_resumo_aluno_bimestre
WHERE aluno = 'João Santos'
ORDER BY bimestre;
