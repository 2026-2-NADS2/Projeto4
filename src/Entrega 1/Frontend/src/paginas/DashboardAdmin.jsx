import { useEffect, useState } from "react";
import DashboardLayout from "../componentes/DashboardLayout.jsx";
import UserChip from "../componentes/UserChip.jsx";
import StatusBadge from "../componentes/StatusBadge.jsx";
import { ROLES } from "../servicos/access-control.js";
import { getDashboard, updateRecordStatus } from "../servicos/mock-api.js";
import { statusLabel } from "../dados/constantes.js";

const TITLE = "Revisão / publicação";

function exportRecords(records) {
    const rows = [["Aluno", "Disciplina", "Professor", "Média", "Status"], ...records.map(record => [record.student, record.subject, record.teacher, record.score, statusLabel[record.status]])];
    const csv = rows.map(row => row.map(value => {
        let text = String(value ?? "");
        if (/^[=+@\-\t\r\n]/.test(text)) text = `'${text}`;
        return `"${text.replaceAll('"', '""')}"`;
    }).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "acompanhamentos.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function DashboardAdmin() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [activeSection, setActiveSection] = useState(TITLE);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        let cancelado = false;
        getDashboard(ROLES.ADMIN)
            .then(resultado => { if (!cancelado) setData(resultado); })
            .catch(erro => { if (!cancelado) setError(erro.message); });
        return () => { cancelado = true; };
    }, []);

    async function revisar(id, status) {
        setSaving(true);
        setMessage("");
        try {
            await updateRecordStatus(id, status);
            setData(await getDashboard(ROLES.ADMIN));
            setMessage(status === "publicado" ? "Relatório publicado." : "Acompanhamento devolvido para ajustes.");
        } catch (error) {
            setMessage(error.message);
        } finally {
            setSaving(false);
        }
    }

    const records = data?.records.filter(record => activeSection !== TITLE || ["revisao", "devolvido"].includes(record.status)) ?? [];

    return (
        <DashboardLayout role={ROLES.ADMIN} title={activeSection} activeSection={activeSection} onSelectSection={setActiveSection}>
            {error && <div className="error-panel" role="alert"><p>{error}</p></div>}
            {!error && !data && <p className="loading" role="status">Carregando dados...</p>}
            {!error && data && (
                <>
                    <div className="subhead"><span>{data.period}</span><UserChip data={data} /></div>
                    {activeSection === "Cadastros" ? (
                        <section className="panel">
                            <h2>Cadastros de demonstração</h2>
                            <p className="panel-intro">Consulta dos alunos e professores presentes nos registros. Edição de cadastros ficará para uma próxima etapa.</p>
                            <h3>Alunos</h3>
                            <ul>{[...new Set(data.records.map(record => record.student))].map(student => <li key={student}>{student}</li>)}</ul>
                            <h3>Professores</h3>
                            <ul>{[...new Set(data.records.map(record => record.teacher))].map(teacher => <li key={teacher}>{teacher}</li>)}</ul>
                        </section>
                    ) : activeSection === "Exportar (Excel)" ? (
                        <section className="panel">
                            <h2>Exportar acompanhamentos</h2>
                            <p className="panel-intro">Baixe os {data.records.length} registros em CSV, formato que pode ser aberto no Excel.</p>
                            <button className="button button--ink" type="button" onClick={() => exportRecords(data.records)}>Baixar CSV</button>
                        </section>
                    ) : (
                        <>
                            <section className="metric-grid" aria-label="Resumo dos acompanhamentos">
                                {data.metrics.map(([value, label]) => (
                                    <article className="metric" key={label}><span className="metric-value">{value}</span><div className="metric-label">{label}</div></article>
                                ))}
                            </section>
                            <section className="review-table" aria-label="Acompanhamentos" tabIndex={0}>
                                <table>
                                    <thead><tr><th scope="col">ALUNO / DISCIPLINA</th><th scope="col">PROFESSOR</th><th scope="col">MÉDIA</th><th scope="col">STATUS</th>{activeSection === TITLE && <th scope="col">AÇÕES</th>}</tr></thead>
                                    <tbody>
                                        {records.length === 0 && <tr><td colSpan={activeSection === TITLE ? 5 : 4}>Nenhum acompanhamento disponível.</td></tr>}
                                        {records.map(record => (
                                            <tr key={record.id}>
                                                <td>{record.student}<div className="record-meta">{record.subject}</div><p className="record-description">{record.description}</p></td>
                                                <td>{record.teacher}</td><td className="score">{record.score}</td><td><StatusBadge value={record.status} /></td>
                                                {activeSection === TITLE && <td>{record.status === "revisao" ? (
                                                    <div className="record-actions">
                                                        <button className="button button--ink" type="button" disabled={saving} onClick={() => revisar(record.id, "publicado")} aria-label={`Publicar ${record.student} — ${record.subject}`}>Publicar</button>
                                                        <button className="button button--outline" type="button" disabled={saving} onClick={() => revisar(record.id, "devolvido")} aria-label={`Devolver ${record.student} — ${record.subject}`}>Devolver</button>
                                                    </div>
                                                ) : "Aguardando ajustes"}</td>}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>
                        </>
                    )}
                    <p role="status">{saving ? "Salvando..." : message}</p>
                </>
            )}
        </DashboardLayout>
    );
}

export default DashboardAdmin;
