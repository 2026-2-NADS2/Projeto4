import { Link, Navigate, useParams } from "react-router-dom";
import Icone from "../../componentes/Icone.jsx";
import Marca from "../../componentes/Marca.jsx";
import { useAutenticacao } from "../../contextos/AutenticacaoContexto.jsx";
import { useAviso } from "../../contextos/AvisoContexto.jsx";
import { api, dados } from "../../dados/dados.js";
import { baixarArquivo, gerarPdf } from "../../utilitarios/arquivos.js";
import { fmtMedia } from "../../utilitarios/formatadores.js";
import { documentoDoRegistro } from "../../utilitarios/familia.js";
import { useTitulo } from "../../utilitarios/useTitulo.js";

export default function Imprimir() {
  const { id } = useParams();
  const { usuario } = useAutenticacao();
  const { avisar } = useAviso();
  const registro = api.rel(id);
  const responsavel = api.resp(usuario?.respId || "r1");
  const vinculado = Boolean(registro && responsavel?.alunos.includes(registro.aluno));
  const permitido = Boolean(vinculado && registro.status === "publicado");

  useTitulo("Imprimir relatório");

  if (!permitido) return <Navigate to="/acesso-negado" replace />;

  const aluno = api.aluno(registro.aluno);
  const turma = api.turma(registro.turma);
  const disciplina = api.disc(registro.disc);
  const professor = api.prof(registro.prof);
  const destaques = registro.tags
    .map((tagId) => dados.tags.find((tag) => tag.id === tagId)?.nome)
    .filter(Boolean)
    .join(" · ");

  function baixarPdf() {
    try {
      const { nomeArquivo, documento } = documentoDoRegistro(registro, responsavel);
      baixarArquivo(nomeArquivo, gerarPdf(documento));
      avisar("PDF gerado", `${nomeArquivo} foi baixado.`, "ok");
    } catch (erro) {
      avisar("Não foi possível gerar o PDF", erro?.message || "Tente novamente.", "err");
    }
  }

  return (
    <>
      <div className="print-toolbar no-print">
        <Link
          className="btn btn-secondary"
          to={`/familia/relatorios/${registro.id}?aluno=${aluno.id}`}
        >
          <Icone nome="chevron-left" /> Voltar
        </Link>
        <span className="grow" />
        <span className="muted hide-mobile" style={{ fontSize: "0.8125rem" }}>
          Use “Salvar como PDF” na janela de impressão do navegador.
        </span>
        <button type="button" className="btn btn-secondary" onClick={baixarPdf}>
          <Icone nome="download" /> Baixar PDF
        </button>
        <button type="button" className="btn btn-primary" onClick={() => window.print()}>
          <Icone nome="printer" /> Imprimir
        </button>
      </div>

      <main className="print-page" id="conteudo">
        <header className="pp-head">
          <div className="logo">
            <Marca />
            <span>
              <span className="word">KFKA</span>
              <small>{dados.escola.nome}</small>
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <b>Relatório de acompanhamento</b>
            <div className="muted">
              {registro.bim}º bimestre · {registro.ano}
            </div>
          </div>
        </header>

        <h1 id="page-title" tabIndex={-1} className="sr-only">
          Relatório para impressão
        </h1>

        <table className="pp-info">
          <tbody>
            <tr>
              <th>Aluno</th>
              <td>{aluno.nome}</td>
              <th>RA</th>
              <td>{aluno.ra}</td>
            </tr>
            <tr>
              <th>Turma</th>
              <td>
                {turma.nome} · {turma.turno}
              </td>
              <th>Disciplina</th>
              <td>{disciplina.nome}</td>
            </tr>
            <tr>
              <th>Professor</th>
              <td>{professor.nome}</td>
              <th>Média</th>
              <td>
                <b>{fmtMedia(registro.media)}</b> (escala 0–10)
              </td>
            </tr>
          </tbody>
        </table>

        <h2>Destaques</h2>
        <p>{destaques || "—"}</p>

        <h2>Observações do professor</h2>
        <p className="pp-desc">{registro.desc}</p>

        <footer className="pp-foot">
          <span>Documento demonstrativo · dados fictícios · gerado localmente pelo navegador</span>
          <span>Ciência do responsável: {registro.lido ? "registrada" : "pendente"}</span>
        </footer>
      </main>
    </>
  );
}
