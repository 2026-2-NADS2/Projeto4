import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Avatar from "../../componentes/Avatar.jsx";
import Campo from "../../componentes/Campo.jsx";
import EmptyState from "../../componentes/EmptyState.jsx";
import { RetornoFamilia, Stepper, TagsDoRegistro, Timeline } from "../../componentes/Fluxo.jsx";
import Icone from "../../componentes/Icone.jsx";
import LayoutApp from "../../componentes/LayoutApp.jsx";
import Modal from "../../componentes/Modal.jsx";
import PageHead from "../../componentes/PageHead.jsx";
import StatusBadge from "../../componentes/StatusBadge.jsx";
import { useAutenticacao } from "../../contextos/AutenticacaoContexto.jsx";
import { useAviso } from "../../contextos/AvisoContexto.jsx";
import { api, dados } from "../../dados/dados.js";
import { fmtMedia } from "../../utilitarios/formatadores.js";
import { useTitulo } from "../../utilitarios/useTitulo.js";

const CHIPS = [
  ["fila", "Aguardando"],
  ["enviado", "Enviados"],
  ["revisao", "Em revisão"],
  ["devolvido", "Devolvidos"],
  ["publicado", "Publicados (3º bim)"],
];

const FILTROS_VAZIOS = { turma: "", disc: "", prof: "", bim: "" };

function rotuloStatus(status) {
  return { fila: "fila" }[status] || status;
}

export function RevisaoLista() {
  useTitulo("Revisão");
  const { usuario } = useAutenticacao();
  const { avisar } = useAviso();
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = useState(params.get("status") || "fila");
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [selecionados, setSelecionados] = useState([]);
  const [lote, setLote] = useState(false);
  const [, forcar] = useState(0);

  useEffect(() => {
    setStatus(params.get("status") || "fila");
  }, [params]);

  const base = useMemo(() => {
    if (status === "fila") return api.relsFiltrados({ status: ["enviado", "revisao"] });
    if (status === "publicado") return api.relsFiltrados({ status: "publicado", bim: 3 });
    return api.relsFiltrados({ status });
  }, [status]);

  const lista = base.filter((relatorio) =>
    Object.entries(filtros).every(
      ([chave, valor]) => !valor || String(relatorio[chave]) === String(valor),
    ),
  );

  const contagens = {
    fila: api.relsFiltrados({ status: ["enviado", "revisao"] }).length,
    enviado: api.relsFiltrados({ status: "enviado" }).length,
    revisao: api.relsFiltrados({ status: "revisao" }).length,
    devolvido: api.relsFiltrados({ status: "devolvido" }).length,
    publicado: api.relsFiltrados({ status: "publicado", bim: 3 }).length,
  };

  function trocarStatus(novo) {
    setStatus(novo);
    setSelecionados([]);
    setParams(novo === "fila" ? {} : { status: novo }, { replace: true });
  }

  function alternarSelecao(id) {
    setSelecionados((atuais) =>
      atuais.includes(id) ? atuais.filter((item) => item !== id) : [...atuais, id],
    );
  }

  function publicarLote() {
    selecionados.forEach((id) => {
      api.mudarStatus(id, "publicado", usuario?.nome || "Coordenação", "Coordenação");
    });
    avisar(
      `${selecionados.length} registro(s) publicado(s)`,
      "Os responsáveis vinculados já podem visualizar.",
      "ok",
    );
    setSelecionados([]);
    setLote(false);
    forcar((valor) => valor + 1);
  }

  return (
    <LayoutApp papel="admin" ativo="revisao">
      <PageHead
        crumbs={[{ label: "Acompanhamento" }, { label: "Revisão" }]}
        title="Revisão e publicação"
        lead="Revise, ajuste com histórico, devolva para ajustes ou publique os registros enviados pelos professores."
        actions={
          <button
            type="button"
            className="btn btn-success"
            disabled={!selecionados.length}
            onClick={() => setLote(true)}
          >
            <Icone nome="check" /> Publicar selecionados
            {selecionados.length ? ` (${selecionados.length})` : ""}
          </button>
        }
      />

      <div className="row" role="group" aria-label="Filtrar por status">
        {CHIPS.map(([chave, rotulo]) => (
          <button
            key={chave}
            type="button"
            className="filter-chip"
            aria-pressed={status === chave}
            onClick={() => trocarStatus(chave)}
          >
            {rotulo} <span className="n">{contagens[chave]}</span>
          </button>
        ))}
      </div>

      <section className="card">
        <div className="filters-panel">
          <div className="field">
            <label className="field-label" htmlFor="rf-t">
              Turma
            </label>
            <select
              id="rf-t"
              className="select"
              value={filtros.turma}
              onChange={(evento) => setFiltros((atual) => ({ ...atual, turma: evento.target.value }))}
            >
              <option value="">Todas</option>
              {dados.turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="rf-d">
              Disciplina
            </label>
            <select
              id="rf-d"
              className="select"
              value={filtros.disc}
              onChange={(evento) => setFiltros((atual) => ({ ...atual, disc: evento.target.value }))}
            >
              <option value="">Todas</option>
              {dados.disciplinas.map((disciplina) => (
                <option key={disciplina.id} value={disciplina.id}>
                  {disciplina.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="rf-p">
              Professor
            </label>
            <select
              id="rf-p"
              className="select"
              value={filtros.prof}
              onChange={(evento) => setFiltros((atual) => ({ ...atual, prof: evento.target.value }))}
            >
              <option value="">Todos</option>
              {dados.professores.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="rf-b">
              Bimestre
            </label>
            <select
              id="rf-b"
              className="select"
              value={filtros.bim}
              onChange={(evento) => setFiltros((atual) => ({ ...atual, bim: evento.target.value }))}
            >
              <option value="">Todos</option>
              {dados.bimestres.map((bimestre) => (
                <option key={bimestre.n} value={bimestre.n}>
                  {bimestre.n}º bimestre
                </option>
              ))}
            </select>
          </div>
        </div>

        {lista.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <span className="sr-only">Selecionar</span>
                  </th>
                  <th>Aluno</th>
                  <th>Disciplina</th>
                  <th>Professor</th>
                  <th>Bim.</th>
                  <th>Média</th>
                  <th>Status</th>
                  <th>
                    <span className="sr-only">Ação</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {lista.map((relatorio) => {
                  const aluno = api.aluno(relatorio.aluno);
                  const editavel = ["enviado", "revisao"].includes(relatorio.status);
                  return (
                    <tr key={relatorio.id}>
                      <td>
                        {editavel ? (
                          <input
                            type="checkbox"
                            checked={selecionados.includes(relatorio.id)}
                            onChange={() => alternarSelecao(relatorio.id)}
                            aria-label={`Selecionar ${aluno.nome}`}
                            style={{ width: 20, height: 20, accentColor: "var(--blue)" }}
                          />
                        ) : null}
                      </td>
                      <td className="cell-main">
                        <div className="cell-person">
                          <Avatar nome={aluno.nome} cor={aluno.cor} tamanho="sm" />
                          <span>
                            <b>{aluno.nome}</b>
                            <small>{api.turma(relatorio.turma).nome}</small>
                          </span>
                        </div>
                      </td>
                      <td data-label="Disciplina">{api.disc(relatorio.disc).nome}</td>
                      <td data-label="Professor">{api.prof(relatorio.prof).nome}</td>
                      <td data-label="Bimestre">{relatorio.bim}º</td>
                      <td data-label="Média" className="mono">
                        {fmtMedia(relatorio.media)}
                      </td>
                      <td data-label="Status">
                        <StatusBadge status={relatorio.status} curto />
                      </td>
                      <td className="actions">
                        <Link
                          className="btn btn-secondary btn-sm"
                          to={`/admin/revisao/${relatorio.id}`}
                        >
                          {editavel ? "Revisar" : "Abrir"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icone="check-circle"
            titulo="Tudo revisado por aqui"
            texto="Nenhum registro corresponde aos filtros. Quando um professor enviar um acompanhamento, ele aparecerá nesta fila."
          />
        )}
      </section>

      <Modal
        aberto={lote}
        aoFechar={() => setLote(false)}
        titulo={`Publicar ${selecionados.length} registro(s)?`}
        texto="Após publicar, os responsáveis vinculados poderão ver os relatórios. A ação fica registrada na auditoria."
        icone="check-circle"
        tom="ico-ok"
        rodape={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setLote(false)}>
              Cancelar
            </button>
            <button type="button" className="btn btn-success" onClick={publicarLote}>
              <Icone nome="check" /> Publicar
            </button>
          </>
        }
      />
    </LayoutApp>
  );
}

export function RevisaoDetalhe() {
  useTitulo("Revisar registro");
  const { id } = useParams();
  const navegar = useNavigate();
  const { usuario } = useAutenticacao();
  const { avisar } = useAviso();
  const [, forcar] = useState(0);
  const [modal, setModal] = useState(null);
  const [comentario, setComentario] = useState("");
  const [motivos, setMotivos] = useState(["Descrição do acompanhamento"]);
  const [editando, setEditando] = useState(false);
  const [media, setMedia] = useState("");
  const [desc, setDesc] = useState("");
  const [erroMedia, setErroMedia] = useState("");
  const [erroDesc, setErroDesc] = useState("");
  const [erroComentario, setErroComentario] = useState("");

  const relatorio = api.rel(id);

  useEffect(() => {
    if (!relatorio) return;
    setMedia(String(relatorio.media).replace(".", ","));
    setDesc(relatorio.desc);
  }, [id]);

  if (!relatorio) return <Navigate to="/admin/revisao" replace />;

  const aluno = api.aluno(relatorio.aluno);
  const professor = api.prof(relatorio.prof);
  const editavel = ["enviado", "revisao"].includes(relatorio.status);
  const outros = api
    .relsFiltrados({ status: ["enviado", "revisao"] })
    .filter((item) => item.id !== relatorio.id)
    .slice(0, 4);

  function avisarSucesso(titulo, texto, paraLista = true) {
    setModal(null);
    setComentario("");
    setErroComentario("");
    avisar(titulo, texto, "ok");
    if (paraLista) navegar("/admin/revisao");
    else forcar((valor) => valor + 1);
  }

  function iniciarRevisao() {
    api.mudarStatus(relatorio.id, "revisao", usuario?.nome || "Coordenação", "Coordenação");
    avisarSucesso("Revisão iniciada", "O professor verá o status “Em revisão”.", false);
  }

  function salvar() {
    const numero = Number(media.replace(",", "."));
    let invalido = false;
    setErroMedia("");
    setErroDesc("");
    if (Number.isNaN(numero) || numero < 0 || numero > 10) {
      setErroMedia("Use um valor entre 0 e 10.");
      invalido = true;
    }
    if (!desc.trim()) {
      setErroDesc("A descrição não pode ficar vazia.");
      invalido = true;
    }
    if (invalido) {
      avisar("Média fora da escala", "Revise os campos destacados.", "err");
      return;
    }

    if (numero !== relatorio.media) {
      relatorio.historico.push({
        quem: usuario?.nome || "Coordenação",
        papel: "Coordenação",
        quando: "agora",
        acao: "Média alterada",
        de: fmtMedia(relatorio.media),
        para: fmtMedia(numero),
      });
      relatorio.media = numero;
    }
    if (desc !== relatorio.desc) {
      const versao =
        relatorio.historico.filter((item) => item.acao === "Descrição ajustada").length + 1;
      relatorio.historico.push({
        quem: usuario?.nome || "Coordenação",
        papel: "Coordenação",
        quando: "agora",
        acao: "Descrição ajustada",
        de: `v${versao}`,
        para: `v${versao + 1}`,
        textoAnterior: relatorio.desc,
        textoNovo: desc,
      });
      relatorio.desc = desc;
    }
    if (relatorio.status === "enviado") {
      api.mudarStatus(relatorio.id, "revisao", usuario?.nome || "Coordenação", "Coordenação");
    }
    setEditando(false);
    avisarSucesso(
      "Alterações salvas",
      "Estado anterior e posterior registrados no histórico.",
      false,
    );
  }

  function devolver(evento) {
    evento.preventDefault();
    if (comentario.trim().length < 15) {
      setErroComentario("Escreva ao menos 15 caracteres para orientar o professor.");
      return;
    }
    api.mudarStatus(
      relatorio.id,
      "devolvido",
      usuario?.nome || "Coordenação",
      "Coordenação",
      `${motivos.length ? `Ajustar: ${motivos.join(", ")}. ` : ""}${comentario.trim()}`,
    );
    avisarSucesso("Registro devolvido ao professor", "O comentário ficou registrado no histórico.");
  }

  function cancelar(evento) {
    evento.preventDefault();
    if (!comentario.trim()) {
      setErroComentario("Informe o motivo do cancelamento.");
      return;
    }
    api.mudarStatus(
      relatorio.id,
      "cancelado",
      usuario?.nome || "Coordenação",
      "Coordenação",
      comentario.trim(),
    );
    avisarSucesso("Registro cancelado", "O histórico foi mantido.", true);
  }

  function publicar() {
    api.mudarStatus(relatorio.id, "publicado", usuario?.nome || "Coordenação", "Coordenação");
    avisarSucesso("Relatório publicado", "A família já pode visualizar.", true);
  }

  function abrirModal(tipo) {
    setComentario("");
    setErroComentario("");
    setMotivos(["Descrição do acompanhamento"]);
    setModal(tipo);
  }

  function alternarMotivo(valor) {
    setMotivos((atuais) =>
      atuais.includes(valor) ? atuais.filter((item) => item !== valor) : [...atuais, valor],
    );
  }

  return (
    <LayoutApp papel="admin" ativo="revisao">
      <PageHead
        crumbs={[{ label: "Revisão", to: "/admin/revisao" }, { label: aluno.nome }]}
        title={aluno.nome}
        lead={`${api.turma(relatorio.turma).nome} · ${api.disc(relatorio.disc).nome} · ${relatorio.bim}º bimestre de ${relatorio.ano} · Prof. ${professor.nome}`}
        actions={<StatusBadge status={relatorio.status} />}
      />

      <Stepper status={relatorio.status} />

      {relatorio.status === "enviado" && (
        <div className="alert info">
          <Icone nome="info" />
          <div className="grow">
            <b>Registro aguardando início da revisão</b>
            Ao iniciar, o professor vê o status “Em revisão” e não pode mais editar.
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={iniciarRevisao}>
            Iniciar revisão
          </button>
        </div>
      )}

      {relatorio.status === "publicado" && (
        <div className="alert success">
          <Icone nome="check-circle" />
          <div>
            <b>Publicado para a família</b>
            Visível para{" "}
            {api
              .respDoAluno(aluno.id)
              .map((responsavel) => responsavel.nome)
              .join(" e ") || "os responsáveis vinculados"}
            . {relatorio.lido ? "Ciência registrada." : "Ainda não lido."}
          </div>
        </div>
      )}

      <div className="grid-main-side">
        <div className="stack">
          <section className="card">
            <div className="grid-2">
              <div className="media-box">
                <span className="eyebrow">Média do bimestre</span>
                {editavel ? (
                  <>
                    <label className="sr-only" htmlFor="rv-media">
                      Média do bimestre
                    </label>
                    <input
                      id="rv-media"
                      className="media-input mono"
                      value={media}
                      inputMode="decimal"
                      aria-invalid={erroMedia ? "true" : "false"}
                      onChange={(evento) => {
                        setMedia(evento.target.value);
                        setErroMedia("");
                      }}
                    />
                    {erroMedia && <span className="error-msg">{erroMedia}</span>}
                  </>
                ) : (
                  <b className="media-val">{fmtMedia(relatorio.media)}</b>
                )}
                <small className="muted">Escala da escola: 0 a 10, uma casa decimal</small>
              </div>
              <div className="stack-sm">
                <span className="eyebrow">Tags do registro</span>
                <TagsDoRegistro ids={relatorio.tags} />
                <small className="muted">Classificações pedagógicas definidas pelo professor.</small>
              </div>
            </div>

            <div className="stack-sm">
              <div className="row-between">
                <span className="eyebrow">Descrição do acompanhamento</span>
                {editavel && !editando && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setEditando(true)}
                  >
                    <Icone nome="edit" className="icon-sm" /> Ajustar texto
                  </button>
                )}
              </div>
              {!editando ? (
                <div className="desc-text">{relatorio.desc}</div>
              ) : (
                <>
                  <Campo
                    label="Texto revisado"
                    tipo="textarea"
                    valor={desc}
                    obrigatorio
                    erro={erroDesc}
                    aoMudar={(valor) => {
                      setDesc(valor);
                      setErroDesc("");
                    }}
                  />
                  <small className="muted">
                    Toda alteração da coordenação fica registrada com o texto anterior.
                  </small>
                </>
              )}
            </div>
          </section>

          <RetornoFamilia relatorio={relatorio} />

          {relatorio.comentarios.length > 0 && (
            <section className="card">
              <h2 style={{ fontSize: "1.125rem" }}>Comentários da revisão</h2>
              {relatorio.comentarios.map((item, indice) => (
                <div className="comment" key={`${item.quando}-${indice}`}>
                  <Avatar nome={item.quem} cor="#FFC94A" tamanho="sm" />
                  <div>
                    <b>{item.quem}</b>{" "}
                    <small className="muted">
                      · {item.papel} · {item.quando}
                    </small>
                    <p>{item.texto}</p>
                  </div>
                </div>
              ))}
            </section>
          )}

          {editavel && (
            <div className="action-bar">
              <button type="button" className="btn btn-danger" onClick={() => abrirModal("devolver")}>
                <Icone nome="undo" /> Devolver para ajustes
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => abrirModal("cancelar")}>
                <Icone nome="ban" /> Cancelar registro
              </button>
              <span className="grow" />
              <button type="button" className="btn btn-secondary" onClick={salvar}>
                <Icone nome="save" /> Salvar alteração
              </button>
              <button type="button" className="btn btn-success" onClick={() => abrirModal("publicar")}>
                <Icone nome="send" /> Publicar para a família
              </button>
            </div>
          )}
        </div>

        <aside className="stack">
          <section className="card">
            <h2 style={{ fontSize: "1.125rem" }}>
              <Icone nome="clock" /> Histórico e auditoria
            </h2>
            <Timeline historico={relatorio.historico} />
          </section>

          {outros.length > 0 && (
            <section className="card tight">
              <h2 style={{ fontSize: "1rem" }}>Próximos na fila</h2>
              {outros.map((item) => {
                const outroAluno = api.aluno(item.aluno);
                return (
                  <Link className="row list-link" key={item.id} to={`/admin/revisao/${item.id}`}>
                    <Avatar nome={outroAluno.nome} cor={outroAluno.cor} tamanho="sm" />
                    <span className="grow">
                      <b>{outroAluno.nome}</b>
                      <small className="muted"> · {api.disc(item.disc).nome}</small>
                    </span>
                    <Icone nome="chevron-right" className="icon-sm" />
                  </Link>
                );
              })}
            </section>
          )}
        </aside>
      </div>

      <Modal
        aberto={modal === "publicar"}
        aoFechar={() => setModal(null)}
        titulo="Publicar para a família?"
        texto={`${aluno.nome} · ${api.disc(relatorio.disc).nome} · ${relatorio.bim}º bimestre`}
        icone="send"
        tom="ico-ok"
        rodape={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>
              Voltar
            </button>
            <button type="button" className="btn btn-success" onClick={publicar}>
              <Icone nome="check" /> Confirmar publicação
            </button>
          </>
        }
      >
        <div className="publish-preview">
          <div className="row-between">
            <span className="eyebrow">Média</span>
            <b className="mono" style={{ fontSize: "1.375rem" }}>
              {fmtMedia(Number(media.replace(",", ".")) || relatorio.media)}
            </b>
          </div>
          <TagsDoRegistro ids={relatorio.tags} />
          <p className="text-2" style={{ fontSize: "0.875rem" }}>
            {desc.slice(0, 180)}…
          </p>
        </div>
        <div className="alert info">
          <Icone nome="family" />
          <div>
            Ficará visível para:{" "}
            <b>
              {api
                .respDoAluno(aluno.id)
                .map((responsavel) => responsavel.nome)
                .join(", ") || "responsáveis vinculados"}
            </b>
            . Eles receberão um aviso (simulação).
          </div>
        </div>
      </Modal>

      <Modal
        aberto={modal === "devolver"}
        aoFechar={() => setModal(null)}
        titulo="Devolver para ajustes"
        texto={`${aluno.nome} · ${api.disc(relatorio.disc).nome}`}
        icone="undo"
        tom="ico-bad"
        rodape={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>
              Cancelar
            </button>
            <button type="submit" form="form-devolver" className="btn btn-danger">
              <Icone nome="send" /> Devolver ao professor
            </button>
          </>
        }
      >
        <form id="form-devolver" className="stack" onSubmit={devolver} noValidate>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack-sm">
            <legend className="field-label">O que precisa ser ajustado?</legend>
            {["Descrição do acompanhamento", "Média do bimestre", "Tags selecionadas"].map(
              (opcao) => (
                <label className="check" key={opcao}>
                  <input
                    type="checkbox"
                    checked={motivos.includes(opcao)}
                    onChange={() => alternarMotivo(opcao)}
                  />{" "}
                  {opcao}
                </label>
              ),
            )}
          </fieldset>
          <Campo
            label="Comentário para o professor"
            tipo="textarea"
            valor={comentario}
            obrigatorio
            placeholder="Explique o que ajustar de forma objetiva e respeitosa."
            dica="Obrigatório. O professor verá esta mensagem junto ao registro."
            erro={erroComentario}
            aoMudar={(valor) => {
              setComentario(valor);
              setErroComentario("");
            }}
          />
          <div className="alert neutral">
            <Icone nome="info" />
            <div>
              O registro volta ao professor com status “Devolvido para ajustes”. O histórico é
              mantido.
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        aberto={modal === "cancelar"}
        aoFechar={() => setModal(null)}
        titulo="Cancelar este registro?"
        texto="Use quando o registro não deve ser publicado (ex.: aluno transferido). O histórico é mantido."
        icone="ban"
        tom="ico-bad"
        rodape={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>
              Voltar
            </button>
            <button type="submit" form="form-cancelar" className="btn btn-danger">
              Cancelar registro
            </button>
          </>
        }
      >
        <form id="form-cancelar" className="stack" onSubmit={cancelar} noValidate>
          <Campo
            label="Motivo"
            tipo="textarea"
            valor={comentario}
            obrigatorio
            erro={erroComentario}
            aoMudar={(valor) => {
              setComentario(valor);
              setErroComentario("");
            }}
          />
        </form>
      </Modal>
    </LayoutApp>
  );
}
