import { Link } from "react-router-dom";
import ThemeToggle from "../componentes/ThemeToggle.jsx";

function NaoEncontrada() {
    return (
        <main className="route-not-found">
            <div className="access-toolbar"><ThemeToggle /></div>
            <h1>Página não encontrada</h1>
            <p>Verifique o endereço ou volte ao início.</p>
            <Link className="button button--ink" to="/">Voltar ao início</Link>
        </main>
    );
}

export default NaoEncontrada;
