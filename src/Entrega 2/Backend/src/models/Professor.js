const Usuario = require("./Usuario");

class Professor extends Usuario {
    constructor(
        idUsuario,
        nome,
        email,
        senhaHash,
        perfil,
        ativo,
        dataCriacao,
        dataAtualizacao,
        idProfessor,
        matricula,
        dataCadastro
    ) {
        super(
            idUsuario,
            nome,
            email,
            senhaHash,
            perfil,
            ativo,
            dataCriacao,
            dataAtualizacao
        );

        this.idProfessor = idProfessor;
        this.matricula = matricula;
        this.dataCadastro = dataCadastro;
    }
}

module.exports = Professor;