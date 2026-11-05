import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Avatar from "../../componentes/Avatar.jsx";
import Icone from "../../componentes/Icone.jsx";
import LayoutPublico from "../../componentes/LayoutPublico.jsx";
import StatusBadge from "../../componentes/StatusBadge.jsx";
import { useTema } from "../../contextos/TemaContexto.jsx";
import { useRevelar } from "../../utilitarios/useRevelar.js";
import { useTitulo } from "../../utilitarios/useTitulo.js";

const NOTAS = [
  ["Matemática", "8,5"],
  ["Língua Portuguesa", "8,0"],
  ["Ciências", "9,0"],
];

const FLUXO = ["rascunho", "enviado", "revisao", "publicado"];

const PERFIS = [
  {
    id: "coordenacao",
    icone: "shield",
    cor: "var(--sun)",
    titulo: "Coordenação",
    sub: "Revisa e publica",
    para: "/entrar/administrador",
    entrar: "Entrar como coordenação",
    itens: [
      "Cadastros e vínculos de turma",
      "Períodos dos quatro bimestres",
      "Revisão, publicação e devolução",
      "Relatórios e auditoria",
    ],
  },
  {
    id: "professor",
    icone: "book",
    cor: "var(--sky)",
    titulo: "Professor",
    sub: "Registra o bimestre",
    para: "/entrar/professor",
    entrar: "Entrar como professor",
    itens: [
      "Turmas e alunos atribuídos",
      "Média, descrição e tags",
      "Rascunho, prévia e envio",
      "Ajustes após devolução",
    ],
  },
  {
    id: "familia",
    icone: "family",
    cor: "var(--mint)",
    titulo: "Família",
    sub: "Acompanha e responde",
    para: "/entrar/responsavel",
    entrar: "Entrar como responsável",
    itens: [
      "Somente alunos vinculados",
      "Só relatórios já publicados",
      "Filtro por bimestre e disciplina",
      "Ciência, observação e PDF",
    ],
  },
];

function PreviaPerfil({ perfil }) {
  if (perfil.id === "coordenacao") {
    return (
      <div className="perfil-previa" aria-hidden="true">
        <div className="pv-head">
          <b>Fila de revisão</b>
          <StatusBadge status="revisao" />
        </div>
        {[
          ["Lucas Souza", "Ciências · 6º A", "#5FD4A8"],
          ["Júlia Souza", "Matemática · 4º B", "#F8B4C8"],
          ["Rafael Lima", "Geografia · 6º A", "#74C0FC"],
        ].map(([nome, detalhe, cor]) => (
          <div className="pv-row" key={nome}>
            <Avatar nome={nome} cor={cor} tamanho="sm" />
            <span className="grow">
              <b>{nome}</b>
              <small>{detalhe}</small>
            </span>
            <span className="pv-btn">Publicar</span>
          </div>
        ))}
      </div>
    );
  }

  if (perfil.id === "professor") {
    return (
      <div className="perfil-previa" aria-hidden="true">
        <div className="pv-head">
          <b>Lucas · Ciências</b>
          <StatusBadge status="rascunho" />
        </div>
        <div className="pv-media">
          <small>Média</small>
          <b className="mono">9,0</b>
        </div>
        <div className="pv-tags">
          <span className="tag t-verde">Participativo</span>
          <span className="tag t-azul">Colabora em grupo</span>
          <span className="tag t-amarelo">Curioso</span>
        </div>
        <p className="pv-texto">
          Participou com curiosidade do projeto sobre o ciclo da água…
        </p>
        <span className="pv-btn pv-btn-azul">Enviar para revisão</span>
      </div>
    );
  }

  return (
    <div className="perfil-previa" aria-hidden="true">
      <div className="pv-head">
        <b>Ciências · 3º bimestre</b>
        <StatusBadge status="publicado" />
      </div>
      <div className="pv-media">
        <small>Média</small>
        <b className="mono">9,0</b>
      </div>
      <p className="pv-texto">
        Participou com curiosidade do projeto sobre o ciclo da água e ajudou os colegas a registrar
        as medições.
      </p>
      <span className="pv-btn pv-btn-verde">
        <Icone nome="check" className="icon-sm" /> Li e estou ciente
      </span>
    </div>
  );
}

export default function Inicio() {
  useTitulo("Início");
  useRevelar();
  const { prefs } = useTema();
  const localizacao = useLocation();
  const arteRef = useRef(null);
  const abasRef = useRef(null);
  const [perfilAtivo, setPerfilAtivo] = useState(PERFIS[0]);

  const reduzirMovimento =
    prefs.menosMovimento ||
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
    false;

  const [statuses, setStatuses] = useState(() =>
    NOTAS.map(() => (reduzirMovimento ? "publicado" : "rascunho")),
  );
  const [cartao1, setCartao1] = useState(reduzirMovimento);
  const [cartao2, setCartao2] = useState(reduzirMovimento);
  const [historiaFim, setHistoriaFim] = useState(reduzirMovimento);

  // Rola até a seção quando a navegação veio de outra rota.
  useEffect(() => {
    const alvo = localizacao.state?.rolarPara;
    if (!alvo) return undefined;
    const timer = window.setTimeout(() => {
      document.getElementById(alvo)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
    return () => window.clearTimeout(timer);
  }, [localizacao.state]);

  // Conta a história do protótipo: cada nota atravessa o fluxo editorial.
  useEffect(() => {
    if (reduzirMovimento) {
      setStatuses(NOTAS.map(() => "publicado"));
      setCartao1(true);
      setCartao2(true);
      setHistoriaFim(true);
      return undefined;
    }

    const timers = [];
    NOTAS.forEach((_, indice) => {
      FLUXO.slice(1).forEach((status, etapa) => {
        timers.push(
          window.setTimeout(() => {
            setStatuses((atuais) =>
              atuais.map((valor, i) => (i === indice ? status : valor)),
            );
          }, 900 + indice * 350 + etapa * 520),
        );
      });
    });

    const fimDasNotas = 900 + (NOTAS.length - 1) * 350 + 2 * 520;
    timers.push(window.setTimeout(() => setCartao1(true), 900 + 2 * 520 + 200));
    timers.push(
      window.setTimeout(() => {
        setCartao2(true);
        setHistoriaFim(true);
      }, fimDasNotas + 350),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [reduzirMovimento]);

  function inclinarArte(evento) {
    if (reduzirMovimento || !arteRef.current) return;
    const caixa = arteRef.current.getBoundingClientRect();
    const x = (evento.clientX - caixa.left) / caixa.width - 0.5;
    const y = (evento.clientY - caixa.top) / caixa.height - 0.5;
    arteRef.current.style.setProperty("--rx", `${(-y * 4).toFixed(2)}deg`);
    arteRef.current.style.setProperty("--ry", `${(x * 5).toFixed(2)}deg`);
  }

  function endireitarArte() {
    if (!arteRef.current) return;
    arteRef.current.style.setProperty("--rx", "0deg");
    arteRef.current.style.setProperty("--ry", "0deg");
  }

  function navegarAbas(evento) {
    const passo = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[evento.key];
    if (!passo) return;
    evento.preventDefault();
    const indice = PERFIS.findIndex((perfil) => perfil.id === perfilAtivo.id);
    const proximo = PERFIS[(indice + passo + PERFIS.length) % PERFIS.length];
    setPerfilAtivo(proximo);
    window.setTimeout(() => document.getElementById(`aba-${proximo.id}`)?.focus(), 0);
  }

  return (
    <LayoutPublico>
      <section className="hero">
        <svg
          className="hero-arcos"
          viewBox="0 0 600 600"
          fill="none"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path
            pathLength="1"
            d="M244 300C320 300 368 214 470 112"
            stroke="#74C0FC"
            strokeWidth="56"
          />
          <path
            pathLength="1"
            d="M244 300C320 300 368 386 470 488"
            stroke="#5FD4A8"
            strokeWidth="56"
          />
          <circle cx="242" cy="300" r="48" fill="#FFC94A" />
        </svg>

        <div className="hero-copy">
          <h1 id="page-title" tabIndex={-1} className="entra" style={{ "--i": 0 }}>
            A escola e a família acompanhando o aluno juntas.
          </h1>
          <p className="entra" style={{ "--i": 1 }}>
            A cada bimestre do Ensino Fundamental, o professor registra o desenvolvimento de cada
            aluno, a coordenação revisa e publica, e a família acompanha tudo em um só lugar.
          </p>
          <div className="row entra" style={{ "--i": 2 }}>
            <Link className="btn btn-primary btn-lg" to="/entrar">
              Acessar minha conta <Icone nome="chevron-right" />
            </Link>
            <a
              className="btn btn-ghost-light btn-lg"
              href="#como-funciona"
              onClick={(evento) => {
                evento.preventDefault();
                document
                  .getElementById("como-funciona")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Ver como funciona
            </a>
          </div>
          <ul className="hero-points entra" style={{ "--i": 3 }}>
            <li>
              <Icone nome="message" /> Comunicação escola–família
            </li>
            <li>
              <Icone nome="clock" /> Quatro bimestres organizados
            </li>
            <li>
              <Icone nome="shield" /> Dados protegidos (LGPD)
            </li>
          </ul>
        </div>

        <div
          className={`hero-art entra${historiaFim ? " historia-fim" : ""}`}
          style={{ "--i": 2 }}
          ref={arteRef}
          onPointerMove={inclinarArte}
          onPointerLeave={endireitarArte}
        >
          <div className="mock" aria-hidden="true">
            <div className="mock-bar">
              <i />
              <i />
              <i />
              <span>kfka.app/familia</span>
            </div>
            <div className="mock-body">
              <div className="mock-side">
                <b>KFKA</b>
                <span className="on">Início</span>
                <span>Relatórios</span>
                <span>Histórico</span>
              </div>
              <div className="mock-main">
                <b className="mock-title">Relatórios de Lucas</b>
                {NOTAS.map(([disciplina, media], indice) => (
                  <div
                    className={`mock-row${statuses[indice] === "publicado" ? " publicada" : ""}`}
                    key={disciplina}
                  >
                    <span>{disciplina}</span>
                    <span className="mono">{media}</span>
                    <span className="mock-st troca" key={statuses[indice]}>
                      <StatusBadge status={statuses[indice]} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`phone${cartao2 ? " tem-novo" : ""}`} aria-hidden="true">
            <div className="phone-notch" />
            <div className="phone-screen">
              <div className="ph-head">
                <Avatar nome="Lucas Souza" cor="#5FD4A8" tamanho="sm" />
                <div>
                  <b>Lucas · 6º A</b>
                  <small>3º bimestre</small>
                </div>
              </div>
              <div className="ph-new">
                <small>Novo relatório</small>
                <b>Ciências</b>
                <span className="nota ok sm">9,0</span>
              </div>
              <div className="ph-bubble">
                Participou com curiosidade do projeto sobre o ciclo da água…
              </div>
              <span className="ph-btn">
                <Icone nome="check" className="icon-sm" /> Li e estou ciente
              </span>
              <div className="ph-tabs">
                <i className="on" />
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>

          <div className={`float-card fc-1${cartao1 ? " is-on" : ""}`} aria-hidden="true">
            <Avatar nome="Lucas Souza" cor="#5FD4A8" tamanho="sm" />
            <div>
              <small>Média · Matemática</small>
              <b className="mono">8,5</b>
            </div>
            <span className="tag t-verde">+0,5</span>
          </div>
          <div className={`float-card fc-2${cartao2 ? " is-on" : ""}`} aria-hidden="true">
            <span
              className="ico ico-teal"
              style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center" }}
            >
              <Icone nome="bell" className="icon-sm" />
            </span>
            <div>
              <b>Novo relatório publicado</b>
              <small>Ciências · agora</small>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="como-funciona" data-revelar>
        <div className="section-head revela">
          <h2>Um fluxo claro, do registro à família</h2>
          <p>
            Cada relatório passa por etapas visíveis para todos. Ninguém fica sem saber em que ponto
            ele está.
          </p>
        </div>
        <ol className="steps-grid">
          {[
            [
              "calendar",
              "ico-blue",
              "A escola abre o bimestre",
              "A coordenação organiza turmas e vínculos e define o período de digitação.",
              "rascunho",
            ],
            [
              "edit",
              "ico-teal",
              "O professor registra",
              "Descrição, média e tags de cada aluno, salvas como rascunho e enviadas para revisão.",
              "enviado",
            ],
            [
              "review",
              "ico-warn",
              "A coordenação revisa",
              "Ajusta com histórico, devolve com comentários ou publica.",
              "revisao",
            ],
            [
              "file",
              "ico-ok",
              "A família acompanha",
              "Consulta o relatório publicado, marca como lido e imprime.",
              "publicado",
            ],
          ].map(([icone, tom, titulo, texto, status], indice) => (
            <li key={titulo} style={{ "--i": indice }}>
              <span className={`flow-dot ${tom}`} aria-hidden="true">
                <Icone nome={icone} className="icon-sm" />
              </span>
              <span className="sr-only">Etapa {indice + 1}: </span>
              <h3>{titulo}</h3>
              <p className="text-2">{texto}</p>
              <StatusBadge status={status} />
            </li>
          ))}
        </ol>
      </section>

      <section className="section section-paper" id="perfis" data-revelar>
        <div className="section-head revela">
          <h2>Três perfis, um só produto</h2>
          <p>Cada pessoa vê exatamente o que precisa, e nada além disso.</p>
        </div>
        <div className="perfis revela">
          <div
            className="perfis-abas"
            role="tablist"
            aria-label="Perfis"
            aria-orientation="vertical"
            ref={abasRef}
            onKeyDown={navegarAbas}
          >
            {PERFIS.map((perfil) => (
              <button
                key={perfil.id}
                type="button"
                role="tab"
                id={`aba-${perfil.id}`}
                aria-controls="painel-perfil"
                aria-selected={perfilAtivo.id === perfil.id}
                tabIndex={perfilAtivo.id === perfil.id ? 0 : -1}
                onClick={() => setPerfilAtivo(perfil)}
              >
                <span className="role-ico sm" style={{ background: perfil.cor }}>
                  <Icone nome={perfil.icone} />
                </span>
                <span>
                  <b>{perfil.titulo}</b>
                  <small>{perfil.sub}</small>
                </span>
              </button>
            ))}
          </div>
          <div
            className="perfil-painel"
            role="tabpanel"
            id="painel-perfil"
            aria-labelledby={`aba-${perfilAtivo.id}`}
          >
            <div className="perfil-texto">
              <ul className="checklist">
                {perfilAtivo.itens.map((item) => (
                  <li key={item}>
                    <Icone nome="check" className="icon-sm" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link className="btn btn-secondary" to={perfilAtivo.para}>
                <Icone nome="user" className="icon-sm" /> {perfilAtivo.entrar}
              </Link>
            </div>
            <PreviaPerfil perfil={perfilAtivo} />
          </div>
        </div>
      </section>

      <section className="section" id="seguranca" data-revelar>
        <div className="card card-dark security revela">
          <div className="grow stack-sm">
            <h2>
              <span className="sec-lock" aria-hidden="true">
                <Icone nome="lock" />
              </span>
              Segurança e LGPD desde o primeiro clique
            </h2>
            <p style={{ color: "rgba(255,255,255,.75)" }}>
              Proteção especial aos dados de crianças e adolescentes. A família só vê relatórios
              publicados dos alunos vinculados a ela.
            </p>
          </div>
          <ul className="checklist sec-list">
            {[
              "Acesso separado por perfil",
              "Sessões que expiram sozinhas",
              "Toda alteração fica na auditoria",
            ].map((item, indice) => (
              <li key={item} style={{ "--i": indice }}>
                <Icone nome="check" className="icon-sm" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} data-revelar>
        <div className="cta-final revela">
          <h2>Pronto para acompanhar de perto?</h2>
          <p>Entre com a sua conta ou crie a de coordenação, professor ou responsável.</p>
          <div className="row cta-acoes">
            <Link className="btn btn-light btn-lg" to="/entrar">
              Acessar minha conta <Icone nome="chevron-right" />
            </Link>
            <Link className="btn btn-ghost-light btn-lg" to="/criar-conta">
              Criar conta
            </Link>
          </div>
        </div>
      </section>
    </LayoutPublico>
  );
}
