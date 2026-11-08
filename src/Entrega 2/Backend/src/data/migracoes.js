/*
 * Ajustes idempotentes de esquema executados na inicialização do servidor.
 * Assim o sistema funciona sem precisar rodar SQL manualmente.
 */

async function garantirTelefoneUsuario(banco) {
    const coluna = await banco.query(`
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'usuario'
          AND column_name = 'telefone';
    `);

    if (coluna.rows.length === 0) {
        try {
            await banco.query(`
                ALTER TABLE usuario
                ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
            `);
        } catch (erro) {
            console.warn(
                "Aviso: não foi possível criar usuario.telefone:",
                erro.message
            );
            console.warn(
                "Rode uma vez como dono do banco: ALTER TABLE usuario ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);"
            );
            return;
        }
    }

    // Aproveita o telefone já cadastrado na tabela responsavel.
    await banco.query(`
        UPDATE usuario u
        SET telefone = r.telefone
        FROM responsavel r
        WHERE r.id_usuario = u.id_usuario
          AND u.telefone IS NULL
          AND r.telefone IS NOT NULL;
    `);
}

async function permitirRascunhoSemConteudo(banco) {
    const colunas = await banco.query(`
        SELECT column_name, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'acompanhamento'
          AND column_name IN ('descricao', 'media');
    `);

    const pendentes = colunas.rows
        .filter((linha) => linha.is_nullable === "NO")
        .map((linha) => linha.column_name);

    if (pendentes.length === 0) {
        return;
    }

    try {
        await banco.query(
            "ALTER TABLE acompanhamento ALTER COLUMN descricao DROP NOT NULL;"
        );
        await banco.query(
            "ALTER TABLE acompanhamento ALTER COLUMN media DROP NOT NULL;"
        );
    } catch (erro) {
        console.warn(
            "Aviso: não foi possível permitir rascunhos sem descrição/média:",
            erro.message
        );
        console.warn(
            "Rode uma vez como dono do banco:"
        );
        console.warn(
            "ALTER TABLE acompanhamento ALTER COLUMN descricao DROP NOT NULL;"
        );
        console.warn(
            "ALTER TABLE acompanhamento ALTER COLUMN media DROP NOT NULL;"
        );
    }
}

async function aplicarMigracoes(banco) {
    await garantirTelefoneUsuario(banco);
    await permitirRascunhoSemConteudo(banco);
}

module.exports = { aplicarMigracoes };
