import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAutenticacao } from "../contextos/AutenticacaoContexto.jsx";
import { useAviso } from "../contextos/AvisoContexto.jsx";
import {
  formatarDecisao,
  lerConsentimento,
  registrarConsentimento,
} from "../utilitarios/consentimento.js";
import Icone from "./Icone.jsx";
import Modal from "./Modal.jsx";

/**
 * Popup no estilo de preferências de cookies, mostrado ao abrir a conta.
 * Pergunta uma vez por conta e registra a escolha no aparelho. Recusar não
 * bloqueia nada: o essencial segue disponível por contrato e obrigação legal;
 * o consentimento cobre apenas as finalidades opcionais.
 */
export default function ConsentimentoLgpd() {
  const { usuario } = useAutenticacao();
  const { avisar } = useAviso();
  const [aberto, setAberto] = useState(false);
  const [decisao, setDecisao] = useState(null);
  const confirmacaoRef = useRef(null);

  // Prefere o id da conta: ele não muda se o e-mail for editado no perfil.
  const conta = usuario?.idUsuario ?? usuario?.email;

  useEffect(() => {
    if (!conta) {
      setAberto(false);
      setDecisao(null);
      return;
    }

    const registro = lerConsentimento(conta);
    setDecisao(registro);
    setAberto(!registro);
  }, [conta]);

  // Ao trocar para a confirmação, o botão que estava com o foco deixa de
  // existir; leva o foco para o texto da decisão para o teclado não cair no
  // fundo da página.
  useEffect(() => {
    if (aberto && decisao) confirmacaoRef.current?.focus();
  }, [aberto, decisao]);

  function fechar() {
    // Fechar sem escolher apenas adia a pergunta para a próxima entrada.
    setAberto(false);
  }

  function decidir(autorizado) {
    if (!conta) return;

    const registro = registrarConsentimento(conta, autorizado);
    if (!registro) return;

    setDecisao(registro);
    avisar(
      "Consentimento registrado",
      autorizado
        ? "Você autorizou o uso dos dados para finalidades opcionais."
        : "Você não autorizou as finalidades opcionais. O acesso essencial continua liberado.",
      autorizado ? "ok" : "info",
    );
  }

  if (!conta) return null;

  return (
    <Modal
      aberto={aberto}
      aoFechar={fechar}
      titulo="Como usamos seus dados"
      texto="Um ajuste rápido, como nas preferências de cookies."
      icone="shield"
      tom="ico-teal"
      rodape={
        decisao ? (
          <button type="button" className="btn btn-primary" onClick={fechar}>
            Fechar
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-ghost" onClick={() => decidir(false)}>
              <Icone nome="x" className="icon-sm" /> Não autorizar
            </button>
            <button type="button" className="btn btn-primary" onClick={() => decidir(true)}>
              <Icone nome="check" className="icon-sm" /> Autorizar
            </button>
          </>
        )
      }
    >
      {decisao ? (
        <div className="stack-sm">
          <div
            className={`alert ${decisao.autorizado ? "info" : "warning"}`}
            role="status"
            tabIndex={-1}
            ref={confirmacaoRef}
          >
            <Icone nome={decisao.autorizado ? "check" : "x"} />
            <div>
              <b>{formatarDecisao(decisao)}</b>
            </div>
          </div>
          <p className="muted" style={{ fontSize: "0.8125rem" }}>
            A escolha fica registrada neste aparelho e pode ser alterada em Perfil →
            Privacidade. O acesso à conta, às notas e aos relatórios continua liberado em
            qualquer caso.
          </p>
          <Link to="/privacidade" onClick={fechar}>
            Ver política de privacidade
          </Link>
        </div>
      ) : (
        <div className="stack-sm">
          <p className="text-2" style={{ fontSize: "0.875rem" }}>
            Para abrir sua conta, notas e relatórios usamos dados essenciais com base no
            contrato e em obrigação legal. Isso continua valendo mesmo se você não
            autorizar.
          </p>
          <div className="stack-sm" style={{ gap: 8 }}>
            <span className="row">
              <Icone nome="check" className="icon-sm" />
              <span>Essencial: acesso à conta, notas e relatórios de acompanhamento.</span>
            </span>
            <span className="row">
              <Icone nome="sparkle" className="icon-sm" />
              <span>
                Opcional, com seu consentimento: avisos e comunicações sobre novidades e
                melhorias da plataforma.
              </span>
            </span>
          </div>
          <p className="muted" style={{ fontSize: "0.8125rem" }}>
            Você pode mudar esta escolha quando quiser em Perfil → Privacidade e consultar
            a{" "}
            <Link to="/privacidade" onClick={fechar}>
              política de privacidade
            </Link>
            .
          </p>
        </div>
      )}
    </Modal>
  );
}
