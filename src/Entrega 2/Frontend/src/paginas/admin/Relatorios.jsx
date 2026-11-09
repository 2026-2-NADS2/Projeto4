import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Avatar from "../../componentes/Avatar.jsx";
import EmptyState from "../../componentes/EmptyState.jsx";
import Icone from "../../componentes/Icone.jsx";
import LayoutApp from "../../componentes/LayoutApp.jsx";
import Modal from "../../componentes/Modal.jsx";
import PageHead from "../../componentes/PageHead.jsx";
import Pagination from "../../componentes/Pagination.jsx";
import StatusBadge from "../../componentes/StatusBadge.jsx";
import { useAviso } from "../../contextos/AvisoContexto.jsx";
import { api, dados } from "../../dados/dados.js";
import { STATUS } from "../../dados/status.js";
import { baixarArquivo, gerarCsv, gerarXlsx } from "../../utilitarios/arquivos.js";
import { fmtMedia } from "../../utilitarios/formatadores.js";
import { useTitulo } from "../../utilitarios/useTitulo.js";

const POR_PAGINA = 12;

const COLUNAS = [
  { chave: "aluno", rotulo: "Aluno" },
  { chave: "turma", rotulo: "Turma" },
  { chave: "disciplina", rotulo: "Disciplina" },
  { chave: "professor", rotulo: "Professor" },
  { chave: "ano", rotulo: "Ano letivo", tipo: "numero" },
  { chave: "bimestre", rotulo: "Bimestre", tipo: "numero" },
  { chave: "media", rotulo: "Média", tipo: "numero" },
  { chave: "status", rotulo: "Status" },
  { chave: "tags", rotulo: "Tags" },
  { chave: "descricao", rotulo: "Observações do professor" },
];

export default function Relatorios() {
  useTitulo("Relatórios gerenciais");
  const { avisar } = useAviso();
  const [params] = useSearchParams();
  const [filtros, setFiltros] = useState({
    turma: params.get("turma") || "",
    disc: params.get("disc") || "",
    prof: params.get("prof") || "",
    bim: params.get("bim") || "",
    aluno: params.get("aluno") || "",
    status: params.get("status") || "",
  });
  const [tags, setTags] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [exportar, setExportar] = useState(false);
  const [formato, setFormato] = useState("xlsx");

  const lista = useMemo(
    () =>
      dados.relatorios.filter(
        (relatorio) =>
          Object.entries(filtros).every(
            ([chave, valor]) => !valor || String(relatorio[chave]) === String(valor),
          ) && (!tags.length || relatorio.tags.some((tag) => tags.includes(tag))),
      ),
    [filtros, tags],
  );

  const comMedia = lista.filter((relatorio) => relatorio.media != null);
  const media = comMedia.length
    ? comMedia.reduce((soma, relatorio) => soma + relatorio.media, 0) / comMedia.length
    : null;
  const publicados = lista.filter((relatorio) => relatorio.status === "publicado");
  const lidos = publicados.filter((relatorio) => relatorio.lido).length;

  const porDisciplina = dados.disciplinas
    .map((disciplina) => {
      const registros = comMedia.filter((relatorio) => relatorio.disc === disciplina.id);
      return [
        disciplina,
        registros.length
          ? registros.reduce((soma, relatorio) => soma + relatorio.media, 0) / registros.length
          : null,
      ];
    })
    .filter(([, valor]) => valor != null);

  const tagsUsadas = dados.tags
    .map((tag) => [tag, lista.filter((relatorio) => relatorio.tags.includes(tag.id)).length])
    .filter(([, total]) => total > 0)
    .sort((a, b) => b[1] - a[1]);
  const maxTag = tagsUsadas.length ? tagsUsadas[0][1] : 1;

  const rotulos = {
    turma: (valor) => api.turma(valor)?.nome,
    disc: (valor) => api.disc(valor)?.nome,
    prof: (valor) => api.prof(valor)?.nome,
    bim: (valor) => `${valor}º bim`,
    aluno: (valor) => api.aluno(valor)?.nome,
    status: (valor) => STATUS[valor]?.label,
  };
  const ativos = Object.entries(filtros)
    .filter(([, valor]) => valor)
    .map(([chave, valor]) => rotulos[chave]?.(valor))
    .concat(tags.map((idTag) => dados.tags.find((tag) => tag.id === idTag)?.nome))
    .filter(Boolean);

  const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * POR_PAGINA;
  const visiveis = lista.slice(inicio, inicio + POR_PAGINA);

  function mudar(chave, valor) {
    setFiltros((atual) => ({ ...atual, [chave]: valor }));
    setPagina(1);
  }

  function alternarTag(id) {
    setTags((atuais) => (atuais.includes(id) ? atuais.filter((tag) => tag !== id) : [...atuais, id]));
    setPagina(1);
  }

  function limpar() {
    setFiltros({ turma: "", disc: "", prof: "", bim: "", aluno: "", status: "" });
    setTags([]);
    setPagina(1);
  }

  function gerarArquivo() {
    try {
      const linhas = lista.map((relatorio) => {
        const media = Number(relatorio.media);
        return {
          aluno: api.aluno(relatorio.aluno)?.nome || "",
          turma: api.turma(relatorio.turma)?.nome || "",
          disciplina: api.disc(relatorio.disc)?.nome || "",
          professor: api.prof(relatorio.prof)?.nome || "",
          ano: relatorio.ano,
          bimestre: relatorio.bim,
          media:
            relatorio.media == null || relatorio.media === "" || !Number.isFinite(media)
              ? ""
              : Math.round(media * 100) / 100,
          status: STATUS[relatorio.status]?.label || relatorio.status,
          tags: (relatorio.tags || [])
            .map((idTag) => dados.tags.find((tag) => tag.id === idTag)?.nome)
            .filter(Boolean)
            .join(" · "),
          descricao: relatorio.desc || "",
        };
      });
      const agora = new Date();
      const carimbo = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(
        2,
        "0",
      )}-${String(agora.getDate()).padStart(2, "0")}`;
      const extensao = formato === "xlsx" ? "xlsx" : "csv";
      const nome = `relatorios-kfka-${carimbo}.${extensao}`;
      const linhasCsv = linhas.map((linha) => ({
        ...linha,
        media:
          typeof linha.media === "number"
            ? String(linha.media).replace(".", ",")
            : linha.media,
      }));
      const arquivo =
        extensao === "xlsx"
          ? gerarXlsx(COLUNAS, linhas, "Relatórios")
          : gerarCsv(COLUNAS, linhasCsv);

      baixarArquivo(nome, arquivo);
      setExportar(false);
      avisar("Arquivo gerado", `${linhas.length} registros exportados em ${nome}.`, "ok");
    } catch (erro) {
      avisar(
        "Não foi possível gerar o arquivo",
        erro?.message || "Tente novamente.",
        "err",
      );
    }
  }

  return (
    <LayoutApp papel="admin" ativo="relatorios">
      <PageHead
        crumbs={[{ label: "Acompanhamento" }, { label: "Relatórios gerenciais" }]}
        title="Relatórios gerenciais"
        lead="Consulte indicadores por turma, disciplina, professor, bimestre, aluno e tags."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setExportar(true)}>
            <Icone nome="sheet" /> Exportar dados
          </button>
        }
      />

      <section className="card" aria-label="Filtros">
        <div className="filters-panel">
          <div className="field">
            <label className="field-label" htmlFor="g-t">
              Turma
            </label>
            <select
              id="g-t"
              className="select"
              value={filtros.turma}
              onChange={(evento) => mudar("turma", evento.target.value)}
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
            <label className="field-label" htmlFor="g-d">
              Disciplina
            </label>
            <select
              id="g-d"
              className="select"
              value={filtros.disc}
              onChange={(evento) => mudar("disc", evento.target.value)}
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
            <label className="field-label" htmlFor="g-p">
              Professor
            </label>
            <select
              id="g-p"
              className="select"
              value={filtros.prof}
              onChange={(evento) => mudar("prof", evento.target.value)}
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
            <label className="field-label" htmlFor="g-b">
              Bimestre
            </label>
            <select
              id="g-b"
              className="select"
              value={filtros.bim}
              onChange={(evento) => mudar("bim", evento.target.value)}
            >
              <option value="">Todos</option>
              {dados.bimestres.map((bimestre) => (
                <option key={bimestre.n} value={bimestre.n}>
                  {bimestre.n}º bimestre
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="g-a">
              Aluno
            </label>
            <select
              id="g-a"
              className="select"
              value={filtros.aluno}
              onChange={(evento) => mudar("aluno", evento.target.value)}
            >
              <option value="">Todos os alunos</option>
              {dados.alunos.map((aluno) => (
                <option key={aluno.id} value={aluno.id}>
                  {aluno.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="g-s">
              Status
            </label>
            <select
              id="g-s"
              className="select"
              value={filtros.status}
              onChange={(evento) => mudar("status", evento.target.value)}
            >
              <option value="">Todos os status</option>
              {["rascunho", "enviado", "revisao", "publicado", "devolvido", "cancelado"].map(
                (status) => (
                  <option key={status} value={status}>
                    {STATUS[status].label}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="field-label">Tags (qualquer uma)</legend>
          <div className="tag-picker">
            {dados.tags.map((tag) => (
              <label className="tag-option" key={tag.id}>
                <input type="checkbox" checked={tags.includes(tag.id)} onChange={() => alternarTag(tag.id)} />
                <span>{tag.nome}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="row-between">
          <div className="active-filters" aria-live="polite">
            {ativos.length ? (
              <>
                Filtros ativos:
                {ativos.map((rotulo) => (
                  <span className="pill" key={rotulo}>
                    {rotulo}
                  </span>
                ))}
              </>
            ) : (
              "Nenhum filtro aplicado — exibindo todos os registros."
            )}
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={limpar}>
            Limpar filtros
          </button>
        </div>
      </section>

      {!lista.length ? (
        <section className="card">
          <EmptyState
            icone="search"
            titulo="Nenhum registro com esses filtros"
            texto="Tente remover algum filtro ou escolher outro bimestre."
            acoes={
              <button type="button" className="btn btn-secondary" onClick={limpar}>
                Limpar filtros
              </button>
            }
          />
        </section>
      ) : (
        <div className="stack-lg">
          <section className="grid-4" aria-label="Indicadores">
            <div className="card tight kpi">
              <div className="kpi-top">
                <span className="ico ico-blue">
                  <Icone nome="chart" className="icon-sm" />
                </span>
                <span className="lbl">Média dos registros filtrados</span>
              </div>
              <div className="val">{media == null ? "—" : fmtMedia(media)}</div>
            </div>
            <div className="card tight kpi">
              <div className="kpi-top">
                <span className="ico ico-teal">
                  <Icone nome="file" className="icon-sm" />
                </span>
                <span className="lbl">Registros encontrados</span>
              </div>
              <div className="val">{lista.length}</div>
            </div>
            <div className="card tight kpi">
              <div className="kpi-top">
                <span className="ico ico-ok">
                  <Icone nome="check-circle" className="icon-sm" />
                </span>
                <span className="lbl">Publicados</span>
              </div>
              <div className="val">{publicados.length}</div>
            </div>
            <div className="card tight kpi">
              <div className="kpi-top">
                <span className="ico ico-sun">
                  <Icone nome="eye" className="icon-sm" />
                </span>
                <span className="lbl">Lidos pelas famílias</span>
              </div>
              <div className="val">
                {publicados.length ? Math.round((lidos / publicados.length) * 100) : 0}%
              </div>
            </div>
          </section>

          <div className="grid-2">
            <section className="card">
              <div className="card-head">
                <div>
                  <h2>Média por disciplina</h2>
                  <p>Registros filtrados com média informada</p>
                </div>
              </div>
              <div
                className="vbars"
                role="img"
                aria-label={porDisciplina
                  .map(([disciplina, valor]) => `${disciplina.nome} ${fmtMedia(valor)}`)
                  .join(", ")}
              >
                {porDisciplina.map(([disciplina, valor]) => (
                  <div className="col" key={disciplina.id}>
                    <span className="v">{fmtMedia(valor)}</span>
                    <span
                      className={`b ${valor < 7 ? "warn" : ""}`}
                      style={{ height: `${valor * 14}px` }}
                    />
                    <span className="l">{disciplina.id}</span>
                  </div>
                ))}
              </div>
              <p className="muted" style={{ fontSize: "0.75rem" }}>
                Barras amarelas: média abaixo de 7,0 (meta ilustrativa).
              </p>
            </section>

            <section className="card">
              <div className="card-head">
                <div>
                  <h2>Tags mais usadas</h2>
                  <p>Quantidade de registros com cada tag</p>
                </div>
              </div>
              {tagsUsadas.length ? (
                tagsUsadas.slice(0, 7).map(([tag, total]) => (
                  <div className="bar-row" key={tag.id}>
                    <span className={`tag ${tag.tom}`}>{tag.nome}</span>
                    <div className="progress">
                      <span style={{ width: `${(total / maxTag) * 100}%` }} />
                    </div>
                    <span className="v">{total}</span>
                  </div>
                ))
              ) : (
                <p className="muted">Sem tags nos registros filtrados.</p>
              )}
            </section>
          </div>

          <section className="card">
            <div className="card-head">
              <div>
                <h2>Registros</h2>
                <p>{lista.length} resultados</p>
              </div>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Turma</th>
                    <th>Disciplina</th>
                    <th>Bim.</th>
                    <th>Média</th>
                    <th>Status</th>
                    <th>
                      <span className="sr-only">Abrir</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((relatorio) => {
                    const aluno = api.aluno(relatorio.aluno);
                    return (
                      <tr key={relatorio.id}>
                        <td className="cell-main">
                          <div className="cell-person">
                            <Avatar nome={aluno.nome} cor={aluno.cor} tamanho="sm" />
                            <b>{aluno.nome}</b>
                          </div>
                        </td>
                        <td data-label="Turma">{api.turma(relatorio.turma).nome}</td>
                        <td data-label="Disciplina">{api.disc(relatorio.disc).nome}</td>
                        <td data-label="Bimestre">{relatorio.bim}º</td>
                        <td data-label="Média" className="mono">
                          {fmtMedia(relatorio.media)}
                        </td>
                        <td data-label="Status">
                          <StatusBadge status={relatorio.status} curto />
                        </td>
                        <td className="actions">
                          <Link className="btn btn-ghost btn-sm" to={`/admin/revisao/${relatorio.id}`}>
                            Detalhe
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              de={inicio + 1}
              ate={Math.min(inicio + POR_PAGINA, lista.length)}
              total={lista.length}
              pagina={paginaAtual}
              totalPaginas={totalPaginas}
              aoMudar={(novo) => setPagina(Math.min(totalPaginas, Math.max(1, novo)))}
            />
          </section>
        </div>
      )}

      <Modal
        aberto={exportar}
        aoFechar={() => setExportar(false)}
        titulo="Exportar relatório filtrado"
        texto="Formato compatível com Excel. O arquivo é gerado no navegador com os registros que atendem aos filtros atuais."
        icone="download"
        tom="ico-ok"
        rodape={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setExportar(false)}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={gerarArquivo}>
              <Icone nome="download" /> Gerar arquivo
            </button>
          </>
        }
      >
        <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack-sm">
          <legend className="field-label">Formato</legend>
          <label className={`format-opt ${formato === "xlsx" ? "sel" : ""}`}>
            <input
              type="radio"
              name="formato"
              checked={formato === "xlsx"}
              onChange={() => setFormato("xlsx")}
            />
            <span className="ico ico-ok">
              <Icone nome="sheet" />
            </span>
            <span className="grow">
              <b className="mono">.xlsx</b>
              <small>Planilha do Excel</small>
            </span>
          </label>
          <label className={`format-opt ${formato === "csv" ? "sel" : ""}`}>
            <input
              type="radio"
              name="formato"
              checked={formato === "csv"}
              onChange={() => setFormato("csv")}
            />
            <span className="ico ico-blue">
              <Icone nome="file" />
            </span>
            <span className="grow">
              <b className="mono">.csv</b>
              <small>Texto separado por ponto e vírgula</small>
            </span>
          </label>
        </fieldset>
        <div className="alert info">
          <Icone nome="shield" />
          <div>Somente dados autorizados pela LGPD são exportados.</div>
        </div>
      </Modal>
    </LayoutApp>
  );
}
