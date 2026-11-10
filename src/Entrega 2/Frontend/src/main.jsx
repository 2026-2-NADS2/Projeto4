import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AutenticacaoProvider } from "./contextos/AutenticacaoContexto.jsx";
import { AvisoProvider } from "./contextos/AvisoContexto.jsx";
import { TemaProvider } from "./contextos/TemaContexto.jsx";
import "./estilos/tokens.css";
import "./estilos/base.css";
import "./estilos/layout.css";
import "./estilos/components.css";
import "./estilos/pages.css";

// Depois de um novo deploy, uma aba que já estava aberta continua pedindo os
// chunks do build anterior, que não existem mais. O servidor devolve o
// index.html no lugar do .js e o import() falha. O Vite avisa por este evento;
// recarregar troca o documento pelo index.html atual e recupera a aba sozinho.
// A marca em sessionStorage evita laço se o recarregamento também falhar.
window.addEventListener("vite:preloadError", (evento) => {
  evento.preventDefault();

  const CHAVE = "kfka-chunk-recarregado-em";
  const agora = Date.now();
  try {
    const ultima = Number(sessionStorage.getItem(CHAVE) || 0);
    if (agora - ultima < 10000) return;
    sessionStorage.setItem(CHAVE, String(agora));
  } catch {
    /* sem armazenamento: segue com a recarga guiada pelo limite de erro */
  }

  window.location.reload();
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <TemaProvider>
        <AvisoProvider>
          <AutenticacaoProvider>
            <App />
          </AutenticacaoProvider>
        </AvisoProvider>
      </TemaProvider>
    </BrowserRouter>
  </StrictMode>,
);
