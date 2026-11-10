import { Link } from "react-router-dom";
import Icone from "../../componentes/Icone.jsx";
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
      <div className="alert info">
        <Icone nome="shield" />
        <div>Conexão segura. Seus dados e os dos alunos são protegidos conforme a LGPD.</div>
      </div>
      <p className="auth-rodape">
        Ainda não tem conta? <Link to="/criar-conta">Criar conta</Link>
        <span aria-hidden="true">·</span>
        <Link to="/">Voltar ao início</Link>
      </p>
    </LayoutAuth>
  );
}
