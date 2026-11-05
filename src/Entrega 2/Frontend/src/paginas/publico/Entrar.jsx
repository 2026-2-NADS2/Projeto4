import { Link } from "react-router-dom";
import LayoutAuth from "../../componentes/LayoutAuth.jsx";
import { useTitulo } from "../../utilitarios/useTitulo.js";
import { EscolhaDePerfil, LogoMobile } from "./partes.jsx";

export default function Entrar() {
  useTitulo("Entrar");

  return (
    <LayoutAuth>
      <div className="stack-sm">
        <LogoMobile />
        <h1 id="page-title" tabIndex={-1}>
          Como você acessa o KFKA?
        </h1>
        <p className="text-2">
          Escolha seu perfil para continuar. Se você tiver mais de um perfil, pode trocar depois de
          entrar.
        </p>
      </div>
      <EscolhaDePerfil base="entrar" />
      <p className="auth-rodape">
        Ainda não tem conta? <Link to="/criar-conta">Criar conta</Link>
        <span aria-hidden="true">·</span>
        <Link to="/">Voltar ao início</Link>
      </p>
    </LayoutAuth>
  );
}
