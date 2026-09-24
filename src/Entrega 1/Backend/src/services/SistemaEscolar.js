
class SistemaEscolar {
    constructor(alunoRepository) {
        this.nome = "KFKA - Plataforma de Acompanhamento Escolar";
        this.alunoRepository = alunoRepository;
    }

    obterInformacoes() {
        return {
            sistema: this.nome,
            status: "Funcionando",
            modulo: "Backend - E1 de POO"
        };
    }

    async listarAlunos() {
        return await this.alunoRepository.listarAlunos();
    }
}

module.exports = SistemaEscolar;