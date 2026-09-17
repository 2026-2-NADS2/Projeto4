import { Link } from "react-router-dom";
import AccessLayout from "../componentes/AccessLayout.jsx";

export default function Landing() {
    return (
        <AccessLayout>
            <header className="landing-header">
                <span className="brand">KFKA</span>
                <Link className="button button--ink" to="/perfil">Entrar</Link>
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