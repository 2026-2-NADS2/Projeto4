--TODAS AS VIEWS ESTARÃO SEPARADAS PELOS COMENTÁRIOS, PRA FACILITAR A VISUALIZAÇÃO
-- VIEW 1 - Acompanhamento completo
-- Centraliza as principais informações de um acompanhamento.


CREATE OR REPLACE VIEW vw_acompanhamento_completo AS
SELECT
    a.id_acompanhamento,

    al.id_aluno,
    al.nome AS aluno,
    al.matricula AS matricula_aluno,

    t.id_turma,
    t.nome AS turma,
    t.ano_serie,
    t.turno,

    d.id_disciplina,
    d.nome AS disciplina,

    p.id_professor,
    p.matricula AS matricula_professor,

    b.id_bimestre,
    b.numero AS bimestre,

    an.id_ano_letivo,
    an.ano AS ano_letivo,

    a.descricao,
    a.media,

    CASE
        WHEN a.media >= 6 THEN 'APROVADO'
        ELSE 'RECUPERAÇÃO'
    END AS situacao_media,

    a.status,
    a.data_criacao,
    a.data_atualizacao

FROM acompanhamento a

JOIN aluno al
    ON al.id_aluno = a.id_aluno

JOIN turma_disciplina_professor tdp
    ON tdp.id_vinculo = a.id_vinculo

JOIN turma t
    ON t.id_turma = tdp.id_turma

JOIN disciplina d
    ON d.id_disciplina = tdp.id_disciplina

JOIN professor p
    ON p.id_professor = tdp.id_professor

JOIN bimestre b
    ON b.id_bimestre = a.id_bimestre

JOIN ano_letivo an
    ON an.id_ano_letivo = tdp.id_ano_letivo;



-- VIEW 2 - Acompanhamentos publicados por responsável
-- Exibe somente os acompanhamentos publicados de alunos
-- vinculados a responsáveis autorizados.


CREATE OR REPLACE VIEW vw_acompanhamentos_publicados_responsavel AS
SELECT
    r.id_responsavel,
    u.nome AS responsavel,
    u.email AS email_responsavel,

    ar.tipo_relacao,
    ar.data_vinculo,

    ac.id_acompanhamento,

    ac.id_aluno,
    ac.aluno,
    ac.matricula_aluno,

    ac.id_turma,
    ac.turma,
    ac.ano_serie,
    ac.turno,

    ac.id_disciplina,
    ac.disciplina,

    ac.id_bimestre,
    ac.bimestre,

    ac.id_ano_letivo,
    ac.ano_letivo,

    ac.descricao,
    ac.media,
    ac.situacao_media,

    ac.status,
    ac.data_criacao,
    ac.data_atualizacao

FROM responsavel r

JOIN usuario u
    ON u.id_usuario = r.id_usuario

JOIN aluno_responsavel ar
    ON ar.id_responsavel = r.id_responsavel

JOIN vw_acompanhamento_completo ac
    ON ac.id_aluno = ar.id_aluno

WHERE ar.autorizado = TRUE
AND ac.status = 'PUBLICADO';



-- VIEW 3 - Professor, turmas e disciplinas
-- Centraliza os vínculos acadêmicos dos professores.


CREATE OR REPLACE VIEW vw_professor_turmas_disciplinas AS
SELECT
    tdp.id_vinculo,

    p.id_professor,
    u.nome AS professor,
    u.email AS email_professor,
    p.matricula AS matricula_professor,

    t.id_turma,
    t.nome AS turma,
    t.ano_serie,
    t.turno,

    d.id_disciplina,
    d.nome AS disciplina,

    an.id_ano_letivo,
    an.ano AS ano_letivo,

    tdp.ativo AS vinculo_ativo,
    t.ativo AS turma_ativa,
    d.ativo AS disciplina_ativa,
    an.ativo AS ano_letivo_ativo,
    u.ativo AS professor_ativo

FROM turma_disciplina_professor tdp

JOIN professor p
    ON p.id_professor = tdp.id_professor

JOIN usuario u
    ON u.id_usuario = p.id_usuario

JOIN turma t
    ON t.id_turma = tdp.id_turma

JOIN disciplina d
    ON d.id_disciplina = tdp.id_disciplina

JOIN ano_letivo an
    ON an.id_ano_letivo = tdp.id_ano_letivo;



-- VIEW 4 - Histórico detalhado dos acompanhamentos
-- Facilita consultas de auditoria.

CREATE OR REPLACE VIEW vw_historico_acompanhamento_detalhado AS
SELECT
    h.id_historico,
    h.id_acompanhamento,

    h.id_usuario,
    u.nome AS usuario,
    u.email AS email_usuario,
    u.perfil,

    ac.id_aluno,
    ac.aluno,
    ac.matricula_aluno,

    ac.id_turma,
    ac.turma,

    ac.id_disciplina,
    ac.disciplina,

    ac.id_bimestre,
    ac.bimestre,

    ac.id_ano_letivo,
    ac.ano_letivo,

    h.estado_anterior,
    h.estado_novo,
    h.data_hora,
    h.observacao

FROM historico_acompanhamento h

JOIN usuario u
    ON u.id_usuario = h.id_usuario

JOIN vw_acompanhamento_completo ac
    ON ac.id_acompanhamento = h.id_acompanhamento;



-- VIEW 5 - Resumo do aluno por bimestre
-- Agrupa informações para relatórios e consultas.

CREATE OR REPLACE VIEW vw_resumo_aluno_bimestre AS
SELECT
    id_aluno,
    aluno,
    matricula_aluno,

    id_turma,
    turma,
    ano_serie,
    turno,

    id_bimestre,
    bimestre,

    id_ano_letivo,
    ano_letivo,

    COUNT(*) AS total_acompanhamentos,

    COUNT(*) FILTER (
        WHERE status = 'PUBLICADO'
    ) AS total_publicados,

    ROUND(AVG(media), 2) AS media_geral,

    COUNT(*) FILTER (
        WHERE media >= 6
    ) AS total_aprovado,

    COUNT(*) FILTER (
        WHERE media < 6
    ) AS total_recuperacao

FROM vw_acompanhamento_completo

GROUP BY
    id_aluno,
    aluno,
    matricula_aluno,
    id_turma,
    turma,
    ano_serie,
    turno,
    id_bimestre,
    bimestre,
    id_ano_letivo,
    ano_letivo;


-- ============================================================
-- CONSULTAS DE VALIDAÇÃO
-- ============================================================


-- VIEW 1
SELECT
    COUNT(*) AS total_linhas,
    COUNT(DISTINCT id_acompanhamento) AS acompanhamentos_distintos
FROM vw_acompanhamento_completo;


-- VIEW 2
SELECT
    status,
    COUNT(*) AS quantidade
FROM vw_acompanhamentos_publicados_responsavel
GROUP BY status;


-- VIEW 3
SELECT
    COUNT(*) AS total_vinculos,
    COUNT(DISTINCT id_vinculo) AS vinculos_distintos
FROM vw_professor_turmas_disciplinas;


-- VIEW 4
SELECT
    COUNT(*) AS total_historicos,
    COUNT(DISTINCT id_historico) AS historicos_distintos
FROM vw_historico_acompanhamento_detalhado;


-- VIEW 5
SELECT
    COUNT(*) AS total_resumos
FROM vw_resumo_aluno_bimestre;

SELECT
    SUM(total_acompanhamentos) AS total_acompanhamentos
FROM vw_resumo_aluno_bimestre;
