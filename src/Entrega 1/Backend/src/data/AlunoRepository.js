
const Aluno = require("../models/Aluno");

class AlunoRepository {
    constructor(banco) {
        this.banco = banco;
    }

    async listarAlunos() {
        const sql = `
            SELECT
                id_aluno,
                nome,
                TO_CHAR(data_nascimento, 'YYYY-MM-DD') AS data_nascimento,
                matricula,
                ativo
            FROM aluno
            ORDER BY id_aluno;
        `;

        const resultado = await this.banco.query(sql);

        const alunos = resultado.rows.map((linha) => {
            return new Aluno(
                linha.id_aluno,
                linha.nome,
                linha.data_nascimento,
                linha.matricula,
                linha.ativo
            );
        });

        return alunos;
    }
}

module.exports = AlunoRepository;