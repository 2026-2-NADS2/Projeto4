import { dados } from "./dados";
import { api } from "../servicos/api";

const CORES = ["#5FD4A8", "#74C0FC", "#FFC94A", "#F8B4C9", "#B9C8FF", "#9FE3D0", "#FFD8A8", "#C9E7F5"];
const cor = (i) => CORES[i % CORES.length];
const sid = (v) => (v == null ? "" : String(v));
const preencher = (arr, novos) => {
  arr.length = 0;
  arr.push(...novos);
};

const unicos = (itens, chave = "id") => {
  const mapa = new Map();
  for (const item of itens) {
    if (item && item[chave] != null && !mapa.has(item[chave])) mapa.set(item[chave], item);
  }
  return [...mapa.values()];
};

const LABELS = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  revisao: "Em revisão",
  publicado: "Publicado",
  devolvido: "Devolvido",
  cancelado: "Cancelado",
};

const status = (valor) => {
  const v = String(valor || "").toLowerCase();
  return v === "em_revisao" ? "revisao" : v;
};

const dataBR = (valor, comHora = false) => {
  if (!valor) return "";

  if (typeof valor === "string") {
    const m = valor.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}${comHora && m[4] ? ` ${m[4]}:${m[5]}` : ""}`;
  }

  const d = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(d.getTime())) return String(valor);

  const data = d.toLocaleDateString("pt-BR");
  if (!comHora) return data;

  return `${data} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
};

const hora = (valor) => (valor ? String(valor).slice(0, 5) : "");

/* ---------- mapeamentos ---------- */

const mapAluno = (a, i) => ({
  id: sid(a.id),
  nome: a.nome || "",
  ra: a.matricula || "",
  turma: sid(a.idTurma ?? ""),
  nasc: dataBR(a.dataNascimento),
  ativo: a.ativo !== false,
  cor: cor(i),
});

const mapTurma = (t) => ({
  id: sid(t.id),
  nome: t.nome || "",
  ano: t.anoSerie || "",
  turno: t.turno || "",
  sala: "",
  ativo: t.ativo !== false,
});

const mapArea = (a, i) => ({
  id: sid(a.id),
  nome: a.nome || "",
  cor: cor(i),
  ativo: a.ativo !== false,
});

const mapDisciplina = (d) => ({
  id: sid(d.id),
  nome: d.nome || "",
  area: sid(d.idArea ?? ""),
  ativa: d.ativo !== false,
});

const mapProfessor = (p, i) => ({
  id: sid(p.id),
  nome: p.nome || "Professor",
  email: p.email || "",
  matricula: p.matricula || "",
  tel: "",
  disc: [],
  ativo: p.ativo !== false,
  cor: cor(i),
});

const mapResponsavel = (r, i) => ({
  id: sid(r.id),
  nome: r.nome || "",
  email: r.email || "",
  tel: r.telefone || "",
  alunos: [],
  parentesco: "",
  consentimento: "",
  ativo: r.ativo !== false,
  cor: cor(i),
});

const mapVinculo = (v) => ({
  id: sid(v.id),
  turma: sid(v.idTurma),
  disc: sid(v.idDisciplina),
  prof: sid(v.idProfessor),
  anoLetivo: sid(v.idAnoLetivo),
  ativo: v.ativo !== false,
});

// /professores/me/vinculos devolve turma/disciplina/professor aninhados.
const mapVinculoProfessor = (v) => ({
  id: sid(v.id),
  turma: sid(v.turma?.id),
  disc: sid(v.disciplina?.id),
  prof: sid(v.professor?.id),
  anoLetivo: sid(v.anoLetivo ?? ""),
  ativo: v.ativo !== false,
});

const mapTag = (t) => ({
  id: sid(t.id),
  nome: t.nome || "",
  tom: "",
  tipo: "",
});

const mapBimestre = (b) => {
  const inicio = new Date(b.dataInicio);
  const fim = new Date(b.dataFim);
  const agora = new Date();
  const situacao =
    agora < inicio ? "agendado" : agora > fim ? "encerrado" : "aberto";

  return {
    id: sid(b.id),
    idAnoLetivo: sid(b.idAnoLetivo ?? ""),
    n: b.numero ?? b.n,
    ini: `${dataBR(b.dataInicio)} ${hora(b.horaInicio)}`.trim(),
    fim: `${dataBR(b.dataFim)} ${hora(b.horaFim)}`.trim(),
    status: situacao,
    rotulo:
      situacao === "aberto"
        ? "Digitação aberta"
        : situacao === "agendado"
          ? "Agendado"
          : "Encerrado",
  };
};

const mapHistorico = (h) => ({
  quem: h.usuario || "",
  papel: h.perfil || "",
  quando: dataBR(h.dataHora, true),
  acao: h.observacao || LABELS[status(h.estadoNovo)] || "Atualizado",
  de: status(h.estadoAnterior) || null,
  para: status(h.estadoNovo) || null,
  coment: h.observacao || null,
});

const mapRel = (r) => {
  const situacao = status(r.status);

  return {
    id: sid(r.id),
    aluno: sid(r.aluno?.id),
    turma: sid(r.turma?.id),
    disc: sid(r.disciplina?.id),
    prof: sid(r.professor?.id),
    idBimestre: sid(r.idBimestre ?? ""),
    bim: r.bimestre ?? r.idBimestre,
    media: r.media,
    status: situacao,
    desc: r.descricao || "",
    ano: r.anoLetivo || new Date().getFullYear(),
    lido: situacao === "publicado",
    tags: Array.isArray(r.tags) ? r.tags.map((tag) => sid(tag.id)) : [],
    comentarios: [],
    observacao: null,
    historico: (r.historico || []).map(mapHistorico),
  };
};

const mapAuditoria = (h) => ({
  quando: dataBR(h.dataHora, true),
  quem: h.usuario || "—",
  acao: `Alterou para ${LABELS[status(h.estadoNovo)] || "—"}`,
  registro: [h.aluno, h.disciplina].filter(Boolean).join(" · ") || "—",
  de: LABELS[status(h.estadoAnterior)] || "—",
  para: LABELS[status(h.estadoNovo)] || "—",
});

/* ---------- hidratação ---------- */

export async function hidratar(sessao) {
  const perfil = sessao?.perfil;

  if (perfil === "administrador") {
    const [alunos, turmas, areas, disciplinas, professores, responsaveis, vinculos, bimestres, rels, auditoria, tags] =
      await Promise.all([
        api("/admin/alunos"),
        api("/admin/turmas"),
        api("/admin/areas"),
        api("/admin/disciplinas"),
        api("/admin/professores"),
        api("/admin/responsaveis"),
        api("/admin/vinculos"),
        api("/admin/bimestres"),
        api("/acompanhamentos"),
        api("/admin/auditoria"),
        api("/tags").catch(() => []),
      ]);

    const vinculosMap = vinculos.filter((v) => v.ativo !== false).map(mapVinculo);
    const professoresMap = professores.map(mapProfessor);
    const responsaveisMap = responsaveis.map(mapResponsavel);

    professoresMap.forEach((professor) => {
      // O mesmo professor leciona a mesma disciplina em várias turmas;
      // sem deduplicar, as listas renderizam chaves repetidas no React.
      professor.disc = [
        ...new Set(
          vinculosMap
            .filter((vinculo) => vinculo.prof === professor.id)
            .map((vinculo) => vinculo.disc),
        ),
      ];
    });

    // A listagem de responsáveis não traz os alunos; busca os vínculos reais
    // para preencher a tabela e o formulário de edição.
    await Promise.all(
      responsaveisMap.map(async (responsavel) => {
        try {
          const vinculosDoResponsavel = await api(
            `/admin/responsaveis/${responsavel.id}/alunos`,
          );
          const autorizados = vinculosDoResponsavel.filter((item) => item.autorizado);
          const parentesco = autorizados
            .map((item) => item.tipoRelacao)
            .find((valor) => Boolean(valor));

          responsavel.alunos = vinculosDoResponsavel.map((item) => sid(item.id));
          responsavel.parentesco = parentesco || "";
          responsavel.consentimento = autorizados.length ? "pela escola" : "—";
        } catch {
          /* mantém os valores padrão */
        }
      }),
    );

    preencher(dados.alunos, alunos.map(mapAluno));
    preencher(dados.turmas, turmas.map(mapTurma));
    preencher(dados.tags, tags.map(mapTag));
    preencher(dados.areas, areas.map(mapArea));
    preencher(dados.disciplinas, disciplinas.map(mapDisciplina));
    preencher(dados.professores, professoresMap);
    preencher(dados.responsaveis, responsaveisMap);
    preencher(dados.vinculos, vinculosMap);
    preencher(dados.bimestres, bimestres.map(mapBimestre));
    preencher(dados.relatorios, rels.map(mapRel));
    preencher(dados.auditoria, auditoria.map(mapAuditoria));
    return;
  }

  const pedidos = [
    api("/alunos"),
    api("/acompanhamentos"),
    api("/bimestres"),
    api("/areas").catch(() => []),
    api("/disciplinas").catch(() => []),
    api("/tags").catch(() => []),
  ];
  if (perfil === "professor") pedidos.push(api("/professores/me/vinculos"));

  const [alunos, rels, bimestres, areas, disciplinas, tags, vinculos = []] =
    await Promise.all(pedidos);

  const turmaPorAluno = new Map();
  rels.forEach((rel) => {
    if (rel.aluno?.id != null && rel.turma?.id != null) {
      turmaPorAluno.set(sid(rel.aluno.id), sid(rel.turma.id));
    }
  });

  const alunosMap = alunos.map((aluno, i) => ({
    ...mapAluno(aluno, i),
    turma:
      sid(aluno.idTurma ?? "") ||
      turmaPorAluno.get(sid(aluno.id)) ||
      "",
  }));

  const turmasMap = unicos(
    [...rels.map((rel) => rel.turma), ...vinculos.map((v) => v.turma)]
      .filter(Boolean)
      .map(mapTurma),
  );

  const disciplinasCatalogo = unicos(disciplinas.map(mapDisciplina));
  const disciplinasDerivadas = unicos(
    [...rels.map((rel) => rel.disciplina), ...vinculos.map((v) => v.disciplina)]
      .filter(Boolean)
      .map(mapDisciplina),
  );
  const disciplinasMap = disciplinasCatalogo.length
    ? disciplinasCatalogo
    : disciplinasDerivadas;

  const professoresMap = unicos(
    [...vinculos.map((v) => v.professor), ...rels.map((rel) => rel.professor)].filter(Boolean),
  ).map((professor, i) => {
    const mapeado = mapProfessor(professor, i);
    if (!professor.nome && mapeado.id === sid(sessao?.profId)) mapeado.nome = sessao.nome;
    return mapeado;
  });

  professoresMap.forEach((professor) => {
    professor.disc = unicos(
      vinculos
        .filter((vinculo) => sid(vinculo.professor?.id) === professor.id)
        .map((vinculo) => ({ id: sid(vinculo.disciplina?.id) })),
    ).map((disciplina) => disciplina.id);
  });

  const meuResponsavel = sessao?.respId
    ? [
        {
          id: sid(sessao.respId),
          nome: sessao.nome || "",
          email: sessao.email || "",
          tel: "",
          alunos: alunos.map((aluno) => sid(aluno.id)),
          parentesco: "",
          consentimento: "",
          ativo: true,
          cor: cor(0),
        },
      ]
    : [];

  const vinculosMap =
    perfil === "professor"
      ? vinculos.filter((vinculo) => vinculo.ativo !== false).map(mapVinculoProfessor)
      : [];

  preencher(dados.alunos, alunosMap);
  preencher(dados.turmas, turmasMap);
  preencher(dados.tags, tags.map(mapTag));
  preencher(dados.areas, areas.map(mapArea));
  preencher(dados.disciplinas, disciplinasMap);
  preencher(dados.professores, professoresMap);
  preencher(dados.responsaveis, meuResponsavel);
  preencher(dados.vinculos, vinculosMap);
  preencher(dados.bimestres, bimestres.map(mapBimestre));
  preencher(dados.relatorios, rels.map(mapRel));
  preencher(dados.auditoria, []);
}
