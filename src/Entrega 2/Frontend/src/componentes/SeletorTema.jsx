import { useTema, TEMAS } from "../contextos/TemaContexto.jsx";
import Icone from "./Icone.jsx";

export default function SeletorTema({ id = "tema" }) {
  const { tema, definirTema } = useTema();

  return (
    <div className="segmented tema-seg" role="group" aria-labelledby={`${id}-l`}>
      {TEMAS.map(([valor, rotulo, icone]) => (
        <button
          key={valor}
          type="button"
          data-tema={valor}
          aria-pressed={tema === valor}
          onClick={() => definirTema(valor)}
        >
          <Icone nome={icone} className="icon-sm" />
          {rotulo}
        </button>
      ))}
    </div>
  );
}

// Botão único usado nas páginas públicas: alterna entre claro e escuro.
export function BotaoTema() {
  const { escuroAtivo, alternarTema } = useTema();

  return (
    <button
      type="button"
      className="icon-btn tema-toggle"
      aria-label={escuroAtivo ? "Usar tema claro" : "Usar tema escuro"}
      onClick={alternarTema}
    >
      <Icone nome={escuroAtivo ? "sun" : "moon"} />
    </button>
  );
}
