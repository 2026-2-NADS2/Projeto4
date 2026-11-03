class Usuario {
    constructor(
        idUsuario,
        nome,
        email,
        senhaHash,
        perfil,
        ativo,
        dataCriacao,
        dataAtualizacao
    ) {
        this.idUsuario = idUsuario;
        this.nome = nome;
        this.email = email;
        this.senhaHash = senhaHash;
        this.perfil = perfil;
        this.ativo = ativo;
        this.dataCriacao = dataCriacao;
        this.dataAtualizacao = dataAtualizacao;
    }

    estaAtivo() {
        return this.ativo === true;
    }

    possuiPerfil(perfil) {
        return this.perfil === perfil;
    }
}

module.exports = Usuario;