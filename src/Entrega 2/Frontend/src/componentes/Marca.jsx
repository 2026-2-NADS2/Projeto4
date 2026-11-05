// Símbolo da marca KFKA: a escola (haste), o professor (céu) e a família (menta)
// se encontram no ponto amarelo da publicação.
export default function Marca({ tamanho = 38, fundo = "var(--ink)", className = "mark" }) {
  return (
    <svg
      className={className}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 40 40"
      role="img"
      aria-label="KFKA"
    >
      <rect width="40" height="40" rx="11" fill={fundo} />
      <g fill="none" strokeWidth="4.4" strokeLinecap="round">
        <path d="M13.5 10v20" stroke="#fff" />
        <path d="M15.5 20C20 20 23 15 27.5 10.5" stroke="#74C0FC" />
        <path d="M15.5 20C20 20 23 25 27.5 29.5" stroke="#5FD4A8" />
      </g>
      <circle cx="15.4" cy="20" r="4.4" fill="#FFC94A" stroke={fundo} strokeWidth="1.6" />
    </svg>
  );
}
