import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
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

function AbasCadastro({ ativa }) {
  const itens = [
    ["alunos", "Alunos", dados.alunos.length],
    ["professores", "Professores", dados.professores.length],
    ["responsaveis", "Responsáveis", dados.responsaveis.length],
  ];
  return (
    <nav className="tabs" aria-label="Cadastros">
      {itens.map(([chave, rotulo, total]) => (
        <Link key={chave} to={`/admin/${chave}`} aria-current={ativa === chave ? "page" : undefined}>
          {rotulo}
          <span className="n">{total}</span>
        </Link>
      ))}
    </nav>
  );
}

function CabecalhoLista({ titulo, lead, children }) {
  return (
    <PageHead
      crumbs={[{ label: "Estrutura escolar" }, { label: titulo }]}
      title={titulo}
      lead={lead}
      actions={children}
    />
  );
}

/* ============================ ALUNOS ============================ */

export function Alunos() {
  useTitulo("Alunos");
  const { avisar } = useAviso();
  const [params] = useSearchParams();
  const [versao, setVersao] = useState(0);
  const [q, setQ] = useState(params.get("q") || "");
  const [turma, setTurma] = useState("");
  const [situacao, setSituacao] = useState("");
  const [importar, setImportar] = useState(false);

  useEffect(() => setQ(params.get("q") || ""), [params]);

  const lista = useMemo(
    () =>
      dados.alunos.filter(
        (aluno) =>
          (!q ||
            aluno.nome.toLowerCase().includes(q.toLowerCase()) ||
            aluno.ra.includes(q)) &&
          (!turma || aluno.turma === turma) &&
          (situacao === "" || String(Number(aluno.ativo)) === situacao),
      ),
    [q, turma, situacao, versao],
  );

  function alternarAtivo(aluno, ativo) {
    aluno.ativo = ativo;
    setVersao((valor) => valor + 1);
    avisar(
      `${aluno.nome} ${ativo ? "ativado" : "inativado"}`,
      "Alteração registrada na auditoria (simulação).",
      ativo ? "ok" : "warn",
    );
  }

  function limpar() {
    setQ("");
    setTurma("");
    setSituacao("");
  }

  return (
    <LayoutApp papel="admin" ativo="alunos">
      <CabecalhoLista
        titulo="Alunos"
        lead="Cadastre, edite, ative ou inative alunos e mantenha os vínculos com responsáveis."
      >
        <button type="button" className="btn btn-secondary" onClick={() => setImportar(true)}>
          <Icone nome="upload" /> Importar planilha
        </button>
        <Link className="btn btn-primary" to="/admin/alunos/novo">
          <Icone nome="plus" /> Novo aluno
        </Link>
      </CabecalhoLista>

      <section className="card">
        <AbasCadastro ativa="alunos" />
        <div className="toolbar" role="search">
          <div className="search">
            <label className="sr-only" htmlFor="f-q">
              Buscar alunos
            </label>
            <Icone nome="search" />
            <input
              id="f-q"
              className="input"
              type="search"
              value={q}
              onChange={(evento) => setQ(evento.target.value)}
              placeholder="Buscar por nome ou RA"
            />
          </div>
          <label className="sr-only" htmlFor="f-turma">
            Turma
          </label>
          <select
            id="f-turma"
            className="select"
            style={{ width: "auto" }}
            value={turma}
            onChange={(evento) => setTurma(evento.target.value)}
          >
            <option value="">Todas as turmas</option>
            {dados.turmas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="f-sit">
            Situação
          </label>
          <select
            id="f-sit"
            className="select"
            style={{ width: "auto" }}
            value={situacao}
            onChange={(evento) => setSituacao(evento.target.value)}
          >
            <option value="">Todas as situações</option>
            <option value="1">Ativos</option>
            <option value="0">Inativos</option>
          </select>
        </div>

        {lista.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Turma</th>
                  <th>Responsáveis</th>
                  <th>Situação</th>
                  <th>
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {lista.map((aluno) => {
                  const responsaveis = api.respDoAluno(aluno.id);
                  return (
                    <tr key={aluno.id}>
                      <td className="cell-main">
                        <div className="cell-person">
                          <Avatar nome={aluno.nome} cor={aluno.cor} tamanho="sm" />
                          <span>
                            <b>{aluno.nome}</b>
                            <small className="mono">RA {aluno.ra}</small>
                          </span>
                        </div>
                      </td>
                      <td data-label="Turma">
                        <Link to={`/admin/turmas/${aluno.turma}`}>
                          {api.turma(aluno.turma)?.nome}
                        </Link>
                      </td>
                      <td data-label="Responsáveis">
                        {responsaveis.length ? (
                          <>
                            <span
                              className="avatar-stack"
                              title={responsaveis.map((item) => item.nome).join(", ")}
                            >
                              {responsaveis.map((item) => (
                                <Avatar key={item.id} nome={item.nome} cor="#C9E7F5" tamanho="sm" />
                              ))}
                            </span>
                            <span className="sr-only">
                              {responsaveis.map((item) => item.nome).join(", ")}
                            </span>
                          </>
                        ) : (
                          <span className="status nao-lido">Sem responsável</span>
                        )}
                      </td>
                      <td data-label="Situação">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={aluno.ativo}
                            onChange={(evento) => alternarAtivo(aluno, evento.target.checked)}
                          />
                          <span className="track" aria-hidden="true" />
                          <span>{aluno.ativo ? "Ativo" : "Inativo"}</span>
                        </label>
                      </td>
                      <td className="actions">
                        <Link className="btn btn-ghost btn-sm" to={`/admin/alunos/${aluno.id}/editar`}>
                          <Icone nome="edit" className="icon-sm" /> Editar
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
            icone="search"
            titulo="Nenhum aluno encontrado"
            texto="Revise o termo de busca ou limpe os filtros para ver todos os alunos."
            acoes={
              <button type="button" className="btn btn-secondary" onClick={limpar}>
                Limpar filtros
              </button>
            }
          />
        )}
      </section>

      <Modal
        aberto={importar}
        aoFechar={() => setImportar(false)}
        titulo="Importar alunos por planilha"
        texto="Interface demonstrativa — nenhum arquivo é processado."
        icone="upload"
        tom="ico-ok"
        rodape={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setImportar(false)}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setImportar(false);
                avisar(
                  "Importação simulada concluída",
                  "482 registros seriam criados; 4 linhas com erro ignoradas.",
                  "ok",
                );
              }}
            >
              <Icone nome="upload" /> Importar 482 registros
            </button>
          </>
        }
      >
        <div className="dropzone">
          <Icone nome="upload" className="icon-lg" />
          <b>Arraste o arquivo aqui ou clique para escolher</b>
          <small>.xlsx ou .csv · até 5 MB</small>
        </div>
        <div className="alert neutral">
          <Icone nome="sheet" />
          <div>
            <b>alunos_6ano_2026.xlsx · 486 linhas</b>
            482 válidas · 4 com erro (turma inexistente ou RA duplicado)
          </div>
        </div>
      </Modal>
    </LayoutApp>
  );
}

export function AlunoForm() {
  useTitulo("Aluno");
  const { id } = useParams();
  const navegar = useNavigate();
  const { avisar } = useAviso();
  const aluno = id ? api.aluno(id) : null;
  const [versao, setVersao] = useState(0);
  const [form, setForm] = useState(() => ({
    nome: aluno?.nome || "",
    nasc: aluno?.nasc || "",
    ra: aluno?.ra || `2026-0${400 + dados.alunos.length}`,
    turma: aluno?.turma || "",
    ativo: aluno?.ativo ?? true,
    consentimento: Boolean(aluno),
  }));
  const [respIds, setRespIds] = useState(() => (aluno ? api.respDoAluno(aluno.id).map((r) => r.id) : []));
  const [selecionado, setSelecionado] = useState("");
  const [erros, setErros] = useState({});

  if (id && !aluno) return <Navigate to="/admin/alunos" replace />;

  function atualizar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: "" }));
  }

  function vincular() {
    if (!selecionado) return;
    setRespIds((atuais) => (atuais.includes(selecionado) ? atuais : [...atuais, selecionado]));
    setSelecionado("");
    setVersao((valor) => valor + 1);
  }

  function remover(idResp) {
    setRespIds((atuais) => atuais.filter((item) => item !== idResp));
    setVersao((valor) => valor + 1);
  }

  function salvar(evento) {
    evento.preventDefault();
    const novosErros = {};
    if (!form.nome.trim()) novosErros.nome = "Informe o nome completo.";
    if (!form.nasc.trim()) novosErros.nasc = "Informe a data de nascimento.";
    if (!form.turma) novosErros.turma = "Selecione a turma.";
    setErros(novosErros);
    if (Object.keys(novosErros).length) {
      avisar("Revise os campos destacados", "Há informações obrigatórias faltando.", "err");
      return;
    }

    let registro = aluno;
    if (!registro) {
      registro = {
        id: `a${Date.now()}`,
        nome: form.nome.trim(),
        ra: form.ra,
        turma: form.turma,
        nasc: form.nasc,
        ativo: form.ativo,
        cor: "#9FE3D0",
      };
      dados.alunos.push(registro);
      dados.auditoria.unshift({
        quando: "agora",
        quem: "Marina Rocha",
        acao: "Criou aluno",
        registro: `${registro.nome} · ${api.turma(registro.turma)?.nome}`,
        de: "—",
        para: "Ativo",
      });
    } else {
      Object.assign(registro, {
        nome: form.nome.trim(),
        nasc: form.nasc,
        turma: form.turma,
        ativo: form.ativo,
      });
    }

    dados.responsaveis.forEach((responsavel) => {
      const tinha = responsavel.alunos.includes(registro.id);
      const deveTer = respIds.includes(responsavel.id);
      if (deveTer && !tinha) responsavel.alunos.push(registro.id);
      if (!deveTer && tinha) responsavel.alunos = responsavel.alunos.filter((x) => x !== registro.id);
    });

    avisar(
      aluno ? "Aluno atualizado" : "Aluno cadastrado",
      "Os dados foram salvos nesta sessão do navegador.",
      "ok",
    );
    navegar("/admin/alunos");
  }

  function inativar() {
    if (!aluno) return;
    aluno.ativo = false;
    avisar("Aluno inativado", "Relatórios já publicados continuam no histórico.", "warn");
    navegar("/admin/alunos");
  }

  const responsaveis = respIds.map((idResp) => api.resp(idResp)).filter(Boolean);

  return (
    <LayoutApp papel="admin" ativo="alunos">
      <PageHead
        crumbs={[{ label: "Alunos", to: "/admin/alunos" }, { label: aluno ? aluno.nome : "Novo aluno" }]}
        title={aluno ? "Editar aluno" : "Novo aluno"}
        lead="Campos com * são obrigatórios."
      />

      <form className="card stack-lg" style={{ maxWidth: 880 }} onSubmit={salvar} noValidate>
        <section className="form-section">
          <header>
            <h3>Dados pessoais</h3>
            <p>Informações básicas de identificação.</p>
          </header>
          <div className="form-grid">
            <Campo
              label="Nome completo"
              valor={form.nome}
              obrigatorio
              className="span-2"
              erro={erros.nome}
              aoMudar={(valor) => atualizar("nome", valor)}
            />
            <Campo
              label="Data de nascimento"
              valor={form.nasc}
              obrigatorio
              placeholder="dd/mm/aaaa"
              icone="calendar"
              erro={erros.nasc}
              aoMudar={(valor) => atualizar("nasc", valor)}
            />
            <Campo label="RA (registro do aluno)" valor={form.ra} disabled dica="Gerado automaticamente." />
          </div>
        </section>

        <section className="form-section">
          <header>
            <h3>Matrícula</h3>
            <p>Turma do ano letivo de 2026.</p>
          </header>
          <div className="form-grid">
            <Campo
              label="Turma"
              valor={form.turma}
              obrigatorio
              opcoes={[["", "Selecione"], ...dados.turmas.map((item) => [item.id, item.nome])]}
              erro={erros.turma}
              aoMudar={(valor) => atualizar("turma", valor)}
            />
            <div className="field">
              <span className="field-label">Situação</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(evento) => atualizar("ativo", evento.target.checked)}
                />
                <span className="track" aria-hidden="true" />
                <span>Aluno ativo</span>
              </label>
            </div>
          </div>
        </section>

        <section className="form-section">
          <header>
            <h3>Responsáveis autorizados</h3>
            <p>Somente responsáveis vinculados poderão ver os relatórios publicados deste aluno.</p>
          </header>
          <div className="tag-group" key={versao}>
            {responsaveis.length ? (
              responsaveis.map((responsavel) => (
                <span className="pill-person" key={responsavel.id}>
                  <Avatar nome={responsavel.nome} cor="#C9E7F5" tamanho="sm" />
                  {responsavel.nome} · {responsavel.parentesco}
                  <button
                    type="button"
                    aria-label={`Remover vínculo com ${responsavel.nome}`}
                    onClick={() => remover(responsavel.id)}
                  >
                    <Icone nome="x" className="icon-sm" />
                  </button>
                </span>
              ))
            ) : (
              <span className="muted">Nenhum responsável vinculado ainda.</span>
            )}
          </div>
          <div className="row">
            <label className="sr-only" htmlFor="add-resp">
              Adicionar responsável
            </label>
            <select
              id="add-resp"
              className="select"
              style={{ maxWidth: 340 }}
              value={selecionado}
              onChange={(evento) => setSelecionado(evento.target.value)}
            >
              <option value="">Selecione um responsável cadastrado</option>
              {dados.responsaveis.map((responsavel) => (
                <option key={responsavel.id} value={responsavel.id}>
                  {responsavel.nome} ({responsavel.email})
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-secondary" onClick={vincular}>
              <Icone nome="plus" /> Vincular
            </button>
            <Link className="btn btn-ghost" to="/admin/responsaveis/novo">
              Cadastrar novo responsável
            </Link>
          </div>
        </section>

        <section className="form-section">
          <header>
            <h3>Privacidade (LGPD)</h3>
          </header>
          <label className="check">
            <input
              type="checkbox"
              checked={form.consentimento}
              onChange={(evento) => atualizar("consentimento", evento.target.checked)}
            />
            Termo de consentimento assinado pelo responsável
          </label>
        </section>

        <div className="form-actions">
          {aluno && (
            <button type="button" className="btn btn-danger spacer" onClick={inativar}>
              <Icone nome="power" /> Inativar aluno
            </button>
          )}
          <Link className="btn btn-secondary" to="/admin/alunos">
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary">
            <Icone nome="check" /> Salvar aluno
          </button>
        </div>
      </form>
    </LayoutApp>
  );
}

/* ============================ PROFESSORES ============================ */

export function Professores() {
  useTitulo("Professores");
  return (
    <LayoutApp papel="admin" ativo="professores">
      <CabecalhoLista
        titulo="Professores"
        lead="Cadastre professores e veja em quais turmas e disciplinas cada um está vinculado."
      >
        <Link className="btn btn-primary" to="/admin/professores/novo">
          <Icone nome="plus" /> Novo professor
        </Link>
      </CabecalhoLista>

      <section className="card">
        <AbasCadastro ativa="professores" />
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Professor</th>
                <th>Disciplinas</th>
                <th>Turmas</th>
                <th>Situação</th>
                <th>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {dados.professores.map((professor) => {
                const vinculos = api.vinculosDoProf(professor.id);
                const turmas = [...new Set(vinculos.map((item) => api.turma(item.turma).nome))];
                return (
                  <tr key={professor.id}>
                    <td className="cell-main">
                      <div className="cell-person">
                        <Avatar nome={professor.nome} cor={professor.cor} tamanho="sm" />
                        <span>
                          <b>{professor.nome}</b>
                          <small>{professor.email}</small>
                        </span>
                      </div>
                    </td>
                    <td data-label="Disciplinas">
                      <span className="tag-group">
                        {professor.disc.map((idDisc) => (
                          <span className="tag t-neutro" key={idDisc}>
                            {api.disc(idDisc)?.nome || idDisc}
                          </span>
                        ))}
                      </span>
                    </td>
                    <td data-label="Turmas">
                      {turmas.join(", ") || <span className="muted">Sem vínculo</span>}
                    </td>
                    <td data-label="Situação">
                      {professor.ativo ? (
                        <span className="status publicado">
                          <Icone nome="check" /> Ativo
                        </span>
                      ) : (
                        <span className="status cancelado">
                          <Icone nome="ban" /> Inativo
                        </span>
                      )}
                    </td>
                    <td className="actions">
                      <Link
                        className="btn btn-ghost btn-sm"
                        to={`/admin/professores/${professor.id}/editar`}
                      >
                        <Icone nome="edit" className="icon-sm" /> Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </LayoutApp>
  );
}

export function ProfessorForm() {
  useTitulo("Professor");
  const { id } = useParams();
  const navegar = useNavigate();
  const { avisar } = useAviso();
  const professor = id ? api.prof(id) : null;
  const [form, setForm] = useState(() => ({
    nome: professor?.nome || "",
    email: professor?.email || "",
    tel: professor?.tel || "",
    disc: professor?.disc || [],
    ativo: professor?.ativo ?? true,
  }));
  const [erros, setErros] = useState({});

  if (id && !professor) return <Navigate to="/admin/professores" replace />;

  const vinculos = professor ? api.vinculosDoProf(professor.id) : [];

  function alternarDisciplina(idDisc) {
    setForm((atual) => ({
      ...atual,
      disc: atual.disc.includes(idDisc)
        ? atual.disc.filter((item) => item !== idDisc)
        : [...atual.disc, idDisc],
    }));
  }

  function salvar(evento) {
    evento.preventDefault();
    const novosErros = {};
    if (!form.nome.trim()) novosErros.nome = "Informe o nome completo.";
    if (!form.email.includes("@")) novosErros.email = "Informe um e-mail válido.";
    if (!form.disc.length) novosErros.disc = "Selecione ao menos uma disciplina.";
    setErros(novosErros);
    if (Object.keys(novosErros).length) {
      avisar("Revise os campos destacados", "Há informações obrigatórias faltando.", "err");
      return;
    }

    if (professor) {
      Object.assign(professor, form);
    } else {
      dados.professores.push({
        id: `p${Date.now()}`,
        nome: form.nome.trim(),
        email: form.email.trim(),
        tel: form.tel,
        disc: form.disc,
        ativo: form.ativo,
        cor: "#74C0FC",
      });
    }
    avisar("Professor salvo", "Os dados foram salvos nesta sessão.", "ok");
    navegar("/admin/professores");
  }

  return (
    <LayoutApp papel="admin" ativo="professores">
      <PageHead
        crumbs={[
          { label: "Professores", to: "/admin/professores" },
          { label: professor ? professor.nome : "Novo professor" },
        ]}
        title={professor ? "Editar professor" : "Novo professor"}
        lead="Campos com * são obrigatórios."
      />
      <div className="grid-main-side">
        <form className="card stack-lg" onSubmit={salvar} noValidate>
          <section className="form-section">
            <header>
              <h3>Identificação</h3>
            </header>
            <div className="form-grid">
              <Campo
                label="Nome completo"
                valor={form.nome}
                obrigatorio
                className="span-2"
                erro={erros.nome}
                aoMudar={(valor) => setForm((atual) => ({ ...atual, nome: valor }))}
              />
              <Campo
                label="E-mail institucional"
                tipo="email"
                valor={form.email}
                obrigatorio
                icone="mail"
                dica="Usado para login e recuperação de senha."
                erro={erros.email}
                aoMudar={(valor) => setForm((atual) => ({ ...atual, email: valor }))}
              />
              <Campo
                label="Telefone"
                valor={form.tel}
                placeholder="(11) 90000-0000"
                aoMudar={(valor) => setForm((atual) => ({ ...atual, tel: valor }))}
              />
            </div>
          </section>

          <section className="form-section">
            <header>
              <h3>Disciplinas que leciona</h3>
              <p>Selecione uma ou mais.</p>
            </header>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="sr-only">Disciplinas</legend>
              <div className="tag-picker">
                {dados.disciplinas.map((disciplina) => (
                  <label className="tag-option" key={disciplina.id}>
                    <input
                      type="checkbox"
                      checked={form.disc.includes(disciplina.id)}
                      onChange={() => alternarDisciplina(disciplina.id)}
                    />
                    <span>{disciplina.nome}</span>
                  </label>
                ))}
              </div>
              {erros.disc && <span className="error-msg">{erros.disc}</span>}
            </fieldset>
          </section>

          <section className="form-section">
            <header>
              <h3>Acesso</h3>
            </header>
            <label className="switch">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(evento) => setForm((atual) => ({ ...atual, ativo: evento.target.checked }))}
              />
              <span className="track" aria-hidden="true" />
              <span>Professor ativo</span>
            </label>
            {!professor && (
              <div className="alert info">
                <Icone nome="mail" />
                <div>Ao salvar, um convite de primeiro acesso seria enviado ao e-mail informado (simulação).</div>
              </div>
            )}
          </section>

          <div className="form-actions">
            <Link className="btn btn-secondary" to="/admin/professores">
              Cancelar
            </Link>
            <button className="btn btn-primary" type="submit">
              <Icone nome="check" /> Salvar professor
            </button>
          </div>
        </form>

        <aside className="card">
          <h2 style={{ fontSize: "1.125rem" }}>Vínculos atuais</h2>
          {vinculos.length ? (
            <ul className="stack-sm" style={{ listStyle: "none" }}>
              {vinculos.map((vinculo) => (
                <li className="row-between" key={`${vinculo.turma}-${vinculo.disc}`}>
                  <span>
                    <b>{api.turma(vinculo.turma)?.nome}</b> · {api.disc(vinculo.disc)?.nome}
                  </span>
                  <Link className="btn btn-ghost btn-sm" to={`/admin/turmas/${vinculo.turma}`}>
                    Ver
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Sem vínculos. Use a tela de vínculos para associar turmas e disciplinas.</p>
          )}
          <Link className="btn btn-secondary" to="/admin/vinculos">
            <Icone nome="link" /> Gerenciar vínculos
          </Link>
        </aside>
      </div>
    </LayoutApp>
  );
}

/* ============================ RESPONSÁVEIS ============================ */

export function Responsaveis() {
  useTitulo("Responsáveis");
  return (
    <LayoutApp papel="admin" ativo="responsaveis">
      <CabecalhoLista
        titulo="Responsáveis e vínculos familiares"
        lead="Um responsável pode estar vinculado a mais de um aluno, e um aluno pode ter mais de um responsável."
      >
        <Link className="btn btn-primary" to="/admin/responsaveis/novo">
          <Icone nome="plus" /> Novo responsável
        </Link>
      </CabecalhoLista>

      <section className="card">
        <AbasCadastro ativa="responsaveis" />
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Responsável</th>
                <th>Alunos vinculados</th>
                <th>Parentesco</th>
                <th>Consentimento LGPD</th>
                <th>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {dados.responsaveis.map((responsavel) => (
                <tr key={responsavel.id}>
                  <td className="cell-main">
                    <div className="cell-person">
                      <Avatar nome={responsavel.nome} cor="#C9E7F5" tamanho="sm" />
                      <span>
                        <b>{responsavel.nome}</b>
                        <small>{responsavel.email}</small>
                      </span>
                    </div>
                  </td>
                  <td data-label="Alunos">
                    <span className="tag-group">
                      {responsavel.alunos.map((idAluno) => {
                        const aluno = api.aluno(idAluno);
                        if (!aluno) return null;
                        return (
                          <span className="tag t-azul" key={idAluno}>
                            {aluno.nome} · {api.turma(aluno.turma)?.nome}
                          </span>
                        );
                      })}
                    </span>
                  </td>
                  <td data-label="Parentesco">{responsavel.parentesco}</td>
                  <td data-label="LGPD">
                    {responsavel.consentimento !== "—" ? (
                      <span className="status publicado">
                        <Icone nome="check" />
                        Registrado {responsavel.consentimento}
                      </span>
                    ) : (
                      <span className="status nao-lido">
                        <Icone nome="alert" />
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="actions">
                    <Link
                      className="btn btn-ghost btn-sm"
                      to={`/admin/responsaveis/${responsavel.id}/editar`}
                    >
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

export function ResponsavelForm() {
  useTitulo("Responsável");
  const { id } = useParams();
  const navegar = useNavigate();
  const { avisar } = useAviso();
  const responsavel = id ? api.resp(id) : null;
  const [form, setForm] = useState(() => ({
    nome: responsavel?.nome || "",
    email: responsavel?.email || "",
    tel: responsavel?.tel || "",
    parentesco: responsavel?.parentesco || "",
    alunos: responsavel?.alunos || [],
    consentimento: responsavel?.consentimento && responsavel.consentimento !== "—",
  }));
  const [erros, setErros] = useState({});

  if (id && !responsavel) return <Navigate to="/admin/responsaveis" replace />;

  function alternarAluno(idAluno) {
    setForm((atual) => ({
      ...atual,
      alunos: atual.alunos.includes(idAluno)
        ? atual.alunos.filter((item) => item !== idAluno)
        : [...atual.alunos, idAluno],
    }));
  }

  function salvar(evento) {
    evento.preventDefault();
    const novosErros = {};
    if (!form.nome.trim()) novosErros.nome = "Informe o nome completo.";
    if (!form.email.includes("@")) novosErros.email = "Informe um e-mail válido.";
    if (!form.parentesco) novosErros.parentesco = "Selecione o parentesco.";
    setErros(novosErros);
    if (Object.keys(novosErros).length) {
      avisar("Revise os campos destacados", "Há informações obrigatórias faltando.", "err");
      return;
    }

    if (responsavel) {
      Object.assign(responsavel, {
        nome: form.nome.trim(),
        email: form.email.trim(),
        tel: form.tel,
        parentesco: form.parentesco,
        alunos: form.alunos,
        consentimento: form.consentimento ? "02/02/2026" : "—",
      });
    } else {
      dados.responsaveis.push({
        id: `r${Date.now()}`,
        nome: form.nome.trim(),
        email: form.email.trim(),
        tel: form.tel,
        parentesco: form.parentesco,
        alunos: form.alunos,
        consentimento: form.consentimento ? "02/02/2026" : "—",
        ativo: true,
      });
    }
    avisar("Responsável salvo", "Vínculos atualizados nesta sessão.", "ok");
    navegar("/admin/responsaveis");
  }

  return (
    <LayoutApp papel="admin" ativo="responsaveis">
      <PageHead
        crumbs={[
          { label: "Responsáveis", to: "/admin/responsaveis" },
          { label: responsavel ? responsavel.nome : "Novo responsável" },
        ]}
        title={responsavel ? "Editar responsável" : "Novo responsável"}
        lead="O vínculo com o aluno define o que a família pode acompanhar."
      />
      <form className="card stack-lg" style={{ maxWidth: 880 }} onSubmit={salvar} noValidate>
        <section className="form-section">
          <header>
            <h3>Contato</h3>
          </header>
          <div className="form-grid">
            <Campo
              label="Nome completo"
              valor={form.nome}
              obrigatorio
              className="span-2"
              erro={erros.nome}
              aoMudar={(valor) => setForm((atual) => ({ ...atual, nome: valor }))}
            />
            <Campo
              label="E-mail"
              tipo="email"
              valor={form.email}
              obrigatorio
              icone="mail"
              erro={erros.email}
              aoMudar={(valor) => setForm((atual) => ({ ...atual, email: valor }))}
            />
            <Campo
              label="Telefone"
              valor={form.tel}
              aoMudar={(valor) => setForm((atual) => ({ ...atual, tel: valor }))}
            />
          </div>
        </section>

        <section className="form-section">
          <header>
            <h3>Alunos vinculados</h3>
            <p>Marque os alunos que este responsável pode acompanhar e informe o parentesco.</p>
          </header>
          <div className="vinc-list">
            {dados.alunos.map((aluno) => (
              <label className="vinc-item" key={aluno.id}>
                <input
                  type="checkbox"
                  checked={form.alunos.includes(aluno.id)}
                  onChange={() => alternarAluno(aluno.id)}
                />
                <Avatar nome={aluno.nome} cor={aluno.cor} tamanho="sm" />
                <span className="grow">
                  <b>{aluno.nome}</b>
                  <small>
                    {api.turma(aluno.turma)?.nome} · RA {aluno.ra}
                  </small>
                </span>
              </label>
            ))}
          </div>
          <div className="form-grid">
            <Campo
              label="Parentesco"
              valor={form.parentesco}
              obrigatorio
              opcoes={[
                ["", "Selecione"],
                "Mãe",
                "Pai",
                "Avó",
                "Avô",
                "Tia",
                "Tio",
                "Responsável legal",
              ]}
              erro={erros.parentesco}
              aoMudar={(valor) => setForm((atual) => ({ ...atual, parentesco: valor }))}
            />
          </div>
          <label className="check">
            <input
              type="checkbox"
              checked={form.consentimento}
              onChange={(evento) =>
                setForm((atual) => ({ ...atual, consentimento: evento.target.checked }))
              }
            />
            Consentimento LGPD registrado
          </label>
        </section>

        <div className="form-actions">
          <Link className="btn btn-secondary" to="/admin/responsaveis">
            Cancelar
          </Link>
          <button className="btn btn-primary" type="submit">
            <Icone nome="check" /> Salvar responsável
          </button>
        </div>
      </form>
    </LayoutApp>
  );
}
