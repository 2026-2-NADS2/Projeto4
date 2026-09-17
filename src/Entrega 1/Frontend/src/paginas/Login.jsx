import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AccessLayout from "../componentes/AccessLayout.jsx";
import { ROLE_DETAILS, isKnownRole, routeForRole, setSession } from "../servicos/access-control.js";
import { signIn } from "../servicos/mock-api.js";

export default function Login() {
    const navigate = useNavigate();
    const selectedRole = sessionStorage.getItem("kfka-selected-role") || "";

    const [identifierError, setIdentifierError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!isKnownRole(selectedRole)) {
        navigate("/perfil");
        return null;
    }

    const label = ROLE_DETAILS[selectedRole].label;

    async function handleSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const identifier = form.identifier.value.trim();
        const password = form.password.value;

        setIdentifierError(identifier ? "" : "Informe seu e-mail ou matrícula.");
        setPasswordError(password.length >= 6 ? "" : "A senha deve ter pelo menos 6 caracteres.");

        if (!identifier || password.length < 6) return;

        setSubmitting(true);
        setFormError("");

        try {
            setSession(await signIn({ identifier, password, role: selectedRole }));
            navigate(routeForRole(selectedRole));
        } catch (error) {
            setFormError(error.message);
            setSubmitting(false);
        }
    }

    return (
        <AccessLayout>
            <section className="login-page">
                <form className="login-card" onSubmit={handleSubmit} noValidate aria-labelledby="login-title">
                    <button className="back-link" type="button" onClick={() => navigate("/perfil")}>← TROCAR PERFIL</button>
                    <h1 id="login-title">Entrar</h1>
                    <p className="selected-profile">Acesso como {label}</p>

                    <div className="field">
                        <label htmlFor="identifier">E-mail ou matrícula</label>
                        <input
                            id="identifier"
                            name="identifier"
                            autoComplete="username"
                            placeholder="E-mail ou matrícula"
                            required
                            aria-invalid={Boolean(identifierError)}
                        />
                        <span className="field-error">{identifierError}</span>
                    </div>

                    <div className="field">
                        <label htmlFor="password">Senha</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Senha"
                            required
                            minLength={6}
                            aria-invalid={Boolean(passwordError)}
                        />
                        <span className="field-error">{passwordError}</span>
                    </div>

                    <p className="field-error" role="alert">{formError}</p>

                    <button className="button button--green" type="submit" disabled={submitting}>
                        {submitting ? "Entrando..." : "Entrar"}
                    </button>

                    <div className="login-options">
                        <label input type="checkbox" name="remember"> Lembrar de mim
                            <a href="#"
                                onClick={event => {
                                    event.preventDefault();
                                    setFormError("Procure a secretaria para redefinir sua senha.");
                                }}>

                                Esqueceu a senha?
                            </a>
                        </label>
                    </div>

                    <p className="login-help">Ainda não tem acesso? Fale com a secretaria</p>
                </form>
            </section>
        </AccessLayout >
    );
}