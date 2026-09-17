import { Link } from "react-router-dom";

function NaoEncontrada() {
    return (
        <main className="route-not-found">
            <h1>Página não encontrada</h1>
            <p>Verifique o endereço ou volte ao início.</p>
            <Link className="button button--ink" to="/">Voltar ao início</Link>
        </main>
    );
}

export default NaoEncontrada;