import { useEffect, useState } from "react";
import DashboardLayout from "../componentes/DashboardLayout.jsx";
import UserChip from "../componentes/UserChip.jsx";
import RecordCard from "../componentes/RecordCard.jsx";
import { ROLES } from "../servicos/access-control.js";
import { getDashboard } from "../servicos/mock-api.js";

const TITLE = "Novo acompanhamento";

function DashboardProfessor() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [activeSection, setActiveSection] = useState(TITLE);
    const [mensagem, setMensagem] = useState("");
    const [mensagemErro, setMensagemErro] = useState(false);

    useEffect(() => {
        let cancelado = false;

        getDashboard(ROLES.PROFESSOR)
            .then(resultado => { if (!cancelado) setData(resultado); })
            .catch(erro => { if (!cancelado) setError(erro.message); });

        return () => { cancelado = true; };
    }, []);

    function handleSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const grade = Number(form.grade.value.replace(",", "."));

        const invalido =
            !form.student.value ||
            !form.description.value.trim() ||
            Number.isNaN(grade) ||
            grade < 0 ||
            grade > 10;

        if (invalido) {
            setMensagemErro(true);
            setMensagem("Preencha aluno, descrição e uma média entre 0 e 10.");
            return;
        }

        setMensagemErro(false);
        setMensagem("Acompanhamento enviado para revisão.");
        form.reset();
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
                    <div className="teacher-layout">
                        <section className="panel">
                            <h2>Novo acompanhamento</h2>
                            <p className="panel-intro">Registre o acompanhamento do aluno para enviar à revisão.</p>
                            <form className="teacher-form" noValidate onSubmit={handleSubmit}>
                                <div className="field">
                                    <label htmlFor="student">Aluno</label>
                                    <select id="student" name="student" required defaultValue="">
                                        <option value="">Selecione um aluno</option>
                                        <option>Laura Martins — 6ºA</option>
                                        <option>Bruno Alves — 6ºA</option>
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
                                <p className={`form-message ${mensagemErro ? "form-message--error" : ""}`} role="status">
                                    {mensagem}
                                </p>
                                <button className="button" type="submit">Enviar para revisão</button>
                            </form>
                        </section>
                        <aside className="panel">
                            <h2>Status recente</h2>
                            <p className="panel-intro">Acompanhamentos enviados no bimestre.</p>
                            <div className="record-list">
                                {data.records.map((record, index) => (
                                    <RecordCard key={index} record={record} />
                                ))}
                            </div>
                        </aside>
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}

export default DashboardProfessor;