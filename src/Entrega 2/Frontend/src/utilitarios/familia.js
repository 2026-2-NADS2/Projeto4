import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAutenticacao } from "../contextos/AutenticacaoContexto.jsx";
import { api } from "../dados/dados.js";

const CHAVE = "kfka-aluno-familia";

function lerAlunoSalvo() {
  try {
    return sessionStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

export function salvarAluno(id) {
  try {
    sessionStorage.setItem(CHAVE, id);
  } catch {
    /* armazenamento indisponível */
  }
}

/**
 * Responsável logado e aluno atual. Um `?aluno=` inválido bloqueia o acesso;
 * sem query, usa o último aluno visto na sessão ou o primeiro vinculado.
 */
export function useFamilia() {
  const { usuario } = useAutenticacao();
  const [params] = useSearchParams();
  const responsavel = api.resp(usuario?.respId || "r1");
  const alunos = responsavel?.alunos || [];
  const pedido = params.get("aluno");
  const salvo = lerAlunoSalvo();
  const id = pedido || (salvo && alunos.includes(salvo) ? salvo : alunos[0]);
  const aluno = id && alunos.includes(id) ? api.aluno(id) : null;

  useEffect(() => {
    if (aluno) salvarAluno(aluno.id);
  }, [aluno]);

  return { responsavel, aluno, params };
}

// Tom da média para a cor do número: ok (8 ou mais), mid (6 a 7,9), baixo (abaixo de 6).
export function tomMedia(media) {
  if (media >= 8) return "ok";
  if (media >= 6) return "mid";
  return "low";
}

export function mediaDe(registros) {
  return registros.length
    ? registros.reduce((soma, registro) => soma + registro.media, 0) / registros.length
    : null;
}

function slug(texto) {
  return texto
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

// Nome do arquivo exibido na simulação de download.
export function nomeArquivoPdf(registro) {
  return `relatorio-${slug(api.aluno(registro.aluno).nome)}-${slug(api.disc(registro.disc).nome)}-${registro.bim}bim.pdf`;
}
