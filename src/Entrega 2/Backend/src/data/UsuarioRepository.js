const Usuario = require("../models/Usuario");
const { perfilParaBanco } = require("../utils/perfil");

class UsuarioRepository {
    constructor(banco) {
        this.banco = banco;
    }

    montarUsuario(linha) {
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
            WHERE LOWER(email) = LOWER($1);
        `;

        const resultado = await this.banco.query(sql, [email]);

        if (resultado.rows.length === 0) {
            return null;
        }

        return this.montarUsuario(resultado.rows[0]);
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

        return this.montarUsuario(resultado.rows[0]);
    }

    async criar({ nome, email, senhaHash, perfil }) {
        const sql = `
            INSERT INTO usuario (
                nome,
                email,
                senha_hash,
                perfil,
                ativo
            )
            VALUES ($1, $2, $3, $4, TRUE)
            RETURNING
                id_usuario,
                nome,
                email,
                senha_hash,
                perfil,
                ativo,
                data_criacao,
                data_atualizacao;
        `;

        const resultado = await this.banco.query(sql, [
            nome,
            email,
            senhaHash,
            perfilParaBanco(perfil) || perfil
        ]);

        return this.montarUsuario(resultado.rows[0]);
    }
}

module.exports = UsuarioRepository;
