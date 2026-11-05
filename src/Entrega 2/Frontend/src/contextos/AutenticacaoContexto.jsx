import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { api, dados } from "../dados/dados.js";

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

// Completa a sessão com o vínculo do mock (professor/responsável) usado pelas telas.
function enriquecerSessao(conta) {
  const sessao = {
    perfil: conta.perfil,
    nome: conta.nome,
    email: conta.email,
    sub: conta.sub,
    cor: conta.cor,
  };

  if (conta.perfil === "professor") {
    const professor = dados.professores.find(
      (item) => item.email?.toLowerCase() === conta.email.toLowerCase(),
    );
    sessao.profId = professor?.id || "p1";
  }

  if (conta.perfil === "responsavel") {
    const responsavel = dados.responsaveis.find(
      (item) => item.email?.toLowerCase() === conta.email.toLowerCase(),
    );
    sessao.respId = responsavel?.id || "r1";
  }

  return sessao;
}

const AutenticacaoContexto = createContext(null);

export function AutenticacaoProvider({ children }) {
  const [usuario, setUsuario] = useState(lerSessao);

  const entrar = useCallback(async ({ perfil, email, senha, lembrar = true }) => {
    // Etapa funcional: esta chamada vira POST /auth/login na API Express.
    const resultado = api.entrar(perfil, email, senha);

    if (resultado.erro) {
      throw new ErroAutenticacao(resultado.erro, { perfil: resultado.perfil });
    }

    const sessao = enriquecerSessao(resultado.conta);
    persistirSessao(sessao, lembrar);
    setUsuario(sessao);
    return sessao;
  }, []);

  const cadastrar = useCallback(async ({ perfil, nome, email, sub, senha }) => {
    // Etapa funcional: esta chamada vira POST /auth/registro na API Express.
    const resultado = api.criarConta({
      perfil,
      nome,
      email,
      sub,
      cor: PERFIS[perfil]?.cor || "#5FD4A8",
      senha,
    });

    if (resultado.erro) throw new ErroAutenticacao(resultado.erro);
    return resultado.conta;
  }, []);

  const sair = useCallback(() => {
    limparSessaoArmazenada();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, entrar, cadastrar, sair }),
    [usuario, entrar, cadastrar, sair],
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
