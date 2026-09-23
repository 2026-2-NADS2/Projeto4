import { useSyncExternalStore } from "react";
import { getTheme, setTheme, subscribeTheme } from "../servicos/theme.js";

export default function ThemeToggle() {
    const theme = useSyncExternalStore(subscribeTheme, getTheme);
    const isDark = theme === "dark";

    return (
        <button
            className="theme-toggle"
            type="button"
            aria-label="Modo escuro"
            aria-pressed={isDark}
            title={`Ativar modo ${isDark ? "claro" : "escuro"}`}
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            <span className="theme-toggle__symbol" aria-hidden="true" />
            <span>Tema: {isDark ? "escuro" : "claro"}</span>
        </button>
    );
}
