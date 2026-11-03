class Acompanhamento {
    constructor(
        idAcompanhamento,
        idAluno,
        idVinculo,
        idBimestre,
        descricao,
        media,
        status,
        dataCriacao,
        dataAtualizacao
    ) {
        this.idAcompanhamento = idAcompanhamento;
        this.idAluno = idAluno;
        this.idVinculo = idVinculo;
        this.idBimestre = idBimestre;
        this.descricao = descricao;
        this.media = Number(media);
        this.status = status;
        this.dataCriacao = dataCriacao;
        this.dataAtualizacao = dataAtualizacao;
    }

    calcularSituacao() {
        return this.media >= 6
            ? "APROVADO"
            : "RECUPERAÇÃO";
    }

    estaPublicado() {
        return this.status === "PUBLICADO";
    }

    podeSerEditado() {
        return (
            this.status === "RASCUNHO" ||
            this.status === "DEVOLVIDO"
        );
    }
}

module.exports = Acompanhamento;