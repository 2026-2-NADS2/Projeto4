import { useEffect } from "react";

// Reproduz o K.revelar do protótipo: as seções ganham "visivel" ao entrar na tela.
export function useRevelar() {
  useEffect(() => {
    const elementos = Array.from(document.querySelectorAll("[data-revelar]"));
    if (!elementos.length) return undefined;

    if (!("IntersectionObserver" in window)) {
      elementos.forEach((elemento) => elemento.classList.add("visivel"));
      return undefined;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add("visivel");
          observador.unobserve(entrada.target);
        });
      },
      { threshold: 0.15 },
    );

    elementos.forEach((elemento) => observador.observe(elemento));
    return () => observador.disconnect();
  }, []);
}
