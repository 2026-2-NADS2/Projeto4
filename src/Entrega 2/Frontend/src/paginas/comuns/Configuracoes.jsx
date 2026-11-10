import { useState } from "react";
import Icone from "../../componentes/Icone.jsx";
import LayoutApp from "../../componentes/LayoutApp.jsx";
import PageHead from "../../componentes/PageHead.jsx";
import { TAMANHOS, TEMAS, useTema } from "../../contextos/TemaContexto.jsx";
import { useAviso } from "../../contextos/AvisoContexto.jsx";
import { useTitulo } from "../../utilitarios/useTitulo.js";

const VOLTA = {
  admin: { rotulo: "Coordenação", para: "/admin/painel" },
  professor: { rotulo: "Professor", para: "/professor/painel" },
  familia: { rotulo: "Início", para: "/familia/painel" },
};

function MiniTema({ modo }) {
  return (
    <span className={`tema-mini tema-mini-${modo}`} aria-hidden="true">
      <span className="tm-side" />
      <span className="tm-main">
        <i />
        <i className="tm-linha" />
        <i className="tm-linha curta" />
        <i className="tm-bt" />
      </span>
    </span>
  );
}

export default function Configuracoes({ papel }) {
  useTitulo("Configurações");
  const { prefs, salvarPreferencias, definirTema, restaurarPreferencias } = useTema();
  const { avisar } = useAviso();
  const [status, setStatus] = useState("");

  const indice = TAMANHOS.findIndex(([valor]) => valor === prefs.texto);
  const voltar = VOLTA[papel];

  function mudarTexto(valor) {
    salvarPreferencias({ texto: valor });
    const rotulo = TAMANHOS.find(([v]) => v === valor)?.[1] || valor;
    setStatus(`Texto ${rotulo.toLowerCase()} (${String(valor).replace(".", ",")}%).`);
  }

  function passoTexto(delta) {
    const proximo = Math.min(TAMANHOS.length - 1, Math.max(0, indice + delta));
    mudarTexto(TAMANHOS[proximo][0]);
  }

  function alternar(chave, ligado) {
    salvarPreferencias({ [chave]: ligado });
    setStatus(
      `${chave === "espaco" ? "Espaçamento de leitura" : "Links sublinhados"}: ${
        ligado ? "ligado" : "desligado"
      }.`,
    );
  }

  function restaurar() {
    restaurarPreferencias();
    setStatus("Preferências restauradas para o padrão.");
    avisar("Preferências restauradas", "Tema, texto e acessibilidade voltaram ao padrão.", "info");
  }

  return (
    <LayoutApp papel={papel} ativo="configuracoes">
      <PageHead
        crumbs={[{ label: voltar.rotulo, to: voltar.para }, { label: "Configurações" }]}
        title="Configurações"
        lead="Aparência e acessibilidade. As escolhas ficam salvas neste navegador."
      />

      <section className="card stack config-sec" aria-labelledby="ac-t">
        <h2 id="ac-t" className="config-h">
          <Icone nome="user" /> Acessibilidade
        </h2>

        <fieldset className="field tamanho-texto">
          <legend id="tt-l">Tamanho do texto</legend>
          <div className="tt-linha">
            <button
              type="button"
              className="icon-btn"
              aria-label="Diminuir o texto"
              disabled={indice <= 0}
              onClick={() => passoTexto(-1)}
            >
              <span className="tt-a menor" aria-hidden="true">
                A−
              </span>
            </button>
            <div className="tt-opcoes" role="radiogroup" aria-labelledby="tt-l">
              {TAMANHOS.map(([valor, rotulo], i) => (
                <label className="tt-opcao" key={valor}>
                  <input
                    type="radio"
                    name={`tt-${papel}`}
                    value={valor}
                    checked={prefs.texto === valor}
                    onChange={() => mudarTexto(valor)}
                  />
                  <span>
                    <b className="tt-aa" style={{ fontSize: `${1 + i * 0.18}rem` }} aria-hidden="true">
                      Aa
                    </b>
                    <small>{rotulo}</small>
                  </span>
                </label>
              ))}
            </div>
            <button
              type="button"
              className="icon-btn"
              aria-label="Aumentar o texto"
              disabled={indice >= TAMANHOS.length - 1}
              onClick={() => passoTexto(1)}
            >
              <span className="tt-a" aria-hidden="true">
                A+
              </span>
            </button>
          </div>
          <span className="hint">
            Aumenta o texto do sistema inteiro: menus, tabelas e relatórios. O tamanho de letra do
            navegador ou celular também é respeitado.
          </span>
        </fieldset>

        <div className="config-amostra" aria-hidden="true">
          <div className="pv-head">
            <b>Ciências · 3º bimestre</b>
            <span className="status publicado">
              <Icone nome="check-circle" />
              Publicado
            </span>
          </div>
          <p>
            Participou com curiosidade do projeto sobre o ciclo da água e ajudou os colegas a
            registrar as medições.
          </p>
        </div>

        <div className="config-opcoes">
          <label className="switch switch-longo">
            <input
              type="checkbox"
              role="switch"
              checked={prefs.espaco}
              onChange={(evento) => alternar("espaco", evento.target.checked)}
            />
            <span className="track" aria-hidden="true" />
            <span className="switch-txt">
              <b>Espaçamento de leitura</b>
              <small>Mais espaço entre linhas, letras e palavras.</small>
            </span>
          </label>
          <label className="switch switch-longo">
            <input
              type="checkbox"
              role="switch"
              checked={prefs.links}
              onChange={(evento) => alternar("links", evento.target.checked)}
            />
            <span className="track" aria-hidden="true" />
            <span className="switch-txt">
              <b>Sublinhar links</b>
              <small>Links no texto ficam sublinhados, não só coloridos.</small>
            </span>
          </label>        </div>

        <div className="row-between config-rodape">
          <p className="muted config-status" role="status" aria-live="polite">
            {status}
          </p>
          <button type="button" className="btn btn-secondary" onClick={restaurar}>
            <Icone nome="refresh" className="icon-sm" /> Restaurar o padrão
          </button>
        </div>
      </section>

      <section className="card stack config-sec" aria-labelledby="ap-t">
        <h2 id="ap-t" className="config-h">
          <Icone nome="sun" /> Aparência
        </h2>
        <div className="field">
          <span className="field-label" id="tema-cfg-l">
            Tema
          </span>
          <div className="tema-cards" role="radiogroup" aria-labelledby="tema-cfg-l">
            {TEMAS.map(([valor, rotulo, icone]) => (
              <button
                key={valor}
                type="button"
                role="radio"
                className="tema-card"
                aria-checked={prefs.tema === valor}
                aria-pressed={prefs.tema === valor}
                onClick={() => definirTema(valor)}
              >
                <MiniTema modo={valor} />
                <span className="tema-card-rot">
                  <Icone nome={icone} className="icon-sm" /> {rotulo}
                  {valor === "sistema" && <small>acompanha o aparelho</small>}
                </span>
                <span className="tema-card-ok" aria-hidden="true">
                  <Icone nome="check" className="icon-sm" />
                </span>
              </button>
            ))}
          </div>
          <span className="hint">
            O modo escuro reduz o brilho à noite; os status continuam com texto, ícone e cor.
          </span>
        </div>
      </section>
    </LayoutApp>
  );
}
