import { useEffect } from "react";

// Mantém o título da aba alinhado à tela atual.
export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo
      ? `${titulo} · KFKA — Acompanhamento Escolar`
      : "KFKA — Acompanhamento Escolar";
  }, [titulo]);
}
