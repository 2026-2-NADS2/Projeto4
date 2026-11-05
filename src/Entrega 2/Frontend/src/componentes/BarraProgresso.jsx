import { STATUS } from "../dados/status.js";
import { CORES_STATUS } from "../utilitarios/professor.js";

// Barra empilhada do andamento da turma, com descrição em texto para leitores de tela.
export default function BarraProgresso({ progresso }) {
  const { total, st } = progresso;
  return (
    <div
      className="stacked"
      role="img"
      aria-label={Object.entries(st)
        .filter(([, quantidade]) => quantidade)
        .map(([status, quantidade]) => `${STATUS[status].label}: ${quantidade}`)
        .join(", ")}
    >
      {Object.entries(st).map(([status, quantidade]) =>
        quantidade ? (
          <span
            key={status}
            style={{
              width: `${(quantidade / (total || 1)) * 100}%`,
              background: CORES_STATUS[status],
            }}
          />
        ) : null,
      )}
    </div>
  );
}
