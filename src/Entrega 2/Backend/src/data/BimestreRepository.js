class BimestreRepository {
    constructor(banco) {
        this.banco = banco;
    }

    async listar() {
        const sql = `
            SELECT
                id_bimestre AS id,
                numero
            FROM bimestre
            ORDER BY numero;
        `;

        const resultado = await this.banco.query(sql);

        return resultado.rows.map((linha) => ({
            id: linha.id,
            numero: linha.numero
        }));
    }

    async buscarPorId(idBimestre) {
        const sql = `
            SELECT
                id_bimestre AS id,
                numero
            FROM bimestre
            WHERE id_bimestre = $1;
        `;

        const resultado = await this.banco.query(sql, [idBimestre]);

        if (resultado.rows.length === 0) {
            return null;
        }

        return {
            id: resultado.rows[0].id,
            numero: resultado.rows[0].numero
        };
    }
}

module.exports = BimestreRepository;
