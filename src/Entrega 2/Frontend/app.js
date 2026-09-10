import { ROLES, ROLE_DETAILS, NAVIGATION, canAccess, clearSession, getSession, isKnownRole, routeForRole, setSession } from "./js/access-control.js";
import { getDashboard, signIn } from "./js/mock-api.js";

const app = document.querySelector("#app");
let selectedRole = sessionStorage.getItem("kfka-selected-role") || "";
const statusLabel = { publicado: "PUBLICADO", revisao: "EM REVISÃO", rascunho: "RASCUNHO", devolvido: "DEVOLVIDO" };
const route = () => location.hash.replace(/^#/, "").split("?")[0] || "/";
const go = path => { location.hash = path; };
const escapeHtml = value => String(value).replace(/[&<>"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);

function accessLayout(content, className = "") { return `<main class="access-page ${className}">${content}</main>`; }

function renderLanding() {
  app.innerHTML = accessLayout(`
    <header class="landing-header"><span class="brand">KFKA</span><button class="button button--ink" data-route="/perfil">Entrar</button></header>
    <section class="hero" aria-labelledby="landing-title"><h1 id="landing-title">O boletim que conversa<br>com a família.</h1><p>Professores registram, a coordenação revisa, e os responsáveis<br> acompanham o desenvolvimento do aluno em tempo real.</p><div><button class="button button--cream" data-route="/perfil">Acessar minha conta</button></div></section>`);
}

function renderProfile() {
  const cards = Object.entries(ROLE_DETAILS).map(([role, detail]) => `<button class="role-card role-card--${role}" data-role="${role}" aria-label="Entrar como ${detail.label}"><span class="role-card__letter">${detail.initial}</span><span>${detail.label}</span></button>`).join("");
  app.innerHTML = accessLayout(`<section class="profile-page" aria-labelledby="profile-title"><h1 id="profile-title">Quem está acessando?</h1><div class="role-list">${cards}</div></section>`);
}

function renderLogin() {
  if (!isKnownRole(selectedRole)) { go("/perfil"); return; }
  const label = ROLE_DETAILS[selectedRole].label;
  app.innerHTML = accessLayout(`<section class="login-page"><form class="login-card" id="login-form" novalidate aria-labelledby="login-title"><button class="back-link" type="button" data-route="/perfil">← TROCAR PERFIL</button><h1 id="login-title">Entrar</h1><p class="selected-profile">Acesso como ${label}</p><div class="field"><label for="identifier">E-mail ou matrícula</label><input id="identifier" name="identifier" autocomplete="username" placeholder="E-mail ou matrícula" required><span class="field-error" id="identifier-error"></span></div><div class="field"><label for="password">Senha</label><input id="password" name="password" type="password" autocomplete="current-password" placeholder="Senha" required minlength="6"><span class="field-error" id="password-error"></span></div><p class="field-error" id="form-error" role="alert"></p><button class="button button--green" type="submit">Entrar</button><div class="login-options"><label><input type="checkbox" name="remember"> Lembrar de mim</label><a href="#/login" data-demo-link="forgot">Esqueceu a senha?</a></div><p class="login-help">Ainda não tem acesso? Fale com a secretaria</p></form></section>`);
}

function userChip(data) {
  const avatar = data.avatar ? `<span class="avatar avatar--image"><img src="${data.avatar}" alt=""></span>` : `<span class="avatar">${data.userInitials}</span>`;
  return `<span class="user-chip">${avatar}${escapeHtml(data.user)}</span>`;
}
const status = value => `<span class="status status--${value}">${statusLabel[value]}</span>`;
function recordCard(record) { return `<article class="record-card"><div class="record-info"><span class="avatar">LM</span><div><p class="record-title">${escapeHtml(record.student)}</p><p class="record-meta">${escapeHtml(record.subject)}</p></div></div><div class="record-result"><span class="score">${escapeHtml(record.score)}</span>${status(record.status)}</div></article>`; }

function dashboardContent(role, data) {
  if (role === ROLES.RESPONSAVEL) return `<div class="subhead"><span>${data.period}</span>${userChip(data)}</div><section class="record-list" aria-label="Acompanhamentos de Laura Martins">${data.records.map(recordCard).join("")}</section>`;
  if (role === ROLES.PROFESSOR) return `<div class="subhead"><span>${data.period}</span>${userChip(data)}</div><div class="teacher-layout"><section class="panel"><h2>Novo acompanhamento</h2><p class="panel-intro">Registre o acompanhamento do aluno para enviar à revisão.</p><form id="record-form" class="teacher-form" novalidate><div class="field"><label for="student">Aluno</label><select id="student" required><option value="">Selecione um aluno</option><option>Laura Martins — 6ºA</option><option>Bruno Alves — 6ºA</option></select></div><div class="field"><label for="grade">Média</label><input id="grade" inputmode="decimal" placeholder="Ex.: 8,4" required></div><div class="field"><label for="description">Descrição do acompanhamento</label><textarea id="description" placeholder="Descreva o desenvolvimento do aluno" required></textarea></div><p id="record-message" class="form-message" role="status"></p><button class="button" type="submit">Enviar para revisão</button></form></section><aside class="panel"><h2>Status recente</h2><p class="panel-intro">Acompanhamentos enviados no bimestre.</p><div class="record-list">${data.records.map(recordCard).join("")}</div></aside></div>`;
  return `<div class="subhead"><span>${data.period}</span>${userChip(data)}</div><section class="metric-grid" aria-label="Resumo dos acompanhamentos">${data.metrics.map(([value, label]) => `<article class="metric"><span class="metric-value">${value}</span><div class="metric-label">${label}</div></article>`).join("")}</section><section class="review-table" aria-label="Fila de revisão"><table><thead><tr><th>ALUNO / DISCIPLINA</th><th>PROFESSOR</th><th>MÉDIA</th><th>STATUS</th></tr></thead><tbody>${data.records.map(record => `<tr><td>${escapeHtml(record.student)}</td><td>${escapeHtml(record.teacher)}</td><td class="score">${escapeHtml(record.score)}</td><td>${status(record.status)}</td></tr>`).join("")}</tbody></table></section>`;
}

function renderDashboard(role) {
  const title = role === ROLES.RESPONSAVEL ? "Meus alunos" : role === ROLES.PROFESSOR ? "Novo acompanhamento" : "Fila de revisão";
  const navigation = NAVIGATION[role].map(item => `<button class="nav-link ${item === title ? "nav-link--active" : ""}" type="button">${item}</button>`).join("");
  app.innerHTML = `<div class="app-shell"><aside class="sidebar"><span class="brand brand--sidebar">KFKA</span><nav class="sidebar__nav" aria-label="Navegação principal">${navigation}<button class="nav-link nav-link--exit" data-action="sign-out" type="button">Sair</button></nav></aside><main class="dashboard-main"><div class="dashboard-head"><h1>${title}</h1></div><div id="dashboard-content" class="loading">Carregando dados...</div></main></div>`;
  loadDashboard(role);
}

async function loadDashboard(role) {
  const target = document.querySelector("#dashboard-content");
  try {
    const data = await getDashboard(role);
    if (route() !== routeForRole(role) || !target) return;
    target.className = ""; target.innerHTML = dashboardContent(role, data);
  } catch (error) {
    if (!target) return;
    target.className = "error-panel";
    target.innerHTML = `<div><p>${escapeHtml(error.message)}</p><button class="button button--outline" data-action="retry" type="button">Tentar novamente</button></div>`;
  }
}

function renderForbidden() { app.innerHTML = `<main class="route-not-found"><h1>Acesso não permitido</h1><p>Seu perfil não tem permissão para visualizar esta página.</p><button class="button button--ink" data-route="/">Voltar ao início</button></main>`; }
function renderNotFound() { app.innerHTML = `<main class="route-not-found"><h1>Página não encontrada</h1><p>Verifique o endereço ou volte ao início.</p><button class="button button--ink" data-route="/">Voltar ao início</button></main>`; }
function render() {
  const currentRoute = route();
  if (currentRoute === "/") return renderLanding();
  if (currentRoute === "/perfil") return renderProfile();
  if (currentRoute === "/login") return renderLogin();
  if (["/responsavel", "/professor", "/admin"].includes(currentRoute)) {
    const user = getSession();
    if (!canAccess(currentRoute, user)) return renderForbidden();
    return renderDashboard(user.role);
  }
  renderNotFound();
}

app.addEventListener("click", event => {
  const routeTrigger = event.target.closest("[data-route]");
  if (routeTrigger) { go(routeTrigger.dataset.route); return; }
  const roleTrigger = event.target.closest("[data-role]");
  if (roleTrigger) { selectedRole = roleTrigger.dataset.role; sessionStorage.setItem("kfka-selected-role", selectedRole); go("/login"); return; }
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "sign-out") { clearSession(); go("/"); }
  if (action === "retry") render();
  if (event.target.matches("[data-demo-link='forgot']")) { event.preventDefault(); document.querySelector("#form-error").textContent = "Procure a secretaria para redefinir sua senha."; }
});

app.addEventListener("submit", async event => {
  if (event.target.id === "login-form") {
    event.preventDefault(); const form = event.target; const identifier = form.identifier.value.trim(); const password = form.password.value;
    const identifierError = document.querySelector("#identifier-error"), passwordError = document.querySelector("#password-error"), formError = document.querySelector("#form-error");
    identifierError.textContent = identifier ? "" : "Informe seu e-mail ou matrícula."; passwordError.textContent = password.length >= 6 ? "" : "A senha deve ter pelo menos 6 caracteres.";
    form.identifier.setAttribute("aria-invalid", String(!identifier)); form.password.setAttribute("aria-invalid", String(password.length < 6));
    if (!identifier || password.length < 6) return;
    const submit = form.querySelector("button[type='submit']"); submit.disabled = true; submit.textContent = "Entrando..."; formError.textContent = "";
    try { setSession(await signIn({ identifier, password, role: selectedRole })); go(routeForRole(selectedRole)); }
    catch (error) { formError.textContent = error.message; submit.disabled = false; submit.textContent = "Entrar"; }
  }
  if (event.target.id === "record-form") {
    event.preventDefault(); const form = event.target; const grade = Number(form.querySelector("#grade").value.replace(",", ".")); const message = form.querySelector("#record-message");
    if (!form.querySelector("#student").value || !form.querySelector("#description").value.trim() || Number.isNaN(grade) || grade < 0 || grade > 10) { message.className = "form-message form-message--error"; message.textContent = "Preencha aluno, descrição e uma média entre 0 e 10."; return; }
    message.className = "form-message"; message.textContent = "Acompanhamento enviado para revisão."; form.reset();
  }
});

window.addEventListener("hashchange", render);
render();
