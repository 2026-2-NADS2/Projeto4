import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Icone from "./Icone.jsx";

/**
 * Modal acessível: foco preso no diálogo, Esc e clique no fundo fecham,
 * e o foco volta para quem abriu ao terminar.
 */
export default function Modal({
  aberto,
  aoFechar,
  titulo,
  texto,
  icone = "info",
  tom = "ico-teal",
  tamanho = "",
  children,
  rodape,
}) {
  const caixaRef = useRef(null);
  const focoAnterior = useRef(null);

  useEffect(() => {
    if (!aberto) return undefined;

    focoAnterior.current = document.activeElement;
    document.body.style.overflow = "hidden";

    const caixa = caixaRef.current;
    const primeiro = caixa?.querySelector(
      "[autofocus], input, textarea, select, button:not(.close), a[href]",
    );
    (primeiro || caixa)?.focus();

    function aoTeclar(evento) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        aoFechar?.();
        return;
      }

      if (evento.key !== "Tab" || !caixa) return;

      const focaveis = Array.from(
        caixa.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((elemento) => elemento.offsetParent !== null);

      if (!focaveis.length) return;

      const primeiroFocavel = focaveis[0];
      const ultimoFocavel = focaveis[focaveis.length - 1];

      if (evento.shiftKey && document.activeElement === primeiroFocavel) {
        evento.preventDefault();
        ultimoFocavel.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimoFocavel) {
        evento.preventDefault();
        primeiroFocavel.focus();
      }
    }

    document.addEventListener("keydown", aoTeclar);

    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
      focoAnterior.current?.focus?.();
    };
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  return createPortal(
    <div
      className="overlay"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar?.();
      }}
    >
      <div
        className={`modal ${tamanho}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        ref={caixaRef}
      >
        <div className="modal-head">
          <span className={`ico ${tom}`.trim()}>
            <Icone nome={icone} />
          </span>
          <div>
            <h2 id="modal-title">{titulo}</h2>
            {texto && <p>{texto}</p>}
          </div>
          <button type="button" className="icon-btn close" aria-label="Fechar" onClick={aoFechar}>
            <Icone nome="x" />
          </button>
        </div>
        {children}
        {rodape && <div className="modal-foot">{rodape}</div>}
      </div>
    </div>,
    document.body,
  );
}
