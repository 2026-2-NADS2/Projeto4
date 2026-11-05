// Formata uma média no padrão brasileiro: 8,5; sem nota, travessão.
export function fmtMedia(valor) {
  return valor == null || valor === "" ? "—" : Number(valor).toFixed(1).replace(".", ",");
}

// Iniciais para avatares: primeira + última palavra, ignorando "da/de/do".
export function iniciais(nome) {
  const partes = String(nome || "")
    .trim()
    .split(/\s+/)
    .filter((parte) => parte && !/^(d[aeo]s?|e|y)$/i.test(parte));

  if (!partes.length) return "?";

  const inicial = (parte) => Array.from(parte)[0] || "";
  return (
    inicial(partes[0]) + (partes.length > 1 ? inicial(partes[partes.length - 1]) : "")
  ).toUpperCase();
}

export function plural(n, singular, pluralForma = `${singular}s`) {
  return `${n} ${n === 1 ? singular : pluralForma}`;
}

export function primeiroNome(nome) {
  return String(nome || "").trim().split(/\s+/)[0] || "";
}

export function normalizarEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function emailValido(email) {
  return /^\S+@\S+\.\S+$/.test(String(email || "").trim());
}

export function dataHoraCurta(data = new Date()) {
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function saudacao(data = new Date()) {
  const hora = data.getHours();
  return hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
}
