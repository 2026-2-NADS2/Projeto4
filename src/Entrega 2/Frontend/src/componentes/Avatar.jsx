import { iniciais } from "../utilitarios/formatadores.js";

export default function Avatar({ nome, cor = "var(--sky)", tamanho = "" }) {
  return (
    <span
      className={`avatar ${tamanho}`.trim()}
      style={{ background: cor }}
      aria-hidden="true"
    >
      {iniciais(nome)}
    </span>
  );
}
