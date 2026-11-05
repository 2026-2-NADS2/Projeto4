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
