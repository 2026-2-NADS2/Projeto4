import { useEffect, useState } from "react";
import DashboardLayout from "../componentes/DashboardLayout.jsx";
import UserChip from "../componentes/UserChip.jsx";
import RecordCard from "../componentes/RecordCard.jsx";
import { ROLES } from "../servicos/access-control.js";
import { getDashboard, saveAccompaniment, STUDENTS, validateAccompaniment } from "../servicos/mock-api.js";

const TITLE = "Novo acompanhamento";

function DashboardProfessor() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [activeSection, setActiveSection] = useState(TITLE);
    const [mensagem, setMensagem] = useState("");
    const [mensagemErro, setMensagemErro] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let cancelado = false;

        getDashboard(ROLES.PROFESSOR)
            .then(resultado => { if (!cancelado) setData(resultado); })
            .catch(erro => { if (!cancelado) setError(erro.message); });

        return () => { cancelado = true; };
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        if (submitting) return;
        const form = event.target;
        const values = { student: form.student.value, grade: form.grade.value, description: form.description.value };
        const validationError = validateAccompaniment(values);

        if (validationError) {
            setMensagemErro(true);
            setMensagem(validationError);
            return;
        }

        setSubmitting(true);
        setMensagem("");
        try {
            const record = await saveAccompaniment(values);
            setData(previous => ({ ...previous, records: [record, ...previous.records] }));
            setMensagemErro(false);
            setMensagem("Acompanhamento enviado para revisão.");
            form.reset();
        } catch (error) {
            setMensagemErro(true);
            setMensagem(error.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <DashboardLayout role={ROLES.PROFESSOR} title={activeSection} activeSection={activeSection} onSelectSection={setActiveSection}>
            {error && <div className="error-panel"><p>{error}</p></div>}
            {!error && !data && <p className="loading">Carregando dados...</p>}
            {!error && data && (
                <>
                    <div className="subhead">
                        <span>{data.period}</span>
                        <UserChip data={data} />
                    </div>
                    {activeSection === "Minhas turmas" && (
                        <section className="panel">
                            <h2>Turma 6ºA · Matemática</h2>
                            <p className="panel-intro">Alunos disponíveis para acompanhamento nesta demonstração.</p>
                            <ul>{STUDENTS.map(student => <li key={student}>{student}</li>)}</ul>
                        </section>
                    )}
                    <div className={activeSection === TITLE ? "teacher-layout" : "record-list"}>
                        {activeSection === TITLE && (
                        <section className="panel">
                            <h2>Novo acompanhamento</h2>
                            <p className="panel-intro">Registre o acompanhamento do aluno para enviar à revisão.</p>
                            <form className="teacher-form" noValidate onSubmit={handleSubmit} aria-describedby="teacher-message">
                                <fieldset disabled={submitting}>
                                <div className="field">
                                    <label htmlFor="student">Aluno</label>
                                    <select id="student" name="student" required defaultValue="">
                                        <option value="">Selecione um aluno</option>
                                        {STUDENTS.map(student => <option key={student}>{student}</option>)}
                                    </select>
                                </div>
                                <div className="field">
                                    <label htmlFor="grade">Média</label>
                                    <input id="grade" name="grade" inputMode="decimal" placeholder="Ex.: 8,4" required />
                                </div>
                                <div className="field">
                                    <label htmlFor="description">Descrição do acompanhamento</label>
                                    <textarea id="description" name="description" placeholder="Descreva o desenvolvimento do aluno" required />
                                </div>
                                <p id="teacher-message" className={`form-message ${mensagemErro ? "form-message--error" : ""}`} role="status">
                                    {mensagem}
                                </p>
                                <button className="button" type="submit">{submitting ? "Enviando..." : "Enviar para revisão"}</button>
                                </fieldset>
                            </form>
                        </section>
                        )}
                        {activeSection !== "Minhas turmas" && (
                        <aside className="panel">
                            <h2>{activeSection === TITLE ? "Status recente" : "Enviados / status"}</h2>
                            <p className="panel-intro">Acompanhamentos enviados no bimestre.</p>
                            <div className="record-list">
                                {data.records.map(record => (
                                    <RecordCard key={record.id} record={record} />
                                ))}
                            </div>
                        </aside>
                        )}
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}

export default DashboardProfessor;
