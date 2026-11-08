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

    async criarPorUsuario(idUsuario, telefone = null) {
        const sql = `
            INSERT INTO responsavel (id_usuario, telefone)
            VALUES ($1, $2)
            RETURNING id_responsavel;
        `;

        const resultado = await this.banco.query(sql, [idUsuario, telefone]);

        return {
            idResponsavel: resultado.rows[0].id_responsavel
        };
    }

    async atualizarTelefonePorUsuario(idUsuario, telefone) {
        const sql = `
            UPDATE responsavel
            SET telefone = $2
            WHERE id_usuario = $1;
        `;

        await this.banco.query(sql, [idUsuario, telefone || null]);
    }
}

module.exports = ResponsavelRepository;
