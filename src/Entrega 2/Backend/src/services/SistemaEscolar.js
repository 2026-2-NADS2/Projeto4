class SistemaEscolar {
    constructor(
        alunoRepository,
        usuarioRepository,
        professorRepository,
        acompanhamentoRepository,
        historicoAcompanhamentoRepository,
        autenticacaoService,
        acompanhamentoService
    ) {
        this.nome =
            "KFKA - Plataforma de Acompanhamento Escolar";

        this.alunoRepository =
            alunoRepository;

        this.usuarioRepository =
            usuarioRepository;

        this.professorRepository =
            professorRepository;

        this.acompanhamentoRepository =
            acompanhamentoRepository;

        this.historicoAcompanhamentoRepository =
            historicoAcompanhamentoRepository;

        this.autenticacaoService =
            autenticacaoService;

        this.acompanhamentoService =
            acompanhamentoService;
    }


    // =====================================================
    // INFORMAÇÕES DO SISTEMA
    // =====================================================

    obterInformacoes() {
        return {
            sistema: this.nome,
            status: "Funcionando",
            modulo: "Backend KFKA"
        };
    }


    // =====================================================
    // AUTENTICAÇÃO
    // =====================================================

    async autenticarUsuario(
        email,
        senha
    ) {
        return await this.autenticacaoService
            .autenticar(
                email,
                senha
            );
    }


    // =====================================================
    // USUÁRIOS
    // =====================================================

    async buscarUsuarioPorId(
        idUsuario
    ) {
        return await this.usuarioRepository
            .buscarPorId(
                idUsuario
            );
    }


    async buscarUsuarioPorEmail(
        email
    ) {
        return await this.usuarioRepository
            .buscarPorEmail(
                email
            );
    }


    // =====================================================
    // ALUNOS
    // =====================================================

    async listarAlunos() {
        return await this.alunoRepository
            .listarAlunos();
    }


    // =====================================================
    // PROFESSORES
    // =====================================================

    async buscarProfessorPorId(
        idProfessor
    ) {
        return await this.professorRepository
            .buscarPorId(
                idProfessor
            );
    }


    async listarVinculosProfessor(
        idProfessor
    ) {
        return await this.professorRepository
            .listarVinculos(
                idProfessor
            );
    }


    // =====================================================
    // ACOMPANHAMENTOS
    // =====================================================

    async buscarAcompanhamentoPorId(
        idAcompanhamento
    ) {
        return await this.acompanhamentoRepository
            .buscarPorId(
                idAcompanhamento
            );
    }


    async listarAcompanhamentosProfessor(
        idProfessor
    ) {
        return await this.acompanhamentoRepository
            .listarPorProfessor(
                idProfessor
            );
    }


    async criarAcompanhamento(
        idProfessor,
        dados
    ) {
        return await this.acompanhamentoService
            .criarAcompanhamento(
                idProfessor,
                dados
            );
    }


    async alterarStatusAcompanhamento(
        idAcompanhamento,
        novoStatus,
        idUsuario,
        observacao = null
    ) {
        return await this.acompanhamentoService
            .alterarStatus(
                idAcompanhamento,
                novoStatus,
                idUsuario,
                observacao
            );
    }


    // =====================================================
    // HISTÓRICO / AUDITORIA
    // =====================================================

    async listarHistoricoAcompanhamento(
        idAcompanhamento
    ) {
        return await this
            .historicoAcompanhamentoRepository
            .listarPorAcompanhamento(
                idAcompanhamento
            );
    }
}

module.exports = SistemaEscolar;