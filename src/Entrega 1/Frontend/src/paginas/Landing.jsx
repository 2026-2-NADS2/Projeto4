import { Link } from "react-router-dom";
import AccessLayout from "../componentes/AccessLayout.jsx";
import ThemeToggle from "../componentes/ThemeToggle.jsx";

export default function Landing() {
    return (
        <AccessLayout showThemeToggle={false}>
            <header className="landing-header">
                <span className="brand">KFKA</span>
                <div className="landing-actions">
                    <ThemeToggle />
                    <Link className="button button--ink" to="/perfil">Entrar</Link>
                </div>
            </header>
            <section className="hero" aria-labelledby="landing-title">
                <h1 id="landing-title">
                    O boletim que conversa<br />com a família.
                </h1>
                <p>
                    Professores registram, a coordenação revisa, e os responsáveis<br />
                    acompanham o desenvolvimento do aluno em tempo real.
                </p>
                <div>
                    <Link className="button button--cream" to="/perfil">Acessar minha conta</Link>
                </div>
            </section>
        </AccessLayout>
    );
}
