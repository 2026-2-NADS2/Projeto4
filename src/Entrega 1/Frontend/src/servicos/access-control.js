export const ROLES = Object.freeze({ RESPONSAVEL: "responsavel", PROFESSOR: "professor", ADMIN: "admin" });

export const ROLE_DETAILS = Object.freeze({
    [ROLES.RESPONSAVEL]: { label: "Responsável", initial: "R", route: "/responsavel" },
    [ROLES.PROFESSOR]: { label: "Professor", initial: "P", route: "/professor" },
    [ROLES.ADMIN]: { label: "Administrador", initial: "A", route: "/admin" }
});

export const NAVIGATION = Object.freeze({
    [ROLES.RESPONSAVEL]: ["Meus alunos", "Relatórios publicados", "Ciência / retorno"],
    [ROLES.PROFESSOR]: ["Minhas turmas", "Novo acompanhamento", "Enviados / status"],
    [ROLES.ADMIN]: ["Cadastros", "Revisão / publicação", "Relatórios", "Exportar (Excel)"]
});

export function routeForRole(role) { return ROLE_DETAILS[role]?.route ?? "/perfil"; }
export function isKnownRole(role) { return Object.hasOwn(ROLE_DETAILS, role); }

// The backend must enforce this same policy. This client guard keeps routes safe in the UI.
export function canAccess(route, user) {
    return Boolean(user && isKnownRole(user.role) && route === routeForRole(user.role));
}

export function getSession() {
    try { return JSON.parse(localStorage.getItem("kfka-session")); } catch { return null; }
}

export function setSession(session) { localStorage.setItem("kfka-session", JSON.stringify(session)); }
export function clearSession() { localStorage.removeItem("kfka-session"); }
