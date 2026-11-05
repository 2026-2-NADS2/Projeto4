import { Link } from "react-router-dom";
import LayoutAuth from "../../componentes/LayoutAuth.jsx";
import { useTitulo } from "../../utilitarios/useTitulo.js";
import { EscolhaDePerfil, LogoMobile } from "./partes.jsx";

export default function CriarConta() {
  useTitulo("Criar conta");

  return (
    <LayoutAuth>
      <div className="stack-sm">
        <LogoMobile />
        <h1 id="page-title" tabIndex={-1}>
          Para quem é a conta?
        </h1>
        <p className="text-2">O KFKA tem três perfis. Cada um vê só o que precisa.</p>
      </div>
      <EscolhaDePerfil base="criar-conta" />
      <p className="auth-rodape">
        Já tem conta? <Link to="/entrar">Entrar</Link>
        <span aria-hidden="true">·</span>
        <Link to="/">Voltar ao início</Link>
      </p>
    </LayoutAuth>
  );
}
