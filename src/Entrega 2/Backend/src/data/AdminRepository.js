/*
 * Repositório do backoffice administrativo.
 *
 * Concentra as consultas de escrita/leitura usadas pela coordenação.
 * Regras de negócio e mensagens ficam no AdminService; aqui só há SQL.
 */

class AdminRepository {
    constructor(banco) {
        this.banco = banco;
    }

    async consultar(sql, parametros = []) {
        return await this.banco.query(sql, parametros);
    }

    async um(sql, parametros = []) {
        const resultado = await this.consultar(sql, parametros);
        return resultado.rows[0] || null;
    }

    montarAtualizacao(tabela, colunaId, id, campos, colunas, extras = []) {
        const atribuicoes = [];
        const parametros = [];

        for (const [campo, coluna] of Object.entries(colunas)) {
            if (campos[campo] !== undefined) {
                parametros.push(campos[campo]);
                atribuicoes.push(`${coluna} = $${parametros.length}`);
            }
        }

        for (const extra of extras) {
            atribuicoes.push(extra);
        }

        if (atribuicoes.length === 0) {
            return null;
        }

        parametros.push(id);

        return {
            sql: `
                UPDATE ${tabela}
                SET ${atribuicoes.join(", ")}
                WHERE ${colunaId} = $${parametros.length}
                RETURNING *;
            `,
            parametros
        };
    }

    // =====================================================
    // USUÁRIOS
    // =====================================================

    async buscarUsuarioPorEmail(email) {
        return await this.um(
            `SELECT id_usuario, nome, email, perfil, ativo
             FROM usuario
             WHERE LOWER(email) = LOWER($1)`,
            [email]
        );
    }

    async buscarUsuarioPorId(idUsuario) {
        return await this.um(
            `SELECT id_usuario, nome, email, perfil, ativo
             FROM usuario
             WHERE id_usuario = $1`,
            [idUsuario]
        );
    }

    async atualizarUsuario(idUsuario, campos) {
        const atualizacao = this.montarAtualizacao(
            "usuario",
            "id_usuario",
            idUsuario,
            campos,
            {
                nome: "nome",
                email: "email",
                senhaHash: "senha_hash",
                ativo: "ativo"
            },
            ["data_atualizacao = NOW()"]
        );

        if (!atualizacao) return null;

        return await this.um(atualizacao.sql, atualizacao.parametros);
    }

    // =====================================================
    // ALUNOS
    // =====================================================

    async listarAlunos(filtros = {}) {
        const resultado = await this.consultar(
            `
            SELECT
                al.id_aluno,
                al.nome,
                TO_CHAR(al.data_nascimento, 'YYYY-MM-DD') AS data_nascimento,
                al.matricula,
                al.ativo,
                (
                    SELECT t.id_turma
                    FROM turma_aluno ta
                    JOIN turma t ON t.id_turma = ta.id_turma
                    WHERE ta.id_aluno = al.id_aluno
                      AND ta.ativo = TRUE
                    ORDER BY ta.data_inicio DESC
                    LIMIT 1
                ) AS id_turma,
                (
                    SELECT t.nome
                    FROM turma_aluno ta
                    JOIN turma t ON t.id_turma = ta.id_turma
                    WHERE ta.id_aluno = al.id_aluno
                      AND ta.ativo = TRUE
                    ORDER BY ta.data_inicio DESC
                    LIMIT 1
                ) AS turma
            FROM aluno al
            WHERE (
                    $1::text IS NULL
                    OR al.nome ILIKE '%' || $1 || '%'
                    OR al.matricula ILIKE '%' || $1 || '%'
                  )
              AND (
                    $2::bigint IS NULL
                    OR EXISTS (
                        SELECT 1
                        FROM turma_aluno ta
                        WHERE ta.id_aluno = al.id_aluno
                          AND ta.id_turma = $2
                          AND ta.ativo = TRUE
                    )
                  )
              AND ($3::boolean IS NULL OR al.ativo = $3)
            ORDER BY al.nome;
            `,
            [
                filtros.q || null,
                filtros.idTurma || null,
                filtros.ativo === undefined ? null : filtros.ativo
            ]
        );

        return resultado.rows;
    }

    async buscarAluno(idAluno) {
        return await this.um(
            `
            SELECT
                id_aluno,
                nome,
                TO_CHAR(data_nascimento, 'YYYY-MM-DD') AS data_nascimento,
                matricula,
                ativo
            FROM aluno
            WHERE id_aluno = $1;
            `,
            [idAluno]
        );
    }

    async buscarAlunoPorMatricula(matricula, ignorarId = null) {
        return await this.um(
            `
            SELECT id_aluno, matricula
            FROM aluno
            WHERE LOWER(matricula) = LOWER($1)
              AND ($2::bigint IS NULL OR id_aluno <> $2)
            LIMIT 1;
            `,
            [matricula, ignorarId]
        );
    }

    async criarAluno(dados) {
        const resultado = await this.consultar(
            `
            INSERT INTO aluno (
                nome,
                data_nascimento,
                matricula,
                ativo
            )
            VALUES ($1, $2, $3, $4)
            RETURNING id_aluno;
            `,
            [
                dados.nome,
                dados.dataNascimento,
                dados.matricula,
                dados.ativo === undefined ? true : dados.ativo
            ]
        );

        return resultado.rows[0].id_aluno;
    }

    async atualizarAluno(idAluno, campos) {
        const atualizacao = this.montarAtualizacao(
            "aluno",
            "id_aluno",
            idAluno,
            campos,
            {
                nome: "nome",
                dataNascimento: "data_nascimento",
                matricula: "matricula",
                ativo: "ativo"
            }
        );

        if (!atualizacao) return null;

        return await this.um(atualizacao.sql, atualizacao.parametros);
    }

    async definirAtivoAluno(idAluno, ativo) {
        return await this.um(
            `
            UPDATE aluno
            SET ativo = $1
            WHERE id_aluno = $2
            RETURNING id_aluno, ativo;
            `,
            [ativo, idAluno]
        );
    }

    async listarResponsaveisDoAluno(idAluno) {
        const resultado = await this.consultar(
            `
            SELECT
                r.id_responsavel,
                u.nome,
                u.email,
                r.telefone,
                ar.tipo_relacao,
                ar.autorizado,
                ar.data_vinculo
            FROM aluno_responsavel ar
            JOIN responsavel r ON r.id_responsavel = ar.id_responsavel
            JOIN usuario u ON u.id_usuario = r.id_usuario
            WHERE ar.id_aluno = $1
            ORDER BY u.nome;
            `,
            [idAluno]
        );

        return resultado.rows;
    }

    async vincularResponsavel(idAluno, idResponsavel, tipoRelacao) {
        return await this.um(
            `
            INSERT INTO aluno_responsavel (
                id_aluno,
                id_responsavel,
                tipo_relacao,
                autorizado
            )
            VALUES ($1, $2, $3, TRUE)
            ON CONFLICT (id_aluno, id_responsavel)
            DO UPDATE SET
                tipo_relacao = EXCLUDED.tipo_relacao,
                autorizado = TRUE
            RETURNING id_aluno, id_responsavel, tipo_relacao, autorizado;
            `,
            [idAluno, idResponsavel, tipoRelacao || null]
        );
    }

    async desvincularResponsavel(idAluno, idResponsavel) {
        const resultado = await this.consultar(
            `
            DELETE FROM aluno_responsavel
            WHERE id_aluno = $1
              AND id_responsavel = $2
            RETURNING id_aluno, id_responsavel;
            `,
            [idAluno, idResponsavel]
        );

        return resultado.rows[0] || null;
    }

    async listarMatriculasDoAluno(idAluno) {
        const resultado = await this.consultar(
            `
            SELECT
                ta.id_turma,
                t.nome AS turma,
                ta.id_ano_letivo,
                an.ano AS ano_letivo,
                TO_CHAR(ta.data_inicio, 'YYYY-MM-DD') AS data_inicio,
                TO_CHAR(ta.data_fim, 'YYYY-MM-DD') AS data_fim,
                ta.ativo
            FROM turma_aluno ta
            JOIN turma t ON t.id_turma = ta.id_turma
            JOIN ano_letivo an ON an.id_ano_letivo = ta.id_ano_letivo
            WHERE ta.id_aluno = $1
            ORDER BY an.ano DESC, t.nome;
            `,
            [idAluno]
        );

        return resultado.rows;
    }

    async matricularAluno(dados) {
        return await this.um(
            `
            INSERT INTO turma_aluno (
                id_turma,
                id_aluno,
                id_ano_letivo,
                data_inicio,
                ativo
            )
            VALUES ($1, $2, $3, $4, TRUE)
            ON CONFLICT (id_turma, id_aluno, id_ano_letivo)
            DO UPDATE SET
                data_inicio = EXCLUDED.data_inicio,
                data_fim = NULL,
                ativo = TRUE
            RETURNING id_turma, id_aluno, id_ano_letivo, data_inicio, ativo;
            `,
            [
                dados.idTurma,
                dados.idAluno,
                dados.idAnoLetivo,
                dados.dataInicio
            ]
        );
    }

    async desmatricularAluno(idAluno, idTurma, idAnoLetivo) {
        const resultado = await this.consultar(
            `
            DELETE FROM turma_aluno
            WHERE id_aluno = $1
              AND id_turma = $2
              AND id_ano_letivo = $3
            RETURNING id_aluno, id_turma, id_ano_letivo;
            `,
            [idAluno, idTurma, idAnoLetivo]
        );

        return resultado.rows[0] || null;
    }

    // =====================================================
    // PROFESSORES
    // =====================================================

    async listarProfessores() {
        const resultado = await this.consultar(
            `
            SELECT
                p.id_professor,
                p.id_usuario,
                p.matricula,
                u.nome,
                u.email,
                u.ativo,
                u.data_criacao,
                (
                    SELECT COUNT(*)::int
                    FROM turma_disciplina_professor tdp
                    WHERE tdp.id_professor = p.id_professor
                      AND tdp.ativo = TRUE
                ) AS total_vinculos
            FROM professor p
            JOIN usuario u ON u.id_usuario = p.id_usuario
            ORDER BY u.nome;
            `
        );

        return resultado.rows;
    }

    async buscarProfessor(idProfessor) {
        return await this.um(
            `
            SELECT
                p.id_professor,
                p.id_usuario,
                p.matricula,
                u.nome,
                u.email,
                u.ativo,
                u.data_criacao
            FROM professor p
            JOIN usuario u ON u.id_usuario = p.id_usuario
            WHERE p.id_professor = $1;
            `,
            [idProfessor]
        );
    }

    async buscarProfessorPorMatricula(matricula, ignorarId = null) {
        return await this.um(
            `
            SELECT id_professor, matricula
            FROM professor
            WHERE LOWER(matricula) = LOWER($1)
              AND ($2::bigint IS NULL OR id_professor <> $2)
            LIMIT 1;
            `,
            [matricula, ignorarId]
        );
    }

    async criarProfessor(dados) {
        return await this.banco.executarTransacao(async (cliente) => {
            const usuario = await cliente.query(
                `
                INSERT INTO usuario (
                    nome,
                    email,
                    senha_hash,
                    perfil,
                    ativo
                )
                VALUES ($1, $2, $3, 'PROFESSOR', TRUE)
                RETURNING id_usuario;
                `,
                [dados.nome, dados.email, dados.senhaHash]
            );

            const idUsuario = usuario.rows[0].id_usuario;

            const professor = await cliente.query(
                `
                INSERT INTO professor (id_usuario, matricula)
                VALUES ($1, $2)
                RETURNING id_professor;
                `,
                [idUsuario, dados.matricula]
            );

            return {
                idUsuario,
                idProfessor: professor.rows[0].id_professor
            };
        });
    }

    async atualizarProfessor(idProfessor, dados) {
        return await this.banco.executarTransacao(async (cliente) => {
            const atual = await cliente.query(
                `
                SELECT id_usuario
                FROM professor
                WHERE id_professor = $1;
                `,
                [idProfessor]
            );

            if (atual.rows.length === 0) {
                return null;
            }

            const idUsuario = atual.rows[0].id_usuario;

            const camposUsuario = {};
            if (dados.nome !== undefined) camposUsuario.nome = dados.nome;
            if (dados.email !== undefined) camposUsuario.email = dados.email;
            if (dados.senhaHash !== undefined) {
                camposUsuario.senhaHash = dados.senhaHash;
            }
            if (dados.ativo !== undefined) camposUsuario.ativo = dados.ativo;

            if (Object.keys(camposUsuario).length > 0) {
                const atualizacao = this.montarAtualizacao(
                    "usuario",
                    "id_usuario",
                    idUsuario,
                    camposUsuario,
                    {
                        nome: "nome",
                        email: "email",
                        senhaHash: "senha_hash",
                        ativo: "ativo"
                    },
                    ["data_atualizacao = NOW()"]
                );

                await cliente.query(
                    atualizacao.sql,
                    atualizacao.parametros
                );
            }

            if (dados.matricula !== undefined) {
                await cliente.query(
                    `
                    UPDATE professor
                    SET matricula = $1
                    WHERE id_professor = $2;
                    `,
                    [dados.matricula, idProfessor]
                );
            }

            return true;
        });
    }

    async definirAtivoProfessor(idProfessor, ativo) {
        return await this.um(
            `
            UPDATE usuario
            SET ativo = $1, data_atualizacao = NOW()
            WHERE id_usuario = (
                SELECT id_usuario
                FROM professor
                WHERE id_professor = $2
            )
            RETURNING id_usuario, ativo;
            `,
            [ativo, idProfessor]
        );
    }

    // =====================================================
    // RESPONSÁVEIS
    // =====================================================

    async listarResponsaveis() {
        const resultado = await this.consultar(
            `
            SELECT
                r.id_responsavel,
                r.id_usuario,
                r.telefone,
                u.nome,
                u.email,
                u.ativo,
                u.data_criacao,
                (
                    SELECT COUNT(*)::int
                    FROM aluno_responsavel ar
                    WHERE ar.id_responsavel = r.id_responsavel
                      AND ar.autorizado = TRUE
                ) AS total_alunos,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', ar.id_aluno,
                                'tipoRelacao', ar.tipo_relacao,
                                'autorizado', ar.autorizado
                            )
                            ORDER BY ar.id_aluno
                        )
                        FROM aluno_responsavel ar
                        WHERE ar.id_responsavel = r.id_responsavel
                    ),
                    '[]'::json
                ) AS alunos
            FROM responsavel r
            JOIN usuario u ON u.id_usuario = r.id_usuario
            ORDER BY u.nome;
            `
        );

        return resultado.rows;
    }

    async buscarResponsavel(idResponsavel) {
        return await this.um(
            `
            SELECT
                r.id_responsavel,
                r.id_usuario,
                r.telefone,
                u.nome,
                u.email,
                u.ativo,
                u.data_criacao
            FROM responsavel r
            JOIN usuario u ON u.id_usuario = r.id_usuario
            WHERE r.id_responsavel = $1;
            `,
            [idResponsavel]
        );
    }

    async criarResponsavel(dados) {
        return await this.banco.executarTransacao(async (cliente) => {
            const usuario = await cliente.query(
                `
                INSERT INTO usuario (
                    nome,
                    email,
                    senha_hash,
                    perfil,
                    ativo
                )
                VALUES ($1, $2, $3, 'RESPONSAVEL', TRUE)
                RETURNING id_usuario;
                `,
                [dados.nome, dados.email, dados.senhaHash]
            );

            const idUsuario = usuario.rows[0].id_usuario;

            const responsavel = await cliente.query(
                `
                INSERT INTO responsavel (id_usuario, telefone)
                VALUES ($1, $2)
                RETURNING id_responsavel;
                `,
                [idUsuario, dados.telefone || null]
            );

            return {
                idUsuario,
                idResponsavel: responsavel.rows[0].id_responsavel
            };
        });
    }

    async atualizarResponsavel(idResponsavel, dados) {
        return await this.banco.executarTransacao(async (cliente) => {
            const atual = await cliente.query(
                `
                SELECT id_usuario
                FROM responsavel
                WHERE id_responsavel = $1;
                `,
                [idResponsavel]
            );

            if (atual.rows.length === 0) {
                return null;
            }

            const idUsuario = atual.rows[0].id_usuario;

            const camposUsuario = {};
            if (dados.nome !== undefined) camposUsuario.nome = dados.nome;
            if (dados.email !== undefined) camposUsuario.email = dados.email;
            if (dados.senhaHash !== undefined) {
                camposUsuario.senhaHash = dados.senhaHash;
            }
            if (dados.ativo !== undefined) camposUsuario.ativo = dados.ativo;

            if (Object.keys(camposUsuario).length > 0) {
                const atualizacao = this.montarAtualizacao(
                    "usuario",
                    "id_usuario",
                    idUsuario,
                    camposUsuario,
                    {
                        nome: "nome",
                        email: "email",
                        senhaHash: "senha_hash",
                        ativo: "ativo"
                    },
                    ["data_atualizacao = NOW()"]
                );

                await cliente.query(
                    atualizacao.sql,
                    atualizacao.parametros
                );
            }

            if (dados.telefone !== undefined) {
                await cliente.query(
                    `
                    UPDATE responsavel
                    SET telefone = $1
                    WHERE id_responsavel = $2;
                    `,
                    [dados.telefone || null, idResponsavel]
                );
            }

            return true;
        });
    }

    async definirAtivoResponsavel(idResponsavel, ativo) {
        return await this.um(
            `
            UPDATE usuario
            SET ativo = $1, data_atualizacao = NOW()
            WHERE id_usuario = (
                SELECT id_usuario
                FROM responsavel
                WHERE id_responsavel = $2
            )
            RETURNING id_usuario, ativo;
            `,
            [ativo, idResponsavel]
        );
    }

    async listarAlunosDoResponsavel(idResponsavel) {
        const resultado = await this.consultar(
            `
            SELECT
                al.id_aluno,
                al.nome,
                al.matricula,
                al.ativo,
                ar.tipo_relacao,
                ar.autorizado
            FROM aluno_responsavel ar
            JOIN aluno al ON al.id_aluno = ar.id_aluno
            WHERE ar.id_responsavel = $1
            ORDER BY al.nome;
            `,
            [idResponsavel]
        );

        return resultado.rows;
    }

    // =====================================================
    // TURMAS
    // =====================================================

    async listarTurmas() {
        const resultado = await this.consultar(
            `
            SELECT
                t.id_turma,
                t.nome,
                t.ano_serie,
                t.turno,
                t.ativo,
                (
                    SELECT COUNT(*)::int
                    FROM turma_aluno ta
                    WHERE ta.id_turma = t.id_turma
                      AND ta.ativo = TRUE
                ) AS total_alunos
            FROM turma t
            ORDER BY t.nome;
            `
        );

        return resultado.rows;
    }

    async buscarTurma(idTurma) {
        return await this.um(
            `
            SELECT id_turma, nome, ano_serie, turno, ativo
            FROM turma
            WHERE id_turma = $1;
            `,
            [idTurma]
        );
    }

    async criarTurma(dados) {
        const resultado = await this.consultar(
            `
            INSERT INTO turma (nome, ano_serie, turno, ativo)
            VALUES ($1, $2, $3, $4)
            RETURNING id_turma;
            `,
            [
                dados.nome,
                dados.anoSerie,
                dados.turno,
                dados.ativo === undefined ? true : dados.ativo
            ]
        );

        return resultado.rows[0].id_turma;
    }

    async atualizarTurma(idTurma, campos) {
        const atualizacao = this.montarAtualizacao(
            "turma",
            "id_turma",
            idTurma,
            campos,
            {
                nome: "nome",
                anoSerie: "ano_serie",
                turno: "turno",
                ativo: "ativo"
            }
        );

        if (!atualizacao) return null;

        return await this.um(atualizacao.sql, atualizacao.parametros);
    }

    async definirAtivoTurma(idTurma, ativo) {
        return await this.um(
            `
            UPDATE turma
            SET ativo = $1
            WHERE id_turma = $2
            RETURNING id_turma, ativo;
            `,
            [ativo, idTurma]
        );
    }

    async listarAlunosDaTurma(idTurma, idAnoLetivo = null) {
        const resultado = await this.consultar(
            `
            SELECT
                al.id_aluno,
                al.nome,
                al.matricula,
                al.ativo,
                ta.id_ano_letivo,
                an.ano AS ano_letivo,
                TO_CHAR(ta.data_inicio, 'YYYY-MM-DD') AS data_inicio,
                TO_CHAR(ta.data_fim, 'YYYY-MM-DD') AS data_fim,
                ta.ativo AS matricula_ativa
            FROM turma_aluno ta
            JOIN aluno al ON al.id_aluno = ta.id_aluno
            JOIN ano_letivo an ON an.id_ano_letivo = ta.id_ano_letivo
            WHERE ta.id_turma = $1
              AND ($2::bigint IS NULL OR ta.id_ano_letivo = $2)
            ORDER BY al.nome;
            `,
            [idTurma, idAnoLetivo]
        );

        return resultado.rows;
    }

    async listarVinculosDaTurma(idTurma) {
        const resultado = await this.consultar(
            `
            SELECT
                tdp.id_vinculo,
                tdp.id_turma,
                t.nome AS turma,
                t.ano_serie,
                t.turno,
                tdp.id_disciplina,
                d.nome AS disciplina,
                tdp.id_professor,
                u.nome AS professor,
                tdp.id_ano_letivo,
                an.ano AS ano_letivo,
                tdp.ativo
            FROM turma_disciplina_professor tdp
            JOIN turma t ON t.id_turma = tdp.id_turma
            JOIN disciplina d ON d.id_disciplina = tdp.id_disciplina
            JOIN professor p ON p.id_professor = tdp.id_professor
            JOIN usuario u ON u.id_usuario = p.id_usuario
            JOIN ano_letivo an ON an.id_ano_letivo = tdp.id_ano_letivo
            WHERE tdp.id_turma = $1
            ORDER BY d.nome, u.nome;
            `,
            [idTurma]
        );

        return resultado.rows;
    }

    // =====================================================
    // DISCIPLINAS E ÁREAS
    // =====================================================

    async listarTags() {
        const resultado = await this.consultar(
            `
            SELECT id_tag, nome, descricao
            FROM tag
            WHERE ativo = TRUE
            ORDER BY nome;
            `
        );

        return resultado.rows.map((linha) => ({
            id: linha.id_tag,
            nome: linha.nome,
            descricao: linha.descricao
        }));
    }

    async listarAreas() {
        const resultado = await this.consultar(
            `
            SELECT id_area, nome, descricao, ativo
            FROM area
            ORDER BY nome;
            `
        );

        return resultado.rows;
    }

    async buscarArea(idArea) {
        return await this.um(
            `
            SELECT id_area, nome, descricao, ativo
            FROM area
            WHERE id_area = $1;
            `,
            [idArea]
        );
    }

    async criarArea(dados) {
        const resultado = await this.consultar(
            `
            INSERT INTO area (nome, descricao, ativo)
            VALUES ($1, $2, $3)
            RETURNING id_area;
            `,
            [
                dados.nome,
                dados.descricao || null,
                dados.ativo === undefined ? true : dados.ativo
            ]
        );

        return resultado.rows[0].id_area;
    }

    async atualizarArea(idArea, campos) {
        const atualizacao = this.montarAtualizacao(
            "area",
            "id_area",
            idArea,
            campos,
            {
                nome: "nome",
                descricao: "descricao",
                ativo: "ativo"
            }
        );

        if (!atualizacao) return null;

        return await this.um(atualizacao.sql, atualizacao.parametros);
    }

    async definirAtivoArea(idArea, ativo) {
        return await this.um(
            `
            UPDATE area
            SET ativo = $1
            WHERE id_area = $2
            RETURNING id_area, ativo;
            `,
            [ativo, idArea]
        );
    }

    async listarDisciplinas() {
        const resultado = await this.consultar(
            `
            SELECT
                d.id_disciplina,
                d.id_area,
                a.nome AS area,
                d.nome,
                d.descricao,
                d.ativo
            FROM disciplina d
            JOIN area a ON a.id_area = d.id_area
            ORDER BY a.nome, d.nome;
            `
        );

        return resultado.rows;
    }

    async buscarDisciplina(idDisciplina) {
        return await this.um(
            `
            SELECT
                d.id_disciplina,
                d.id_area,
                a.nome AS area,
                d.nome,
                d.descricao,
                d.ativo
            FROM disciplina d
            JOIN area a ON a.id_area = d.id_area
            WHERE d.id_disciplina = $1;
            `,
            [idDisciplina]
        );
    }

    async criarDisciplina(dados) {
        const resultado = await this.consultar(
            `
            INSERT INTO disciplina (
                id_area,
                nome,
                descricao,
                ativo
            )
            VALUES ($1, $2, $3, $4)
            RETURNING id_disciplina;
            `,
            [
                dados.idArea,
                dados.nome,
                dados.descricao || null,
                dados.ativo === undefined ? true : dados.ativo
            ]
        );

        return resultado.rows[0].id_disciplina;
    }

    async atualizarDisciplina(idDisciplina, campos) {
        const atualizacao = this.montarAtualizacao(
            "disciplina",
            "id_disciplina",
            idDisciplina,
            campos,
            {
                idArea: "id_area",
                nome: "nome",
                descricao: "descricao",
                ativo: "ativo"
            }
        );

        if (!atualizacao) return null;

        return await this.um(atualizacao.sql, atualizacao.parametros);
    }

    async definirAtivoDisciplina(idDisciplina, ativo) {
        return await this.um(
            `
            UPDATE disciplina
            SET ativo = $1
            WHERE id_disciplina = $2
            RETURNING id_disciplina, ativo;
            `,
            [ativo, idDisciplina]
        );
    }

    // =====================================================
    // VÍNCULOS TURMA / DISCIPLINA / PROFESSOR
    // =====================================================

    async listarVinculos(filtros = {}) {
        const resultado = await this.consultar(
            `
            SELECT
                tdp.id_vinculo,
                tdp.id_turma,
                t.nome AS turma,
                t.ano_serie,
                t.turno,
                tdp.id_disciplina,
                d.nome AS disciplina,
                tdp.id_professor,
                u.nome AS professor,
                tdp.id_ano_letivo,
                an.ano AS ano_letivo,
                tdp.ativo
            FROM turma_disciplina_professor tdp
            JOIN turma t ON t.id_turma = tdp.id_turma
            JOIN disciplina d ON d.id_disciplina = tdp.id_disciplina
            JOIN professor p ON p.id_professor = tdp.id_professor
            JOIN usuario u ON u.id_usuario = p.id_usuario
            JOIN ano_letivo an ON an.id_ano_letivo = tdp.id_ano_letivo
            WHERE ($1::bigint IS NULL OR tdp.id_turma = $1)
              AND ($2::bigint IS NULL OR tdp.id_professor = $2)
              AND ($3::bigint IS NULL OR tdp.id_disciplina = $3)
              AND ($4::bigint IS NULL OR tdp.id_ano_letivo = $4)
              AND ($5::boolean IS NULL OR tdp.ativo = $5)
            ORDER BY an.ano DESC, t.nome, d.nome;
            `,
            [
                filtros.idTurma || null,
                filtros.idProfessor || null,
                filtros.idDisciplina || null,
                filtros.idAnoLetivo || null,
                filtros.ativo === undefined ? null : filtros.ativo
            ]
        );

        return resultado.rows;
    }

    async buscarVinculo(idVinculo) {
        return await this.um(
            `
            SELECT
                tdp.id_vinculo,
                tdp.id_turma,
                t.nome AS turma,
                tdp.id_disciplina,
                d.nome AS disciplina,
                tdp.id_professor,
                u.nome AS professor,
                tdp.id_ano_letivo,
                an.ano AS ano_letivo,
                tdp.ativo
            FROM turma_disciplina_professor tdp
            JOIN turma t ON t.id_turma = tdp.id_turma
            JOIN disciplina d ON d.id_disciplina = tdp.id_disciplina
            JOIN professor p ON p.id_professor = tdp.id_professor
            JOIN usuario u ON u.id_usuario = p.id_usuario
            JOIN ano_letivo an ON an.id_ano_letivo = tdp.id_ano_letivo
            WHERE tdp.id_vinculo = $1;
            `,
            [idVinculo]
        );
    }

    async criarVinculo(dados) {
        const resultado = await this.consultar(
            `
            INSERT INTO turma_disciplina_professor (
                id_turma,
                id_disciplina,
                id_professor,
                id_ano_letivo,
                ativo
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id_vinculo;
            `,
            [
                dados.idTurma,
                dados.idDisciplina,
                dados.idProfessor,
                dados.idAnoLetivo,
                dados.ativo === undefined ? true : dados.ativo
            ]
        );

        return resultado.rows[0].id_vinculo;
    }

    async atualizarVinculo(idVinculo, campos) {
        const atualizacao = this.montarAtualizacao(
            "turma_disciplina_professor",
            "id_vinculo",
            idVinculo,
            campos,
            {
                idTurma: "id_turma",
                idDisciplina: "id_disciplina",
                idProfessor: "id_professor",
                idAnoLetivo: "id_ano_letivo",
                ativo: "ativo"
            }
        );

        if (!atualizacao) return null;

        return await this.um(atualizacao.sql, atualizacao.parametros);
    }

    async definirAtivoVinculo(idVinculo, ativo) {
        return await this.um(
            `
            UPDATE turma_disciplina_professor
            SET ativo = $1
            WHERE id_vinculo = $2
            RETURNING id_vinculo, ativo;
            `,
            [ativo, idVinculo]
        );
    }

    // =====================================================
    // ANOS LETIVOS E BIMESTRES
    // =====================================================

    async listarAnosLetivos() {
        const resultado = await this.consultar(
            `
            SELECT
                id_ano_letivo,
                ano,
                TO_CHAR(data_inicio, 'YYYY-MM-DD') AS data_inicio,
                TO_CHAR(data_fim, 'YYYY-MM-DD') AS data_fim,
                ativo
            FROM ano_letivo
            ORDER BY ano DESC;
            `
        );

        return resultado.rows;
    }

    async buscarAnoLetivo(idAnoLetivo) {
        return await this.um(
            `
            SELECT
                id_ano_letivo,
                ano,
                TO_CHAR(data_inicio, 'YYYY-MM-DD') AS data_inicio,
                TO_CHAR(data_fim, 'YYYY-MM-DD') AS data_fim,
                ativo
            FROM ano_letivo
            WHERE id_ano_letivo = $1;
            `,
            [idAnoLetivo]
        );
    }

    async criarAnoLetivo(dados) {
        const resultado = await this.consultar(
            `
            INSERT INTO ano_letivo (
                ano,
                data_inicio,
                data_fim,
                ativo
            )
            VALUES ($1, $2, $3, $4)
            RETURNING id_ano_letivo;
            `,
            [
                dados.ano,
                dados.dataInicio,
                dados.dataFim,
                dados.ativo === undefined ? true : dados.ativo
            ]
        );

        return resultado.rows[0].id_ano_letivo;
    }

    async atualizarAnoLetivo(idAnoLetivo, campos) {
        const atualizacao = this.montarAtualizacao(
            "ano_letivo",
            "id_ano_letivo",
            idAnoLetivo,
            campos,
            {
                ano: "ano",
                dataInicio: "data_inicio",
                dataFim: "data_fim",
                ativo: "ativo"
            }
        );

        if (!atualizacao) return null;

        return await this.um(atualizacao.sql, atualizacao.parametros);
    }

    async definirAtivoAnoLetivo(idAnoLetivo, ativo) {
        return await this.um(
            `
            UPDATE ano_letivo
            SET ativo = $1
            WHERE id_ano_letivo = $2
            RETURNING id_ano_letivo, ativo;
            `,
            [ativo, idAnoLetivo]
        );
    }

    async listarBimestres(filtros = {}) {
        const resultado = await this.consultar(
            `
            SELECT
                b.id_bimestre,
                b.id_ano_letivo,
                an.ano AS ano_letivo,
                b.numero,
                TO_CHAR(b.data_inicio, 'YYYY-MM-DD') AS data_inicio,
                TO_CHAR(b.data_fim, 'YYYY-MM-DD') AS data_fim,
                TO_CHAR(b.hora_inicio, 'HH24:MI') AS hora_inicio,
                TO_CHAR(b.hora_fim, 'HH24:MI') AS hora_fim
            FROM bimestre b
            JOIN ano_letivo an ON an.id_ano_letivo = b.id_ano_letivo
            WHERE ($1::bigint IS NULL OR b.id_ano_letivo = $1)
            ORDER BY an.ano DESC, b.numero;
            `,
            [filtros.idAnoLetivo || null]
        );

        return resultado.rows;
    }

    async buscarBimestre(idBimestre) {
        return await this.um(
            `
            SELECT
                b.id_bimestre,
                b.id_ano_letivo,
                b.numero,
                TO_CHAR(b.data_inicio, 'YYYY-MM-DD') AS data_inicio,
                TO_CHAR(b.data_fim, 'YYYY-MM-DD') AS data_fim,
                TO_CHAR(b.hora_inicio, 'HH24:MI') AS hora_inicio,
                TO_CHAR(b.hora_fim, 'HH24:MI') AS hora_fim
            FROM bimestre b
            WHERE b.id_bimestre = $1;
            `,
            [idBimestre]
        );
    }

    async criarBimestre(dados) {
        const resultado = await this.consultar(
            `
            INSERT INTO bimestre (
                id_ano_letivo,
                numero,
                data_inicio,
                data_fim,
                hora_inicio,
                hora_fim
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id_bimestre;
            `,
            [
                dados.idAnoLetivo,
                dados.numero,
                dados.dataInicio,
                dados.dataFim,
                dados.horaInicio,
                dados.horaFim
            ]
        );

        return resultado.rows[0].id_bimestre;
    }

    async atualizarBimestre(idBimestre, campos) {
        const atualizacao = this.montarAtualizacao(
            "bimestre",
            "id_bimestre",
            idBimestre,
            campos,
            {
                idAnoLetivo: "id_ano_letivo",
                numero: "numero",
                dataInicio: "data_inicio",
                dataFim: "data_fim",
                horaInicio: "hora_inicio",
                horaFim: "hora_fim"
            }
        );

        if (!atualizacao) return null;

        return await this.um(atualizacao.sql, atualizacao.parametros);
    }

    async excluirBimestre(idBimestre) {
        const resultado = await this.consultar(
            `
            DELETE FROM bimestre
            WHERE id_bimestre = $1
            RETURNING id_bimestre;
            `,
            [idBimestre]
        );

        return resultado.rows[0] || null;
    }

    // =====================================================
    // AUDITORIA
    // =====================================================

    async listarAuditoria(filtros = {}) {
        const resultado = await this.consultar(
            `
            SELECT
                h.id_historico,
                h.id_acompanhamento,
                al.nome AS aluno,
                d.nome AS disciplina,
                u.nome AS usuario,
                u.perfil,
                h.estado_anterior,
                h.estado_novo,
                h.data_hora,
                h.observacao
            FROM historico_acompanhamento h
            JOIN usuario u ON u.id_usuario = h.id_usuario
            JOIN acompanhamento ac ON ac.id_acompanhamento = h.id_acompanhamento
            JOIN aluno al ON al.id_aluno = ac.id_aluno
            JOIN turma_disciplina_professor tdp
                ON tdp.id_vinculo = ac.id_vinculo
            JOIN disciplina d ON d.id_disciplina = tdp.id_disciplina
            WHERE ($1::bigint IS NULL OR h.id_acompanhamento = $1)
              AND ($2::bigint IS NULL OR h.id_usuario = $2)
            ORDER BY h.data_hora DESC
            LIMIT $3;
            `,
            [
                filtros.idAcompanhamento || null,
                filtros.idUsuario || null,
                filtros.limite || 200
            ]
        );

        return resultado.rows;
    }
}

module.exports = AdminRepository;
