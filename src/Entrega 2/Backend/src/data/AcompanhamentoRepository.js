const Acompanhamento =
    require("../models/Acompanhamento");

class AcompanhamentoRepository {
    constructor(banco) {
        this.banco = banco;
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

        const resultado =
            await this.banco.query(
                sql,
                [idAcompanhamento]
            );

        if (resultado.rows.length === 0) {
            return null;
        }

        const linha = resultado.rows[0];

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

    async listarPorProfessor(idProfessor) {
        const sql = `
            SELECT
                id_acompanhamento,
                aluno,
                turma,
                disciplina,
                bimestre,
                ano_letivo,
                descricao,
                media,
                situacao_media,
                status
            FROM vw_acompanhamento_completo
            WHERE id_professor = $1
            ORDER BY
                bimestre,
                turma,
                aluno,
                disciplina;
        `;

        const resultado =
            await this.banco.query(
                sql,
                [idProfessor]
            );

        return resultado.rows;
    }
}

module.exports = AcompanhamentoRepository;