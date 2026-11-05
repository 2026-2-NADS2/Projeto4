import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icone from "../../componentes/Icone.jsx";
import Modal from "../../componentes/Modal.jsx";
import { api } from "../../dados/dados.js";
import { primeiroNome } from "../../utilitarios/formatadores.js";

// Troca entre os filhos quando a família tem mais de um aluno vinculado.
export function SeletorAluno({ aluno, responsavel, base }) {
  if (!aluno || !responsavel || responsavel.alunos.length <= 1) return null;

  return (
    <div className="segmented" role="group" aria-label="Aluno">
      {responsavel.alunos.map((id) => {
        const item = api.aluno(id);
        const turma = api.turma(item.turma);
        return (
          <Link
            key={id}
            to={`${base}${base.includes("?") ? "&" : "?"}aluno=${id}`}
            aria-current={id === aluno.id ? "page" : undefined}
          >
            {primeiroNome(item.nome)} · {turma.nome}
          </Link>
        );
      })}
    </div>
  );
}

// Simulação de geração de PDF: barra de progresso local, sem baixar arquivo.
export function ModalPdf({ aberto, aoFechar, arquivo }) {
  const [progresso, setProgresso] = useState(0);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (!aberto) return undefined;
    setProgresso(0);
    setPronto(false);
    const animar = window.setTimeout(() => setProgresso(100), 30);
    const concluir = window.setTimeout(() => setPronto(true), 1200);
    return () => {
      window.clearTimeout(animar);
      window.clearTimeout(concluir);
    };
  }, [aberto]);

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Gerando o PDF do relatório"
      texto="Formato A4 · com cabeçalho da escola e ciência do responsável"
      icone="file"
      tom="ico-ok"
      rodape={
        <button type="button" className="btn btn-primary" onClick={aoFechar}>
          Fechar
        </button>
      }
    >
      <div className="stack-sm">
        <div className="progress">
          <span style={{ width: `${progresso}%`, transition: "width 1.1s ease" }} />
        </div>
        <small className="muted">
          {pronto ? `${arquivo} · pronto (simulação)` : "Montando o documento…"}
        </small>
      </div>
      <div className="alert neutral">
        <Icone nome="info" />
        <div>
          Protótipo: nenhum arquivo é baixado. Na versão funcional, o PDF será gerado pelo
          servidor.
        </div>
      </div>
    </Modal>
  );
}
