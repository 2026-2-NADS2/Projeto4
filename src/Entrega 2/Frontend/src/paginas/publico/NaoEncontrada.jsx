import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../../componentes/EmptyState.jsx";
import Icone from "../../componentes/Icone.jsx";
import LayoutPublico from "../../componentes/LayoutPublico.jsx";
import { useTitulo } from "../../utilitarios/useTitulo.js";

export default function NaoEncontrada() {
  useTitulo("Página não encontrada");
  const navegar = useNavigate();

  return (
    <LayoutPublico>
      <section
        className="section"
        style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}
      >
        <EmptyState
          icone="search"
          titulo={
            <span id="page-title" tabIndex={-1}>
              Não encontramos esta página
            </span>
          }
          texto="O link pode estar desatualizado ou o relatório foi movido. Use os atalhos abaixo para voltar."
          acoes={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => navegar(-1)}>
                <Icone nome="chevron-left" className="icon-sm" /> Voltar
              </button>
              <Link className="btn btn-primary" to="/">
                <Icone nome="home" className="icon-sm" /> Página inicial
              </Link>
            </>
          }
        />
      </section>
    </LayoutPublico>
  );
}
