import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Avatar from "../../componentes/Avatar.jsx";
import Icone from "../../componentes/Icone.jsx";
import LayoutApp from "../../componentes/LayoutApp.jsx";
import Modal from "../../componentes/Modal.jsx";
import PageHead from "../../componentes/PageHead.jsx";
import { useAviso } from "../../contextos/AvisoContexto.jsx";
import { dados } from "../../dados/dados.js";
import { useTitulo } from "../../utilitarios/useTitulo.js";

const TIPOS = [
  ["", "Tudo"],
  ["Publicou", "Publicações"],
  ["Devolveu", "Devoluções"],
  ["Alterou", "Alterações"],
  ["Inativou", "Cadastros"],
];

export default function Auditoria() {
  useTitulo("Histórico e auditoria");
  const { avisar } = useAviso();
  const [params, setParams] = useSearchParams();
  const filtro = params.get("tipo") || "";
  const [exportar, setExportar] = useState(false);

  const lista = dados.auditoria.filter((item) => !filtro || item.acao.startsWith(filtro));

  function trocarFiltro(tipo) {
    setParams(tipo ? { tipo } : {}, { replace: true });
  }

  function gerar() {
    setExportar(false);
    avisar(
      "Exportação simulada",
      `${lista.length} eventos seriam exportados em .xlsx. Nenhum arquivo real foi criado.`,
      "ok",
    );
  }

  return (
    <LayoutApp papel="admin" ativo="auditoria">
      <PageHead
        crumbs={[{ label: "Acompanhamento" }, { label: "Auditoria" }]}
        title="Histórico e auditoria"
        lead="Toda alteração registra usuário, data/hora, estado anterior e estado posterior. Os registros não podem ser editados."
        actions={
          <button type="button" className="btn btn-secondary" onClick={() => setExportar(true)}>
            <Icone nome="download" /> Exportar log
          </button>
        }
      />

      <div className="row" role="group" aria-label="Tipo de evento">
        {TIPOS.map(([chave, rotulo]) => (
          <button
            key={chave}
            type="button"
            className="filter-chip"
            aria-pressed={filtro === chave}
            onClick={() => trocarFiltro(chave)}
          >
            {rotulo}
          </button>
        ))}
      </div>

      <section className="card flush">
        <div className="table-wrap" style={{ border: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Data/hora</th>
                <th>Usuário</th>
                <th>Ação</th>
                <th>Registro</th>
                <th>Antes → depois</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((item, indice) => (
                <tr key={`${item.quando}-${item.acao}-${indice}`}>
                  <td className="cell-main mono">{item.quando}</td>
                  <td data-label="Usuário">
                    <div className="cell-person">
                      <Avatar
                        nome={item.quem}
                        cor={item.quem === "Marina Rocha" ? "#FFC94A" : "#74C0FC"}
                        tamanho="sm"
                      />
                      {item.quem}
                    </div>
                  </td>
                  <td data-label="Ação">
                    <b>{item.acao}</b>
                  </td>
                  <td data-label="Registro">{item.registro}</td>
                  <td data-label="Mudança">
                    <span className="tl-change" style={{ margin: 0 }}>
                      {item.de} <Icone nome="chevron-right" className="icon-sm" />{" "}
                      <b>{item.para}</b>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="muted row" style={{ fontSize: "0.8125rem" }}>
        <Icone nome="lock" className="icon-sm" /> Retenção de 5 anos · somente leitura.
      </p>

      <Modal
        aberto={exportar}
        aoFechar={() => setExportar(false)}
        titulo="Exportar log de auditoria"
        texto="Formato compatível com Excel. Interface demonstrativa — nenhum arquivo será gerado."
        icone="download"
        tom="ico-ok"
        rodape={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setExportar(false)}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={gerar}>
              <Icone nome="download" /> Gerar arquivo
            </button>
          </>
        }
      >
        <div className="alert info">
          <Icone nome="shield" />
          <div>
            Serão exportados <b>{lista.length}</b> eventos
            {filtro ? ` do tipo “${TIPOS.find(([chave]) => chave === filtro)?.[1]}”` : ""}. Dados
            pessoais seguem a política de retenção da escola.
          </div>
        </div>
      </Modal>
    </LayoutApp>
  );
}
