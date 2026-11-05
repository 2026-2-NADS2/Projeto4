const { Pool } = require("pg");

require("dotenv").config();

class ConexaoBanco {
    constructor() {
        this.pool = null;
    }

    criarPool() {
        const host = process.env.DATABASE_HOST;
        const porta = Number(
            process.env.DATABASE_PORT || 5432
        );

        const banco =
            process.env.DATABASE_NAME;

        const usuario =
            process.env.DATABASE_USER;

        const senha =
            process.env.DATABASE_PASSWORD;

        if (
            !host ||
            !banco ||
            !usuario ||
            !senha
        ) {
            throw new Error(
                "As configurações de conexão com o banco estão incompletas."
            );
        }

        const usarSsl =
            String(process.env.DATABASE_SSL || "true").toLowerCase() !==
            "false";

        this.pool = new Pool({
            host: host,
            port: porta,
            database: banco,
            user: usuario,
            password: senha,
            ...(usarSsl
                ? {
                      ssl: {
                          rejectUnauthorized: true
                      }
                  }
                : {}),
            max: 5,
            connectionTimeoutMillis: 10000
        });
    }

    async query(
        sql,
        parametros = []
    ) {
        if (this.pool === null) {
            this.criarPool();
        }

        return await this.pool.query(
            sql,
            parametros
        );
    }

    async executarTransacao(operacao) {
        if (this.pool === null) {
            this.criarPool();
        }

        const cliente =
            await this.pool.connect();

        try {
            await cliente.query("BEGIN");

            const resultado =
                await operacao(cliente);

            await cliente.query("COMMIT");

            return resultado;

        } catch (erro) {
            await cliente.query("ROLLBACK");

            throw erro;

        } finally {
            cliente.release();
        }
    }

    async encerrar() {
        if (this.pool !== null) {
            await this.pool.end();
            this.pool = null;
        }
    }
}

module.exports = ConexaoBanco;