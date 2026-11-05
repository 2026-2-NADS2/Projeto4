import { Link } from "react-router-dom";
import { BotaoTema } from "./SeletorTema.jsx";
import Avatar from "./Avatar.jsx";
import Icone from "./Icone.jsx";
import Marca from "./Marca.jsx";
import StatusBadge from "./StatusBadge.jsx";

export default function LayoutAuth({ children }) {
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="auth">
        <div className="auth-art">
          <Link className="logo" to="/" style={{ color: "#fff" }}>
            <Marca />
            <span>
              <span className="word">KFKA</span>
              <small>Acompanhamento Escolar</small>
            </span>
          </Link>
          <h2 style={{ color: "#fff", fontSize: "clamp(2rem,3.4vw,3rem)", lineHeight: 1.08 }}>
            A escola e a família
            <br />
            na mesma página.
          </h2>
          <p style={{ color: "rgba(255,255,255,.75)", maxWidth: "44ch" }}>
            Relatórios bimestrais revisados pela escola, publicados com segurança e acessíveis de
            qualquer tela.
          </p>
          <div className="auth-card">
            <Avatar nome="Lucas Souza" cor="#5FD4A8" />
            <div className="grow">
              <b>Lucas Souza · 6º A</b>
              <small>Matemática · 3º bimestre</small>
            </div>
            <StatusBadge status="publicado" />
          </div>
          <ul className="checklist auth-list">
            {[
              "A coordenação revisa antes de publicar",
              "A família registra ciência e pode responder",
              "Só os responsáveis vinculados veem o aluno",
            ].map((item) => (
              <li key={item}>
                <Icone nome="check" className="icon-sm" />
                {item}
              </li>
            ))}
          </ul>
          <span className="auth-blob" />
        </div>
        <main className="auth-form" id="conteudo">
          <BotaoTema />
          <div className="stack-lg">{children}</div>
        </main>
      </div>
    </>
  );
}
