import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Icone from "../componentes/Icone.jsx";

const TIPOS = {
  ok: { cor: "var(--success)", icone: "check" },
  err: { cor: "var(--danger)", icone: "alert" },
  info: { cor: "var(--blue)", icone: "info" },
  warn: { cor: "var(--warning)", icone: "alert" },
};

const AvisoContexto = createContext(null);
let sequencia = 0;

function Toast({ aviso, aoFechar }) {
  const [saindo, setSaindo] = useState(false);
  const restante = useRef(5200);
  const inicio = useRef(Date.now());
  const timer = useRef(null);

  useEffect(() => {
    const encerrar = () => {
      setSaindo(true);
      window.setTimeout(() => aoFechar(aviso.id), 220);
    };

    timer.current = window.setTimeout(encerrar, restante.current);
    return () => window.clearTimeout(timer.current);
  }, [aviso.id, aoFechar]);

  const pausar = () => {
    window.clearTimeout(timer.current);
    restante.current -= Date.now() - inicio.current;
  };

  const retomar = () => {
    inicio.current = Date.now();
    window.clearTimeout(timer.current);
    const encerrar = () => {
      setSaindo(true);
      window.setTimeout(() => aoFechar(aviso.id), 220);
    };
    timer.current = window.setTimeout(encerrar, Math.max(restante.current, 1200));
  };

  const fechar = () => {
    setSaindo(true);
    window.setTimeout(() => aoFechar(aviso.id), 220);
  };

  const tipo = TIPOS[aviso.tipo] || TIPOS.ok;

  return (
    <div
      className={`toast${saindo ? " leaving" : ""}`}
      onMouseEnter={pausar}
      onMouseLeave={retomar}
    >
      <span className="ico" style={{ background: tipo.cor }}>
        <Icone nome={tipo.icone} className="icon-sm" />
      </span>
      <div>
        <b>{aviso.titulo}</b>
        {aviso.texto && <small>{aviso.texto}</small>}
      </div>
      <button type="button" aria-label="Fechar aviso" onClick={fechar}>
        <Icone nome="x" className="icon-sm" />
      </button>
    </div>
  );
}

export function AvisoProvider({ children }) {
  const [avisos, setAvisos] = useState([]);

  const remover = useCallback((id) => {
    setAvisos((atuais) => atuais.filter((aviso) => aviso.id !== id));
  }, []);

  const avisar = useCallback((titulo, texto = "", tipo = "ok") => {
    const id = ++sequencia;
    setAvisos((atuais) => [...atuais, { id, titulo, texto, tipo }]);
    return id;
  }, []);

  const valor = useMemo(() => ({ avisar }), [avisar]);

  return (
    <AvisoContexto.Provider value={valor}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {avisos.map((aviso) => (
          <Toast key={aviso.id} aviso={aviso} aoFechar={remover} />
        ))}
      </div>
    </AvisoContexto.Provider>
  );
}

export function useAviso() {
  const contexto = useContext(AvisoContexto);
  if (!contexto) throw new Error("useAviso precisa estar dentro de AvisoProvider.");
  return contexto;
}
