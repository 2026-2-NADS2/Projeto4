import { useEffect, useState } from "react";
import DashboardLayout from "../componentes/DashboardLayout.jsx";
import UserChip from "../componentes/UserChip.jsx";
import RecordCard from "../componentes/RecordCard.jsx";
import { ROLES } from "../servicos/access-control.js";
import { getDashboard } from "../servicos/mock-api.js";
import { RESPONSAVEL_FILTERS } from "../dados/constantes.js";

const TITLE = "Meus alunos";

function DashboardResponsavel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState(TITLE);

  useEffect(() => {
    let cancelado = false;

    getDashboard(ROLES.RESPONSAVEL)
      .then(resultado => { if (!cancelado) setData(resultado); })
      .catch(erro => { if (!cancelado) setError(erro.message); });

    return () => { cancelado = true; };
  }, []);

  const filtro = RESPONSAVEL_FILTERS[activeSection];
  const registros = data ? (filtro ? filtro(data.records) : data.records) : [];

  return (
    <DashboardLayout role={ROLES.RESPONSAVEL} title={TITLE} activeSection={activeSection} onSelectSection={setActiveSection}>
      {error && <div className="error-panel"><p>{error}</p></div>}
      {!error && !data && <p className="loading">Carregando dados...</p>}
      {!error && data && (
        <>
          <div className="subhead">
            <span>{data.period}</span>
            <UserChip data={data} />
          </div>
          <section className="record-list" aria-label="Acompanhamentos de Laura Martins">
            {registros.map((record, index) => (
              <RecordCard key={index} record={record} />
            ))}
          </section>
        </>
      )}
    </DashboardLayout>
  );
}

export default DashboardResponsavel;