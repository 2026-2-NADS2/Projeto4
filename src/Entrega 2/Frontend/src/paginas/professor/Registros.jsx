import { useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
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
import { BIM_ATUAL, editavel } from "../../utilitarios/professor.js";
import { useTitulo } from "../../utilitarios/useTitulo.js";

const ABAS = [
  ["", "Todos (3º bim)"],
  ["rascunho", "Rascunhos"],
  ["enviado", "Enviados"],
  ["revisao", "Em revisão"],
  ["devolvido", "Devolvidos"],
  ["publicado", "Publicados"],
];

const MENSAGENS = {
  rascunho: [
    "neutral",
    "pencil",
    "Rascunho",
    "Só você vê este registro. Envie para revisão quando estiver pronto.",
  ],
  enviado: [
    "info",
    "send",
    "Aguardando a coordenação",
    "A revisão ainda não começou. Você será avisado quando houver retorno.",
  ],
  revisao: [
    "warning",
    "review",
    "Em revisão pela coordenação",
    "A edição está bloqueada enquanto a coordenação analisa.",
  ],
  publicado: [
    "success",
    "check-circle",
    "Publicado para a família",
    "O responsável ainda não abriu o relatório.",
  ],
  devolvido: [
    "danger",
    "undo",
    "Devolvido para ajustes",
    "Leia o comentário da coordenação, ajuste e reenvie.",
  ],
  cancelado: ["neutral", "ban", "Registro cancelado", "Este registro não será publicado."],
};

function mensagemDoRegistro(registro) {
  const [tom, icone, titulo, texto] = MENSAGENS[registro.status] || MENSAGENS.rascunho;
  return {
    tom,
    icone,
    titulo,
    texto:
      registro.status === "publicado" && registro.lido
        ? "O responsável registrou ciência deste relatório."
        : texto,
  };
}

function ConfirmacaoEnvio({ registro, aoFechar, aoConfirmar }) {
  if (!registro) return null;
  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo={registro.status === "devolvido" ? "Reenviar para revisão?" : "Enviar para revisão?"}
      texto={`${api.aluno(registro.aluno).nome} · ${api.disc(registro.disc).nome} · ${registro.bim}º bimestre`}
      icone="send"
      tom="ico-blue"
      rodape={
        <>
          <button type="button" className="btn btn-secondary" onClick={aoFechar}>
            Voltar e revisar
          </button>
          <button type="button" className="btn btn-primary" onClick={aoConfirmar}>
            <Icone nome="send" /> Confirmar envio
          </button>
        </>
      }
    >
      <div className="publish-preview">
        <div className="row-between">
          <span className="eyebrow">Média</span>
          <b className="mono" style={{ fontSize: "1.375rem" }}>
            {fmtMedia(registro.media)}
          </b>
        </div>
        <TagsDoRegistro ids={registro.tags} />
      </div>
      <div className="alert info">
        <Icone nome="lock" />
        <div>
          Depois de enviar, você <b>não poderá editar</b> até a coordenação concluir a revisão
          ou devolver o registro.
        </div>
      </div>
    </Modal>
  );
}

export function Registros() {
  useTitulo("Meus registros");
  const { usuario } = useAutenticacao();
  const [params] = useSearchParams();
  const profId = usuario?.profId || "p1";
  const status = params.get("status") || "";

  const base = api
    .relsFiltrados({ prof: profId })
    .filter((registro) => registro.bim === BIM_ATUAL || status);
  const lista = status ? base.filter((registro) => registro.status === status) : base;
  const contar = (valor) => api.relsFiltrados({ prof: profId, status: valor }).length;

  return (
    <LayoutApp papel="professor" ativo="registros">
      <PageHead
        crumbs={[{ label: "Professor", to: "/professor/painel" }, { label: "Meus registros" }]}
        title="Meus registros"
        lead="Acompanhe em que etapa da revisão está cada registro que você criou."
        actions={
          <Link className="btn btn-primary" to="/professor/registro/novo">
            <Icone nome="plus" /> Novo acompanhamento
          </Link>
        }
      />

      <nav className="tabs" aria-label="Filtrar por status">
        {ABAS.map(([chave, rotulo]) => (
          <Link
            key={chave || "todos"}
            to={`/professor/registros${chave ? `?status=${chave}` : ""}`}
            aria-current={chave === status ? "page" : undefined}
          >
            {rotulo}
            {chave ? <span className="count">{contar(chave)}</span> : null}
          </Link>
        ))}
      </nav>

      <section className="card flush">
        {lista.length ? (
          <div className="table-wrap" style={{ border: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Disciplina</th>
                  <th>Bimestre</th>
                  <th>Média</th>
                  <th>Status</th>
                  <th>
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {lista.map((registro) => {
                  const aluno = api.aluno(registro.aluno);
                  return (
                    <tr key={registro.id}>
                      <td className="cell-main">
                        <Link className="cell-person" to={`/professor/registros/${registro.id}`}>
                          <Avatar nome={aluno.nome} cor={aluno.cor} tamanho="sm" />
                          <span>
                            <b>{aluno.nome}</b>
                            <small>{api.turma(registro.turma).nome}</small>
                          </span>
                        </Link>
                      </td>
                      <td data-label="Disciplina">{api.disc(registro.disc).nome}</td>
                      <td data-label="Bimestre">{registro.bim}º</td>
                      <td data-label="Média" className="mono">
                        {fmtMedia(registro.media)}
                      </td>
                      <td data-label="Status">
                        <StatusBadge status={registro.status} curto={false} />
                      </td>
                      <td className="actions">
                        {editavel(registro.status) ? (
                          <Link
                            className={`btn ${registro.status === "devolvido" ? "btn-danger" : "btn-secondary"} btn-sm`}
                            to={`/professor/registro/${registro.id}/editar`}
                          >
                            {registro.status === "devolvido" ? "Ajustar" : "Continuar"}
                          </Link>
                        ) : null}
                        <Link
                          className="btn btn-ghost btn-sm"
                          to={`/professor/registros/${registro.id}`}
                        >
                          <Icone nome="eye" className="icon-sm" /> Ver
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
            titulo={status === "devolvido" ? "Nenhum registro devolvido" : "Nada por aqui"}
            texto={
              status === "devolvido"
                ? "Ótimo! A coordenação não pediu ajustes nos seus registros."
                : "Não há registros com este status no momento."
            }
            acoes={
              <Link className="btn btn-secondary" to="/professor/registros">
                Ver todos
              </Link>
            }
          />
        )}
      </section>
    </LayoutApp>
  );
}

export function RegistroDetalhe() {
  useTitulo("Registro");
  const { id } = useParams();
  const { usuario } = useAutenticacao();
  const registro = api.rel(id);
  const profId = usuario?.profId || "p1";

  if (!registro || registro.prof !== profId) {
    return <Navigate to="/acesso-negado" replace />;
  }

  const aluno = api.aluno(registro.aluno);
  const mensagem = mensagemDoRegistro(registro);

  return (
    <LayoutApp papel="professor" ativo="registros">
      <PageHead
        crumbs={[
          { label: "Meus registros", to: "/professor/registros" },
          { label: aluno.nome },
        ]}
        title={`${aluno.nome} · ${api.disc(registro.disc).nome}`}
        lead={`${api.turma(registro.turma).nome} · ${registro.bim}º bimestre de ${registro.ano}`}
        actions={<StatusBadge status={registro.status} curto={false} />}
      />

      <Stepper status={registro.status} />

      <div className={`alert ${mensagem.tom}`}>
        <Icone nome={mensagem.icone} />
        <div className="grow">
          <b>{mensagem.titulo}</b>
          {mensagem.texto}
        </div>
        {editavel(registro.status) ? (
          <Link
            className={`btn ${registro.status === "devolvido" ? "btn-danger" : "btn-primary"} btn-sm`}
            to={`/professor/registro/${registro.id}/editar`}
          >
            {registro.status === "devolvido" ? "Ajustar registro" : "Continuar edição"}
          </Link>
        ) : null}
      </div>

      <div className="grid-main-side">
        <div className="stack">
          <section className="card stack">
            <div className="grid-2">
              <div className="media-box">
                <span className="eyebrow">Média do bimestre</span>
                <b className="media-val">{fmtMedia(registro.media)}</b>
              </div>
              <div className="stack-sm">
                <span className="eyebrow">Tags</span>
                <TagsDoRegistro ids={registro.tags} />
              </div>
            </div>
            <div className="stack-sm">
              <span className="eyebrow">Descrição</span>
              <div className="desc-text">{registro.desc}</div>
            </div>
          </section>

          {registro.comentarios.length ? (
            <section className="card">
              <h2 style={{ fontSize: "1.125rem" }}>Comentários da coordenação</h2>
              {registro.comentarios.map((comentario, indice) => (
                <div className="comment" key={`${comentario.quando}-${indice}`}>
                  <Avatar nome={comentario.quem} cor="#FFC94A" tamanho="sm" />
                  <div>
                    <b>{comentario.quem}</b>{" "}
                    <small className="muted">
                      · {comentario.papel} · {comentario.quando}
                    </small>
                    <p>{comentario.texto}</p>
                  </div>
                </div>
              ))}
            </section>
          ) : null}
        </div>

        <aside className="stack">
          <RetornoFamilia relatorio={registro} />
          <section className="card">
            <h2 style={{ fontSize: "1.125rem" }}>
              <Icone nome="clock" /> Histórico
            </h2>
            <Timeline historico={registro.historico} />
          </section>
        </aside>
      </div>
    </LayoutApp>
  );
}

function FormularioAcompanhamento({ registro, profId, usuario }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { avisar } = useAviso();

  const vinculos = api.vinculosDoProf(profId);
  const turmasDoProf = [...new Set(vinculos.map((vinculo) => vinculo.turma))];

  const [alunoId, setAlunoId] = useState(
    registro?.aluno || params.get("aluno") || "",
  );
  const [disc, setDisc] = useState(registro?.disc || params.get("disc") || "");
  const [bim] = useState(
    registro?.bim || Number(params.get("bim")) || BIM_ATUAL,
  );
  const [media, setMedia] = useState(
    registro ? (registro.media == null ? "" : fmtMedia(registro.media)) : "",
  );
  const [tags, setTags] = useState(registro?.tags || []);
  const [desc, setDesc] = useState(registro?.desc || "");
  const [erros, setErros] = useState({});
  const [envio, setEnvio] = useState(null);

  const alunoSelecionado = alunoId ? api.aluno(alunoId) : null;
  const turmaSelecionada = alunoSelecionado ? api.turma(alunoSelecionado.turma) : null;

  const alunosOpts = [
    ["", "Selecione o aluno"],
    ...turmasDoProf.flatMap((turmaId) =>
      api
        .alunosDaTurma(turmaId)
        .filter((aluno) => aluno.ativo)
        .map((aluno) => [aluno.id, `${aluno.nome} — ${api.turma(turmaId).nome}`]),
    ),
  ];

  const discOpts = [
    ["", "Selecione a disciplina"],
    ...(turmaSelecionada
      ? vinculos.filter((vinculo) => vinculo.turma === turmaSelecionada.id)
      : vinculos
    )
      .map((vinculo) => vinculo.disc)
      .filter((disciplina, indice, lista) => lista.indexOf(disciplina) === indice)
      .map((disciplina) => [disciplina, api.disc(disciplina).nome]),
  ];

  const ultimoComentario =
    registro && registro.comentarios.length
      ? registro.comentarios[registro.comentarios.length - 1]
      : null;

  function trocarAluno(valor) {
    setAlunoId(valor);
    setErros((atuais) => ({ ...atuais, aluno: "" }));
    const aluno = api.aluno(valor);
    if (!aluno) return;
    const disciplinas = vinculos
      .filter((vinculo) => vinculo.turma === aluno.turma)
      .map((vinculo) => vinculo.disc);
    if (!disciplinas.includes(disc)) {
      setDisc(disciplinas.length === 1 ? disciplinas[0] : "");
    }
  }

  function alternarTag(id) {
    setTags((atuais) =>
      atuais.includes(id) ? atuais.filter((tag) => tag !== id) : [...atuais, id],
    );
  }

  function validar(completo) {
    const novos = {};
    if (!alunoId) novos.aluno = "Escolha o aluno.";
    if (!disc) novos.disc = "Escolha a disciplina.";
    if (completo) {
      const numero = media.trim().replace(",", ".");
      if (!numero) {
        novos.media = "Informe a média do bimestre.";
      } else if (!/^\d{1,2}(\.\d)?$/.test(numero) || Number(numero) > 10) {
        novos.media = "Use um número de 0 a 10, com até uma casa decimal.";
      }
      if (desc.trim().length < 60) {
        novos.desc = `Escreva ao menos 60 caracteres (atual: ${desc.trim().length}).`;
      }
    }
    setErros(novos);
    if (Object.keys(novos).length) {
      avisar(
        "Revise os campos destacados",
        completo
          ? "Há informações obrigatórias faltando ou fora da escala."
          : "Escolha aluno e disciplina — são necessários para salvar o rascunho.",
        "err",
      );
      return false;
    }
    return true;
  }

  function duplicado() {
    const existente = api.registro(alunoId, disc, bim);
    return existente && existente.id !== registro?.id ? existente : null;
  }

  function coletar() {
    const numero = media.trim() === "" ? null : Number(media.replace(",", "."));
    return {
      id: registro?.id,
      aluno: alunoId,
      disc,
      turma: alunoSelecionado ? alunoSelecionado.turma : "",
      prof: profId,
      bim,
      ano: 2026,
      media: Number.isNaN(numero) ? null : numero,
      tags,
      desc: desc.trim(),
    };
  }

  function salvar(status) {
    return api.salvarRegistro({ ...coletar(), status });
  }

  function salvarRascunho() {
    if (!validar(false)) return;
    if (duplicado()) {
      avisar(
        "Já existe um registro",
        "Abra o registro existente para este aluno e disciplina.",
        "err",
      );
      return;
    }
    const salvo = salvar(registro ? registro.status : "rascunho");
    if (registro) {
      salvo.historico.push({
        quem: usuario?.nome || "Professor",
        papel: "Professor",
        quando: "agora",
        acao: "Rascunho atualizado",
        de: null,
        para: salvo.status,
      });
    }
    avisar(
      "Rascunho salvo nesta sessão",
      "Fica disponível enquanto a página estiver aberta.",
    );
    navigate(`/professor/registro/${salvo.id}/editar`, { replace: !registro });
  }

  function conferirDuplicado() {
    const existente = duplicado();
    if (!existente) return false;
    avisar(
      "Já existe um registro",
      `${api.aluno(existente.aluno).nome} já tem ${api.disc(existente.disc).nome} no ${existente.bim}º bimestre.`,
      "err",
    );
    return true;
  }

  function previsualizar() {
    if (!validar(true) || conferirDuplicado()) return;
    const salvo = salvar(registro ? registro.status : "rascunho");
    navigate(`/professor/registro/${salvo.id}/previa`);
  }

  function enviar(evento) {
    evento.preventDefault();
    if (!validar(true) || conferirDuplicado()) return;
    setEnvio(salvar(registro ? registro.status : "rascunho"));
  }

  function confirmarEnvio() {
    if (!envio) return;
    api.mudarStatus(envio.id, "enviado", usuario?.nome || "Professor", "Professor");
    setEnvio(null);
    avisar("Enviado para revisão", "A coordenação foi avisada (simulação).");
    navigate(`/professor/registros/${envio.id}`);
  }

  const titulo = registro
    ? registro.status === "devolvido"
      ? "Ajustar após devolução"
      : "Continuar rascunho"
    : "Novo acompanhamento";

  return (
    <LayoutApp papel="professor" ativo="registros">
      <PageHead
        crumbs={[
          { label: "Professor", to: "/professor/painel" },
          {
            label: registro
              ? registro.status === "devolvido"
                ? "Ajustar registro"
                : "Editar rascunho"
              : "Novo acompanhamento",
          },
        ]}
        title={titulo}
        lead="Registre a média e um relato pedagógico do bimestre. A família só verá depois da revisão e publicação pela coordenação."
        actions={registro ? <StatusBadge status={registro.status} /> : undefined}
      />

      {registro && registro.status === "devolvido" && ultimoComentario ? (
        <div className="alert danger">
          <Icone nome="undo" />
          <div>
            <b>
              Comentário da coordenação · {ultimoComentario.quem} · {ultimoComentario.quando}
            </b>
            “{ultimoComentario.texto}”
          </div>
        </div>
      ) : null}

      <div className={`grid-main-side${registro ? "" : " sticky-side"}`}>
        <form id="reg-form" className="card stack-lg" noValidate onSubmit={enviar}>
          <fieldset className="form-section">
            <legend>1. Aluno e período</legend>
            <div className="form-grid">
              <Campo
                label="Aluno"
                id="f-aluno"
                valor={alunoId}
                aoMudar={trocarAluno}
                opcoes={alunosOpts}
                obrigatorio
                disabled={Boolean(registro)}
                erro={erros.aluno}
                className="span-2"
              />
              <Campo
                label="Turma"
                id="f-turma"
                valor={turmaSelecionada ? turmaSelecionada.nome : "Preenchida ao escolher o aluno"}
                disabled
              />
              <Campo
                label="Disciplina"
                id="f-disc"
                valor={disc}
                aoMudar={(valor) => {
                  setDisc(valor);
                  setErros((atuais) => ({ ...atuais, disc: "" }));
                }}
                opcoes={discOpts}
                obrigatorio
                disabled={Boolean(registro)}
                erro={erros.disc}
              />
              <Campo label="Ano letivo" id="f-ano" valor="2026" disabled />
              <Campo
                label="Bimestre"
                id="f-bim"
                valor={bim}
                opcoes={dados.bimestres.map((bimestre) => [
                  bimestre.n,
                  `${bimestre.n}º bimestre · ${bimestre.rotulo}`,
                ])}
                obrigatorio
                disabled
                dica="Somente o 3º bimestre está aberto para digitação."
              />
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>2. Desempenho</legend>
            <div className="form-grid">
              <div className={`field ${erros.media ? "has-error" : ""}`.trim()}>
                <label htmlFor="f-media">
                  Média do bimestre
                  <span className="req" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="f-media"
                  className="input mono"
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex.: 8,5"
                  value={media}
                  aria-invalid={erros.media ? "true" : "false"}
                  aria-describedby="f-media-hint"
                  style={{ maxWidth: 160, fontSize: "1.25rem" }}
                  onChange={(evento) => {
                    setMedia(evento.target.value);
                    setErros((atuais) => ({ ...atuais, media: "" }));
                  }}
                />
                <span className="hint" id="f-media-hint">
                  De 0 a 10, com até uma casa decimal.
                </span>
                {erros.media ? (
                  <span className="error-msg" role="alert">
                    <Icone nome="alert" className="icon-sm" />
                    <span>{erros.media}</span>
                  </span>
                ) : null}
              </div>
            </div>

            <div className="field">
              <span className="field-label" id="tags-lbl">
                Tags pedagógicas <small className="muted">(opcional, escolha quantas quiser)</small>
              </span>
              <div className="tag-picker" role="group" aria-labelledby="tags-lbl">
                {dados.tags.map((tag) => (
                  <label className="tag-option" key={tag.id}>
                    <input
                      type="checkbox"
                      name="tags"
                      value={tag.id}
                      checked={tags.includes(tag.id)}
                      onChange={() => alternarTag(tag.id)}
                    />
                    <span>{tag.nome}</span>
                  </label>
                ))}
              </div>
              <span className="hint">
                Classificações pedagógicas, não diagnósticos. Ajudam a coordenação a gerar
                relatórios por perfil.
              </span>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>3. Relato para a família</legend>
            <Campo
              label="Descrição do acompanhamento"
              id="f-desc"
              tipo="textarea"
              valor={desc}
              aoMudar={(valor) => {
                setDesc(valor);
                setErros((atuais) => ({ ...atuais, desc: "" }));
              }}
              obrigatorio
              maxLength={1200}
              placeholder="Conte como foi o bimestre: participação, conquistas, pontos de atenção e uma sugestão prática para casa."
              erro={erros.desc}
              dica={`${desc.length}/1200 caracteres · mínimo 60. Escreva em linguagem acessível para a família.`}
            />
            <details className="tips">
              <summary>
                <Icone nome="sparkle" className="icon-sm" /> Dicas para um bom relato
              </summary>
              <ul>
                <li>Comece por algo positivo e concreto.</li>
                <li>Cite o conteúdo trabalhado (ex.: frações, mapas).</li>
                <li>Aponte um ponto de atenção sem rótulos.</li>
                <li>Termine com uma sugestão que a família possa apoiar.</li>
              </ul>
            </details>
          </fieldset>

          <div className="action-bar">
            <Link
              className="btn btn-ghost"
              to={registro ? `/professor/registros/${registro.id}` : "/professor/painel"}
            >
              Cancelar
            </Link>
            <span className="grow" />
            <button type="button" className="btn btn-secondary" onClick={salvarRascunho}>
              <Icone nome="save" /> Salvar rascunho
            </button>
            <button type="button" className="btn btn-secondary" onClick={previsualizar}>
              <Icone nome="eye" /> Pré-visualizar
            </button>
            <button type="submit" className="btn btn-primary">
              <Icone nome="send" />{" "}
              {registro && registro.status === "devolvido"
                ? "Reenviar para revisão"
                : "Enviar para revisão"}
            </button>
          </div>
        </form>

        <aside className="stack">
          <section className="card tight stack-sm">
            <h2 style={{ fontSize: "1rem" }}>
              <Icone nome="info" /> Como funciona
            </h2>
            <Stepper status={registro ? registro.status : "rascunho"} />
            <p className="muted" style={{ fontSize: "0.8125rem" }}>
              Depois de enviado, o registro vai para a coordenação. Ela pode publicar para a
              família ou devolver com comentários.
            </p>
          </section>
          {registro ? (
            <section className="card tight">
              <h2 style={{ fontSize: "1rem" }}>Histórico</h2>
              <Timeline historico={registro.historico} />
            </section>
          ) : null}
          <section className="card tight stack-sm">
            <h2 style={{ fontSize: "1rem" }}>
              <Icone nome="shield" /> Privacidade
            </h2>
            <p className="muted" style={{ fontSize: "0.8125rem" }}>
              Somente os responsáveis vinculados a este aluno verão o relato, e apenas após a
              publicação.
            </p>
          </section>
        </aside>
      </div>

      {envio ? (
        <ConfirmacaoEnvio
          registro={envio}
          aoFechar={() => setEnvio(null)}
          aoConfirmar={confirmarEnvio}
        />
      ) : null}
    </LayoutApp>
  );
}

export function RegistroForm() {
  useTitulo("Acompanhamento");
  const { id } = useParams();
  const { usuario } = useAutenticacao();
  const profId = usuario?.profId || "p1";
  const registro = id ? api.rel(id) : null;

  if (id && (!registro || registro.prof !== profId)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  if (registro && !editavel(registro.status)) {
    return (
      <LayoutApp papel="professor" ativo="registros">
        <PageHead
          crumbs={[
            { label: "Meus registros", to: "/professor/registros" },
            { label: "Edição bloqueada" },
          ]}
          title="Este registro não pode ser editado agora"
        />
        <div className="alert warning">
          <Icone nome="lock" />
          <div>
            <b>Status: {registro.status === "publicado" ? "Publicado" : "Em análise"}</b>
            Registros enviados, em revisão ou publicados só podem ser alterados pela
            coordenação. Se precisar corrigir algo, peça a devolução.
          </div>
        </div>
        <Link className="btn btn-secondary" to={`/professor/registros/${registro.id}`}>
          Ver registro
        </Link>
      </LayoutApp>
    );
  }

  return (
    <FormularioAcompanhamento
      key={id || "novo"}
      registro={registro}
      profId={profId}
      usuario={usuario}
    />
  );
}

export function RegistroPrevia() {
  useTitulo("Pré-visualização");
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAutenticacao();
  const { avisar } = useAviso();
  const [envio, setEnvio] = useState(null);
  const registro = api.rel(id);
  const profId = usuario?.profId || "p1";

  if (!registro || registro.prof !== profId) {
    return <Navigate to="/acesso-negado" replace />;
  }

  const aluno = api.aluno(registro.aluno);

  function abrirEnvio() {
    if (!editavel(registro.status)) {
      avisar("Registro já enviado", "Este registro não está mais em edição.", "info");
      return;
    }
    setEnvio(registro);
  }

  function confirmarEnvio() {
    api.mudarStatus(registro.id, "enviado", usuario?.nome || "Professor", "Professor");
    setEnvio(null);
    avisar("Enviado para revisão", "A coordenação foi avisada (simulação).");
    navigate(`/professor/registros/${registro.id}`);
  }

  return (
    <LayoutApp papel="professor" ativo="registros">
      <PageHead
        crumbs={[
          { label: "Professor", to: "/professor/painel" },
          { label: "Pré-visualização" },
        ]}
        title="Como a família verá"
        lead="Confira o texto e a média antes de enviar. Esta é a visão do responsável após a publicação."
        actions={<StatusBadge status={registro.status} />}
      />

      <div className="alert neutral">
        <Icone nome="eye" />
        <div>Pré-visualização local. Nada foi enviado ainda.</div>
      </div>

      <article className="card report-doc" aria-label="Prévia do relatório">
        <header className="report-head">
          <div className="row">
            <Avatar nome={aluno.nome} cor={aluno.cor} tamanho="lg" />
            <div>
              <h2 style={{ fontSize: "1.5rem" }}>{aluno.nome}</h2>
              <span className="muted" style={{ fontSize: "0.8125rem" }}>
                {api.disc(registro.disc).nome} · {registro.bim}º bimestre de {registro.ano} ·{" "}
                {api.turma(registro.turma).nome} · Prof. {usuario?.nome}
              </span>
            </div>
          </div>
          <div className="media-box sm">
            <span className="eyebrow">Média</span>
            <b className="media-val">{fmtMedia(registro.media)}</b>
          </div>
        </header>
        <TagsDoRegistro ids={registro.tags} />
        <div className="desc-text">{registro.desc}</div>
      </article>

      <div className="action-bar">
        <Link className="btn btn-secondary" to={`/professor/registro/${registro.id}/editar`}>
          <Icone nome="pencil" /> Voltar e editar
        </Link>
        <span className="grow" />
        <button type="button" className="btn btn-primary" onClick={abrirEnvio}>
          <Icone nome="send" /> Enviar para revisão
        </button>
      </div>

      {envio ? (
        <ConfirmacaoEnvio
          registro={envio}
          aoFechar={() => setEnvio(null)}
          aoConfirmar={confirmarEnvio}
        />
      ) : null}
    </LayoutApp>
  );
}
