import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "../servicos/api";
import { hidratar } from "../dados/carregarDados";

const CHAVE = "kfka-sessao";

export const PERFIS = {
  administrador: {
    icone: "shield",
    cor: "#FFC94A",
    titulo: "Sou da coordenação",
    sub: "Administro a escola",
    nome: "coordenação",
    pill: "Coordenação",
    area: "admin",
    destino: "/admin/painel",
  },
  professor: {
    icone: "book",
    cor: "#74C0FC",
    titulo: "Sou professor",
    sub: "Registro o acompanhamento das turmas",
    nome: "professor",
    pill: "Professor",
    area: "professor",
    destino: "/professor/painel",
  },
  responsavel: {
    icone: "family",
    cor: "#5FD4A8",
    titulo: "Sou responsável",
    sub: "Acompanho meus filhos",
    nome: "responsável",
    pill: "Responsável",
    area: "familia",
    destino: "/familia/selecionar",
  },
};

export class ErroAutenticacao extends Error {
  constructor(codigo, extras = {}) {
    super(codigo);
    this.name = "ErroAutenticacao";
    this.codigo = codigo;
    Object.assign(this, extras);
  }
}

// O backend usa códigos com "_"; as telas usam os mesmos códigos do protótipo.
const CODIGOS_API = {
  sem_conta: "sem-conta",
  outro_perfil: "outro-perfil",
  email_em_uso: "email",
};

function paraErroAutenticacao(erro, perfil) {
  if (erro instanceof ErroAutenticacao) return erro;

  return new ErroAutenticacao(CODIGOS_API[erro?.codigo] || erro?.codigo || "erro", {
    perfil: erro?.detalhes?.perfil || perfil,
    mensagem: erro?.message,
  });
}

function lerSessao() {
  try {
    const daAba = sessionStorage.getItem(CHAVE);
    if (daAba) return JSON.parse(daAba);
    const lembrada = localStorage.getItem(CHAVE);
    if (lembrada) return JSON.parse(lembrada);
  } catch {
    /* armazenamento indisponível */
  }
  return null;
}

function persistirSessao(sessao, lembrar) {
  const json = JSON.stringify(sessao);
  try {
    sessionStorage.setItem(CHAVE, json);
    if (lembrar) localStorage.setItem(CHAVE, json);
    else localStorage.removeItem(CHAVE);
  } catch {
    /* fica só na memória */
  }
}

function limparSessaoArmazenada() {
  try {
    sessionStorage.removeItem(CHAVE);
    localStorage.removeItem(CHAVE);
  } catch {
    /* nada a limpar */
  }
}

// Converte o usuário devolvido pela API no formato de sessão usado pelas telas.
function enriquecerSessao(usuario) {
  const meta = PERFIS[usuario.perfil] || {};

  return {
    idUsuario: usuario.idUsuario ?? null,
    perfil: usuario.perfil,
    nome: usuario.nome,
    email: usuario.email,
    sub: meta.sub || "",
    cor: meta.cor || "#5FD4A8",
    telefone: usuario.telefone || "",
    profId: usuario.professorId == null ? null : String(usuario.professorId),
    respId: usuario.responsavelId == null ? null : String(usuario.responsavelId),
  };
}

const AutenticacaoContexto = createContext(null);

export function AutenticacaoProvider({ children }) {
  const [usuario, setUsuario] = useState(lerSessao);

  // Restaura a sessão do token salvo e recarrega os dados do banco.
  useEffect(() => {
    const token = getToken();

    if (!token) {
      limparSessaoArmazenada();
      setUsuario(null);
      return;
    }

    let ativo = true;

    (async () => {
      try {
        const { usuario: dadosUsuario } = await api("/auth/me");
        const sessao = enriquecerSessao(dadosUsuario);
        await hidratar(sessao);
        if (ativo) setUsuario(sessao);
      } catch {
        setToken(null);
        limparSessaoArmazenada();
        if (ativo) setUsuario(null);
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  const entrar = useCallback(async ({ perfil, email, senha, lembrar = true }) => {
    try {
      const { token, usuario: dadosUsuario } = await api("/auth/login", {
        metodo: "POST",
        corpo: { email, senha, perfil },
      });

      setToken(token);
      const sessao = enriquecerSessao(dadosUsuario);
      await hidratar(sessao);
      persistirSessao(sessao, lembrar);
      setUsuario(sessao);
      return sessao;
    } catch (erro) {
      setToken(null);
      throw paraErroAutenticacao(erro, perfil);
    }
  }, []);

  const cadastrar = useCallback(async ({ perfil, nome, email, senha }) => {
    try {
      const { usuario: dadosUsuario } = await api("/auth/registro", {
        metodo: "POST",
        corpo: { nome, email, senha, perfil },
      });

      return enriquecerSessao(dadosUsuario);
    } catch (erro) {
      throw paraErroAutenticacao(erro);
    }
  }, []);

  const sair = useCallback(() => {
    limparSessaoArmazenada();
    setToken(null);
    setUsuario(null);
  }, []);

  // Atualiza a sessão depois de editar o próprio perfil.
  const atualizarSessao = useCallback((dadosUsuario) => {
    const sessao = enriquecerSessao(dadosUsuario);
    let lembrar = false;

    try {
      lembrar = Boolean(localStorage.getItem(CHAVE));
    } catch {
      /* armazenamento indisponível */
    }

    persistirSessao(sessao, lembrar);
    setUsuario(sessao);
    return sessao;
  }, []);

  const valor = useMemo(
    () => ({ usuario, entrar, cadastrar, sair, atualizarSessao }),
    [usuario, entrar, cadastrar, sair, atualizarSessao],
  );

  return <AutenticacaoContexto.Provider value={valor}>{children}</AutenticacaoContexto.Provider>;
}

export function useAutenticacao() {
  const contexto = useContext(AutenticacaoContexto);
  if (!contexto) {
    throw new Error("useAutenticacao precisa estar dentro de AutenticacaoProvider.");
  }
  return contexto;
}
