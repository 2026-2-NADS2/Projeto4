import { Link, useLocation, useNavigate } from "react-router-dom";
import { BotaoTema } from "./SeletorTema.jsx";
import Icone from "./Icone.jsx";
import Marca from "./Marca.jsx";

export default function LayoutPublico({ children }) {
  const localizacao = useLocation();
  const navegar = useNavigate();

  function irPara(secao) {
    if (localizacao.pathname === "/") {
      document.getElementById(secao)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navegar("/", { state: { rolarPara: secao } });
    }
  }

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="public-header">
        <Link className="logo" to="/" style={{ color: "#fff" }}>
          <Marca />
          <span>
            <span className="word">KFKA</span>
            <small>Acompanhamento Escolar</small>
          </span>
        </Link>
        <nav aria-label="Seções da página">
          <a
            href="#como-funciona"
            onClick={(evento) => {
              evento.preventDefault();
              irPara("como-funciona");
            }}
          >
            Como funciona
          </a>
          <a
            href="#perfis"
            onClick={(evento) => {
              evento.preventDefault();
              irPara("perfis");
            }}
          >
            Perfis
          </a>
          <a
            href="#seguranca"
            onClick={(evento) => {
              evento.preventDefault();
              irPara("seguranca");
            }}
          >
            Segurança
          </a>
        </nav>
        <BotaoTema />
        <Link className="btn btn-ghost-light hide-mobile" to="/criar-conta">
          Criar conta
        </Link>
        <Link className="btn btn-light" to="/entrar">
          <Icone nome="user" />
          Entrar
        </Link>
      </header>
      <main id="conteudo">{children}</main>
      <footer className="public-footer">
        <Link className="logo" to="/" style={{ color: "#fff" }}>
          <Marca />
          <span>
            <span className="word">KFKA</span>
            <small>Acompanhamento Escolar</small>
          </span>
        </Link>
        <span>Projeto Interdisciplinar · 2º ADS · FECAP 2026</span>
        <span className="row" style={{ flexWrap: "wrap" }}>
          <Link to="/documentacao">Documentação</Link>
          <Link to="/privacidade">Privacidade</Link>
          <Link to="/entrar">Entrar</Link>
        </span>
      </footer>
    </>
  );
}
