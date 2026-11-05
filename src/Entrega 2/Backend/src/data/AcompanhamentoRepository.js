const Acompanhamento = require("../models/Acompanhamento");

const CAMPOS_COMPLETOS = `
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
    ac.id_professor,
    ac.matricula_professor,
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
`;

class AcompanhamentoRepository {
    constructor(banco) {
        this.banco = banco;
    }

    montarAcompanhamento(linha) {
        return new Acompanhamento(
            linha.id_acompanhamento,
            linha.id_aluno,
            linha.id_vinculo,
            linha.id_bimestre,
            linha.descricao,
            linha.media,
            linha.status,
            linha.data_criacao,
            linha.data_atualizacao
        );
    }

    async buscarPorId(idAcompanhamento) {
    const sql = `
        SELECT
            id_acompanhamento,
            id_aluno,
            id_vinculo,
            id_bimestre,
            descricao,
            media,
            status,
            data_criacao,
            data_atualizacao
        FROM acompanhamento
        WHERE id_acompanhamento = $1;
    `;

        const resultado = await this.banco.query(sql, [idAcompanhamento]);

        if (resultado.rows.length === 0) {
            return null;
        }

        return this.montarAcompanhamento(resultado.rows[0]);
    }

    async listarCompletos(filtros = {}) {
        const condicoes = [];
        const parametros = [];

        if (filtros.idProfessor) {
            parametros.push(filtros.idProfessor);
            condicoes.push(`ac.id_professor = $${parametros.length}`);
        }

        if (filtros.idResponsavel) {
            parametros.push(filtros.idResponsavel);
            condicoes.push(`ac.id_aluno IN (
                SELECT ar.id_aluno
                FROM aluno_responsavel ar
                WHERE ar.id_responsavel = $${parametros.length}
                  AND ar.autorizado = TRUE
            )`);
            condicoes.push(`ac.status = 'PUBLICADO'`);
        }

        if (filtros.idAluno) {
            parametros.push(filtros.idAluno);
            condicoes.push(`ac.id_aluno = $${parametros.length}`);
        }

        if (filtros.idBimestre) {
            parametros.push(filtros.idBimestre);
            condicoes.push(`ac.id_bimestre = $${parametros.length}`);
        }

        if (filtros.idTurma) {
            parametros.push(filtros.idTurma);
            condicoes.push(`ac.id_turma = $${parametros.length}`);
        }

        if (filtros.idDisciplina) {
            parametros.push(filtros.idDisciplina);
            condicoes.push(`ac.id_disciplina = $${parametros.length}`);
        }

        if (filtros.status) {
            parametros.push(filtros.status);
            condicoes.push(`ac.status = $${parametros.length}`);
        }

        const onde = condicoes.length
            ? `WHERE ${condicoes.join(" AND ")}`
            : "";

        const sql = `
            SELECT ${CAMPOS_COMPLETOS}
            FROM vw_acompanhamento_completo ac
            ${onde}
            ORDER BY
                ac.bimestre DESC,
                ac.aluno,
                ac.disciplina;
        `;

        const resultado = await this.banco.query(sql, parametros);

        return resultado.rows;
    }

    async buscarCompletoPorId(idAcompanhamento, filtros = {}) {
        const condicoes = ["ac.id_acompanhamento = $1"];
        const parametros = [idAcompanhamento];

        if (filtros.idProfessor) {
            parametros.push(filtros.idProfessor);
            condicoes.push(`ac.id_professor = $${parametros.length}`);
        }

        if (filtros.idResponsavel) {
            parametros.push(filtros.idResponsavel);
            condicoes.push(`ac.id_aluno IN (
                SELECT ar.id_aluno
                FROM aluno_responsavel ar
                WHERE ar.id_responsavel = $${parametros.length}
                  AND ar.autorizado = TRUE
            )`);
            condicoes.push(`ac.status = 'PUBLICADO'`);
        }

        const sql = `
            SELECT ${CAMPOS_COMPLETOS}
            FROM vw_acompanhamento_completo ac
            WHERE ${condicoes.join(" AND ")}
            LIMIT 1;
        `;

        const resultado = await this.banco.query(sql, parametros);

        return resultado.rows.length ? resultado.rows[0] : null;
    }

    async existeDuplicado(idAluno, idVinculo, idBimestre, ignorarId = null) {
        const parametros = [idAluno, idVinculo, idBimestre];
        let filtroExtra = "";

        if (ignorarId) {
            parametros.push(ignorarId);
            filtroExtra = `AND id_acompanhamento <> $${parametros.length}`;
        }

        const sql = `
            SELECT 1
            FROM acompanhamento
            WHERE id_aluno = $1
              AND id_vinculo = $2
              AND id_bimestre = $3
              ${filtroExtra}
            LIMIT 1;
        `;

        const resultado = await this.banco.query(sql, parametros);

        return resultado.rows.length > 0;
    }

    async criar(dados, idUsuario) {
        const sql = `
            WITH novo AS (
                INSERT INTO acompanhamento (
                    id_aluno,
                    id_vinculo,
                    id_bimestre,
                    descricao,
                    media,
                    status
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id_acompanhamento
            ),
            historico AS (
                INSERT INTO historico_acompanhamento (
                    id_acompanhamento,
                    id_usuario,
                    estado_anterior,
                    estado_novo,
                    observacao
                )
                SELECT
                    id_acompanhamento,
                    $7,
                    NULL,
                    $6,
                    'Criação do acompanhamento'
                FROM novo
                RETURNING id_historico
            )
            SELECT id_acompanhamento FROM novo;
        `;

        const resultado = await this.banco.query(sql, [
            dados.idAluno,
            dados.idVinculo,
            dados.idBimestre,
            dados.descricao,
            dados.media,
            dados.status,
            idUsuario
        ]);

        return resultado.rows[0].id_acompanhamento;
    }

    async atualizar(idAcompanhamento, campos, opcoes = {}) {
        const colunas = {
            descricao: "descricao",
            media: "media",
            status: "status"
        };

        const atribuicoes = [];
        const parametros = [];

        for (const [campo, coluna] of Object.entries(colunas)) {
            if (campos[campo] !== undefined) {
                parametros.push(campos[campo]);
                atribuicoes.push(`${coluna} = $${parametros.length}`);
            }
        }

        if (atribuicoes.length === 0) {
            return this.buscarPorId(idAcompanhamento);
        }

        atribuicoes.push("data_atualizacao = NOW()");
        parametros.push(idAcompanhamento);
        const idParam = `$${parametros.length}`;

        let sql;

        if (opcoes.registrarHistorico && opcoes.idUsuario) {
            parametros.push(opcoes.idUsuario);
            const usuarioParam = `$${parametros.length}`;
            parametros.push(opcoes.estadoAnterior || null);
            const anteriorParam = `$${parametros.length}`;
            parametros.push(opcoes.observacao || null);
            const observacaoParam = `$${parametros.length}`;

            sql = `
                WITH atualizado AS (
                    UPDATE acompanhamento
                    SET ${atribuicoes.join(", ")}
                    WHERE id_acompanhamento = ${idParam}
                    RETURNING *
                ),
                historico AS (
                    INSERT INTO historico_acompanhamento (
                        id_acompanhamento,
                        id_usuario,
                        estado_anterior,
                        estado_novo,
                        observacao
                    )
                    SELECT
                        id_acompanhamento,
                        ${usuarioParam},
                        ${anteriorParam},
                        status,
                        ${observacaoParam}
                    FROM atualizado
                    RETURNING id_historico
                )
                SELECT * FROM atualizado;
            `;
        } else {
            sql = `
                UPDATE acompanhamento
                SET ${atribuicoes.join(", ")}
                WHERE id_acompanhamento = ${idParam}
                RETURNING *;
            `;
        }

        const resultado = await this.banco.query(sql, parametros);

        if (resultado.rows.length === 0) {
            return null;
        }

        return this.montarAcompanhamento(resultado.rows[0]);
    }

    async listarHistorico(idAcompanhamento) {
        const sql = `
            SELECT
                id_historico,
                usuario,
                perfil,
                estado_anterior,
                estado_novo,
                data_hora,
                observacao
            FROM vw_historico_acompanhamento_detalhado
            WHERE id_acompanhamento = $1
            ORDER BY data_hora;
        `;

        const resultado = await this.banco.query(sql, [idAcompanhamento]);

        return resultado.rows;
    }

    async atualizarStatus(
    idAcompanhamento,
    novoStatus,
    executor = this.banco
) {
    const sql = `
        UPDATE acompanhamento
        SET
            status = $1,
            data_atualizacao = CURRENT_TIMESTAMP
        WHERE id_acompanhamento = $2
        RETURNING
            id_acompanhamento,
            id_aluno,
            id_vinculo,
            id_bimestre,
            descricao,
            media,
            status,
            data_criacao,
            data_atualizacao;
    `;

    const resultado =
        await executor.query(
            sql,
            [
                novoStatus,
                idAcompanhamento
            ]
        );

    if (resultado.rows.length === 0) {
        return null;
    }

    const linha =
        resultado.rows[0];

    return new Acompanhamento(
        linha.id_acompanhamento,
        linha.id_aluno,
        linha.id_vinculo,
        linha.id_bimestre,
        linha.descricao,
        linha.media,
        linha.status,
        linha.data_criacao,
        linha.data_atualizacao
    );
}
}

module.exports = AcompanhamentoRepository;
