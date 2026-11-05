import { Link } from "react-router-dom";
import Icone from "../../componentes/Icone.jsx";
import LayoutPublico from "../../componentes/LayoutPublico.jsx";
import { useTitulo } from "../../utilitarios/useTitulo.js";

export default function Privacidade() {
  useTitulo("Privacidade");

  return (
    <LayoutPublico>
      <div className="section">
        <div className="card stack" style={{ maxWidth: 760, margin: "0 auto" }}>
          <h1 id="page-title" tabIndex={-1}>
            Privacidade e proteção de dados
          </h1>
          <p className="text-2">
            Resumo demonstrativo. O KFKA coleta apenas dados necessários ao acompanhamento escolar,
            restringe o acesso por perfil e registra consentimento do responsável. A família visualiza
            somente relatórios publicados dos alunos vinculados à sua conta. Toda alteração
            administrativa fica registrada com usuário, data/hora, estado anterior e posterior.
          </p>
          <Link className="btn btn-secondary" to="/">
            <Icone nome="chevron-left" className="icon-sm" /> Voltar
          </Link>
        </div>
      </div>
    </LayoutPublico>
  );
}
