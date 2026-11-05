class HistoricoAcompanhamentoRepository {
    constructor(banco) {
        this.banco = banco;
    }

    async registrar(
    idAcompanhamento,
    idUsuario,
    estadoAnterior,
    estadoNovo,
    observacao = null,
    executor = this.banco
    )  {
        const sql = `
            INSERT INTO historico_acompanhamento (
                id_acompanhamento,
                id_usuario,
                estado_anterior,
                estado_novo,
                observacao
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5
            )
            RETURNING
                id_historico,
                id_acompanhamento,
                id_usuario,
                estado_anterior,
                estado_novo,
                data_hora,
                observacao;
        `;

        const valores = [
            idAcompanhamento,
            idUsuario,
            estadoAnterior,
            estadoNovo,
            observacao
        ];

        const resultado =
            await executor.query(
                sql,
                valores
            );

        return resultado.rows[0];
    }

    async listarPorAcompanhamento(
        idAcompanhamento
    ) {
        const sql = `
            SELECT
                id_historico,
                id_acompanhamento,
                id_usuario,
                estado_anterior,
                estado_novo,
                data_hora,
                observacao
            FROM historico_acompanhamento
            WHERE id_acompanhamento = $1
            ORDER BY data_hora;
        `;

        const resultado =
            await this.banco.query(
                sql,
                [idAcompanhamento]
            );

        return resultado.rows;
    }
}

module.exports =
    HistoricoAcompanhamentoRepository;