import { Fragment, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function PageHead({ crumbs = [], title, lead, actions }) {
  const tituloRef = useRef(null);

  // Leitores de tela anunciam a troca de tela quando o foco vai para o <h1>.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      tituloRef.current?.focus({ preventScroll: true });
    }, 30);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <header className="page-head">
      <div className="stack-sm">
        {crumbs.length > 1 && (
          <nav className="breadcrumbs" aria-label="Você está em">
            {crumbs.map((item, indice) => (
              <Fragment key={`${item.label}-${indice}`}>
                {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
                {indice < crumbs.length - 1 && (
                  <span className="sep" aria-hidden="true">
                    /
                  </span>
                )}
              </Fragment>
            ))}
          </nav>
        )}
        <h1 id="page-title" tabIndex={-1} ref={tituloRef}>
          {title}
        </h1>
        {lead && <p className="lead">{lead}</p>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </header>
  );
}
