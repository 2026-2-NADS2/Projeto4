import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CHAVE = "kfka-prefs";
const PADRAO = {
  tema: "sistema",
  texto: "100",
  espaco: false,
  links: false,
  menosMovimento: false,
};

export const TAMANHOS = [
  ["100", "Padrão"],
  ["112.5", "Médio"],
  ["125", "Grande"],
  ["150", "Muito grande"],
];

export const TEMAS = [
  ["sistema", "Sistema", "monitor"],
  ["claro", "Claro", "sun"],
  ["escuro", "Escuro", "moon"],
];

const TemaContexto = createContext(null);

function lerPreferencias() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) || "{}");
    return { ...PADRAO, ...salvo };
  } catch {
    return { ...PADRAO };
  }
}

export function TemaProvider({ children }) {
  const [prefs, setPrefs] = useState(lerPreferencias);
  const [sistemaEscuro, setSistemaEscuro] = useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false,
  );

  // Acompanha o tema do sistema quando a escolha é "Sistema".
  useEffect(() => {
    const consulta = window.matchMedia("(prefers-color-scheme: dark)");
    const aoMudar = (evento) => setSistemaEscuro(evento.matches);
    consulta.addEventListener?.("change", aoMudar);
    return () => consulta.removeEventListener?.("change", aoMudar);
  }, []);

  const escuroAtivo =
    prefs.tema === "escuro" || (prefs.tema === "sistema" && sistemaEscuro);

  // Aplica as preferências no <html>; como o CSS usa rem, o texto cresce junto com o layout.
  useEffect(() => {
    const raiz = document.documentElement;
    raiz.style.fontSize = prefs.texto === "100" ? "" : `${prefs.texto}%`;
    raiz.classList.toggle("texto-espacado", Boolean(prefs.espaco));
    raiz.classList.toggle("links-sublinhados", Boolean(prefs.links));
    raiz.classList.toggle("menos-movimento", Boolean(prefs.menosMovimento));

    if (prefs.tema === "sistema") {
      delete raiz.dataset.theme;
    } else {
      raiz.dataset.theme = prefs.tema === "escuro" ? "dark" : "light";
    }
    raiz.style.colorScheme = escuroAtivo ? "dark" : "light";

    // Largura útil = tela ÷ escala do texto. Com texto grande, o menu vira gaveta.
    const escala = Number(prefs.texto) / 100;
    raiz.classList.toggle(
      "gaveta-forcada",
      escala > 1 && window.innerWidth >= 1024 && window.innerWidth / escala < 1024,
    );

    let quadro = 0;
    function aoRedimensionar() {
      window.cancelAnimationFrame(quadro);
      quadro = window.requestAnimationFrame(() => {
        raiz.classList.toggle(
          "gaveta-forcada",
          escala > 1 && window.innerWidth >= 1024 && window.innerWidth / escala < 1024,
        );
      });
    }
    window.addEventListener("resize", aoRedimensionar, { passive: true });
    return () => {
      window.cancelAnimationFrame(quadro);
      window.removeEventListener("resize", aoRedimensionar);
    };
  }, [prefs, escuroAtivo]);

  const salvarPreferencias = useCallback((mudanca) => {
    setPrefs((atuais) => {
      const novas = { ...atuais, ...mudanca };
      try {
        localStorage.setItem(CHAVE, JSON.stringify(novas));
      } catch {
        /* vale só na memória */
      }
      return novas;
    });
  }, []);

  const definirTema = useCallback(
    (tema) => salvarPreferencias({ tema }),
    [salvarPreferencias],
  );

  const alternarTema = useCallback(() => {
    definirTema(escuroAtivo ? "claro" : "escuro");
  }, [definirTema, escuroAtivo]);

  const restaurarPreferencias = useCallback(() => {
    setPrefs({ ...PADRAO });
    try {
      localStorage.setItem(CHAVE, JSON.stringify(PADRAO));
    } catch {
      /* vale só na memória */
    }
  }, []);

  const valor = useMemo(
    () => ({
      prefs,
      tema: prefs.tema,
      escuroAtivo,
      salvarPreferencias,
      definirTema,
      alternarTema,
      restaurarPreferencias,
    }),
    [prefs, escuroAtivo, salvarPreferencias, definirTema, alternarTema, restaurarPreferencias],
  );

  return <TemaContexto.Provider value={valor}>{children}</TemaContexto.Provider>;
}

export function useTema() {
  const contexto = useContext(TemaContexto);
  if (!contexto) throw new Error("useTema precisa estar dentro de TemaProvider.");
  return contexto;
}
