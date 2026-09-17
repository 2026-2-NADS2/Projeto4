import { useNavigate } from "react-router-dom";
import { NAVIGATION, clearSession } from "../servicos/access-control.js";

function DashboardLayout({ role, title, activeSection, onSelectSection, children }) {
    const navigate = useNavigate();

    function handleSignOut() {
        clearSession();
        navigate("/");
    }

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <span className="brand brand--sidebar">KFKA</span>
                <nav className="sidebar__nav" aria-label="Navegação principal">
                    {NAVIGATION[role].map(item => (
                        <button
                            key={item}
                            className={`nav-link ${item === activeSection ? "nav-link--active" : ""}`}
                            type="button"
                            onClick={() => onSelectSection?.(item)}
                        >
                            {item}
                        </button>
                    ))}
                    <button className="nav-link nav-link--exit" type="button" onClick={handleSignOut}>
                        Sair
                    </button>
                </nav>
            </aside>
            <main className="dashboard-main">
                <div className="dashboard-head">
                    <h1>{title}</h1>
                </div>
                <div className="dashboard-content">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default DashboardLayout;