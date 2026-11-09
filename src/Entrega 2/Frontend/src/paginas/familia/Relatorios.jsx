import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import Avatar from "../../componentes/Avatar.jsx";
import Campo from "../../componentes/Campo.jsx";
import EmptyState from "../../componentes/EmptyState.jsx";
import { TagsDoRegistro } from "../../componentes/Fluxo.jsx";
import Icone from "../../componentes/Icone.jsx";
import LayoutApp from "../../componentes/LayoutApp.jsx";
import LineChart from "../../componentes/LineChart.jsx";
import PageHead from "../../componentes/PageHead.jsx";
import { useAutenticacao } from "../../contextos/AutenticacaoContexto.jsx";
import { useAviso } from "../../contextos/AvisoContexto.jsx";
import { api, dados } from "../../dados/dados.js";
import { baixarArquivo, gerarPdf } from "../../utilitarios/arquivos.js";
import { fmtMedia, primeiroNome } from "../../utilitarios/formatadores.js";
import {
  documentoDoRegistro,
  tomMedia,
  useFamilia,
} from "../../utilitarios/familia.js";
import { useTitulo } from "../../utilitarios/useTitulo.js";
import { SeletorAluno } from "./partes.jsx";

export function RelatoriosFamilia() {
  const { responsavel, aluno, params } = useFamilia();
  const [, setParams] = useSearchParams();
  useTitulo(aluno ? `Relatórios de ${primeiroNome(aluno.nome)}` : "Relatórios");

  if (!aluno) return <Navigate to="/acesso-negado" replace />;

  const registros = api.relsDaFamilia(responsavel.id, aluno.id);
  const filtros = {
    bim: params.get("bim") || "",
    disc: params.get("disc") || "",
    lido: params.get("lido") || "",
  };
  const lista = registros
    .filter(
      (registro) =>
        (!filtros.bim || registro.bim === Number(filtros.bim)) &&
        (!filtros.disc || registro.disc === filtros.disc) &&
        (!filtros.lido || String(registro.lido) === filtros.lido),
    )
    .sort((a, b) => b.bim - a.bim);
  const disciplinasDisponiveis = [...new Set(registros.map((registro) => registro.disc))];
  const temFiltro = Boolean(filtros.bim || filtros.disc || filtros.lido);

  function filtrar(chave, valor) {
    const proximos = new URLSearchParams(params);
    proximos.set("aluno", aluno.id);
    if (valor) proximos.set(chave, valor);
    else proximos.delete(chave);
    setParams(proximos);
  }

  return (
    <LayoutApp papel="familia" ativo="relatorios">
      <PageHead
        crumbs={[
          { label: "Início", to: `/familia/painel?aluno=${aluno.id}` },
          { label: "Relatórios" },
        ]}
        title={`Relatórios de ${primeiroNome(aluno.nome)}`}
        lead="Somente relatórios revisados e publicados pela coordenação aparecem aqui."
        actions={
          <SeletorAluno aluno={aluno} responsavel={responsavel} base="/familia/relatorios" />
        }
      />

      <form
        className="card tight filters-panel"
        aria-label="Filtros"
        onSubmit={(evento) => evento.preventDefault()}
      >
        <div
          className="form-grid"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))" }}
        >
          <Campo
            id="ff-ano"
            label="Ano letivo"
            valor="2026"
            opcoes={[["2026", "2026"]]}
            disabled
          />
          <Campo
            id="ff-bim"
            label="Bimestre"
            valor={filtros.bim}
            opcoes={[
              ["", "Todos"],
              ...dados.bimestres
                .filter((bimestre) => bimestre.status !== "agendado")
                .map((bimestre) => [String(bimestre.n), `${bimestre.n}º bimestre`]),
            ]}
            aoMudar={(valor) => filtrar("bim", valor)}
          />
          <Campo
            id="ff-disc"
            label="Disciplina"
            valor={filtros.disc}
            opcoes={[
              ["", "Todas"],
              ...disciplinasDisponiveis.map((id) => [id, api.disc(id).nome]),
            ]}
            aoMudar={(valor) => filtrar("disc", valor)}
          />
          <Campo
            id="ff-lido"
            label="Leitura"
            valor={filtros.lido}
            opcoes={[
              ["", "Todos"],
              ["false", "Não lidos"],
              ["true", "Lidos"],
            ]}
            aoMudar={(valor) => filtrar("lido", valor)}
          />
        </div>

        {temFiltro && (
          <div className="active-filters row">
            {filtros.bim && <span className="pill">{filtros.bim}º bimestre</span>}
            {filtros.disc && <span className="pill">{api.disc(filtros.disc).nome}</span>}
            {filtros.lido && (
              <span className="pill">{filtros.lido === "true" ? "Lidos" : "Não lidos"}</span>
            )}
            <Link className="link-btn" to={`/familia/relatorios?aluno=${aluno.id}`}>
              Limpar filtros
            </Link>
          </div>
        )}
      </form>

      {lista.length ? (
        <div className="report-list">
          {lista.map((registro) => (
            <Link
              className="card card-link report-item"
              key={registro.id}
              to={`/familia/relatorios/${registro.id}?aluno=${aluno.id}`}
            >
              <span className={`nota ${tomMedia(registro.media)}`}>
                {fmtMedia(registro.media)}
              </span>
              <div className="grow stack-sm">
                <div className="row" style={{ gap: 8 }}>
                  <b style={{ fontSize: "1rem" }}>{api.disc(registro.disc).nome}</b>
                  <span className="muted" style={{ fontSize: "0.8125rem" }}>
                    · {registro.bim}º bimestre · Prof. {api.prof(registro.prof).nome}
                  </span>
                </div>
                <p className="text-2 clamp-2" style={{ fontSize: "0.875rem" }}>
                  {registro.desc}
                </p>
                <TagsDoRegistro ids={registro.tags} />
              </div>
              <span className={`status ${registro.lido ? "lido" : "nao-lido"}`}>
                <Icone nome={registro.lido ? "check" : "eye"} />
                {registro.lido ? "Lido" : "Não lido"}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <section className="card">
          <EmptyState
            icone="search"
            titulo={
              registros.length
                ? "Nenhum relatório com esses filtros"
                : "Ainda não há relatórios publicados"
            }
            texto={
              registros.length
                ? "Tente outro bimestre ou disciplina."
                : "Quando a escola publicar, eles aparecerão aqui."
            }
            acoes={
              registros.length ? (
                <Link className="btn btn-secondary" to={`/familia/relatorios?aluno=${aluno.id}`}>
                  Limpar filtros
                </Link>
              ) : null
            }
          />
        </section>
      )}
    </LayoutApp>
  );
}

export function RelatorioDetalhe() {
  const { id } = useParams();
  const { usuario } = useAutenticacao();
  const { avisar } = useAviso();
  const registro = api.rel(id);
  const responsavel = api.resp(usuario?.respId || "r1");

  useTitulo(
    registro ? `${api.disc(registro.disc).nome} · ${registro.bim}º bimestre` : "Relatório",
  );

  const [observacao, setObservacao] = useState("");
  const [erroObservacao, setErroObservacao] = useState("");
  const [, atualizar] = useState(0);

  useEffect(() => {
    setObservacao("");
    setErroObservacao("");
  }, [id]);

  const vinculado = Boolean(registro && responsavel?.alunos.includes(registro.aluno));
  const permitido = Boolean(vinculado && registro.status === "publicado");

  if (!permitido) return <Navigate to="/acesso-negado" replace />;

  const aluno = api.aluno(registro.aluno);
  const turma = api.turma(registro.turma);
  const disciplina = api.disc(registro.disc);
  const professor = api.prof(registro.prof);
  const area = api.area(disciplina?.area);
  const historico = api
    .relsDaFamilia(responsavel.id, aluno.id)
    .filter((item) => item.disc === registro.disc)
    .sort((a, b) => a.bim - b.bim);
  const anterior = historico.find((item) => item.bim === registro.bim - 1);
  const publicadoEm =
    (registro.historico?.find((item) => item.para === "publicado") || {}).quando || "—";
  const outros = api
    .relsDaFamilia(responsavel.id, aluno.id)
    .filter((item) => item.bim === registro.bim && item.id !== registro.id);

  const pontos = dados.bimestres.map((bimestre) => {
    const doBim = historico.find((item) => item.bim === bimestre.n);
    return {
      label: `${bimestre.n}º`,
      value: doBim ? doBim.media : null,
      current: bimestre.n === registro.bim,
    };
  });
  const rotuloGrafico =
    "Média por bimestre: " +
    pontos
      .map((ponto) => `${ponto.label} ${ponto.value == null ? "a publicar" : fmtMedia(ponto.value)}`)
      .join(", ");

  function baixarPdf() {
    try {
      const { nomeArquivo, documento } = documentoDoRegistro(registro, responsavel);
      baixarArquivo(nomeArquivo, gerarPdf(documento));
      avisar("PDF gerado", `${nomeArquivo} foi baixado.`, "ok");
    } catch (erro) {
      avisar("Não foi possível gerar o PDF", erro?.message || "Tente novamente.", "err");
    }
  }

  function marcarLido() {
    registro.lido = true;
    registro.historico.push({
      quem: responsavel.nome,
      papel: "Responsável",
      quando: "agora",
      acao: "Ciência registrada",
      de: null,
      para: null,
    });
    atualizar((valor) => valor + 1);
    avisar("Ciência registrada", "O professor verá sua confirmação (simulação).");
  }

  function enviarObservacao(evento) {
    evento.preventDefault();
    const texto = observacao.trim();

    if (!texto) {
      setErroObservacao("Escreva sua observação.");
      return;
    }

    if (texto.length < 10) {
      setErroObservacao("Escreva ao menos 10 caracteres.");
      return;
    }

    registro.observacao = {
      texto,
      quem: responsavel.nome,
      papel: "Responsável",
      quando: "agora",
    };
    registro.historico.push({
      quem: responsavel.nome,
      papel: "Responsável",
      quando: "agora",
      acao: "Observação enviada",
      de: null,
      para: null,
    });
    setObservacao("");
    setErroObservacao("");
    atualizar((valor) => valor + 1);
    avisar("Observação enviada", "Registrada apenas nesta sessão de demonstração.");
  }

  return (
    <LayoutApp papel="familia" ativo="relatorios">
      <PageHead
        crumbs={[
          { label: "Relatórios", to: `/familia/relatorios?aluno=${aluno.id}` },
          { label: `${disciplina.nome} · ${registro.bim}º bim` },
        ]}
        title={disciplina.nome}
        lead={`${aluno.nome} · ${turma.nome} · ${registro.bim}º bimestre de ${registro.ano} · publicado em ${publicadoEm}`}
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={baixarPdf}>
              <Icone nome="download" /> Baixar PDF
            </button>
            <Link
              className="btn btn-secondary"
              to={`/familia/imprimir/${registro.id}?aluno=${aluno.id}`}
            >
              <Icone nome="printer" /> Ver para impressão
            </Link>
          </>
        }
      />

      <div className="grid-main-side">
        <div className="stack">
          <article className="card report-doc">
            <header className="report-head">
              <div className="row">
                <Avatar nome={professor.nome} cor={professor.cor} />
                <div>
                  <b>Prof. {professor.nome}</b>
                  <div className="muted" style={{ fontSize: "0.8125rem" }}>
                    {area?.nome || ""}
                  </div>
                </div>
              </div>
              <div className="media-box sm">
                <span className="eyebrow">Média</span>
                <b className="media-val">{fmtMedia(registro.media)}</b>
                {anterior && (
                  <small
                    style={{
                      fontWeight: 700,
                      color:
                        registro.media >= anterior.media
                          ? "var(--st-publicado)"
                          : "var(--st-devolvido)",
                    }}
                  >
                    {registro.media >= anterior.media ? "▲" : "▼"}{" "}
                    {fmtMedia(Math.abs(registro.media - anterior.media))} vs. {anterior.bim}º bim
                  </small>
                )}
              </div>
            </header>

            <div className="stack-sm">
              <span className="eyebrow">Destaques</span>
              <TagsDoRegistro ids={registro.tags} />
            </div>

            <div className="stack-sm">
              <span className="eyebrow">O que o professor observou</span>
              <div className="desc-text lg">{registro.desc}</div>
            </div>
          </article>

          <section className="card stack" id="ciencia">
            {registro.lido ? (
              <div className="alert success">
                <Icone nome="check-circle" />
                <div>
                  <b>Você registrou ciência deste relatório</b>
                  A escola foi avisada (simulação local).
                </div>
              </div>
            ) : (
              <div className="row-between">
                <div>
                  <h2 style={{ fontSize: "1.125rem" }}>Confirme a leitura</h2>
                  <p className="text-2" style={{ fontSize: "0.875rem" }}>
                    Avise a escola que você leu este relatório.
                  </p>
                </div>
                <button type="button" className="btn btn-success" onClick={marcarLido}>
                  <Icone nome="check" /> Li e estou ciente
                </button>
              </div>
            )}

            {registro.observacao ? (
              <div className="comment">
                <Avatar nome={registro.observacao.quem} cor="#5FD4A8" tamanho="sm" />
                <div>
                  <b>Sua observação</b>{" "}
                  <small className="muted">· {registro.observacao.quando}</small>
                  <p>{registro.observacao.texto}</p>
                  <small className="muted">
                    <Icone nome="eye" className="icon-sm" />
                    Visível para o professor e a coordenação.
                  </small>
                </div>
              </div>
            ) : (
              <form className="stack-sm" onSubmit={enviarObservacao} noValidate>
                <Campo
                  id="obs"
                  label="Observação para a escola (opcional)"
                  tipo="textarea"
                  valor={observacao}
                  aoMudar={(valor) => {
                    setObservacao(valor);
                    setErroObservacao("");
                  }}
                  placeholder="Ex.: Vamos reforçar a revisão do caderno em casa."
                  dica="Será lida pela coordenação e pelo professor."
                  erro={erroObservacao}
                  minLength={10}
                  maxLength={500}
                />
                <div className="form-actions">
                  <button type="submit" className="btn btn-secondary">
                    <Icone nome="message" /> Enviar observação
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>

        <aside className="stack">
          <section className="card">
            <h2 style={{ fontSize: "1.125rem" }}>Evolução em {disciplina.nome}</h2>
            <LineChart points={pontos} height={140} label={rotuloGrafico} />
          </section>

          <section className="card tight stack-sm">
            <h2 style={{ fontSize: "1rem" }}>
              Outros relatórios do {registro.bim}º bimestre
            </h2>
            {outros.length ? (
              outros.map((item) => (
                <Link
                  className="row list-link"
                  key={item.id}
                  to={`/familia/relatorios/${item.id}?aluno=${aluno.id}`}
                >
                  <span className="grow">
                    <b>{api.disc(item.disc).nome}</b>
                  </span>
                  <span className="mono">{fmtMedia(item.media)}</span>
                  <Icone nome="chevron-right" className="icon-sm" />
                </Link>
              ))
            ) : (
              <p className="muted">Nenhum outro publicado.</p>
            )}
          </section>
        </aside>
      </div>
    </LayoutApp>
  );
}
