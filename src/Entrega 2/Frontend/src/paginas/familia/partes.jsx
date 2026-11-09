import { Link } from "react-router-dom";
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
            {primeiroNome(item.nome)} · {turma ? turma.nome : "Sem turma"}
          </Link>
        );
      })}
    </div>
  );
}
