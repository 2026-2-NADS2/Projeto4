const dataByRole = {
  responsavel: {
    user: "Carla Martins", userInitials: "CM", avatar: "assets/avatar-responsavel.svg", period: "Bimestre 02 · Ano letivo 2026",
    records: [
      { student: "Laura Martins — 6ºA", subject: "Matemática · Bimestre 02", score: "8.4", status: "publicado" },
      { student: "Laura Martins — 6ºA", subject: "Português · Bimestre 02", score: "—", status: "revisao" },
      { student: "Laura Martins — 6ºA", subject: "Ciências · Bimestre 02", score: "—", status: "rascunho" }
    ]
  },
  professor: {
    user: "R. Souza", userInitials: "RS", period: "Bimestre 02 · Turma 6ºA",
    records: [
      { student: "Laura Martins", subject: "Matemática", score: "8.4", status: "revisao" },
      { student: "Bruno Alves", subject: "Matemática", score: "7.2", status: "rascunho" }
    ]
  },
  admin: {
    user: "Admin", userInitials: "AD", avatar: "assets/avatar-admin.svg", period: "Bimestre 02 · 6 acompanhamentos pendentes",
    metrics: [["128", "Publicados"], ["14", "Em revisão"], ["6", "Devolvidos"], ["22", "Rascunhos"]],
    records: [
      { student: "Laura Martins · Matemática", teacher: "R. Souza", score: "8.4", status: "revisao" },
      { student: "Bruno Alves · Ciências", teacher: "C. Nunes", score: "7.2", status: "revisao" },
      { student: "Ana Costa · Português", teacher: "R. Souza", score: "—", status: "devolvido" }
    ]
  }
};

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

export async function signIn({ identifier, password, role }) {
  await wait(650);
  if (!identifier || !password || !role) throw new Error("Dados de acesso incompletos.");
  return { role, identifier };
}

export async function getDashboard(role) {
  await wait(500);
  if (sessionStorage.getItem("kfka-force-api-error") === "true") throw new Error("Não foi possível carregar os dados. Tente novamente.");
  if (!dataByRole[role]) throw new Error("Perfil sem dados disponíveis.");
  return structuredClone(dataByRole[role]);
}
