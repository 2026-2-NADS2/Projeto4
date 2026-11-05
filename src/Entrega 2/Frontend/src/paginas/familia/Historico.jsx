import { Link, Navigate } from "react-router-dom";
import Icone from "../../componentes/Icone.jsx";
import LayoutApp from "../../componentes/LayoutApp.jsx";
import PageHead from "../../componentes/PageHead.jsx";
import { api, dados } from "../../dados/dados.js";
import { fmtMedia, primeiroNome } from "../../utilitarios/formatadores.js";
import { tomMedia, useFamilia } from "../../utilitarios/familia.js";
import { useTitulo } from "../../utilitarios/useTitulo.js";
import { SeletorAluno } from "./partes.jsx";

export default function HistoricoFamilia() {
  const { responsavel, aluno } = useFamilia();
  useTitulo(aluno ? `Histórico de ${primeiroNome(aluno.nome)}` : "Histórico por bimestre");

  if (!aluno) return <Navigate to="/acesso-negado" replace />;

  const registros = api.relsDaFamilia(responsavel.id, aluno.id);
  const bimestres = dados.bimestres.filter((bimestre) => bimestre.status !== "agendado");

  return (
    <LayoutApp papel="familia" ativo="historico">
      <PageHead
        crumbs={[
          { label: "Início", to: `/familia/painel?aluno=${aluno.id}` },
          { label: "Histórico" },
        ]}
        title={`Histórico de ${primeiroNome(aluno.nome)}`}
        lead={`Médias publicadas por disciplina e bimestre · ${dados.escola.ano}`}
        actions={
          <SeletorAluno aluno={aluno} responsavel={responsavel} base="/familia/historico" />
        }
      />

      <section className="card flush">
        <div className="table-wrap">
          <table className="table hist-table">
            <caption className="sr-only">Médias por disciplina e bimestre</caption>
            <thead>
              <tr>
                <th scope="col">Disciplina</th>
                {bimestres.map((bimestre) => (
                  <th scope="col" key={bimestre.n}>
                    {bimestre.n}º bim
                  </th>
                ))}
                <th scope="col">Tendência</th>
              </tr>
            </thead>
            <tbody>
              {dados.disciplinas.map((disciplina) => {
                const valores = bimestres.map((bimestre) =>
                  registros.find(
                    (registro) =>
                      registro.disc === disciplina.id && registro.bim === bimestre.n,
                  ),
                );
                const notas = valores.filter(Boolean).map((registro) => registro.media);
                const tendencia =
                  notas.length > 1 ? notas[notas.length - 1] - notas[0] : null;
                const area = api.area(disciplina.area);

                return (
                  <tr key={disciplina.id}>
                    <th scope="row" className="cell-main">
                      <span className="row" style={{ gap: 8 }}>
                        <span
                          className="area-dot"
                          style={{ background: area.cor }}
                          aria-hidden="true"
                        />
                        {disciplina.nome}
                      </span>
                    </th>
                    {valores.map((registro, indice) => (
                      <td key={bimestres[indice].n} data-label={`${bimestres[indice].n}º bim`}>
                        {registro ? (
                          <Link
                            className={`nota sm ${tomMedia(registro.media)}`}
                            to={`/familia/relatorios/${registro.id}?aluno=${aluno.id}`}
                            aria-label={`${disciplina.nome}, ${bimestres[indice].n}º bimestre: ${fmtMedia(registro.media)}`}
                          >
                            {fmtMedia(registro.media)}
                          </Link>
                        ) : (
                          <span className="muted" title="Ainda não publicado">
                            —
                          </span>
                        )}
                      </td>
                    ))}
                    <td data-label="Tendência">
                      {tendencia == null ? (
                        <span className="muted">—</span>
                      ) : (
                        <span
                          className={`trend ${tendencia > 0 ? "up" : tendencia < 0 ? "down" : ""}`}
                        >
                          {tendencia > 0 ? "▲ subiu" : tendencia < 0 ? "▼ caiu" : "● estável"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="muted" style={{ fontSize: "0.8125rem" }}>
        <Icone nome="info" className="icon-sm" /> “—” indica que o relatório ainda não foi
        publicado pela escola.
      </p>
    </LayoutApp>
  );
}
