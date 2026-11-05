import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Avatar from "../../componentes/Avatar.jsx";
import Campo from "../../componentes/Campo.jsx";
import EmptyState from "../../componentes/EmptyState.jsx";
import Icone from "../../componentes/Icone.jsx";
import LayoutApp from "../../componentes/LayoutApp.jsx";
import Modal from "../../componentes/Modal.jsx";
import PageHead from "../../componentes/PageHead.jsx";
import { useAviso } from "../../contextos/AvisoContexto.jsx";
import { api, dados } from "../../dados/dados.js";
import { useTitulo } from "../../utilitarios/useTitulo.js";

/* ============================ TURMAS ============================ */

export function Turmas() {
  useTitulo("Turmas");
  const navegar = useNavigate();
  const { avisar } = useAviso();
  const [versao, setVersao] = useState(0);
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState({ nome: "", ano: "", turno: "Manhã", sala: "" });

  function criar(evento) {
    evento.preventDefault();
    if (!form.nome.trim() || !form.ano) {
      avisar("Preencha os campos obrigatórios", "Informe o nome e o ano da turma.", "err");
      return;
    }
    const nova = {
      id: `T${Date.now().toString(36).toUpperCase()}`,
      nome: form.nome.trim(),
      ano: form.ano,
      turno: form.turno,
      sala: form.sala || "A definir",
    };
    dados.turmas.push(nova);
    setVersao((valor) => valor + 1);
    setAberto(false);
    avisar("Turma criada", `${nova.nome} foi adicionada ao ano letivo.`, "ok");
    navegar(`/admin/turmas/${nova.id}`);
  }

  return (
    <LayoutApp papel="admin" ativo="turmas">
      <PageHead
        crumbs={[{ label: "Estrutura escolar" }, { label: "Turmas" }]}
        title="Turmas"
        lead="Cada turma reúne alunos, professores e disciplinas do ano letivo de 2026."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setAberto(true)}>
            <Icone nome="plus" /> Nova turma
          </button>
        }
      />

      <section className="grid-3" aria-label="Turmas do ano letivo" key={versao}>
        {dados.turmas.map((turma) => {
          const alunos = api.alunosDaTurma(turma.id);
          const vinculos = dados.vinculos.filter((vinculo) => vinculo.turma === turma.id);
          const disciplinas = [...new Set(vinculos.map((vinculo) => vinculo.disc))];
          const publicados = api.relsFiltrados({ turma: turma.id, status: "publicado" }).length;
          return (
            <Link className="card card-link stack-sm" key={turma.id} to={`/admin/turmas/${turma.id}`}>
              <div className="row-between">
                <span className="turma-badge">{turma.nome}</span>
                <Icone nome="chevron-right" className="icon-sm" />
              </div>
              <div>
                <b>{turma.ano}</b>
                <p className="muted" style={{ fontSize: "0.875rem" }}>
                  {turma.turno} · {turma.sala}
                </p>
              </div>
              <div className="row-between">
                <span className="muted" style={{ fontSize: "0.8125rem" }}>
                  <Icone nome="users" className="icon-sm" /> {alunos.length} alunos
                </span>
                <span className="muted" style={{ fontSize: "0.8125rem" }}>
                  <Icone nome="book" className="icon-sm" /> {disciplinas.length} disciplinas
                </span>
              </div>
              <div className="progress" aria-hidden="true">
                <span style={{ width: `${alunos.length ? Math.min(100, publicados / alunos.length * 100) : 0}%` }} />
              </div>
              <small className="muted">{publicados} relatórios publicados</small>
            </Link>
          );
        })}
      </section>

      <Modal
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo="Nova turma"
        texto="A turma fica disponível para matrícula e vínculo de professores."
        icone="users"
        tom="ico-blue"
        rodape={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setAberto(false)}>
              Cancelar
            </button>
            <button type="submit" form="form-turma" className="btn btn-primary">
              <Icone nome="plus" /> Criar turma
            </button>
          </>
        }
      >
        <form id="form-turma" className="form-grid" onSubmit={criar} noValidate>
          <Campo
            label="Nome da turma"
            valor={form.nome}
            obrigatorio
            placeholder="Ex.: 7º C"
            aoMudar={(valor) => setForm((atual) => ({ ...atual, nome: valor }))}
          />
          <Campo
            label="Ano"
            valor={form.ano}
            obrigatorio
            opcoes={[
              ["", "Selecione"],
              "6º ano",
              "7º ano",
              "8º ano",
              "9º ano",
            ]}
            aoMudar={(valor) => setForm((atual) => ({ ...atual, ano: valor }))}
          />
          <Campo
            label="Turno"
            valor={form.turno}
            opcoes={[
              ["Manhã", "Manhã"],
              ["Tarde", "Tarde"],
            ]}
            aoMudar={(valor) => setForm((atual) => ({ ...atual, turno: valor }))}
          />
          <Campo
            label="Sala"
            valor={form.sala}
            placeholder="Ex.: Sala 18"
            aoMudar={(valor) => setForm((atual) => ({ ...atual, sala: valor }))}
          />
        </form>
      </Modal>
    </LayoutApp>
  );
}

export function TurmaDetalhe() {
  useTitulo("Detalhe da turma");
  const { id } = useParams();
  const turma = api.turma(id);

  if (!turma) return <Navigate to="/admin/turmas" replace />;

  const alunos = api.alunosDaTurma(turma.id);
  const vinculos = dados.vinculos.filter((vinculo) => vinculo.turma === turma.id);

  return (
    <LayoutApp papel="admin" ativo="turmas">
      <PageHead
        crumbs={[{ label: "Turmas", to: "/admin/turmas" }, { label: turma.nome }]}
        title={
          <span className="row">
            <span className="turma-badge lg">{turma.nome}</span>
            {turma.ano}
          </span>
        }
        lead={`${turma.turno} · ${turma.sala} · ${alunos.length} alunos matriculados`}
        actions={
          <Link className="btn btn-secondary" to="/admin/vinculos">
            <Icone nome="link" /> Gerenciar vínculos
          </Link>
        }
      />

      <section className="card">
        <div className="card-head">
          <div>
            <h2>Professores e disciplinas</h2>
            <p>Cobertura do 3º bimestre por componente curricular</p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Disciplina</th>
                <th>Professor</th>
                <th>Registros no 3º bim.</th>
                <th>Publicados</th>
                <th>
                  <span className="sr-only">Ação</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {vinculos.map((vinculo) => {
                const registros = api.relsFiltrados({ turma: turma.id, disc: vinculo.disc, bim: 3 });
                const publicados = registros.filter((r) => r.status === "publicado").length;
                return (
                  <tr key={`${vinculo.turma}-${vinculo.disc}`}>
                    <td className="cell-main">
                      <span className="row">
                        <span
                          className="area-dot"
                          style={{ background: api.area(api.disc(vinculo.disc)?.area)?.cor }}
                        />
                        <b>{api.disc(vinculo.disc)?.nome}</b>
                      </span>
                    </td>
                    <td data-label="Professor">{api.prof(vinculo.prof)?.nome || "Sem professor"}</td>
                    <td data-label="Registros">{registros.length}</td>
                    <td data-label="Publicados">
                      <span className={`status ${publicados ? "publicado" : "pendente"}`}>
                        <Icone nome={publicados ? "check" : "clock"} /> {publicados}
                      </span>
                    </td>
                    <td className="actions">
                      <Link
                        className="btn btn-ghost btn-sm"
                        to={`/admin/relatorios?turma=${turma.id}&disc=${vinculo.disc}&bim=3`}
                      >
                        Ver relatórios
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
            <h2>Alunos</h2>
            <p>{alunos.length} matrículas ativas</p>
          </div>
          <Link className="btn btn-secondary btn-sm" to="/admin/alunos">
            Gerenciar alunos
          </Link>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>RA</th>
                <th>Situação</th>
                <th>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => (
                <tr key={aluno.id}>
                  <td className="cell-main">
                    <div className="cell-person">
                      <Avatar nome={aluno.nome} cor={aluno.cor} tamanho="sm" />
                      <b>{aluno.nome}</b>
                    </div>
                  </td>
                  <td data-label="RA" className="mono">
                    {aluno.ra}
                  </td>
                  <td data-label="Situação">
                    <span className={`status ${aluno.ativo ? "publicado" : "cancelado"}`}>
                      <Icone nome={aluno.ativo ? "check" : "ban"} />
                      {aluno.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="actions">
                    <Link className="btn btn-ghost btn-sm" to={`/admin/alunos/${aluno.id}/editar`}>
                      <Icone nome="edit" className="icon-sm" /> Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </LayoutApp>
  );
}

/* ============================ DISCIPLINAS E TAGS ============================ */

export function Disciplinas() {
  useTitulo("Disciplinas e tags");
  const { avisar } = useAviso();
  const [aba, setAba] = useState("disc");
  const [versao, setVersao] = useState(0);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ nome: "", area: "LIN" });
  const [novaTag, setNovaTag] = useState({ nome: "", tipo: "Participação" });

  const usoDasTags = useMemo(() => {
    const contagem = {};
    dados.relatorios.forEach((relatorio) => {
      (relatorio.tags || []).forEach((idTag) => {
        contagem[idTag] = (contagem[idTag] || 0) + 1;
      });
    });
    return contagem;
  }, [versao]);

  function alternarDisciplina(disciplina) {
    disciplina.ativa = !disciplina.ativa;
    setVersao((valor) => valor + 1);
    avisar(
      `${disciplina.nome} ${disciplina.ativa ? "ativada" : "desativada"}`,
      "A mudança vale para novos vínculos e registros.",
      "info",
    );
  }

  function criarDisciplina(evento) {
    evento.preventDefault();
    if (!form.nome.trim()) {
      avisar("Informe o nome", "O nome da disciplina é obrigatório.", "err");
      return;
    }
    const id = form.nome.trim().slice(0, 3).toUpperCase().replace(/\s/g, "");
    if (dados.disciplinas.some((disciplina) => disciplina.id === id)) {
      avisar("Disciplina já existe", "Use outro nome ou edite a disciplina existente.", "err");
      return;
    }
    dados.disciplinas.push({ id, nome: form.nome.trim(), area: form.area, ativa: true });
    setVersao((valor) => valor + 1);
    setModal(null);
    setForm({ nome: "", area: "LIN" });
    avisar("Disciplina criada", `${form.nome.trim()} foi adicionada à área.`, "ok");
  }

  function criarTag(evento) {
    evento.preventDefault();
    if (!novaTag.nome.trim()) {
      avisar("Informe o nome", "O nome da tag é obrigatório.", "err");
      return;
    }
    dados.tags.push({
      id: `t${Date.now().toString(36)}`,
      nome: novaTag.nome.trim(),
      tom: "t-neutro",
      tipo: novaTag.tipo,
    });
    setVersao((valor) => valor + 1);
    setModal(null);
    setNovaTag({ nome: "", tipo: "Participação" });
    avisar("Tag criada", "A classificação já pode ser usada nos registros.", "ok");
  }

  return (
    <LayoutApp papel="admin" ativo="disciplinas">
      <PageHead
        crumbs={[{ label: "Estrutura escolar" }, { label: "Disciplinas e tags" }]}
        title="Disciplinas e tags"
        lead="Organize os componentes curriculares por área e mantenha as classificações pedagógicas."
        actions={
          aba === "disc" ? (
            <button type="button" className="btn btn-primary" onClick={() => setModal("disc")}>
              <Icone nome="plus" /> Nova disciplina
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setModal("tag")}>
              <Icone nome="plus" /> Nova tag
            </button>
          )
        }
      />

      <section className="card" key={versao}>
        <nav className="tabs" aria-label="Disciplinas e tags">
          <button
            type="button"
            aria-current={aba === "disc" ? "page" : undefined}
            onClick={() => setAba("disc")}
          >
            Disciplinas <span className="n">{dados.disciplinas.length}</span>
          </button>
          <button
            type="button"
            aria-current={aba === "tags" ? "page" : undefined}
            onClick={() => setAba("tags")}
          >
            Tags <span className="n">{dados.tags.length}</span>
          </button>
        </nav>

        {aba === "disc" ? (
          <div className="disc-grid" style={{ display: "grid", gap: 16 }}>
            {dados.areas.map((area) => (
              <section className="card tight disc-card" key={area.id}>
                <div className="row-between">
                  <span className="row">
                    <span className="area-dot" style={{ background: area.cor }} />
                    <b>{area.nome}</b>
                  </span>
                  <span className="tag t-neutro">
                    {dados.disciplinas.filter((disciplina) => disciplina.area === area.id).length}
                  </span>
                </div>
                {dados.disciplinas
                  .filter((disciplina) => disciplina.area === area.id)
                  .map((disciplina) => (
                    <div className="row-between list-line" key={disciplina.id}>
                      <span>{disciplina.nome}</span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={disciplina.ativa}
                          onChange={() => alternarDisciplina(disciplina)}
                        />
                        <span className="track" aria-hidden="true" />
                        <span className="sr-only">Disciplina ativa</span>
                      </label>
                    </div>
                  ))}
              </section>
            ))}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tag</th>
                  <th>Tipo</th>
                  <th>Usos em relatórios</th>
                </tr>
              </thead>
              <tbody>
                {dados.tags.map((tag) => (
                  <tr key={tag.id}>
                    <td className="cell-main">
                      <span className={`tag ${tag.tom}`}>{tag.nome}</span>
                    </td>
                    <td data-label="Tipo">{tag.tipo}</td>
                    <td data-label="Usos">
                      <b className="mono">{usoDasTags[tag.id] || 0}</b>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        aberto={modal === "disc"}
        aoFechar={() => setModal(null)}
        titulo="Nova disciplina"
        icone="book"
        tom="ico-blue"
        rodape={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>
              Cancelar
            </button>
            <button type="submit" form="form-disc" className="btn btn-primary">
              <Icone nome="plus" /> Criar disciplina
            </button>
          </>
        }
      >
        <form id="form-disc" className="form-grid" onSubmit={criarDisciplina} noValidate>
          <Campo
            label="Nome"
            valor={form.nome}
            obrigatorio
            className="span-2"
            placeholder="Ex.: Filosofia"
            aoMudar={(valor) => setForm((atual) => ({ ...atual, nome: valor }))}
          />
          <Campo
            label="Área do conhecimento"
            valor={form.area}
            opcoes={dados.areas.map((area) => [area.id, area.nome])}
            aoMudar={(valor) => setForm((atual) => ({ ...atual, area: valor }))}
          />
        </form>
      </Modal>

      <Modal
        aberto={modal === "tag"}
        aoFechar={() => setModal(null)}
        titulo="Nova tag pedagógica"
        texto="Tags classificam observações e não substituem avaliações diagnósticas."
        icone="tag"
        tom="ico-teal"
        rodape={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>
              Cancelar
            </button>
            <button type="submit" form="form-tag" className="btn btn-primary">
              <Icone nome="plus" /> Criar tag
            </button>
          </>
        }
      >
        <form id="form-tag" className="form-grid" onSubmit={criarTag} noValidate>
          <Campo
            label="Nome da tag"
            valor={novaTag.nome}
            obrigatorio
            className="span-2"
            placeholder="Ex.: Colaboração em projetos"
            aoMudar={(valor) => setNovaTag((atual) => ({ ...atual, nome: valor }))}
          />
          <Campo
            label="Tipo"
            valor={novaTag.tipo}
            opcoes={[
              ["Participação", "Participação"],
              ["Desempenho", "Desempenho"],
              ["Habilidade", "Habilidade"],
              ["Atenção pedagógica", "Atenção pedagógica"],
              ["Hábito de estudo", "Hábito de estudo"],
              ["Frequência", "Frequência"],
            ]}
            aoMudar={(valor) => setNovaTag((atual) => ({ ...atual, tipo: valor }))}
          />
        </form>
      </Modal>
    </LayoutApp>
  );
}

/* ============================ VÍNCULOS ============================ */

export function Vinculos() {
  useTitulo("Vínculos");
  const { avisar } = useAviso();
  const [turma, setTurma] = useState("6A");
  const [versao, setVersao] = useState(0);
  const [disc, setDisc] = useState("");
  const [prof, setProf] = useState("");

  const vinculos = dados.vinculos.filter((vinculo) => vinculo.turma === turma);
  const usadas = new Set(vinculos.map((vinculo) => vinculo.disc));
  const disponiveis = dados.disciplinas.filter((disciplina) => disciplina.ativa && !usadas.has(disciplina.id));
  const elegiveis = dados.professores.filter(
    (professor) => professor.ativo && professor.disc.includes(disc),
  );

  function alterarProfessor(vinculo, novoProf) {
    vinculo.prof = novoProf;
    setVersao((valor) => valor + 1);
    avisar("Professor atualizado", `${api.disc(vinculo.disc)?.nome} · ${api.turma(turma)?.nome}`, "ok");
  }

  function remover(vinculo) {
    dados.vinculos.splice(dados.vinculos.indexOf(vinculo), 1);
    setVersao((valor) => valor + 1);
    avisar("Vínculo removido", `${api.disc(vinculo.disc)?.nome} · ${api.turma(turma)?.nome}`, "warn");
  }

  function adicionar(evento) {
    evento.preventDefault();
    if (!disc || !prof) {
      avisar("Selecione disciplina e professor", "Os dois campos são obrigatórios.", "err");
      return;
    }
    if (dados.vinculos.some((vinculo) => vinculo.turma === turma && vinculo.disc === disc)) {
      avisar("Vínculo duplicado", "Esta disciplina já tem professor nesta turma.", "err");
      return;
    }
    const professor = api.prof(prof);
    if (!professor?.disc.includes(disc)) {
      avisar("Professor incompatível", "O professor não leciona esta disciplina.", "err");
      return;
    }
    dados.vinculos.push({ turma, disc, prof });
    setDisc("");
    setProf("");
    setVersao((valor) => valor + 1);
    avisar("Vínculo criado", `${professor.nome} · ${api.disc(disc)?.nome}`, "ok");
  }

  return (
    <LayoutApp papel="admin" ativo="vinculos">
      <PageHead
        crumbs={[{ label: "Estrutura escolar" }, { label: "Vínculos" }]}
        title="Vínculos de professores"
        lead="Defina quem leciona cada disciplina em cada turma."
      />

      <section className="card" key={versao}>
        <div className="segmented" role="tablist" aria-label="Turma">
          {dados.turmas.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={turma === item.id}
              onClick={() => {
                setTurma(item.id);
                setDisc("");
                setProf("");
              }}
            >
              {item.nome}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Disciplina</th>
                <th>Professor responsável</th>
                <th>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {vinculos.map((vinculo) => (
                <tr key={`${vinculo.turma}-${vinculo.disc}`}>
                  <td className="cell-main">
                    <span className="row">
                      <span
                        className="area-dot"
                        style={{ background: api.area(api.disc(vinculo.disc)?.area)?.cor }}
                      />
                      <b>{api.disc(vinculo.disc)?.nome}</b>
                    </span>
                  </td>
                  <td data-label="Professor">
                    <label className="sr-only" htmlFor={`prof-${vinculo.disc}`}>
                      Professor de {api.disc(vinculo.disc)?.nome}
                    </label>
                    <select
                      id={`prof-${vinculo.disc}`}
                      className="select"
                      value={vinculo.prof}
                      onChange={(evento) => alterarProfessor(vinculo, evento.target.value)}
                    >
                      {dados.professores
                        .filter(
                          (professor) =>
                            professor.ativo && professor.disc.includes(vinculo.disc),
                        )
                        .map((professor) => (
                          <option key={professor.id} value={professor.id}>
                            {professor.nome}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => remover(vinculo)}
                    >
                      <Icone nome="x" className="icon-sm" /> Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {disponiveis.length ? (
          <form className="add-vinc" onSubmit={adicionar}>
            <h3 style={{ fontSize: "1rem" }}>Adicionar vínculo em {api.turma(turma)?.nome}</h3>
            <div className="grid-2">
              <div className="field">
                <label className="field-label" htmlFor="v-disc">
                  Disciplina
                </label>
                <select
                  id="v-disc"
                  className="select"
                  value={disc}
                  onChange={(evento) => {
                    setDisc(evento.target.value);
                    setProf("");
                  }}
                >
                  <option value="">Selecione</option>
                  {disponiveis.map((disciplina) => (
                    <option key={disciplina.id} value={disciplina.id}>
                      {disciplina.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="v-prof">
                  Professor
                </label>
                <select
                  id="v-prof"
                  className="select"
                  value={prof}
                  disabled={!disc}
                  onChange={(evento) => setProf(evento.target.value)}
                >
                  <option value="">{disc ? "Selecione" : "Escolha a disciplina primeiro"}</option>
                  {elegiveis.map((professor) => (
                    <option key={professor.id} value={professor.id}>
                      {professor.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <button type="submit" className="btn btn-primary" disabled={!disc || !prof}>
                <Icone nome="link" /> Adicionar vínculo
              </button>
            </div>
          </form>
        ) : (
          <EmptyState
            icone="check-circle"
            titulo="Todas as disciplinas têm professor"
            texto={`A turma ${api.turma(turma)?.nome} está com a grade completa.`}
          />
        )}
      </section>
    </LayoutApp>
  );
}

/* ============================ PERÍODOS ============================ */

const DATA_HORA = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;

function paraData(texto) {
  const partes = DATA_HORA.exec(texto);
  if (!partes) return null;
  const [, dia, mes, ano, hora, minuto] = partes.map(Number);
  const data = new Date(ano, mes - 1, dia, hora, minuto);
  return Number.isNaN(data.getTime()) ? null : data;
}

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function Periodos() {
  useTitulo("Períodos");
  const { avisar } = useAviso();
  const [periodos, setPeriodos] = useState(() => dados.bimestres.map((item) => ({ ...item })));
  const [reabrir, setReabrir] = useState(null);
  const [motivo, setMotivo] = useState("");

  const aberto = periodos.find((periodo) => periodo.status === "aberto");

  function atualizar(indice, campo, valor) {
    setPeriodos((atuais) =>
      atuais.map((periodo, i) => (i === indice ? { ...periodo, [campo]: valor } : periodo)),
    );
  }

  function salvar(evento) {
    evento.preventDefault();
    const invalido = periodos.find((periodo) => !paraData(periodo.ini) || !paraData(periodo.fim));
    if (invalido) {
      avisar(
        "Data inválida",
        `${invalido.n}º bimestre: use o formato dd/mm/aaaa hh:mm.`,
        "err",
      );
      return;
    }
    const foraDeOrdem = periodos.find((periodo) => paraData(periodo.fim) <= paraData(periodo.ini));
    if (foraDeOrdem) {
      avisar(
        "Período inconsistente",
        `${foraDeOrdem.n}º bimestre: o encerramento deve ser depois da abertura.`,
        "err",
      );
      return;
    }
    periodos.forEach((periodo, indice) => {
      Object.assign(dados.bimestres[indice], {
        ini: periodo.ini,
        fim: periodo.fim,
        status: periodo.status,
        rotulo:
          periodo.status === "aberto"
            ? "Digitação aberta"
            : periodo.status === "encerrado"
              ? "Encerrado"
              : "Agendado",
      });
    });
    avisar("Períodos salvos", "As datas do calendário letivo foram atualizadas.", "ok");
  }

  function confirmarReabertura(evento) {
    evento.preventDefault();
    if (!motivo.trim()) {
      avisar("Informe o motivo", "A reabertura precisa de justificativa na auditoria.", "err");
      return;
    }
    setPeriodos((atuais) =>
      atuais.map((periodo) =>
        periodo.n === reabrir.n ? { ...periodo, status: "aberto" } : periodo,
      ),
    );
    avisar(
      "Período reaberto",
      `${reabrir.n}º bimestre · motivo registrado: ${motivo.trim()}`,
      "warn",
    );
    setReabrir(null);
    setMotivo("");
  }

  return (
    <LayoutApp papel="admin" ativo="periodos">
      <PageHead
        crumbs={[{ label: "Estrutura escolar" }, { label: "Períodos" }]}
        title="Períodos de avaliação"
        lead="Abra e encerre os bimestres. Ao reabrir, a justificativa fica registrada na auditoria."
      />

      <section className="card stack">
        <div className="row-between">
          <div>
            <h2 style={{ fontSize: "1.125rem" }}>Calendário letivo 2026</h2>
            <p className="muted" style={{ fontSize: "0.875rem" }}>
              {aberto ? `${aberto.n}º bimestre aberto para digitação` : "Nenhum bimestre aberto"}
            </p>
          </div>
          <span className="tag t-verde">
            <Icone nome="calendar" /> Aurora 2026
          </span>
        </div>
        <div
          className="year-line"
          aria-hidden="true"
          style={{ height: 18 }}
        >
          {periodos.map((periodo, indice) => (
            <span
              key={periodo.n}
              style={{
                flex: 1,
                background:
                  periodo.status === "aberto"
                    ? "var(--teal)"
                    : periodo.status === "encerrado"
                      ? "var(--success-bg)"
                      : "var(--line-strong)",
              }}
              title={`${periodo.n}º bimestre`}
            />
          ))}
        </div>
        <div className="months">
          {MESES.map((mes) => (
            <span key={mes}>{mes}</span>
          ))}
        </div>
      </section>

      <div className="grid-2">
        {periodos.map((periodo, indice) => (
          <form
            className={`card stack period-open-${periodo.status === "aberto"}`}
            key={periodo.n}
            style={
              periodo.status === "aberto"
                ? { border: "2px solid var(--teal)", boxShadow: "0 0 0 4px var(--teal-soft)" }
                : undefined
            }
            onSubmit={(evento) => {
              evento.preventDefault();
              salvar(evento);
            }}
          >
            <div className="row-between">
              <h2 style={{ fontSize: "1.125rem" }}>{periodo.n}º bimestre</h2>
              <span
                className={`status ${
                  periodo.status === "aberto"
                    ? "publicado"
                    : periodo.status === "agendado"
                      ? "pendente"
                      : "rascunho"
                }`}
              >
                <Icone
                  nome={
                    periodo.status === "aberto"
                      ? "check-circle"
                      : periodo.status === "agendado"
                        ? "clock"
                        : "lock"
                  }
                />
                {periodo.status === "aberto"
                  ? "Digitação aberta"
                  : periodo.status === "agendado"
                    ? "Agendado"
                    : "Encerrado"}
              </span>
            </div>
            <div className="form-grid">
              <Campo
                label="Abertura"
                valor={periodo.ini}
                icone="calendar"
                aoMudar={(valor) => atualizar(indice, "ini", valor)}
              />
              <Campo
                label="Encerramento"
                valor={periodo.fim}
                icone="calendar"
                aoMudar={(valor) => atualizar(indice, "fim", valor)}
              />
            </div>
            <div className="form-actions">
              {periodo.status === "encerrado" ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setReabrir(periodo);
                    setMotivo("");
                  }}
                >
                  <Icone nome="refresh" /> Reabrir período
                </button>
              ) : (
                <button type="submit" className="btn btn-primary">
                  <Icone nome="save" /> Salvar datas
                </button>
              )}
            </div>
          </form>
        ))}
      </div>

      <Modal
        aberto={Boolean(reabrir)}
        aoFechar={() => setReabrir(null)}
        titulo={`Reabrir o ${reabrir?.n || ""}º bimestre`}
        texto="A reabertura permite novos envios e fica registrada com autor e motivo."
        icone="alert"
        tom="ico-warn"
        rodape={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setReabrir(null)}>
              Cancelar
            </button>
            <button type="submit" form="form-reabrir" className="btn btn-primary">
              <Icone nome="refresh" /> Reabrir período
            </button>
          </>
        }
      >
        <form id="form-reabrir" className="stack" onSubmit={confirmarReabertura} noValidate>
          <Campo
            label="Motivo da reabertura"
            valor={motivo}
            obrigatorio
            dica="Obrigatório para a auditoria da escola."
            aoMudar={setMotivo}
          />
        </form>
      </Modal>
    </LayoutApp>
  );
}
