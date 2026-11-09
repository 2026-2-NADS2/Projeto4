import { useId, useLayoutEffect, useRef, useState } from "react";
import Icone from "./Icone.jsx";

/**
 * Campo padrão do design system, com rótulo associado, dica, erro e olho de senha.
 * Aceita texto, e-mail, senha, select, textarea e datas.
 */
export default function Campo({
  label,
  tipo = "text",
  valor = "",
  aoMudar,
  placeholder = "",
  obrigatorio = false,
  dica = "",
  icone = "",
  erro = "",
  opcoes = null,
  className = "",
  id: idExterno,
  name,
  autoComplete,
  autoFocus = false,
  min,
  max,
  minLength,
  maxLength,
  inputMode,
  disabled = false,
}) {
  const idGerado = useId();
  const id = idExterno || `campo-${idGerado.replace(/[:]/g, "")}`;
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const textareaRef = useRef(null);

  // Faz o textarea crescer junto com o texto (até o limite definido no CSS),
  // em vez de manter a altura fixa e esconder o conteúdo atrás da rolagem.
  useLayoutEffect(() => {
    const elemento = textareaRef.current;
    if (!elemento) return;

    function ajustar() {
      elemento.style.height = "auto";
      const bordas = elemento.offsetHeight - elemento.clientHeight;
      elemento.style.height = `${elemento.scrollHeight + bordas}px`;
    }

    ajustar();
    window.addEventListener("resize", ajustar);
    return () => window.removeEventListener("resize", ajustar);
  }, [valor]);

  const propsComuns = {
    id,
    name: name || id,
    value: valor,
    onChange: (evento) => aoMudar?.(evento.target.value, evento),
    disabled,
    required: obrigatorio,
    "aria-invalid": erro ? "true" : "false",
    "aria-describedby": dica ? `${id}-hint` : undefined,
    autoComplete,
    autoFocus,
  };

  let controle;

  if (opcoes) {
    controle = (
      <select {...propsComuns} className="select">
        {opcoes.map((opcao) => {
          const [v, rotulo] = Array.isArray(opcao) ? opcao : [opcao, opcao];
          return (
            <option key={String(v)} value={v}>
              {rotulo}
            </option>
          );
        })}
      </select>
    );
  } else if (tipo === "textarea") {
    controle = (
      <textarea
        {...propsComuns}
        ref={textareaRef}
        className="textarea"
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
      />
    );
  } else {
    const tipoEfetivo = tipo === "password" && senhaVisivel ? "text" : tipo;
    const campo = (
      <input
        {...propsComuns}
        type={tipoEfetivo}
        className={`input ${tipo === "password" ? "com-olho" : ""}`.trim()}
        placeholder={placeholder}
        min={min}
        max={max}
        minLength={minLength}
        maxLength={maxLength}
        inputMode={inputMode}
      />
    );

    if (tipo === "password") {
      controle = (
        <div className="input-icon sem-icone">
          {campo}
          <button
            type="button"
            className="ver-senha"
            aria-pressed={senhaVisivel}
            aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
            aria-controls={id}
            onClick={() => setSenhaVisivel((atual) => !atual)}
          >
            <Icone nome={senhaVisivel ? "eye-off" : "eye"} className="icon-sm" />
          </button>
        </div>
      );
    } else if (icone) {
      controle = (
        <div className="input-icon">
          <Icone nome={icone} />
          {campo}
        </div>
      );
    } else {
      controle = campo;
    }
  }

  return (
    <div className={`field ${erro ? "has-error" : ""} ${className}`.trim()}>
      <label htmlFor={id}>
        {label}
        {obrigatorio && (
          <span className="req" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {controle}
      {dica && (
        <span className="hint" id={`${id}-hint`}>
          {dica}
        </span>
      )}
      <span className="error-msg" role="alert">
        <Icone nome="alert" className="icon-sm" />
        <span>{erro}</span>
      </span>
    </div>
  );
}
