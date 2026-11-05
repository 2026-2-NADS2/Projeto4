import { Link } from "react-router-dom";
import BarraProgresso from "../../componentes/BarraProgresso.jsx";
import Icone from "../../componentes/Icone.jsx";
import LayoutApp from "../../componentes/LayoutApp.jsx";
import PageHead from "../../componentes/PageHead.jsx";
import { useAutenticacao } from "../../contextos/AutenticacaoContexto.jsx";
import { api } from "../../dados/dados.js";
import { STATUS } from "../../dados/status.js";
import { primeiroNome, saudacao } from "../../utilitarios/formatadores.js";
import { CORES_STATUS, progressoDaTurma, registroDe } from "../../utilitarios/professor.js";
import { useTitulo } from "../../utilitarios/useTitulo.js";

const LEGENDA = ["publicado", "revisao", "enviado", "rascunho", "devolvido", "pendente"];

export default function ProfessorPainel() {
  useTitulo("Início do professor");
  const { usuario } = useAutenticacao();
  const profId = usuario?.profId || "p1";

  const vinculos = api.vinculosDoProf(profId);
  const todos = vinculos.flatMap((vinculo) =>
    api
      .alunosDaTurma(vinculo.turma)
      .filter((aluno) => aluno.ativo)
      .map((aluno) => registroDe(aluno.id, vinculo.disc)),
  );
  const feitos = todos.filter((registro) => registro && registro.status !== "rascunho").length;
  const percentual = Math.round((feitos / (todos.length || 1)) * 100);
  const devolvidos = api.relsFiltrados({ prof: profId, status: "devolvido" });
  const rascunhos = api.relsFiltrados({ prof: profId, status: "rascunho" });
  const pendentes = todos.filter((registro) => !registro).length;

  const retornos = api
    .relsFiltrados({ prof: profId, status: "publicado" })
    .filter((registro) => registro.lido || registro.observacao)
    .sort((a, b) => (b.observacao ? 1 : 0) - (a.observacao ? 1 : 0))
    .slice(0, 4);

  return (
    <LayoutApp papel="professor" ativo="painel">
      <PageHead
        crumbs={[{ label: "Professor" }]}
        title={`${saudacao()}, ${primeiroNome(usuario?.nome || "Carlos")}`}
        lead="Veja o que falta registrar no 3º bimestre e responda aos ajustes pedidos pela coordenação."
        actions={
          <Link className="btn btn-primary" to="/professor/registro/novo">
            <Icone nome="plus" /> Novo acompanhamento
          </Link>
        }
      />

      <section className="card card-dark hero-prof" aria-label="Progresso do bimestre">
        <div
          className="ring"
          style={{ "--p": percentual }}
          data-label={`${percentual}%`}
          role="img"
          aria-label={`${percentual}% dos registros enviados`}
        />
        <div className="grow stack-sm">
          <h2 style={{ fontSize: "1.5rem" }}>
            {feitos} de {todos.length} registros enviados
          </h2>
          <p style={{ color: "var(--sky)", fontWeight: 700, fontSize: "0.8125rem" }}>
            3º bimestre · digitação aberta
          </p>
          <p style={{ color: "rgba(255,255,255,.75)" }}>
            O prazo termina em <b style={{ color: "#fff" }}>30/09 às 23:59</b>. Depois disso, só a
            coordenação pode reabrir.
          </p>
          <div className="row" style={{ marginTop: "var(--s2)" }}>
            <Link className="btn btn-light btn-sm" to="/professor/turmas">
              <Icone nome="users" /> Minhas turmas
            </Link>
          </div>
        </div>
      </section>

      <section className="grid-3" aria-label="Pendências">
        <Link
          className="card tight card-link kpi"
          to="/professor/registros?status=devolvido"
        >
          <div className="kpi-top">
            <span className="ico ico-bad">
              <Icone nome="undo" className="icon-sm" />
            </span>
            <span className="lbl">Devolvidos para ajustes</span>
          </div>
          <div className="val">{devolvidos.length}</div>
        </Link>
        <Link
          className="card tight card-link kpi"
          to="/professor/registros?status=rascunho"
        >
          <div className="kpi-top">
            <span className="ico ico-blue">
              <Icone nome="pencil" className="icon-sm" />
            </span>
            <span className="lbl">Rascunhos em andamento</span>
          </div>
          <div className="val">{rascunhos.length}</div>
        </Link>
        <Link
          className="card tight card-link kpi"
          to={`/professor/turmas/${vinculos[0]?.turma || "6A"}?disc=${vinculos[0]?.disc || "MAT"}`}
        >
          <div className="kpi-top">
            <span className="ico ico-warn">
              <Icone nome="clock" className="icon-sm" />
            </span>
            <span className="lbl">Alunos sem registro</span>
          </div>
          <div className="val">{pendentes}</div>
        </Link>
      </section>

      {devolvidos.length > 0 && (
        <section className="card">
          <div className="card-head">
            <div>
              <h2>Precisa da sua atenção</h2>
              <p>A coordenação devolveu estes registros com comentários</p>
            </div>
          </div>
          <div className="stack-sm">
            {devolvidos.map((registro) => {
              const aluno = api.aluno(registro.aluno);
              const comentario =
                registro.comentarios[registro.comentarios.length - 1];
              return (
                <div className="alert danger" key={registro.id}>
                  <Icone nome="undo" />
                  <div className="grow">
                    <b>
                      {aluno.nome} · {api.disc(registro.disc).nome} ·{" "}
                      {api.turma(registro.turma).nome}
                    </b>
                    {comentario
                      ? `“${comentario.texto}” — ${comentario.quem}`
                      : "Devolvido para ajustes."}
                  </div>
                  <Link
                    className="btn btn-danger btn-sm"
                    to={`/professor/registro/${registro.id}/editar`}
                  >
                    Ajustar
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="stack">
        <div className="row-between">
          <h2 style={{ fontSize: "1.25rem" }}>Minhas turmas</h2>
          <div className="legend">
            {LEGENDA.map((status) => (
              <span key={status}>
                <i style={{ background: CORES_STATUS[status] }} />
                {STATUS[status].short || STATUS[status].label}
              </span>
            ))}
          </div>
        </div>
        <div className="grid-3">
          {vinculos.map((vinculo) => {
            const turma = api.turma(vinculo.turma);
            const progresso = progressoDaTurma(vinculo.turma, vinculo.disc);
            const enviados =
              progresso.total - progresso.st.pendente - progresso.st.rascunho;
            return (
              <Link
                className="card card-link turma-card"
                key={`${vinculo.turma}-${vinculo.disc}`}
                to={`/professor/turmas/${turma.id}?disc=${vinculo.disc}`}
              >
                <div className="row-between">
                  <span className="turma-badge">{turma.nome}</span>
                  <span className="tag t-neutro">{api.disc(vinculo.disc).nome}</span>
                </div>
                <div>
                  <b style={{ fontSize: "1rem" }}>
                    {enviados}/{progresso.total} enviados
                  </b>
                  <div className="muted" style={{ fontSize: "0.8125rem" }}>
                    {turma.turno} · {turma.sala}
                  </div>
                </div>
                <BarraProgresso progresso={progresso} />
                {progresso.st.devolvido ? (
                  <small style={{ color: "var(--st-devolvido)", fontWeight: 700 }}>
                    <Icone nome="undo" className="icon-sm" /> {progresso.st.devolvido} devolvido(s)
                  </small>
                ) : (
                  <small className="muted">{progresso.st.pendente} sem registro</small>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <div>
            <h2>Retornos das famílias</h2>
            <p>Ciência e observações dos responsáveis sobre seus relatórios</p>
          </div>
        </div>
        <div className="timeline">
          {retornos.map((registro) => {
            const aluno = api.aluno(registro.aluno);
            const responsavel = api.respDoAluno(aluno.id)[0];
            const observacao = registro.observacao;
            return (
              <div className="tl-item" key={registro.id}>
                <span className={`tl-dot ${observacao ? "ico-teal" : "ico-ok"}`}>
                  <Icone nome={observacao ? "message" : "check"} className="icon-sm" />
                </span>
                <div>
                  <b>
                    <Link to={`/professor/registros/${registro.id}`}>
                      {observacao
                        ? `${observacao.quem} enviou uma observação`
                        : `${responsavel?.nome || "Responsável"} leu o relatório de ${primeiroNome(aluno.nome)}`}
                    </Link>
                  </b>
                  <small>
                    {aluno.nome} · {api.disc(registro.disc).nome} · {registro.bim}º bimestre
                  </small>
                  {observacao ? <div className="tl-comment">“{observacao.texto}”</div> : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </LayoutApp>
  );
}
