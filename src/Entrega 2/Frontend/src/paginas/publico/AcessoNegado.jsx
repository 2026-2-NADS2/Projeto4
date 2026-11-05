import { Link } from "react-router-dom";
import EmptyState from "../../componentes/EmptyState.jsx";
import Icone from "../../componentes/Icone.jsx";
import { PERFIS, useAutenticacao } from "../../contextos/AutenticacaoContexto.jsx";
import { useTitulo } from "../../utilitarios/useTitulo.js";

export default function AcessoNegado() {
  useTitulo("Acesso negado");
  const { usuario } = useAutenticacao();
  const perfil = usuario ? PERFIS[usuario.perfil] : null;

  return (
    <main
      id="conteudo"
      className="section"
      style={{ minHeight: "80vh", display: "grid", placeItems: "center" }}
    >
      <EmptyState
        icone="lock"
        titulo={
          <span id="page-title" tabIndex={-1}>
            Esta área não faz parte do seu perfil
          </span>
        }
        texto={
          perfil
            ? `Você entrou como ${perfil.pill}. Telas de cadastro e revisão são exclusivas da coordenação. Relatórios de outros alunos ou ainda não publicados não ficam disponíveis para a família.`
            : "Entre com uma conta que tenha permissão para abrir esta tela."
        }
        acoes={
          <>
            <Link className="btn btn-secondary" to="/entrar">
              <Icone nome="swap" className="icon-sm" /> Trocar de perfil
            </Link>
            <Link className="btn btn-primary" to={perfil ? perfil.destino : "/"}>
              <Icone nome="home" className="icon-sm" /> Ir para o meu início
            </Link>
          </>
        }
      />
    </main>
  );
}
