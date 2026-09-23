// A preferência visual é independente da sessão de login e das permissões.
const STORAGE_KEY = "kfka-theme";
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
const listeners = new Set();

function readPreference() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved === "light" || saved === "dark" ? saved : null;
    } catch {
        // O tema continua funcionando quando o navegador bloqueia o armazenamento.
        return null;
    }
}

let preference = readPreference();
let theme = preference ?? (systemTheme.matches ? "dark" : "light");

function applyTheme() {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    listeners.forEach(listener => listener());
}

// Executado antes de o React desenhar as telas.
applyTheme();

export function getTheme() {
    return theme;
}

export function setTheme(nextTheme) {
    if (nextTheme !== "light" && nextTheme !== "dark") return;
    preference = nextTheme;
    theme = nextTheme;
    try {
        localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
        // Mantém a escolha em memória durante esta visita.
    }
    applyTheme();
}

function onSystemChange() {
    if (preference !== null) return;
    theme = systemTheme.matches ? "dark" : "light";
    applyTheme();
}

function onStorageChange(event) {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    preference = readPreference();
    theme = preference ?? (systemTheme.matches ? "dark" : "light");
    applyTheme();
}

// Compartilha o estado entre botões e sincroniza abas, com limpeza dos eventos.
export function subscribeTheme(listener) {
    listeners.add(listener);
    if (listeners.size === 1) {
        systemTheme.addEventListener("change", onSystemChange);
        window.addEventListener("storage", onStorageChange);
        onSystemChange();
    }
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
            systemTheme.removeEventListener("change", onSystemChange);
            window.removeEventListener("storage", onStorageChange);
        }
    };
}
