const bcrypt = require("bcryptjs");
const ErroAplicacao = require("../errors/ErroAplicacao");

const PERFIS_PUBLICOS = ["responsavel"];

class AutenticacaoService {
    constructor(
        usuarioRepository,
        tokenService = null,
        opcoes = {}
    ) {
        this.usuarioRepository = usuarioRepository;
        this.tokenService = tokenService;
        this.professorRepository = opcoes.professorRepository || null;
        this.responsavelRepository = opcoes.responsavelRepository || null;
    }

    async montarUsuarioPublico(usuario) {
        const dados = {
            idUsuario: usuario.idUsuario,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil,
            ativo: usuario.ativo,
            professorId: null,
            responsavelId: null
        };

        if (usuario.perfil === "professor" && this.professorRepository) {
            const professor = await this.professorRepository.buscarPorUsuario(
                usuario.idUsuario
            );
            dados.professorId = professor ? professor.idProfessor : null;
        }

        if (usuario.perfil === "responsavel" && this.responsavelRepository) {
            const responsavel =
                await this.responsavelRepository.buscarPorUsuario(
                    usuario.idUsuario
                );
            dados.responsavelId = responsavel
                ? responsavel.idResponsavel
                : null;
        }

        return dados;
    }

    async validarCredenciais(email, senha, perfilSolicitado = null) {
        const usuario = await this.usuarioRepository.buscarPorEmail(email);

        if (usuario === null) {
            throw new ErroAplicacao(
                "sem_conta",
                "Não encontramos uma conta com este e-mail.",
                401
            );
        }

        if (!usuario.estaAtivo()) {
            throw new ErroAplicacao(
                "usuario_inativo",
                "Esta conta está inativa. Procure a coordenação.",
                403
            );
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

        if (!senhaValida) {
            throw new ErroAplicacao("senha", "Senha incorreta.", 401);
        }

        if (
            perfilSolicitado &&
            String(perfilSolicitado).toLowerCase() !==
                String(usuario.perfil).toLowerCase()
        ) {
            throw new ErroAplicacao(
                "outro_perfil",
                "Este e-mail pertence a outro perfil.",
                403,
                { perfil: usuario.perfil }
            );
        }

        return usuario;
    }

    // Mantido para os scripts de teste antigos.
    async autenticar(email, senha) {
        return this.validarCredenciais(email, senha);
    }

    async login(email, senha, perfilSolicitado = null) {
        if (!this.tokenService) {
            throw new Error("TokenService não configurado.");
        }

        const usuario = await this.validarCredenciais(
            email,
            senha,
            perfilSolicitado
        );

        return {
            token: this.tokenService.emitir(usuario),
            usuario: await this.montarUsuarioPublico(usuario)
        };
    }

    async registrar({ nome, email, senha, perfil }) {
        const perfilNormalizado = String(perfil || "responsavel").toLowerCase();

        if (!PERFIS_PUBLICOS.includes(perfilNormalizado)) {
            throw new ErroAplicacao(
                "perfil_nao_permitido",
                "O cadastro público cria apenas contas de responsável. Coordenação e professores são cadastrados pela escola.",
                403,
                { perfil: "Use apenas responsavel." }
            );
        }

        const existente = await this.usuarioRepository.buscarPorEmail(email);

        if (existente) {
            throw new ErroAplicacao(
                "email_em_uso",
                "Já existe uma conta com este e-mail.",
                409,
                { email: "Já existe uma conta com este e-mail." }
            );
        }

        const senhaHash = await bcrypt.hash(senha, 12);

        try {
            const usuario = await this.usuarioRepository.criar({
                nome,
                email,
                senhaHash,
                perfil: perfilNormalizado
            });

            return await this.montarUsuarioPublico(usuario);
        } catch (erro) {
            if (erro && erro.code === "23505") {
                throw new ErroAplicacao(
                    "email_em_uso",
                    "Já existe uma conta com este e-mail.",
                    409,
                    { email: "Já existe uma conta com este e-mail." }
                );
            }

            throw erro;
        }
    }

    async autenticarToken(token) {
        if (!this.tokenService) {
            throw new Error("TokenService não configurado.");
        }

        const conteudo = this.tokenService.verificar(token);
        const usuario = await this.usuarioRepository.buscarPorId(
            Number(conteudo.sub)
        );

        if (!usuario || !usuario.estaAtivo()) {
            throw new ErroAplicacao(
                "token_invalido",
                "Sessão inválida ou expirada. Entre novamente.",
                401
            );
        }

        return await this.montarUsuarioPublico(usuario);
    }
}

module.exports = AutenticacaoService;
