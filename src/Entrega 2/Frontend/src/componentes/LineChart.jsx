import { fmtMedia } from "../utilitarios/formatadores.js";

/**
 * Gráfico de linha para séries no tempo. A linha é um SVG esticado (viewBox 0–100);
 * pontos e rótulos são HTML posicionados em %, então não distorcem em nenhuma largura.
 */
export default function LineChart({ points, label, height = 180 }) {
  const valores = points.map((ponto) => ponto.value).filter((valor) => valor != null);
  const minimo = valores.length
    ? Math.max(0, Math.min(6, Math.floor(Math.min(...valores)) - 1))
    : 0;
  const maximo = 10;
  const total = points.length;
  const eixoX = (indice) => ((indice + 0.5) / total) * 100;
  const eixoY = (valor) => 100 - ((valor - minimo) / (maximo - minimo)) * 100;

  // Trechos contínuos: um bimestre sem dado interrompe a linha.
  const segmentos = [];
  let atual = [];
  points.forEach((ponto, indice) => {
    if (ponto.value == null) {
      if (atual.length) segmentos.push(atual);
      atual = [];
    } else {
      atual.push([eixoX(indice), eixoY(ponto.value)]);
    }
  });
  if (atual.length) segmentos.push(atual);

  const linha = segmentos
    .map((segmento) => `M${segmento.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(" L")}`)
    .join(" ");

  const area = segmentos
    .filter((segmento) => segmento.length > 1)
    .map(
      (segmento) =>
        `M${segmento[0][0].toFixed(2)} 100 L${segmento
          .map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`)
          .join(" L")} L${segmento[segmento.length - 1][0].toFixed(2)} 100 Z`,
    )
    .join(" ");

  const marcas = [maximo, (minimo + maximo) / 2, minimo];

  return (
    <figure className="lchart" role="img" aria-label={label}>
      <div className="lchart-body">
        <div className="lchart-y" aria-hidden="true">
          {marcas.map((marca) => (
            <span key={marca}>{fmtMedia(marca)}</span>
          ))}
        </div>
        <div className="lchart-plot" style={{ height }} aria-hidden="true">
          {marcas.map((marca) => (
            <i key={marca} className="lchart-grid" style={{ top: `${eixoY(marca)}%` }} />
          ))}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
            <path className="lchart-area" d={area} />
            <path className="lchart-line" d={linha} vectorEffect="non-scaling-stroke" />
          </svg>
          {points.map((ponto, indice) =>
            ponto.value == null ? null : (
              <span
                key={ponto.label}
                className={`lchart-pt${ponto.current ? " is-current" : ""}`}
                style={{ left: `${eixoX(indice)}%`, top: `${eixoY(ponto.value)}%` }}
              >
                <b>{fmtMedia(ponto.value)}</b>
              </span>
            ),
          )}
        </div>
        <div
          className="lchart-x"
          aria-hidden="true"
          style={{ gridTemplateColumns: `repeat(${total},minmax(0,1fr))` }}
        >
          {points.map((ponto) => (
            <span
              key={ponto.label}
              className={`${ponto.current ? "is-current" : ""}${ponto.value == null ? " is-empty" : ""}`}
            >
              {ponto.label}
              {ponto.value == null && <small>a publicar</small>}
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}
