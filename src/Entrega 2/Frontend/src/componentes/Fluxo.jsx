import { api, dados } from "../dados/dados.js";
import { STATUS } from "../dados/status.js";
import Avatar from "./Avatar.jsx";
import Icone from "./Icone.jsx";
import StatusBadge from "./StatusBadge.jsx";

// Linha do fluxo editorial. Devolvido e Cancelado aparecem como saídas do caminho feliz.
export function Stepper({ status }) {
  const ordem = ["rascunho", "enviado", "revisao", "publicado"];
  const rotulos = ["Rascunho", "Enviado", "Em revisão", "Publicado"];
  const indice = ordem.indexOf(status);

  if (status === "devolvido") {
    return (
      <div className="stepper" aria-label="Etapa do fluxo: devolvido">
        {["Rascunho", "Enviado", "Em revisão"].map((rotulo, i) => (
          <FragmentoPasso
            key={rotulo}
            passo={
              <span className="step done">
                <span className="n">✓</span>
                {rotulo}
              </span>
            }
            comLinha={i < 2}
          />
        ))}
        <span className="step bad">
          <span className="n">!</span>
          Devolvido para ajustes
        </span>
      </div>
    );
  }

  if (status === "cancelado") {
    return (
      <div className="stepper" aria-label="Etapa do fluxo: cancelado">
        <span className="step bad">
          <span className="n">×</span>
          Cancelado
        </span>
      </div>
    );
  }

  return (
    <div className="stepper" aria-label={`Etapa do fluxo: ${rotulos[indice] || rotulos[0]}`}>
      {rotulos.map((rotulo, i) => (
        <FragmentoPasso
          key={rotulo}
          comLinha={i < 3}
          passo={
            <span
              className={`step ${
                i < indice || (i === indice && status === "publicado")
                  ? "done"
                  : i === indice
                    ? "current"
                    : ""
              }`}
            >
              <span className="n">
                {i < indice || (status === "publicado" && i === indice) ? "✓" : i + 1}
              </span>
              {rotulo}
            </span>
          }
        />
      ))}
    </div>
  );
}

function FragmentoPasso({ passo, comLinha }) {
  return (
    <>
      {passo}
      {comLinha ? <span className="step-line" aria-hidden="true" /> : null}
    </>
  );
}

function rotuloStatus(valor) {
  return STATUS[valor] ? STATUS[valor].short || STATUS[valor].label : valor;
}

const TONS = {
  publicado: "ico-ok",
  devolvido: "ico-bad",
  revisao: "ico-warn",
  enviado: "ico-teal",
  cancelado: "ico-bad",
};

// Histórico de um registro, com quem fez, quando e a transição de estado.
export function Timeline({ historico = [] }) {
  return (
    <div className="timeline">
      {historico.map((item, indice) => {
        const familia = item.papel === "Responsável";
        const tom = familia ? "ico-ok" : TONS[item.para] || "ico-blue";
        const icone = familia
          ? /Observa/.test(item.acao)
            ? "message"
            : "check"
          : STATUS[item.para]?.icon || "edit";

        return (
          <div className="tl-item" key={`${item.acao}-${item.quando}-${indice}`}>
            <span className={`tl-dot ${tom}`}>
              <Icone nome={icone} className="icon-sm" />
            </span>
            <div>
              <b>{item.acao}</b>
              <small>
                {item.quem} · {item.papel} · {item.quando}
              </small>
              {item.de ? (
                <div className="tl-change">
                  {rotuloStatus(item.de)} <Icone nome="chevron-right" className="icon-sm" />{" "}
                  <b>{rotuloStatus(item.para)}</b>
                </div>
              ) : null}
              {item.coment ? <div className="tl-comment">“{item.coment}”</div> : null}
              {item.textoAnterior ? (
                <details className="tl-version">
                  <summary>Comparar versões</summary>
                  <div className="ver-old">
                    <span className="eyebrow">Antes</span>
                    <p>{item.textoAnterior}</p>
                  </div>
                  <div className="ver-new">
                    <span className="eyebrow">Depois</span>
                    <p>{item.textoNovo}</p>
                  </div>
                </details>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Retorno da família: ciência e observação do responsável, visível ao professor e à coordenação.
export function RetornoFamilia({ relatorio }) {
  if (!relatorio || relatorio.status !== "publicado") return null;
  const responsaveis = api.respDoAluno(relatorio.aluno);
  const observacao = relatorio.observacao;

  return (
    <section className="card stack-sm family-return" aria-label="Retorno da família">
      <div className="row-between">
        <h2 style={{ fontSize: "1.125rem" }}>
          <Icone nome="family" /> Retorno da família
        </h2>
        <StatusBadge status={relatorio.lido ? "lido" : "nao-lido"} />
      </div>
      {observacao ? (
        <div className="comment">
          <Avatar nome={observacao.quem} cor="#5FD4A8" tamanho="sm" />
          <div>
            <b>{observacao.quem}</b>{" "}
            <small className="muted">
              · {observacao.papel} · {observacao.quando}
            </small>
            <p>{observacao.texto}</p>
          </div>
        </div>
      ) : (
        <p className="muted" style={{ fontSize: "0.875rem" }}>
          {relatorio.lido
            ? `${responsaveis[0]?.nome || "O responsável"} registrou ciência e não deixou observação.`
            : "O responsável ainda não abriu este relatório."}
        </p>
      )}
    </section>
  );
}

// Cartões de tags de um registro (quando presentes).
export function TagsDoRegistro({ ids = [] }) {
  if (!ids.length) return <span className="muted">Nenhuma tag</span>;
  return (
    <span className="tag-group">
      {ids.map((id) => {
        const tag = dados.tags.find((t) => t.id === id);
        if (!tag) return null;
        return (
          <span className={`tag ${tag.tom}`} key={id}>
            {tag.nome}
          </span>
        );
      })}
    </span>
  );
}
