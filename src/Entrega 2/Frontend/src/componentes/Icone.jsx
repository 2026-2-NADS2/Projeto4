import { ICONES } from "./icones.js";

// Ícone do design system: SVG inline com o traço original do protótipo.
export default function Icone({ nome, className = "", titulo, ...props }) {
  const conteudo = ICONES[nome];
  if (!conteudo) return null;

  const classes = `icon ${className}`.trim();
  const acessivel = titulo ? { role: "img", "aria-label": titulo } : { "aria-hidden": true };

  return (
    <svg
      className={classes}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...acessivel}
      {...props}
      dangerouslySetInnerHTML={{ __html: conteudo }}
    />
  );
}
