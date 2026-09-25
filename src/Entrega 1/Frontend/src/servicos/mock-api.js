import { getSession, isKnownRole, ROLES } from "./access-control.js";

export const STUDENTS = ["Laura Martins — 6ºA", "Bruno Alves — 6ºA"];
const STORAGE_KEY = "kfka-records-v1";
const initialRecords = [
  { id: "laura-publicado", student: STUDENTS[0], subject: "Matemática", teacher: "R. Souza", score: "8.4", description: "Bom desenvolvimento no bimestre.", status: "publicado" },
  { id: "laura-revisao", student: STUDENTS[0], subject: "Matemática", teacher: "R. Souza", score: "8.4", description: "Acompanhamento em revisão.", status: "revisao" },
  { id: "bruno-rascunho", student: STUDENTS[1], subject: "Matemática", teacher: "R. Souza", score: "7.2", description: "Registro em elaboração.", status: "rascunho" },
  { id: "bruno-revisao", student: STUDENTS[1], subject: "Ciências", teacher: "C. Nunes", score: "7.2", description: "Acompanhamento em revisão.", status: "revisao" },
  { id: "ana-devolvido", student: "Ana Costa — 6ºA", subject: "Português", teacher: "R. Souza", score: "—", description: "Complementar a descrição.", status: "devolvido" }
];
const users = {
  responsavel: { user: "Carla Martins", userInitials: "CM", avatar: "assets/avatar-responsavel.svg" },
  professor: { user: "R. Souza", userInitials: "RS" },
  admin: { user: "Admin", userInitials: "AD", avatar: "assets/avatar-admin.svg" }
};
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function request(role) {
  await wait(500);
  if (sessionStorage.getItem("kfka-force-api-error") === "true") throw new Error("Não foi possível concluir a solicitação. Tente novamente.");
  if (!isKnownRole(role) || getSession()?.role !== role) throw new Error("Acesso não permitido para este perfil.");
}

function readRecords() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(initialRecords);
  const records = JSON.parse(saved);
  if (!Array.isArray(records) || records.some(record => !record || typeof record.id !== "string" || typeof record.student !== "string" || !["publicado", "revisao", "rascunho", "devolvido"].includes(record.status))) {
    throw new Error("Os dados de demonstração salvos são inválidos.");
  }
  return records;
}

function writeRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function validateAccompaniment({ student, grade, description }) {
  const value = String(grade ?? "").trim();
  if (!STUDENTS.includes(student) || !description?.trim() || !/^\d+(?:[.,]\d+)?$/.test(value) || Number(value.replace(",", ".")) > 10) {
    return "Preencha aluno, descrição e uma média entre 0 e 10.";
  }
  return "";
}

export async function signIn({ identifier, password, role }) {
  await wait(650);
  if (!identifier?.trim() || password?.length < 6 || !password || !isKnownRole(role)) throw new Error("Dados de acesso inválidos.");
  return { role, identifier: identifier.trim() };
}

export async function getDashboard(role) {
  await request(role);
  let records = readRecords();
  if (role === ROLES.PROFESSOR) records = records.filter(record => record.teacher === users.professor.user);
  if (role === ROLES.RESPONSAVEL) records = records.filter(record => record.student === STUDENTS[0] && record.status === "publicado");
  return {
    ...users[role], period: "Bimestre 02 · Ano letivo 2026", records,
    metrics: [["publicado", "Publicados"], ["revisao", "Em revisão"], ["devolvido", "Devolvidos"], ["rascunho", "Rascunhos"]]
      .map(([status, label]) => [String(records.filter(record => record.status === status).length), label])
  };
}

export async function saveAccompaniment(values) {
  await request(ROLES.PROFESSOR);
  const error = validateAccompaniment(values);
  if (error) throw new Error(error);
  const record = {
    id: crypto.randomUUID(), student: values.student, subject: "Matemática", teacher: users.professor.user,
    score: String(Number(values.grade.trim().replace(",", "."))), description: values.description.trim(), status: "revisao"
  };
  writeRecords([record, ...readRecords()]);
  return record;
}

export async function updateRecordStatus(id, status) {
  await request(ROLES.ADMIN);
  if (!["publicado", "devolvido"].includes(status)) throw new Error("Status inválido.");
  const records = readRecords();
  const record = records.find(item => item.id === id);
  if (!record || record.status !== "revisao") throw new Error("O registro não está disponível para revisão.");
  record.status = status;
  writeRecords(records);
}

export async function acknowledgeRecord(id) {
  await request(ROLES.RESPONSAVEL);
  const records = readRecords();
  const record = records.find(item => item.id === id && item.student === STUDENTS[0] && item.status === "publicado");
  if (!record) throw new Error("Relatório indisponível.");
  record.acknowledged = true;
  writeRecords(records);
}
