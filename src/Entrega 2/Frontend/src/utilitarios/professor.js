import { api, dados } from "../dados/dados.js";

// Bimestre com digitação aberta no protótipo (usado como fallback).
export const BIM_ATUAL = 3;

// Bimestre aberto conforme os períodos carregados do servidor.
export function bimestreAtual() {
  const aberto = dados.bimestres.find((bimestre) => bimestre.status === "aberto");
  return aberto?.n ?? BIM_ATUAL;
}

export const editavel = (status) => status === "rascunho" || status === "devolvido";

export const CORES_STATUS = {
  publicado: "var(--success)",
  revisao: "var(--sun)",
  enviado: "var(--teal)",
  rascunho: "var(--st-rascunho)",
  devolvido: "var(--danger)",
  pendente: "var(--line-strong)",
};

// Registro do aluno naquela disciplina e bimestre (o atual, se não for informado).
export function registroDe(alunoId, disc, bim = BIM_ATUAL) {
  return api.registro(alunoId, disc, bim);
}

// Quantos alunos da turma já têm registro em cada status, para a barra de andamento.
export function progressoDaTurma(turma, disc) {
  const alunos = api.alunosDaTurma(turma).filter((aluno) => aluno.ativo);
  const st = {
    publicado: 0,
    revisao: 0,
    enviado: 0,
    rascunho: 0,
    devolvido: 0,
    pendente: 0,
  };
  alunos.forEach((aluno) => {
    const registro = registroDe(aluno.id, disc);
    st[registro ? registro.status : "pendente"] += 1;
  });
  return { total: alunos.length, st };
}
