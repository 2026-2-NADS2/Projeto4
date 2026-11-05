class ErroAplicacao extends Error {
    constructor(codigo, mensagem, status = 400, detalhes = null) {
        super(mensagem);

        this.name = "ErroAplicacao";
        this.codigo = codigo;
        this.status = status;
        this.detalhes = detalhes;
    }
}

module.exports = ErroAplicacao;
