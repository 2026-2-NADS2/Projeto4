import { useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import Avatar from "../../componentes/Avatar.jsx";
import BarraProgresso from "../../componentes/BarraProgresso.jsx";
import EmptyState from "../../componentes/EmptyState.jsx";
import { TagsDoRegistro } from "../../componentes/Fluxo.jsx";
import Icone from "../../componentes/Icone.jsx";
import LayoutApp from "../../componentes/LayoutApp.jsx";
import PageHead from "../../componentes/PageHead.jsx";
import StatusBadge from "../../componentes/StatusBadge.jsx";
import { useAutenticacao } from "../../contextos/AutenticacaoContexto.jsx";
import { api, dados } from "../../dados/dados.js";
import { fmtMedia } from "../../utilitarios/formatadores.js";
import { BIM_ATUAL, progressoDaTurma, registroDe } from "../../utilitarios/professor.js";
import { useTitulo } from "../../utilitarios/useTitulo.js";

const FILTROS = [
  ["", "Todos"],
  ["pendente", "Sem registro"],
  ["rascunho", "Rascunho"],
  ["devolvido", "Devolvidos"],
];

function acaoDoRegistro(aluno, disc, registro) {
  if (!registro) {
    return (
      <Link
        className="btn btn-primary btn-sm"
        to={`/professor/registro/novo?aluno=${aluno.id}&disc=${disc}&bim=${BIM_ATUAL}`}
      >
        <Icone nome="plus" className="icon-sm" /> Registrar
      </Link>
    );
  }
  if (registro.status === "rascunho") {
    return (
      <Link className="btn btn-secondary btn-sm" to={`/professor/registro/${registro.id}/editar`}>
        <Icone nome="pencil" className="icon-sm" /> Continuar
      </Link>
    );
  }
  if (registro.status === "devolvido") {
    return (
      <Link className="btn btn-danger btn-sm" to={`/professor/registro/${registro.id}/editar`}>
        <Icone nome="undo" className="icon-sm" /> Ajustar
      </Link>
    );
  }
  return (
    <Link className="btn btn-ghost btn-sm" to={`/professor/registros/${registro.id}`}>
      <Icone nome="eye" className="icon-sm" /> Ver
    </Link>
  );
}

export function Turmas() {
  useTitulo("Minhas turmas");
  const { usuario } = useAutenticacao();
  const vinculos = api.vinculosDoProf(usuario?.profId || "p1");

  return (
    <LayoutApp papel="professor" ativo="turmas">
      <PageHead
        crumbs={[{ label: "Professor", to: "/professor/painel" }, { label: "Minhas turmas" }]}
        title="Minhas turmas"
        lead="Turmas e disciplinas atribuídas a você pela coordenação no ano letivo de 2026."
      />

      <div className="grid-3">
        {vinculos.map((vinculo) => {
          const turma = api.turma(vinculo.turma);
          const progresso = progressoDaTurma(vinculo.turma, vinculo.disc);
          const status = progresso.st.devolvido
            ? "devolvido"
            : progresso.st.pendente
              ? "pendente"
              : "enviado";
          return (
            <article className="card turma-card" key={`${vinculo.turma}-${vinculo.disc}`}>
              <div className="row-between">
                <span className="turma-badge lg">{turma.nome}</span>
                <StatusBadge status={status} curto />
              </div>
              <div>
                <h2 style={{ fontSize: "1.125rem" }}>{api.disc(vinculo.disc).nome}</h2>
                <p className="muted" style={{ fontSize: "0.8125rem" }}>
                  {turma.ano} · {turma.turno} · {turma.sala} · {progresso.total} alunos ativos
                </p>
              </div>
              <BarraProgresso progresso={progresso} />
              <Link
                className="btn btn-secondary btn-block"
                to={`/professor/turmas/${turma.id}?disc=${vinculo.disc}`}
              >
                Abrir turma <Icone nome="chevron-right" className="icon-sm" />
              </Link>
            </article>
          );
        })}
      </div>
    </LayoutApp>
  );
}

export function TurmaDetalhe() {
  useTitulo("Turma");
  const { id } = useParams();
  const [params] = useSearchParams();
  const { usuario } = useAutenticacao();
  const [q, setQ] = useState(params.get("q") || "");
  const [filtro, setFiltro] = useState("");
  const [versao] = useState(0);

  const turma = api.turma(id);
  const vinculos = api.vinculosDoProf(usuario?.profId || "p1").filter(
    (vinculo) => vinculo.turma === id,
  );

  if (!turma || !vinculos.length) return <Navigate to="/acesso-negado" replace />;

  const disc = vinculos.some((vinculo) => vinculo.disc === params.get("disc"))
    ? params.get("disc")
    : vinculos[0].disc;
  const alunos = api.alunosDaTurma(turma.id);
  const progresso = progressoDaTurma(turma.id, disc);

  const lista = useMemo(
    () =>
      alunos.filter((aluno) => {
        const registro = registroDe(aluno.id, disc);
        const status = !aluno.ativo ? "inativo" : registro ? registro.status : "pendente";
        return (
          aluno.nome.toLowerCase().includes(q.trim().toLowerCase()) &&
          (!filtro || status === filtro)
        );
      }),
    [alunos, disc, q, filtro, versao],
  );

  return (
    <LayoutApp papel="professor" ativo="turmas">
      <PageHead
        crumbs={[
          { label: "Minhas turmas", to: "/professor/turmas" },
          { label: `${turma.nome} · ${api.disc(disc).nome}` },
        ]}
        title={`${turma.nome} · ${api.disc(disc).nome}`}
        lead={`${alunos.length} alunos · ${turma.turno} · ${turma.sala} · 3º bimestre`}
        actions={
          <Link className="btn btn-primary" to={`/professor/registro/novo?disc=${disc}`}>
            <Icone nome="plus" /> Novo acompanhamento
          </Link>
        }
      />

      {vinculos.length > 1 && (
        <div className="segmented" role="group" aria-label="Disciplina">
          {vinculos.map((vinculo) => (
            <Link
              key={vinculo.disc}
              to={`/professor/turmas/${turma.id}?disc=${vinculo.disc}`}
              aria-current={vinculo.disc === disc ? "page" : undefined}
            >
              {api.disc(vinculo.disc).nome}
            </Link>
          ))}
        </div>
      )}

      <section className="grid-4">
        {[
          ["pendente", "Sem registro", "ico-warn", "clock"],
          ["rascunho", "Rascunhos", "ico-blue", "pencil"],
          ["devolvido", "Devolvidos", "ico-bad", "undo"],
          ["publicado", "Publicados", "ico-ok", "check-circle"],
        ].map(([status, rotulo, tom, icone]) => (
          <div className="card tight row" key={status}>
            <span
              className={`ico ${tom}`}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                display: "grid",
                placeItems: "center",
              }}
            >
              <Icone nome={icone} />
            </span>
            <div>
              <b className="mono" style={{ fontSize: "1.375rem" }}>
                {progresso.st[status]}
              </b>
              <div className="muted" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                {rotulo}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="card" key={versao}>
        <div className="toolbar" role="search">
          <div className="search grow">
            <label className="sr-only" htmlFor="tq">
              Buscar aluno
            </label>
            <Icone nome="search" />
            <input
              id="tq"
              className="input"
              type="search"
              placeholder="Buscar aluno pelo nome"
              value={q}
              onChange={(evento) => setQ(evento.target.value)}
            />
          </div>
          <div className="segmented" role="group" aria-label="Filtrar por situação">
            {FILTROS.map(([valor, rotulo]) => (
              <button
                key={valor || "todos"}
                type="button"
                aria-pressed={filtro === valor}
                onClick={() => setFiltro(valor)}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </div>

        {lista.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>RA</th>
                  <th>Média</th>
                  <th>Status do registro</th>
                  <th>
                    <span className="sr-only">Ação</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {lista.map((aluno) => {
                  const registro = registroDe(aluno.id, disc);
                  return (
                    <tr key={aluno.id}>
                      <td className="cell-main">
                        <Link className="cell-person" to={`/professor/alunos/${aluno.id}`}>
                          <Avatar nome={aluno.nome} cor={aluno.cor} tamanho="sm" />
                          <span>
                            <b>{aluno.nome}</b>
                            <small>{aluno.ativo ? turma.nome : "Inativo · transferido"}</small>
                          </span>
                        </Link>
                      </td>
                      <td data-label="RA" className="mono">
                        {aluno.ra}
                      </td>
                      <td data-label="Média" className="mono">
                        {registro ? fmtMedia(registro.media) : "—"}
                      </td>
                      <td data-label="Status">
                        {aluno.ativo ? (
                          <StatusBadge
                            status={registro ? registro.status : "pendente"}
                            curto={false}
                          />
                        ) : (
                          <StatusBadge status="cancelado" curto />
                        )}
                      </td>
                      <td className="actions">
                        {aluno.ativo ? acaoDoRegistro(aluno, disc, registro) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icone="search"
            titulo="Nenhum aluno encontrado"
            texto="Ajuste a busca ou o filtro de situação para ver os alunos da turma."
            acoes={
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setQ("");
                  setFiltro("");
                }}
              >
                Limpar filtros
              </button>
            }
          />
        )}
      </section>
    </LayoutApp>
  );
}

export function AlunoDetalhe() {
  useTitulo("Aluno");
  const { id } = useParams();
  const { usuario } = useAutenticacao();
  const aluno = api.aluno(id);

  if (!aluno) return <Navigate to="/professor/turmas" replace />;

  const turma = api.turma(aluno.turma);
  const discIds = api
    .vinculosDoProf(usuario?.profId || "p1")
    .filter((vinculo) => vinculo.turma === aluno.turma)
    .map((vinculo) => vinculo.disc);

  if (!discIds.length) return <Navigate to="/acesso-negado" replace />;

  const registros = api
    .relsFiltrados({ aluno: aluno.id })
    .filter((registro) => discIds.includes(registro.disc));
  const responsaveis = api.respDoAluno(aluno.id);
  const periodos = dados.bimestres.filter((bimestre) => bimestre.status !== "agendado");

  function acaoDoBimestre(disciplina, periodo, registro) {
    if (periodo.status === "aberto") {
      return acaoDoRegistro(aluno, disciplina, registro);
    }
    if (registro) {
      return (
        <Link className="btn btn-ghost btn-sm" to={`/professor/registros/${registro.id}`}>
          <Icone nome="eye" className="icon-sm" /> Ver
        </Link>
      );
    }
    return (
      <span className="muted" style={{ fontSize: "0.75rem" }}>
        Período encerrado
      </span>
    );
  }

  return (
    <LayoutApp papel="professor" ativo="turmas">
      <PageHead
        crumbs={[
          { label: "Minhas turmas", to: "/professor/turmas" },
          { label: turma.nome, to: `/professor/turmas/${turma.id}?disc=${discIds[0]}` },
          { label: aluno.nome },
        ]}
        title={aluno.nome}
        lead={`${turma.nome} · RA ${aluno.ra} · nascimento ${aluno.nasc}`}
      />

      <div className="grid-main-side">
        <section className="card">
          <div className="card-head">
            <div>
              <h2>Acompanhamentos</h2>
              <p>Registros seus para este aluno, por bimestre e disciplina</p>
            </div>
          </div>
          {discIds.map((discId) => (
            <div key={discId}>
              <h3 className="eyebrow" style={{ marginTop: 8 }}>
                {api.disc(discId).nome}
              </h3>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Bimestre</th>
                      <th>Média</th>
                      <th>Tags</th>
                      <th>Status</th>
                      <th>
                        <span className="sr-only">Ação</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {periodos.map((periodo) => {
                      const registro = registros.find(
                        (item) =>
                          item.disc === discId &&
                          item.bim === periodo.n &&
                          item.status !== "cancelado",
                      );
                      return (
                        <tr key={periodo.n}>
                          <td className="cell-main">
                            <b>{periodo.n}º bimestre</b>
                          </td>
                          <td data-label="Média" className="mono">
                            {registro ? fmtMedia(registro.media) : "—"}
                          </td>
                          <td data-label="Tags">
                            {registro ? (
                              <TagsDoRegistro ids={registro.tags} />
                            ) : (
                              <span className="muted">—</span>
                            )}
                          </td>
                          <td data-label="Status">
                            <StatusBadge
                              status={registro ? registro.status : "pendente"}
                              curto
                            />
                          </td>
                          <td className="actions">
                            {acaoDoBimestre(discId, periodo, registro)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>

        <aside className="stack">
          <section className="card stack-sm" style={{ alignItems: "center", textAlign: "center" }}>
            <Avatar nome={aluno.nome} cor={aluno.cor} tamanho="xl" />
            <b style={{ fontSize: "1.125rem" }}>{aluno.nome}</b>
            <span className="muted" style={{ fontSize: "0.8125rem" }}>
              {turma.nome} · {turma.turno}
            </span>
            <StatusBadge status={aluno.ativo ? "publicado" : "cancelado"} curto />
          </section>

          <section className="card tight stack-sm">
            <h2 style={{ fontSize: "1rem" }}>Responsáveis</h2>
            {responsaveis.length ? (
              responsaveis.map((responsavel) => (
                <div className="row" key={responsavel.id}>
                  <Avatar nome={responsavel.nome} cor="#9FE3D0" tamanho="sm" />
                  <span>
                    <b style={{ fontSize: "0.875rem" }}>{responsavel.nome}</b>
                    <small className="muted"> · {responsavel.parentesco}</small>
                  </span>
                </div>
              ))
            ) : (
              <p className="muted">Nenhum responsável vinculado.</p>
            )}
            <small className="muted">Contatos são gerenciados pela coordenação.</small>
          </section>
        </aside>
      </div>
    </LayoutApp>
  );
}
