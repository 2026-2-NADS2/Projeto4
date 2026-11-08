const Aluno = require("../models/Aluno");

const CAMPOS = `
    al.id_aluno,
    al.nome,
    TO_CHAR(al.data_nascimento, 'YYYY-MM-DD') AS data_nascimento,
    al.matricula,
    al.ativo,
    (
        SELECT ta.id_turma
        FROM turma_aluno ta
        WHERE ta.id_aluno = al.id_aluno
          AND ta.ativo = TRUE
        ORDER BY ta.id_ano_letivo DESC
        LIMIT 1
    ) AS id_turma
`;

class AlunoRepository {
    constructor(banco) {
        this.banco = banco;
    }

    montarAluno(linha) {
        const aluno = new Aluno(
            linha.id_aluno,
            linha.nome,
            linha.data_nascimento,
            linha.matricula,
            linha.ativo
        );

        aluno.idTurma = linha.id_turma ?? null;

        return aluno;
    }

    async listarAlunos() {
        const sql = `
            SELECT ${CAMPOS}
            FROM aluno al
            ORDER BY al.nome;
        `;

        const resultado = await this.banco.query(sql);

        return resultado.rows.map((linha) => this.montarAluno(linha));
    }

    async buscarPorId(idAluno) {
        const sql = `
            SELECT ${CAMPOS}
            FROM aluno al
            WHERE al.id_aluno = $1;
        `;

        const resultado = await this.banco.query(sql, [idAluno]);

        if (resultado.rows.length === 0) {
            return null;
        }

        return this.montarAluno(resultado.rows[0]);
    }

    async listarPorProfessor(idProfessor) {
        const sql = `
            SELECT DISTINCT ${CAMPOS}
            FROM aluno al
            JOIN turma_aluno ta
                ON ta.id_aluno = al.id_aluno
               AND ta.ativo = TRUE
            JOIN turma_disciplina_professor v
                ON v.id_turma = ta.id_turma
               AND v.id_ano_letivo = ta.id_ano_letivo
               AND v.ativo = TRUE
            WHERE v.id_professor = $1
            ORDER BY al.nome;
        `;

        const resultado = await this.banco.query(sql, [idProfessor]);

        return resultado.rows.map((linha) => this.montarAluno(linha));
    }

    async listarPorResponsavel(idResponsavel) {
        const sql = `
            SELECT ${CAMPOS}
            FROM aluno al
            JOIN aluno_responsavel ar
                ON ar.id_aluno = al.id_aluno
            WHERE ar.id_responsavel = $1
              AND ar.autorizado = TRUE
            ORDER BY al.nome;
        `;

        const resultado = await this.banco.query(sql, [idResponsavel]);

        return resultado.rows.map((linha) => this.montarAluno(linha));
    }

    async pertenceAoProfessor(idAluno, idProfessor) {
        const sql = `
            SELECT 1
            FROM vw_acompanhamento_completo
            WHERE id_aluno = $1
              AND id_professor = $2
            LIMIT 1;
        `;

        const resultado = await this.banco.query(sql, [
            idAluno,
            idProfessor
        ]);

        return resultado.rows.length > 0;
    }

    async pertenceAoResponsavel(idAluno, idResponsavel) {
        const sql = `
            SELECT 1
            FROM aluno_responsavel
            WHERE id_aluno = $1
              AND id_responsavel = $2
              AND autorizado = TRUE
            LIMIT 1;
        `;

        const resultado = await this.banco.query(sql, [
            idAluno,
            idResponsavel
        ]);

        return resultado.rows.length > 0;
    }

    async verificarMatriculaEmTurma(
        idAluno,
        idTurma,
        idAnoLetivo
    ) {
        const sql = `
            SELECT
                id_turma,
                id_aluno,
                id_ano_letivo,
                ativo
            FROM turma_aluno
            WHERE id_aluno = $1
              AND id_turma = $2
              AND id_ano_letivo = $3
              AND ativo = TRUE;
        `;

        const resultado = await this.banco.query(
            sql,
            [
                idAluno,
                idTurma,
                idAnoLetivo
            ]
        );

        return resultado.rows.length > 0;
    }
}

module.exports = AlunoRepository;
