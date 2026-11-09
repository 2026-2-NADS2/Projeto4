import { Navigate, useLocation } from "react-router-dom";
import { useAutenticacao } from "../contextos/AutenticacaoContexto.jsx";

export default function RotaProtegida({ perfil, children }) {
  const { usuario, carregando } = useAutenticacao();
  const localizacao = useLocation();

  // Enquanto a sessão é validada e os dados são recarregados, não decide o
  // redirecionamento: evita mandar o usuário a "acesso negado" por engano.
  if (carregando) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <p className="text-2">Carregando…</p>
      </div>
    );
  }

  if (!usuario) {
    const volta = encodeURIComponent(localizacao.pathname + localizacao.search);
    return <Navigate to={`/entrar/${perfil}?volta=${volta}`} replace />;
  }

  if (usuario.perfil !== perfil) return <Navigate to="/acesso-negado" replace />;

  return children;
}
