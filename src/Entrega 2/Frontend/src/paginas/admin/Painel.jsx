import { Link } from "react-router-dom";
import Avatar from "../../componentes/Avatar.jsx";
import Icone from "../../componentes/Icone.jsx";
import LayoutApp from "../../componentes/LayoutApp.jsx";
import PageHead from "../../componentes/PageHead.jsx";
import StatusBadge from "../../componentes/StatusBadge.jsx";
import { useAutenticacao } from "../../contextos/AutenticacaoContexto.jsx";
import { api, dados } from "../../dados/dados.js";
import { STATUS } from "../../dados/status.js";
import { primeiroNome, saudacao } from "../../utilitarios/formatadores.js";
import { useTitulo } from "../../utilitarios/useTitulo.js";

function rotuloDoStatus(status) {
  return STATUS[status]?.short || STATUS[status]?.label || status;
}

const STATUS_FLUXO = ["rascunho", "enviado", "revisao", "publicado", "devolvido"];
const CORES = {
  rascunho: "var(--st-rascunho)",
  enviado: "var(--teal)",
  revisao: "var(--sun)",
  publicado: "var(--success)",
  devolvido: "var(--danger)",
};

function Kpi({ icone, tom, valor, rotulo, detalhe, cor, para }) {
  return (
    <Link className="card tight card-link kpi" to={para}>
      <div className="kpi-top">
        <span className={`ico ${tom}`}>
          <Icone nome={icone} className="icon-sm" />
        </span>
        <span className="lbl">{rotulo}</span>
      </div>
      <div className="val">{valor}</div>
      <span className="delta" style={{ color: cor }}>
        {detalhe}
      </span>
    </Link>
  );
}

export default function AdminPainel() {
  useTitulo("Painel da coordenação");
  const { usuario } = useAutenticacao();

  const b3 = api.relsFiltrados({ bim: 3 });
  const contar = (status) => b3.filter((r) => r.status === status).length;
  const fila = api.relsFiltrados({ status: ["enviado", "revisao"] });
  const esperado = 128;
  const total = STATUS_FLUXO.reduce((soma, status) => soma + contar(status), 0) || 1;

  return (
    <LayoutApp papel="admin" ativo="painel">
      <PageHead
        crumbs={[{ label: "Coordenação" }]}
        title={`${saudacao()}, ${primeiroNome(usuario?.nome || "Marina")}`}
        lead="Acompanhe o 3º bimestre em todas as turmas e revise o que os professores enviaram."
        actions={
          <>
            <Link className="btn btn-secondary" to="/admin/relatorios">
              <Icone nome="chart" /> Relatórios
            </Link>
            <Link className="btn btn-primary" to="/admin/revisao">
              <Icone nome="review" /> Revisar agora ({fila.length})
            </Link>
          </>
        }
      />

      <section className="grid-4" aria-label="Indicadores do 3º bimestre">
        <Kpi
          icone="review"
          tom="ico-warn"
          valor={fila.length}
          rotulo="Aguardando revisão"
          detalhe="ver fila"
          cor="var(--warning)"
          para="/admin/revisao"
        />
        <Kpi
          icone="check-circle"
          tom="ico-ok"
          valor={contar("publicado")}
          rotulo="Publicados no 3º bimestre"
          detalhe="para as famílias"
          cor="var(--success)"
          para="/admin/relatorios?status=publicado"
        />
        <Kpi
          icone="undo"
          tom="ico-bad"
          valor={contar("devolvido")}
          rotulo="Devolvidos para ajustes"
          detalhe="com os professores"
          cor="var(--danger)"
          para="/admin/revisao?status=devolvido"
        />
        <Kpi
          icone="pencil"
          tom="ico-blue"
          valor={esperado - b3.length + contar("rascunho")}
          rotulo="Ainda não enviados"
          detalhe={`de ${esperado} esperados`}
          cor="var(--text-muted)"
          para="/admin/relatorios?bim=3"
        />
      </section>

      <section className="card card-dark period-banner" aria-label="Período atual">
        <span
          className="ico"
          style={{
            background: "rgba(255,255,255,.1)",
            width: 52,
            height: 52,
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            color: "var(--sky)",
          }}
        >
          <Icone nome="calendar" />
        </span>
        <div className="grow">
          <div className="row">
            <h2 style={{ fontSize: "1.25rem" }}>3º bimestre · digitação aberta</h2>
            <span className="tag" style={{ background: "var(--mint)", color: "var(--on-pastel)" }}>
              ABERTO
            </span>
          </div>
          <p style={{ color: "rgba(255,255,255,.75)", fontSize: "0.875rem" }}>
            De 01/08 às 08:00 até 30/09 às 23:59 · restam 2 dias
          </p>
        </div>
        <div style={{ minWidth: 220 }} className="stack-sm">
          <small style={{ color: "rgba(255,255,255,.75)", fontWeight: 700 }}>70% do período</small>
          <div className="progress on-dark">
            <span style={{ width: "70%" }} />
          </div>
        </div>
        <Link className="btn btn-light" to="/admin/periodos">
          <Icone nome="calendar" /> Configurar períodos
        </Link>
      </section>

      <div className="grid-main-side">
        <section className="card">
          <div className="card-head">
            <div>
              <h2>Fila de revisão</h2>
              <p>Registros enviados pelos professores aguardando você</p>
            </div>
            <Link className="btn btn-ghost btn-sm" to="/admin/revisao">
              Ver todos <Icone nome="chevron-right" className="icon-sm" />
            </Link>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Disciplina</th>
                  <th>Professor</th>
                  <th>Status</th>
                  <th>
                    <span className="sr-only">Ação</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {fila.slice(0, 6).map((r) => {
                  const aluno = api.aluno(r.aluno);
                  return (
                    <tr key={r.id}>
                      <td className="cell-main">
                        <div className="cell-person">
                          <Avatar nome={aluno.nome} cor={aluno.cor} tamanho="sm" />
                          <span>
                            <b>{aluno.nome}</b>
                            <small>
                              {api.turma(r.turma).nome} · {r.bim}º bim
                            </small>
                          </span>
                        </div>
                      </td>
                      <td data-label="Disciplina">{api.disc(r.disc).nome}</td>
                      <td data-label="Professor">{api.prof(r.prof).nome}</td>
                      <td data-label="Status">
                        <StatusBadge status={r.status} curto />
                      </td>
                      <td className="actions">
                        <Link className="btn btn-secondary btn-sm" to={`/admin/revisao/${r.id}`}>
                          Revisar
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div>
              <h2>Status do 3º bimestre</h2>
              <p>{total} registros no fluxo</p>
            </div>
          </div>
          <div
            className="stacked"
            role="img"
            aria-label={`Distribuição por status: ${STATUS_FLUXO.map(
              (status) => `${rotuloDoStatus(status)}: ${contar(status)}`,
            ).join("; ")}`}
          >
            {STATUS_FLUXO.map((status) => (
              <span
                key={status}
                style={{ width: `${(contar(status) / total) * 100}%`, background: CORES[status] }}
              />
            ))}
          </div>
          <ul className="stack-sm" style={{ listStyle: "none" }}>
            {STATUS_FLUXO.map((status) => (
              <li className="row-between" key={status}>
                <StatusBadge status={status} curto />
                <b className="mono">{contar(status)}</b>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid-2">
        <section className="card">
          <div className="card-head">
            <div>
              <h2>Publicação por turma</h2>
              <p>Percentual de registros publicados no 3º bimestre</p>
            </div>
          </div>
          {dados.turmas.map((turma) => {
            const relatorios = b3.filter((r) => r.turma === turma.id);
            const percentual = relatorios.length
              ? Math.round(
                  (relatorios.filter((r) => r.status === "publicado").length / relatorios.length) * 100,
                )
              : 0;
            return (
              <div className="bar-row" key={turma.id}>
                <Link to={`/admin/turmas/${turma.id}`}>{turma.nome}</Link>
                <div className="progress">
                  <span
                    style={{
                      width: `${percentual}%`,
                      background:
                        percentual >= 60
                          ? "var(--success)"
                          : percentual >= 30
                            ? "var(--teal)"
                            : "var(--sun)",
                    }}
                  />
                </div>
                <span className="v">{percentual}%</span>
              </div>
            );
          })}
        </section>

        <section className="card">
          <div className="card-head">
            <div>
              <h2>Atividade recente</h2>
              <p>Registrada na auditoria</p>
            </div>
            <Link className="btn btn-ghost btn-sm" to="/admin/auditoria">
              Auditoria <Icone nome="chevron-right" className="icon-sm" />
            </Link>
          </div>
          <div className="timeline">
            {dados.auditoria.slice(0, 4).map((item, indice) => (
              <div className="tl-item" key={`${item.quando}-${item.acao}-${indice}`}>
                <span className="tl-dot ico-teal">
                  <Icone nome="clock" className="icon-sm" />
                </span>
                <div>
                  <b>{item.acao}</b>
                  <small>
                    {item.registro} · {item.quem} · {item.quando}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </LayoutApp>
  );
}
