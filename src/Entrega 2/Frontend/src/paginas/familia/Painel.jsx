import { Link, Navigate } from "react-router-dom";
import BimTabs from "../../componentes/BimTabs.jsx";
import EmptyState from "../../componentes/EmptyState.jsx";
import Icone from "../../componentes/Icone.jsx";
import LayoutApp from "../../componentes/LayoutApp.jsx";
import LineChart from "../../componentes/LineChart.jsx";
import PageHead from "../../componentes/PageHead.jsx";
import StatusBadge from "../../componentes/StatusBadge.jsx";
import { api, dados } from "../../dados/dados.js";
import { fmtMedia, plural, primeiroNome } from "../../utilitarios/formatadores.js";
import { mediaDe, tomMedia, useFamilia } from "../../utilitarios/familia.js";
import { useTitulo } from "../../utilitarios/useTitulo.js";
import { SeletorAluno } from "./partes.jsx";

export default function PainelFamilia() {
  const { responsavel, aluno, params } = useFamilia();
  useTitulo(aluno ? `Acompanhamento de ${primeiroNome(aluno.nome)}` : "Início da família");

  if (!aluno) return <Navigate to="/acesso-negado" replace />;

  const turma = api.turma(aluno.turma);
  const registros = api.relsDaFamilia(responsavel.id, aluno.id);
  const ultimoBim = Math.max(0, ...registros.map((registro) => registro.bim));
  const bim = Number(params.get("bim")) || ultimoBim || 1;
  const doBim = registros.filter((registro) => registro.bim === bim);
  const novos = registros.filter((registro) => !registro.lido);
  const media = mediaDe(doBim);
  const anterior = mediaDe(registros.filter((registro) => registro.bim === bim - 1));

  const pontos = dados.bimestres.map((bimestre) => {
    const doPeriodo = registros.filter((registro) => registro.bim === bimestre.n);
    return {
      label: `${bimestre.n}º bimestre`,
      value: mediaDe(doPeriodo),
      current: bimestre.n === bim,
    };
  });
  const rotuloGrafico =
    "Média geral por bimestre: " +
    pontos
      .map((ponto) => `${ponto.label} ${ponto.value == null ? "a publicar" : fmtMedia(ponto.value)}`)
      .join(", ");

  return (
    <LayoutApp papel="familia" ativo="painel">
      <PageHead
        title={`Acompanhamento de ${primeiroNome(aluno.nome)}`}
        lead={[turma?.nome, turma?.turno, dados.escola.nome].filter(Boolean).join(" · ")}
        actions={<SeletorAluno aluno={aluno} responsavel={responsavel} base="/familia/painel" />}
      />

      {novos.length > 0 && (
        <section className="card new-report" aria-label="Novidade">
          <span className="ico ico-ok">
            <Icone nome="sparkle" />
          </span>
          <div className="grow">
            <h2 style={{ fontSize: "1.25rem" }}>
              Novo relatório de {api.disc(novos[0].disc)?.nome || "Disciplina"}
            </h2>
            <p className="text-2">
              {novos[0].bim}º bimestre
              {novos.length > 1
                ? ` · e mais ${plural(novos.length - 1, "relatório")} aguardando sua leitura.`
                : " · a escola acabou de publicar."}
            </p>
          </div>
          <Link
            className="btn btn-primary"
            to={`/familia/relatorios/${novos[0].id}?aluno=${aluno.id}`}
          >
            Ler agora <Icone nome="chevron-right" className="icon-sm" />
          </Link>
        </section>
      )}

      <BimTabs ativo={bim} base={`/familia/painel?aluno=${aluno.id}`} desabilitarFuturo />

      {doBim.length ? (
        <>
          <section className="grid-3">
            <div className="card tight kpi">
              <div className="kpi-top">
                <span className="ico ico-blue">
                  <Icone nome="chart" className="icon-sm" />
                </span>
                <span className="lbl">Média geral do {bim}º bimestre</span>
              </div>
              <div className="val">{fmtMedia(media)}</div>
              {anterior != null && media != null && (
                <span
                  className="delta"
                  style={{
                    color:
                      media >= anterior ? "var(--st-publicado)" : "var(--st-devolvido)",
                  }}
                >
                  {media >= anterior ? "▲" : "▼"} {fmtMedia(Math.abs(media - anterior))} em
                  relação ao {bim - 1}º
                </span>
              )}
            </div>

            <div className="card tight kpi">
              <div className="kpi-top">
                <span className="ico ico-ok">
                  <Icone nome="file" className="icon-sm" />
                </span>
                <span className="lbl">Relatórios publicados</span>
              </div>
              <div className="val">{doBim.length}</div>
              <span className="delta muted">de {dados.disciplinas.length} disciplinas</span>
            </div>

            <div className="card tight kpi">
              <div className="kpi-top">
                <span className="ico ico-warn">
                  <Icone nome="eye" className="icon-sm" />
                </span>
                <span className="lbl">Ainda não lidos</span>
              </div>
              <div className="val">{doBim.filter((registro) => !registro.lido).length}</div>
              <Link className="delta" to={`/familia/relatorios?aluno=${aluno.id}&bim=${bim}`}>
                ver lista
              </Link>
            </div>
          </section>

          <section className="stack">
            <h2 style={{ fontSize: "1.25rem" }}>Disciplinas no {bim}º bimestre</h2>
            <div className="grid-4 disc-grid">
              {doBim.map((registro) => {
                const disciplina = api.disc(registro.disc);
                const area = api.area(disciplina?.area);
                return (
                  <Link
                    className="card card-link disc-card"
                    key={registro.id}
                    to={`/familia/relatorios/${registro.id}?aluno=${aluno.id}`}
                  >
                    <div className="row-between">
                      <span
                        className="area-dot"
                        style={{ background: area?.cor || "#B9C8FF" }}
                        aria-hidden="true"
                      />
                      <StatusBadge status={registro.lido ? "lido" : "nao-lido"} curto />
                    </div>
                    <b>{disciplina?.nome || "Disciplina"}</b>
                    <span className={`nota ${tomMedia(registro.media)}`}>
                      <span className="sr-only">Média </span>
                      {fmtMedia(registro.media)}
                    </span>
                    <small className="muted">Prof. {api.prof(registro.prof).nome}</small>
                  </Link>
                );
              })}
            </div>
            {dados.disciplinas.length > doBim.length && (
              <p className="muted" style={{ fontSize: "0.8125rem" }}>
                <Icone nome="info" className="icon-sm" />{" "}
                {plural(dados.disciplinas.length - doBim.length, "disciplina")} ainda em
                preparação pela escola. Elas aparecem aqui assim que forem publicadas.
              </p>
            )}
          </section>
        </>
      ) : (
        <section className="card">
          <EmptyState
            icone="book-open"
            titulo={`Nenhum relatório publicado no ${bim}º bimestre`}
            texto={`Os professores de ${primeiroNome(aluno.nome)} ainda estão finalizando os acompanhamentos. Você receberá um aviso assim que a coordenação publicar.`}
            acoes={
              <Link className="btn btn-secondary" to={`/familia/historico?aluno=${aluno.id}`}>
                <Icone nome="clock" /> Ver bimestres anteriores
              </Link>
            }
          />
        </section>
      )}

      <section className="card">
        <div className="card-head">
          <div>
            <h2>Evolução da média geral</h2>
            <p>Bimestres publicados em {dados.escola.ano}</p>
          </div>
        </div>
        <LineChart points={pontos} label={rotuloGrafico} />
      </section>
    </LayoutApp>
  );
}
