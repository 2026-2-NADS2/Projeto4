class SistemaEscolar {
    constructor(
    alunoRepository,
    usuarioRepository,
    professorRepository,
    autenticacaoService
) {
    this.nome = "KFKA - Plataforma de Acompanhamento Escolar";
    this.alunoRepository = alunoRepository;
    this.usuarioRepository = usuarioRepository;
    this.professorRepository = professorRepository;
    this.autenticacaoService = autenticacaoService;
}

async buscarProfessorPorId(idProfessor) {
    return await this.professorRepository.buscarPorId(idProfessor);
}

async listarVinculosProfessor(idProfessor) {
    return await this.professorRepository.listarVinculos(idProfessor);
}

    obterInformacoes() {
        return {
            sistema: this.nome,
            status: "Funcionando",
            modulo: "Backend KFKA"
        };
    }

    async autenticarUsuario(email, senha) {
    return await this.autenticacaoService.autenticar(
        email,
        senha
    );
}

    async listarAlunos() {
        return await this.alunoRepository.listarAlunos();
    }

    async buscarUsuarioPorId(idUsuario) {
        return await this.usuarioRepository.buscarPorId(idUsuario);
    }

    async buscarUsuarioPorEmail(email) {
        return await this.usuarioRepository.buscarPorEmail(email);
    }
}

module.exports = SistemaEscolar;