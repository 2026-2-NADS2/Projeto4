import { normalizarEmail } from "./formatadores.js";

// O backend ainda não guarda a decisão de consentimento LGPD, então ela fica
// no aparelho, por conta. O acesso essencial (entrar, notas, relatórios) nunca
// depende deste registro: ele cobre só as finalidades opcionais.
const CHAVE = "kfka-consentimento-lgpd";

function lerTodos() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return {};
    const dados = JSON.parse(bruto);
    return dados && typeof dados === "object" ? dados : {};
  } catch {
    return {};
  }
}

export function lerConsentimento(email) {
  const registro = lerTodos()[normalizarEmail(email)];

  if (!registro || typeof registro.autorizado !== "boolean") return null;

  return {
    autorizado: registro.autorizado,
    em: typeof registro.em === "string" ? registro.em : null,
  };
}

export function registrarConsentimento(email, autorizado) {
  const chave = normalizarEmail(email);
  if (!chave) return null;

  const registro = {
    autorizado: Boolean(autorizado),
    em: new Date().toISOString(),
  };

  const todos = lerTodos();
  todos[chave] = registro;

  try {
    localStorage.setItem(CHAVE, JSON.stringify(todos));
  } catch {
    /* sem armazenamento: a decisão vale só para esta navegação */
  }

  return registro;
}

export function formatarDecisao(registro) {
  if (!registro) return "";

  const acao = registro.autorizado ? "autorizou" : "não autorizou";
  const texto = `Você ${acao} o uso dos dados para finalidades opcionais`;

  if (!registro.em) return `${texto}.`;

  const data = new Date(registro.em);
  if (Number.isNaN(data.getTime())) return `${texto}.`;

  return `${texto} em ${data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}.`;
}
