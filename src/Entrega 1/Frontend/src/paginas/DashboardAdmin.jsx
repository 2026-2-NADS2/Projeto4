import { useEffect, useState } from "react";
import DashboardLayout from "../componentes/DashboardLayout.jsx";
import UserChip from "../componentes/UserChip.jsx";
import StatusBadge from "../componentes/StatusBadge.jsx";
import { ROLES } from "../servicos/access-control.js";
import { getDashboard } from "../servicos/mock-api.js";

const TITLE = "Fila de revisão";

function DashboardAdmin() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [activeSection, setActiveSection] = useState(TITLE);

    useEffect(() => {
        let cancelado = false;

        getDashboard(ROLES.ADMIN)
            .then(resultado => { if (!cancelado) setData(resultado); })
            .catch(erro => { if (!cancelado) setError(erro.message); });

        return () => { cancelado = true; };
    }, []);

    return (
        <DashboardLayout role={ROLES.ADMIN} title={TITLE} activeSection={activeSection} onSelectSection={setActiveSection}>
            {error && <div className="error-panel"><p>{error}</p></div>}
            {!error && !data && <p className="loading">Carregando dados...</p>}
            {!error && data && (
                <>
                    <div className="subhead">
                        <span>{data.period}</span>
                        <UserChip data={data} />
                    </div>
                    <section className="metric-grid" aria-label="Resumo dos acompanhamentos">
                        {data.metrics.map(([value, label]) => (
                            <article className="metric" key={label}>
                                <span className="metric-value">{value}</span>
                                <div className="metric-label">{label}</div>
                            </article>
                        ))}
                    </section>
                    <section className="review-table" aria-label="Fila de revisão">
                        <table>
                            <thead>
                                <tr>
                                    <th>ALUNO / DISCIPLINA</th>
                                    <th>PROFESSOR</th>
                                    <th>MÉDIA</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.records.map((record, index) => (
                                    <tr key={index}>
                                        <td>{record.student}</td>
                                        <td>{record.teacher}</td>
                                        <td className="score">{record.score}</td>
                                        <td><StatusBadge value={record.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </>
            )}
        </DashboardLayout>
    );
}

export default DashboardAdmin;