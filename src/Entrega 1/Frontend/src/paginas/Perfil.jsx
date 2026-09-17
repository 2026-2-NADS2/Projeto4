import { useNavigate } from "react-router-dom";
import AccessLayout from "../componentes/AccessLayout.jsx";
import { ROLE_DETAILS } from "../servicos/access-control.js";

export default function Perfil() {
    const navigate = useNavigate();

    function selecionarPerfil(role) {
        sessionStorage.setItem("kfka-selected-role", role);
        navigate("/login");
    }

    return (
        <AccessLayout>
            <section className="profile-page" aria-labelledby="profile-title">
                <h1 id="profile-title">Quem está acessando?</h1>
                <div className="role-list">
                    {Object.entries(ROLE_DETAILS).map(([role, detail]) => (
                        <button
                            key={role}
                            className={`role-card role-card--${role}`}
                            aria-label={`Entrar como ${detail.label}`}
                            onClick={() => selecionarPerfil(role)}
                        >
                            <span className="role-card__letter">{detail.initial}</span>
                            <span>{detail.label}</span>
                        </button>
                    ))}
                </div>
            </section>
        </AccessLayout>
    );
}