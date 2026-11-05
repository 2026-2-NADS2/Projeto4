import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Campo from "../../componentes/Campo.jsx";
import Icone from "../../componentes/Icone.jsx";
import LayoutAuth from "../../componentes/LayoutAuth.jsx";
import { useAviso } from "../../contextos/AvisoContexto.jsx";
import { emailValido } from "../../utilitarios/formatadores.js";
import { useTitulo } from "../../utilitarios/useTitulo.js";

const FORCA = ["Senha muito fraca", "Senha fraca", "Senha média", "Senha boa", "Senha forte"];

function nivelDaSenha(valor) {
  if (!valor) return 0;
  return (
    (valor.length >= 8 ? 1 : 0) +
    (/\d/.test(valor) ? 1 : 0) +
    (/[^\w\s]/.test(valor) ? 1 : 0) +
    (/[A-Z]/.test(valor) && /[a-z]/.test(valor) ? 1 : 0)
  );
}

function Etapa({ numero, titulo, atual }) {
  const concluida = numero < atual;
  return (
    <span className={`step${concluida ? " done" : numero === atual ? " current" : ""}`}>
      <span className="n">{concluida ? "✓" : numero}</span>
      {titulo}
    </span>
  );
}

export default function RecuperarSenha() {
  const [busca, setBusca] = useSearchParams();
  const navegar = useNavigate();
  const { avisar } = useAviso();
  const passo = Math.min(3, Math.max(1, Number(busca.get("passo") || 1)));

  const [email, setEmail] = useState("");
  const [erroEmail, setErroEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [erroConfirmacao, setErroConfirmacao] = useState("");

  useTitulo(
    passo === 1 ? "Recuperar senha" : passo === 2 ? "Verifique seu e-mail" : "Nova senha",
  );

  const nivel = nivelDaSenha(senha);

  function enviarEmail(evento) {
    evento.preventDefault();
    const limpo = email.trim();
    if (!limpo) return setErroEmail("Preencha este campo.");
    if (!emailValido(limpo)) return setErroEmail("Informe um e-mail válido, como nome@escola.edu.br.");
    setErroEmail("");
    setBusca({ passo: "2" });
  }

  function salvarSenha(evento) {
    evento.preventDefault();
    let invalido = false;

    if (senha.length < 8) {
      setErroSenha("Use pelo menos 8 caracteres.");
      invalido = true;
    } else {
      setErroSenha("");
    }

    if (confirmacao !== senha) {
      setErroConfirmacao("As senhas não coincidem.");
      invalido = true;
    } else {
      setErroConfirmacao("");
    }

    if (invalido) return;

    avisar("Senha alterada (simulação)", "Agora é só entrar com a nova senha.", "ok");
    navegar("/entrar");
  }

  return (
    <LayoutAuth>
      <Link to="/entrar" className="row" style={{ fontWeight: 700, textDecoration: "none", gap: 6 }}>
        <Icone nome="chevron-left" className="icon-sm" /> Voltar ao login
      </Link>

      <div className="stepper">
        <Etapa numero={1} titulo="E-mail" atual={passo} />
        <span className="step-line" />
        <Etapa numero={2} titulo="Verificação" atual={passo} />
        <span className="step-line" />
        <Etapa numero={3} titulo="Nova senha" atual={passo} />
      </div>

      <div className="stack-sm">
        <h1 id="page-title" tabIndex={-1}>
          {passo === 1
            ? "Esqueceu a senha?"
            : passo === 2
              ? "Verifique seu e-mail"
              : "Crie uma nova senha"}
        </h1>
        <p className="text-2">
          {passo === 1
            ? "Informe o e-mail cadastrado. Enviaremos um link seguro."
            : passo === 2
              ? "Enviamos as instruções para o e-mail informado."
              : "Use uma senha que você não utilize em outros serviços."}
        </p>
      </div>

      {passo === 1 && (
        <form className="stack" noValidate onSubmit={enviarEmail}>
          <Campo
            id="remail"
            label="E-mail cadastrado"
            tipo="email"
            valor={email}
            aoMudar={setEmail}
            obrigatorio
            icone="mail"
            placeholder="nome@email.com"
            erro={erroEmail}
            autoComplete="email"
            inputMode="email"
          />
          <button className="btn btn-primary btn-lg btn-block" type="submit">
            <Icone nome="send" /> Enviar link de redefinição
          </button>
        </form>
      )}

      {passo === 2 && (
        <>
          <div className="alert success">
            <Icone nome="check" />
            <div>
              <b>Link enviado (simulação)</b>
              Se o e-mail estiver cadastrado, você receberá um link válido por 30 minutos. Confira
              também a caixa de spam.
            </div>
          </div>
          <Link className="btn btn-secondary btn-lg btn-block" to="/recuperar-senha?passo=3">
            Já recebi — criar nova senha
          </Link>
          <button
            type="button"
            className="link-btn"
            onClick={() => avisar("Link reenviado (simulação)", "Confira sua caixa de entrada.", "info")}
          >
            Reenviar e-mail
          </button>
        </>
      )}

      {passo === 3 && (
        <form className="stack" noValidate onSubmit={salvarSenha}>
          <Campo
            id="nsenha"
            label="Nova senha"
            tipo="password"
            valor={senha}
            aoMudar={setSenha}
            obrigatorio
            icone="lock"
            erro={erroSenha}
            dica="Mínimo de 8 caracteres, com número e símbolo."
            autoComplete="new-password"
          />
          <div className="forca">
            <div className="strength" data-nivel={nivel} aria-hidden="true">
              {[0, 1, 2, 3].map((indice) => (
                <span key={indice} className={indice < nivel ? "on" : undefined} />
              ))}
            </div>
            <span className="forca-txt" aria-live="polite">
              {senha ? FORCA[nivel] : ""}
            </span>
          </div>
          <Campo
            id="csenha"
            label="Confirmar nova senha"
            tipo="password"
            valor={confirmacao}
            aoMudar={setConfirmacao}
            obrigatorio
            icone="lock"
            erro={erroConfirmacao}
            autoComplete="new-password"
          />
          <button className="btn btn-primary btn-lg btn-block" type="submit">
            <Icone nome="check" /> Salvar e entrar
          </button>
        </form>
      )}
    </LayoutAuth>
  );
}
