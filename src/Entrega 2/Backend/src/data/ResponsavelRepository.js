class ResponsavelRepository {
    constructor(banco) {
        this.banco = banco;
    }

    async buscarPorUsuario(idUsuario) {
        const sql = `
            SELECT id_responsavel
            FROM responsavel
            WHERE id_usuario = $1;
        `;

        const resultado = await this.banco.query(sql, [idUsuario]);

        if (resultado.rows.length === 0) {
            return null;
        }

        return {
            idResponsavel: resultado.rows[0].id_responsavel
        };
    }
}

module.exports = ResponsavelRepository;
