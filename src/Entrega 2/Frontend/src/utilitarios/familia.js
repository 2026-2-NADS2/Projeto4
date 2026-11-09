import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAutenticacao } from "../contextos/AutenticacaoContexto.jsx";
import { api, dados } from "../dados/dados.js";
import { fmtMedia } from "./formatadores.js";

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

export function nomeArquivoPdf(registro) {
  return `relatorio-${slug(api.aluno(registro.aluno).nome)}-${slug(api.disc(registro.disc).nome)}-${registro.bim}bim.pdf`;
}

// Conteúdo do PDF do relatório individual, pronto para gerarPdf().
export function documentoDoRegistro(registro, responsavel) {
  const aluno = api.aluno(registro.aluno);
  const turma = api.turma(registro.turma);
  const disciplina = api.disc(registro.disc);
  const professor = api.prof(registro.prof);
  const area = api.area(disciplina?.area);
  const destaques = registro.tags
    .map((idTag) => dados.tags.find((tag) => tag.id === idTag)?.nome)
    .filter(Boolean)
    .join(" · ");
  const historico = (responsavel
    ? api.relsDaFamilia(responsavel.id, registro.aluno)
    : dados.relatorios.filter((item) => item.aluno === registro.aluno)
  )
    .filter((item) => item.disc === registro.disc)
    .sort((a, b) => a.bim - b.bim);
  const publicadoEm =
    (registro.historico?.find((item) => item.para === "publicado") || {}).quando || "";

  const secoes = [
    {
      titulo: "Destaques",
      paragrafos: [destaques || "Nenhum destaque informado."],
    },
    {
      titulo: "Observações do professor",
      paragrafos: [registro.desc || "Sem observações."],
    },
    {
      titulo: "Evolução na disciplina",
      itens: historico.map((item) => [
        `${item.bim}º bimestre de ${item.ano}`,
        item.media == null ? "a publicar" : `${fmtMedia(item.media)} (escala 0–10)`,
      ]),
    },
  ];

  if (registro.observacao?.texto) {
    secoes.push({
      titulo: "Observação do responsável",
      paragrafos: [registro.observacao.texto],
    });
  }

  return {
    nomeArquivo: nomeArquivoPdf(registro),
    documento: {
      escola: dados.escola.nome,
      titulo: "Relatório de acompanhamento",
      subtitulo: `${registro.bim}º bimestre de ${registro.ano}${
        publicadoEm ? ` · publicado em ${publicadoEm}` : ""
      }`,
      cabecalho: [
        ["Aluno", aluno.nome],
        ["RA", aluno.ra || "—"],
        ["Turma", turma ? `${turma.nome}${turma.turno ? ` · ${turma.turno}` : ""}` : "—"],
        ["Disciplina", disciplina?.nome || "—"],
        ["Área", area?.nome || "—"],
        ["Professor", professor?.nome || "—"],
        ["Média", `${fmtMedia(registro.media)} (escala 0–10)`],
      ],
      secoes,
      rodape: `Ciência do responsável: ${registro.lido ? "registrada" : "pendente"}`,
    },
  };
}

// Resumo do desempenho do aluno no bimestre, para o PDF do painel da família.
export function documentoDesempenho(responsavel, aluno, bim) {
  const registros = api.relsDaFamilia(responsavel.id, aluno.id);
  const doBim = registros.filter((registro) => registro.bim === bim);
  const media = mediaDe(doBim);
  const anterior = mediaDe(registros.filter((registro) => registro.bim === bim - 1));
  const turma = api.turma(aluno.turma);
  const variacao =
    media != null && anterior != null
      ? `${fmtMedia(Math.abs(media - anterior))} ${
          media >= anterior ? "acima" : "abaixo"
        } do bimestre anterior`
      : "—";

  return {
    nomeArquivo: `desempenho-${slug(aluno.nome)}-${bim}bim.pdf`,
    documento: {
      escola: dados.escola.nome,
      titulo: "Resumo de desempenho do aluno",
      subtitulo: `${bim}º bimestre de ${dados.escola.ano}`,
      cabecalho: [
        ["Aluno", aluno.nome],
        ["RA", aluno.ra || "—"],
        ["Turma", turma ? `${turma.nome}${turma.turno ? ` · ${turma.turno}` : ""}` : "—"],
        ["Responsável", responsavel.nome || "—"],
        ["Média geral no bimestre", media == null ? "—" : `${fmtMedia(media)} (escala 0–10)`],
        ["Variação", variacao],
        ["Relatórios publicados", `${doBim.length} de ${dados.disciplinas.length} disciplinas`],
        [
          "Relatórios ainda não lidos",
          String(doBim.filter((registro) => !registro.lido).length),
        ],
      ],
      secoes: [
        {
          titulo: `Desempenho por disciplina no ${bim}º bimestre`,
          itens: doBim.length
            ? doBim.map((registro) => {
                const disciplina = api.disc(registro.disc);
                const professor = api.prof(registro.prof);
                return [
                  disciplina?.nome || "Disciplina",
                  `${fmtMedia(registro.media)} · Prof. ${professor?.nome || "—"} · ${
                    registro.lido ? "ciência registrada" : "leitura pendente"
                  }`,
                ];
              })
            : [["Sem relatórios", "Nenhum relatório publicado neste bimestre."]],
        },
        {
          titulo: "Evolução da média geral",
          itens: dados.bimestres.map((bimestre) => {
            const valor = mediaDe(
              registros.filter((registro) => registro.bim === bimestre.n),
            );
            return [
              `${bimestre.n}º bimestre`,
              valor == null ? "a publicar" : `${fmtMedia(valor)} (média geral)`,
            ];
          }),
        },
      ],
      rodape: `Documento gerado a pedido de ${responsavel.nome || "responsável"}.`,
    },
  };
}
