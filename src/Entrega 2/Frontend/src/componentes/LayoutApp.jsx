import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, dados } from "../dados/dados.js";
import { useAutenticacao } from "../contextos/AutenticacaoContexto.jsx";
import { useAviso } from "../contextos/AvisoContexto.jsx";
import Avatar from "./Avatar.jsx";
import Icone from "./Icone.jsx";
import Marca from "./Marca.jsx";
import SeletorTema from "./SeletorTema.jsx";

const MENUS = {
  admin: [
    {
      label: "Visão geral",
      itens: [{ chave: "painel", texto: "Painel", icone: "grid", para: "/admin/painel" }],
    },
    {
      label: "Estrutura escolar",
      itens: [
        { chave: "alunos", texto: "Alunos", icone: "user", para: "/admin/alunos" },
        { chave: "professores", texto: "Professores", icone: "book", para: "/admin/professores" },
        {
          chave: "responsaveis",
          texto: "Responsáveis",
          icone: "family",
          para: "/admin/responsaveis",
        },
        { chave: "turmas", texto: "Turmas", icone: "users", para: "/admin/turmas" },
        {
          chave: "disciplinas",
          texto: "Disciplinas e tags",
          icone: "tag",
          para: "/admin/disciplinas",
        },
        { chave: "vinculos", texto: "Vínculos", icone: "link", para: "/admin/vinculos" },
        { chave: "periodos", texto: "Períodos letivos", icone: "calendar", para: "/admin/periodos" },
      ],
    },
    {
      label: "Acompanhamento",
      itens: [
        {
          chave: "revisao",
          texto: "Revisão",
          icone: "review",
          para: "/admin/revisao",
          contagem: true,
        },
        {
          chave: "relatorios",
          texto: "Relatórios gerenciais",
          icone: "chart",
          para: "/admin/relatorios",
        },
        {
          chave: "auditoria",
          texto: "Histórico e auditoria",
          icone: "clock",
          para: "/admin/auditoria",
        },
      ],
    },
  ],
  professor: [
    {
      label: "Meu trabalho",
      itens: [
        { chave: "painel", texto: "Início", icone: "home", para: "/professor/painel" },
        { chave: "turmas", texto: "Minhas turmas", icone: "users", para: "/professor/turmas" },
        {
          chave: "registros",
          texto: "Meus registros",
          icone: "file",
          para: "/professor/registros",
          contagem: true,
        },
        {
          chave: "novo",
          texto: "Novo acompanhamento",
          icone: "plus",
          para: "/professor/registro/novo",
        },
      ],
    },
  ],
  familia: [
    {
      label: "Acompanhamento",
      itens: [
        { chave: "painel", texto: "Início", icone: "home", para: "/familia/painel" },
        { chave: "relatorios", texto: "Relatórios", icone: "file", para: "/familia/relatorios" },
        {
          chave: "historico",
          texto: "Histórico por bimestre",
          icone: "clock",
          para: "/familia/historico",
        },
      ],
    },
  ],
};

const ROTULOS = { admin: "Administrador", professor: "Professor", familia: "Responsável" };
const CORES = { admin: "var(--sun)", professor: "var(--sky)", familia: "var(--mint)" };

const CHAVE_NOTIFICACOES = "kfka-notificacoes-lidas";

const chaveNotificacao = ([, , titulo, , quando]) => `${titulo}-${quando}`;

// Cada aviso tem seu próprio estado de leitura. O valor "1" gravado pela versão
// anterior significava "tudo lido" e é tratado como tal.
function lerNotificacoesLidas(papel) {
  try {
    const valor = localStorage.getItem(`${CHAVE_NOTIFICACOES}:${papel}`);
    if (!valor) return new Set();
    if (valor === "1") return new Set(["*"]);
    const chaves = JSON.parse(valor);
    return new Set(Array.isArray(chaves) ? chaves : []);
  } catch {
    return new Set();
  }
}

function salvarNotificacoesLidas(papel, lidas) {
  try {
    localStorage.setItem(`${CHAVE_NOTIFICACOES}:${papel}`, JSON.stringify([...lidas]));
  } catch {
    /* armazenamento indisponível */
  }
}

function caminhoDoAviso(href, papel) {
  if (href) return href.replace(/^#/, "");
  if (papel === "professor") return "/professor/registros?status=devolvido";
  if (papel === "familia") return "/familia/relatorios";
  return "/admin/revisao";
}

export default function LayoutApp({ papel, ativo, children }) {
  const { usuario, sair } = useAutenticacao();
  const { avisar } = useAviso();
  const navegar = useNavigate();
  const localizacao = useLocation();
  const [navAberto, setNavAberto] = useState(false);
  const [dropdownAberto, setDropdownAberto] = useState(null);
  const [busca, setBusca] = useState("");
  const [notificacoesLidas, setNotificacoesLidas] = useState(() =>
    lerNotificacoesLidas(papel),
  );

  // Fecha menus suspensos ao clicar fora e ao trocar de tela.
  useEffect(() => {
    if (!dropdownAberto) return undefined;

    function aoClicar(evento) {
      if (!evento.target.closest(".dropdown")) setDropdownAberto(null);
    }

    document.addEventListener("click", aoClicar);
    return () => document.removeEventListener("click", aoClicar);
  }, [dropdownAberto]);

  useEffect(() => {
    setDropdownAberto(null);
    setNavAberto(false);
  }, [localizacao.pathname]);

  useEffect(() => {
    setNotificacoesLidas(lerNotificacoesLidas(papel));
  }, [papel]);

  const nome = usuario?.nome || "";
  const sub = usuario?.sub || ROTULOS[papel];
  const cor = usuario?.cor || CORES[papel];

  // Calculado a cada render: a hidratação substitui os arrays em memória e um
  // useMemo com dependências estáveis manteria a contagem antiga (mock).
  let contagem = 0;
  if (papel === "admin") {
    contagem = api.relsFiltrados({ status: ["enviado", "revisao"] }).length;
  } else if (papel === "professor") {
    contagem = api.relsFiltrados({ prof: usuario?.profId || "p1", status: "devolvido" }).length;
  }

  const responsavel = dados.responsaveis.find(
    (item) => item.id === (usuario?.respId || "r1"),
  );
  const criancas = responsavel?.alunos || [];
  const alunoSelecionado = new URLSearchParams(localizacao.search).get("aluno");

  const notificacoes = dados.notificacoes[papel] || [];
  const naoLidas = notificacoes.filter(
    (notificacao) =>
      !notificacoesLidas.has("*") && !notificacoesLidas.has(chaveNotificacao(notificacao)),
  );
  const todasLidas = naoLidas.length === 0;

  function sairConta() {
    sair();
    avisar("Você saiu da sua conta", "Sessão encerrada neste navegador.", "info");
    navegar("/entrar");
  }

  function trocarPerfil() {
    sair();
    navegar("/entrar");
  }

  function marcarNotificacaoLida(chave) {
    if (notificacoesLidas.has("*") || notificacoesLidas.has(chave)) return;
    const novas = new Set(notificacoesLidas).add(chave);
    setNotificacoesLidas(novas);
    salvarNotificacoesLidas(papel, novas);
  }

  function marcarNotificacoesLidas() {
    const novas = new Set(notificacoes.map(chaveNotificacao));
    setNotificacoesLidas(novas);
    salvarNotificacoesLidas(papel, novas);
    avisar("Notificações marcadas como lidas", "", "info");
    setDropdownAberto(null);
  }

  function enviarBusca(evento) {
    evento.preventDefault();
    const termo = busca.trim();
    if (papel === "admin") {
      navegar(`/admin/alunos${termo ? `?q=${encodeURIComponent(termo)}` : ""}`);
    } else {
      navegar(`/professor/turmas${termo ? `?q=${encodeURIComponent(termo)}` : ""}`);
    }
  }

  const rotaBase = `/${papel}/painel`;

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className={`app${papel === "familia" ? " has-tabbar" : ""}${navAberto ? " nav-open" : ""}`}>
        <aside className="sidebar" aria-label="Menu principal">
          <Link className="logo brand" to={rotaBase} style={{ color: "#fff" }}>
            <Marca />
            <span>
              <span className="word">KFKA</span>
              <small>Acompanhamento Escolar</small>
            </span>
          </Link>
          <span className="role-pill">
            <span className="dot" style={{ background: CORES[papel] }} />
            Perfil {ROTULOS[papel]}
          </span>
          <nav aria-label="Navegação do perfil">
            {MENUS[papel].map((grupo) => (
              <div className="nav" role="list" key={grupo.label}>
                <div className="nav-label">{grupo.label}</div>
                {grupo.itens.map((item) => (
                  <Link
                    key={item.chave}
                    role="listitem"
                    to={item.para}
                    aria-current={ativo === item.chave ? "page" : undefined}
                    onClick={() => setNavAberto(false)}
                  >
                    <Icone nome={item.icone} />
                    <span>{item.texto}</span>
                    {item.contagem && contagem > 0 && (
                      <span className="count" aria-label={`${contagem} pendentes`}>
                        {contagem}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ))}

            {papel === "familia" && (
              <div className="nav" role="list">
                <div className="nav-label">Meus alunos</div>
                {criancas.map((id) => {
                  const aluno = api.aluno(id);
                  const turma = api.turma(aluno?.turma);
                  if (!aluno) return null;
                  return (
                    <Link
                      key={aluno.id}
                      to={`/familia/painel?aluno=${aluno.id}`}
                      role="listitem"
                      aria-current={alunoSelecionado === aluno.id ? "page" : undefined}
                      onClick={() => setNavAberto(false)}
                    >
                      <Avatar nome={aluno.nome} cor={aluno.cor} tamanho="sm" />
                      <span>
                        {aluno.nome.trim().split(/\s+/)[0]}{" "}
                        <small style={{ opacity: 0.7 }}>· {turma?.nome}</small>
                      </span>
                    </Link>
                  );
                })}
                <Link to="/familia/selecionar" onClick={() => setNavAberto(false)}>
                  <Icone nome="swap" />
                  <span>Trocar aluno</span>
                </Link>
              </div>
            )}
          </nav>
          <div className="sidebar-foot">
            <Link
              className="nav-config"
              to={`/${papel}/configuracoes`}
              aria-current={ativo === "configuracoes" ? "page" : undefined}
            >
              <Icone nome="settings" />
              <span>Configurações</span>
            </Link>
            <div className="user-card">
              <Avatar nome={nome} cor={cor} />
              <div className="grow">
                <div className="name">{nome}</div>
                <div className="sub">{sub}</div>
              </div>
              <Link to="/entrar" aria-label="Sair" onClick={sairConta}>
                <Icone nome="logout" />
              </Link>
            </div>
          </div>
        </aside>

        <div className="scrim" onClick={() => setNavAberto(false)} />

        <div className="main">
          <header className="topbar">
            <button
              type="button"
              className="icon-btn menu-btn"
              aria-label="Abrir menu"
              aria-expanded={navAberto}
              onClick={() => setNavAberto((aberto) => !aberto)}
            >
              <Icone nome="menu" />
            </button>

            {papel !== "familia" && (
              <form className="search" role="search" onSubmit={enviarBusca}>
                <label className="sr-only" htmlFor="gsearch">
                  Buscar
                </label>
                <Icone nome="search" />
                <input
                  id="gsearch"
                  className="input"
                  type="search"
                  value={busca}
                  onChange={(evento) => setBusca(evento.target.value)}
                  placeholder={
                    papel === "admin"
                      ? "Buscar aluno, professor, turma…"
                      : "Buscar aluno ou turma…"
                  }
                />
              </form>
            )}

            <span className="grow" />

            {papel === "familia" ? (
              <span className="hide-mobile filter-chip" style={{ cursor: "default" }}>
                <Icone nome="cap" className="icon-sm" /> {dados.escola.nome} · {dados.escola.ano}
              </span>
            ) : (
              <Link
                className="hide-mobile filter-chip"
                to={papel === "admin" ? "/admin/periodos" : "/professor/painel"}
              >
                <Icone nome="calendar" className="icon-sm" /> 3º bimestre · digitação até 30/09
              </Link>
            )}

            <div className={`dropdown${dropdownAberto === "notificacoes" ? " open" : ""}`}>
              <button
                type="button"
                className="icon-btn"
                aria-haspopup="true"
                aria-expanded={dropdownAberto === "notificacoes"}
                aria-label={
                  todasLidas ? "Notificações" : `Notificações (${naoLidas.length} novas)`
                }
                onClick={() =>
                  setDropdownAberto((atual) => (atual === "notificacoes" ? null : "notificacoes"))
                }
              >
                <Icone nome="bell" />
                {!todasLidas && <span className="badge-dot" />}
              </button>
              <div className="menu notif-panel" role="menu">
                <div className="row-between" style={{ padding: "6px 8px 10px" }}>
                  <b style={{ fontFamily: "var(--font-display)", fontSize: "1.125rem" }}>
                    Notificações
                  </b>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={marcarNotificacoesLidas}
                    disabled={todasLidas}
                  >
                    {todasLidas ? "Tudo lido" : "Marcar como lidas"}
                  </button>
                </div>
                {notificacoes.map((notificacao) => {
                  const [icone, tom, titulo, detalhe, quando, href] = notificacao;
                  const chave = chaveNotificacao(notificacao);
                  const lida =
                    notificacoesLidas.has("*") || notificacoesLidas.has(chave);

                  return (
                    <Link
                      className={`notif-item${lida ? "" : " unread"}`}
                      key={chave}
                      to={caminhoDoAviso(href, papel)}
                      onClick={() => {
                        marcarNotificacaoLida(chave);
                        setDropdownAberto(null);
                      }}
                    >
                      <span className={`ico ${tom}`}>
                        <Icone nome={icone} className="icon-sm" />
                      </span>
                      <span>
                        <b>{titulo}</b>
                        <small>
                          {detalhe} · {quando}
                        </small>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className={`dropdown${dropdownAberto === "conta" ? " open" : ""}`}>
              <button
                type="button"
                className="icon-btn"
                style={{ width: "auto", padding: "0 6px", gap: 6, borderRadius: 999 }}
                aria-haspopup="true"
                aria-expanded={dropdownAberto === "conta"}
                aria-label="Menu da conta"
                onClick={() => setDropdownAberto((atual) => (atual === "conta" ? null : "conta"))}
              >
                <Avatar nome={nome} cor={cor} tamanho="sm" />
                <Icone nome="chevron-down" className="icon-sm" />
              </button>
              <div className="menu" role="menu">
                <div style={{ padding: "8px 12px 10px" }}>
                  <b>{nome}</b>
                  <div className="muted" style={{ fontSize: "0.75rem" }}>
                    {sub}
                  </div>
                </div>
                <hr />
                <Link to={`/${papel}/perfil`} role="menuitem">
                  <Icone nome="user" /> Meu perfil
                </Link>
                <Link to={`/${papel}/configuracoes`} role="menuitem">
                  <Icone nome="settings" /> Configurações
                </Link>
                <button type="button" role="menuitem" onClick={trocarPerfil}>
                  <Icone nome="swap" /> Trocar de perfil
                </button>
                <hr />
                <div className="menu-tema">
                  <span id="tema-menu-l">Tema</span>
                  <SeletorTema id="tema-menu" />
                </div>
                <hr />
                <button type="button" role="menuitem" className="danger" onClick={sairConta}>
                  <Icone nome="logout" /> Sair
                </button>
                <Link to="/sessao-expirada" role="menuitem">
                  <Icone nome="clock" /> Ver tela de sessão expirada
                </Link>
              </div>
            </div>
          </header>

          <main id="conteudo" className="content" tabIndex={-1}>
            {children}
          </main>
        </div>

        {papel === "familia" && (
          <nav className="tabbar" aria-label="Navegação inferior">
            <Link to="/familia/painel" aria-current={ativo === "painel" ? "page" : undefined}>
              <Icone nome="home" />
              Início
            </Link>
            <Link to="/familia/relatorios" aria-current={ativo === "relatorios" ? "page" : undefined}>
              <Icone nome="file" />
              Relatórios
            </Link>
            <Link to="/familia/historico" aria-current={ativo === "historico" ? "page" : undefined}>
              <Icone nome="clock" />
              Histórico
            </Link>
            <Link to="/familia/perfil" aria-current={ativo === "perfil" ? "page" : undefined}>
              <Icone nome="user" />
              Perfil
            </Link>
          </nav>
        )}
      </div>
    </>
  );
}
