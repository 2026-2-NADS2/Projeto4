import { useEffect, useState } from "react";
import DashboardLayout from "../componentes/DashboardLayout.jsx";
import UserChip from "../componentes/UserChip.jsx";
import RecordCard from "../componentes/RecordCard.jsx";
import { ROLES } from "../servicos/access-control.js";
import { acknowledgeRecord, getDashboard } from "../servicos/mock-api.js";
import { RESPONSAVEL_FILTERS } from "../dados/constantes.js";

const TITLE = "Meus alunos";

function DashboardResponsavel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState(TITLE);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function confirmarCiencia(id) {
    setSaving(true);
    setMessage("");
    try {
      await acknowledgeRecord(id);
      setData(previous => ({ ...previous, records: previous.records.map(record => record.id === id ? { ...record, acknowledged: true } : record) }));
      setMessage("Ciência confirmada.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

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
    <DashboardLayout role={ROLES.RESPONSAVEL} title={activeSection} activeSection={activeSection} onSelectSection={setActiveSection}>
      {error && <div className="error-panel"><p>{error}</p></div>}
      {!error && !data && <p className="loading">Carregando dados...</p>}
      {!error && data && (
        <>
          <div className="subhead">
            <span>{data.period}</span>
            <UserChip data={data} />
          </div>
          <section className="record-list" aria-label="Acompanhamentos de Laura Martins">
            {registros.length === 0 && <p>Nenhum relatório publicado disponível.</p>}
            {activeSection === TITLE && <h2>Laura Martins · Turma 6ºA</h2>}
            {registros.map(record => (
              <div key={record.id}>
                <RecordCard record={record} />
                {activeSection === "Ciência / retorno" && (
                  <button className="button button--outline" type="button" disabled={saving || record.acknowledged} onClick={() => confirmarCiencia(record.id)}>
                    {record.acknowledged ? "Ciência confirmada" : "Confirmar leitura"}
                  </button>
                )}
              </div>
            ))}
          </section>
          <p role="status">{message}</p>
        </>
      )}
    </DashboardLayout>
  );
}

export default DashboardResponsavel;
