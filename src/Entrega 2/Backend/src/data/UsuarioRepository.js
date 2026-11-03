const Usuario = require("../models/Usuario");

class UsuarioRepository {
    constructor(banco) {
        this.banco = banco;
    }

    async buscarPorEmail(email) {
        const sql = `
            SELECT
                id_usuario,
                nome,
                email,
                senha_hash,
                perfil,
                ativo,
                data_criacao,
                data_atualizacao
            FROM usuario
            WHERE email = $1;
        `;

        const resultado = await this.banco.query(sql, [email]);

        if (resultado.rows.length === 0) {
            return null;
        }

        const linha = resultado.rows[0];

        return new Usuario(
            linha.id_usuario,
            linha.nome,
            linha.email,
            linha.senha_hash,
            linha.perfil,
            linha.ativo,
            linha.data_criacao,
            linha.data_atualizacao
        );
    }

    async buscarPorId(idUsuario) {
        const sql = `
            SELECT
                id_usuario,
                nome,
                email,
                senha_hash,
                perfil,
                ativo,
                data_criacao,
                data_atualizacao
            FROM usuario
            WHERE id_usuario = $1;
        `;

        const resultado = await this.banco.query(sql, [idUsuario]);

        if (resultado.rows.length === 0) {
            return null;
        }

        const linha = resultado.rows[0];

        return new Usuario(
            linha.id_usuario,
            linha.nome,
            linha.email,
            linha.senha_hash,
            linha.perfil,
            linha.ativo,
            linha.data_criacao,
            linha.data_atualizacao
        );
    }
}

module.exports = UsuarioRepository;