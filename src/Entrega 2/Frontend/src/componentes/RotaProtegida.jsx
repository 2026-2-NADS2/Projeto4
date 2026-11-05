import { Navigate, useLocation } from "react-router-dom";
import { useAutenticacao } from "../contextos/AutenticacaoContexto.jsx";

export default function RotaProtegida({ perfil, children }) {
  const { usuario } = useAutenticacao();
  const localizacao = useLocation();

  if (!usuario) {
    const volta = encodeURIComponent(localizacao.pathname + localizacao.search);
    return <Navigate to={`/entrar/${perfil}?volta=${volta}`} replace />;
  }

  if (usuario.perfil !== perfil) return <Navigate to="/acesso-negado" replace />;

  return children;
}
