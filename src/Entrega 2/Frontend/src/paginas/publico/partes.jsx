import { Link } from "react-router-dom";
import { PERFIS } from "../../contextos/AutenticacaoContexto.jsx";
import Icone from "../../componentes/Icone.jsx";
import Marca from "../../componentes/Marca.jsx";

export function CartaoPerfil({ perfil, base }) {
  const dadosPerfil = PERFIS[perfil];
  if (!dadosPerfil) return null;

  return (
    <Link className="role-option" to={`/${base}/${perfil}`}>
      <span
        className="role-ico sm"
        style={{ background: dadosPerfil.cor }}
        aria-hidden="true"
      >
        <Icone nome={dadosPerfil.icone} />
      </span>
      <span className="grow">
        <b>{dadosPerfil.titulo}</b>
        <small>{dadosPerfil.sub}</small>
      </span>
      <Icone nome="chevron-right" />
    </Link>
  );
}

export function EscolhaDePerfil({ base }) {
  return (
    <div className="stack-sm">
      {Object.keys(PERFIS).map((perfil) => (
        <CartaoPerfil key={perfil} perfil={perfil} base={base} />
      ))}
    </div>
  );
}

export function PilulaPerfil({ perfil }) {
  const dadosPerfil = PERFIS[perfil] || PERFIS.responsavel;
  return (
    <span className="role-pill-light">
      <span
        className="role-ico xs"
        style={{ background: dadosPerfil.cor }}
        aria-hidden="true"
      >
        <Icone nome={dadosPerfil.icone} className="icon-sm" />
      </span>
      {dadosPerfil.pill}
    </span>
  );
}

export function LogoMobile() {
  return (
    <span className="only-mobile">
      <Link className="logo" to="/" style={{ color: "var(--ink)" }}>
        <Marca />
        <span>
          <span className="word">KFKA</span>
          <small>Acompanhamento Escolar</small>
        </span>
      </Link>
    </span>
  );
}
