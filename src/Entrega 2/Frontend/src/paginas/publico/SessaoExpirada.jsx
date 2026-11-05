import { Link } from "react-router-dom";
import Icone from "../../componentes/Icone.jsx";
import LayoutAuth from "../../componentes/LayoutAuth.jsx";
import { useTitulo } from "../../utilitarios/useTitulo.js";

export default function SessaoExpirada() {
  useTitulo("Sessão expirada");

  return (
    <LayoutAuth>
      <span
        className="ico ico-warn"
        style={{ width: 64, height: 64, borderRadius: 18 }}
      >
        <Icone nome="clock" className="icon-lg" />
      </span>
      <div className="stack-sm">
        <h1 id="page-title" tabIndex={-1}>
          Sua sessão expirou
        </h1>
        <p className="text-2">
          Por segurança, encerramos o acesso após 30 minutos sem atividade. Nada do que estava salvo
          foi perdido.
        </p>
      </div>
      <Link className="btn btn-primary btn-lg btn-block" to="/entrar">
        Entrar novamente <Icone nome="chevron-right" />
      </Link>
      <div className="alert info">
        <Icone nome="shield" />
        <div>Em computadores compartilhados, sempre use “Sair” ao terminar.</div>
      </div>
    </LayoutAuth>
  );
}
