import { Link } from "react-router-dom";
import { dados } from "../dados/dados.js";

export default function BimTabs({ ativo, base, desabilitarFuturo = false }) {
  return (
    <div className="bim-tabs" role="group" aria-label="Bimestre">
      {dados.bimestres.map((bimestre) => {
        if (desabilitarFuturo && bimestre.status === "agendado") {
          return (
            <span key={bimestre.n} className="bim" aria-disabled="true">
              <b>{bimestre.n}º bimestre</b>
              <small>{bimestre.rotulo}</small>
            </span>
          );
        }

        const separador = base.includes("?") ? "&" : "?";
        return (
          <Link
            key={bimestre.n}
            className="bim"
            to={`${base}${separador}bim=${bimestre.n}`}
            aria-current={bimestre.n === Number(ativo) ? "page" : undefined}
          >
            <b>{bimestre.n}º bimestre</b>
            <small>{bimestre.rotulo}</small>
          </Link>
        );
      })}
    </div>
  );
}
