import { dados } from "../dados/dados.js";

export function Etiqueta({ id }) {
  const etiqueta = dados.tags.find((item) => item.id === id);
  if (!etiqueta) return null;

  return (
    <span className={`tag ${etiqueta.tom}`.trim()} title={etiqueta.nome}>
      {etiqueta.nome}
    </span>
  );
}

export default function Etiquetas({ ids = [] }) {
  return (
    <span className="tag-group">
      {ids.map((id) => (
        <Etiqueta key={id} id={id} />
      ))}
    </span>
  );
}
