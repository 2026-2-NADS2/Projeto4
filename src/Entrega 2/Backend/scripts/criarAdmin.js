/*
 * Cria (ou atualiza) a conta de coordenação — o único perfil que não pode
 * ser criado pela interface, para evitar que alguém se promova a admin.
 *
 * Uso:
 *   npm run criar-admin -- "coordenacao@escola.com" "SenhaForte123" "Nome da coordenação"
 *
 * Ou por variáveis de ambiente:
 *   ADMIN_EMAIL=... ADMIN_SENHA=... ADMIN_NOME=... npm run criar-admin
 */

const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const bcrypt = require("bcryptjs");
const ConexaoBanco = require("../src/data/ConexaoBanco");
const { perfilParaBanco } = require("../src/utils/perfil");

const USO = `
Uso:
  npm run criar-admin -- "email@escola.com" "SenhaForte123" ["Nome da coordenação"]

Ou:
  ADMIN_EMAIL=... ADMIN_SENHA=... ADMIN_NOME=... npm run criar-admin
`.trim();

async function principal() {
    const [emailArg, senhaArg, nomeArg] = process.argv.slice(2);
    const email = (emailArg || process.env.ADMIN_EMAIL || "")
        .trim()
        .toLowerCase();
    const senha = senhaArg || process.env.ADMIN_SENHA || "";
    const nome = (nomeArg || process.env.ADMIN_NOME || "Coordenação").trim();

    if (!email || !senha) {
        console.error(USO);
        process.exitCode = 1;
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.error("E-mail inválido.");
        process.exitCode = 1;
        return;
    }

    if (senha.length < 8) {
        console.error("A senha precisa ter ao menos 8 caracteres.");
        process.exitCode = 1;
        return;
    }

    const banco = new ConexaoBanco();

    try {
        const senhaHash = await bcrypt.hash(senha, 12);
        const perfil = perfilParaBanco("administrador");

        const existente = await banco.query(
            "SELECT id_usuario FROM usuario WHERE LOWER(email) = LOWER($1);",
            [email]
        );

        if (existente.rows.length > 0) {
            await banco.query(
                `
                UPDATE usuario
                SET nome = $1,
                    senha_hash = $2,
                    perfil = $3,
                    ativo = TRUE,
                    data_atualizacao = NOW()
                WHERE id_usuario = $4;
                `,
                [nome, senhaHash, perfil, existente.rows[0].id_usuario]
            );

            console.log(`Conta de coordenação atualizada: ${email}`);
        } else {
            await banco.query(
                `
                INSERT INTO usuario (nome, email, senha_hash, perfil, ativo)
                VALUES ($1, $2, $3, $4, TRUE);
                `,
                [nome, email, senhaHash, perfil]
            );

            console.log(`Conta de coordenação criada: ${email}`);
        }

        console.log('Entre em /entrar escolhendo o perfil "Coordenação".');
    } finally {
        await banco.encerrar();
    }
}

principal().catch((erro) => {
    console.error("Falha ao criar a conta de coordenação:", erro.message);
    process.exitCode = 1;
});
