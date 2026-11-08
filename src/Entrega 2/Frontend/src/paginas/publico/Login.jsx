import { useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Campo from "../../componentes/Campo.jsx";
import Icone from "../../componentes/Icone.jsx";
import LayoutAuth from "../../componentes/LayoutAuth.jsx";
import {
  ErroAutenticacao,
  PERFIS,
  useAutenticacao,
} from "../../contextos/AutenticacaoContexto.jsx";
import { useAviso } from "../../contextos/AvisoContexto.jsx";
import { emailValido, normalizarEmail } from "../../utilitarios/formatadores.js";
import { useTitulo } from "../../utilitarios/useTitulo.js";
import { PilulaPerfil } from "./partes.jsx";

// Tentativas por e-mail, mantidas entre montagens como no protótipo.
const tentativas = {};

export default function Login() {
  const { perfil } = useParams();
  const [busca] = useSearchParams();
  const navegar = useNavigate();
  const { entrar } = useAutenticacao();
  const { avisar } = useAviso();

  const dadosPerfil = PERFIS[perfil];
  const [email, setEmail] = useState(busca.get("email") || "");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(true);
  const [erroEmail, setErroEmail] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [alerta, setAlerta] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useTitulo(dadosPerfil ? `Entrar · ${dadosPerfil.pill}` : "Entrar");

  if (!dadosPerfil) return <Navigate to="/entrar" replace />;

  const volta = busca.get("volta");
  const motivo = busca.get("motivo");

  async function enviar(evento) {
    evento.preventDefault();
    setErroEmail("");
    setErroSenha("");
    setAlerta(null);

    const emailLimpo = email.trim();
    let invalido = false;

    if (!emailLimpo) {
      setErroEmail("Preencha este campo.");
      invalido = true;
    } else if (!emailValido(emailLimpo)) {
      setErroEmail("Informe um e-mail válido, como nome@escola.edu.br.");
      invalido = true;
    }

    if (!senha) {
      setErroSenha("Preencha este campo.");
      invalido = true;
    }

    if (invalido) return;

    const chave = normalizarEmail(emailLimpo);
    if ((tentativas[chave] || 0) >= 3) {
      setAlerta({
        titulo: "Acesso bloqueado por 15 minutos",
        texto:
          "Foram 3 tentativas com a senha errada. Use “Esqueci minha senha” para criar uma nova.",
        tipo: "danger",
      });
      return;
    }

    try {
      setEnviando(true);
      const sessao = await entrar({ perfil, email: emailLimpo, senha, lembrar });
      delete tentativas[chave];

      avisar(
        `Olá, ${sessao.nome.trim().split(/\s+/)[0]}!`,
        `Você entrou como ${dadosPerfil.nome}.`,
        "ok",
      );

      const area = `/${dadosPerfil.area}/`;
      navegar(volta && volta.startsWith(area) ? volta : dadosPerfil.destino, { replace: true });
    } catch (erro) {
      if (!(erro instanceof ErroAutenticacao)) {
        setAlerta({
          titulo: "Não foi possível entrar",
          texto: "Tente novamente em alguns instantes.",
          tipo: "danger",
        });
        return;
      }

      if (erro.codigo === "sem-conta") {
        setAlerta({
          titulo: "Não encontramos uma conta com este e-mail",
          texto: "Confira o endereço ou crie sua conta.",
          tipo: "danger",
          link: { para: `/criar-conta/${perfil}`, rotulo: `Criar conta de ${dadosPerfil.nome}` },
        });
      } else if (erro.codigo === "outro-perfil") {
        setAlerta({
          titulo: `Este e-mail é de uma conta de ${PERFIS[erro.perfil]?.nome || "outro perfil"}`,
          texto: "Entre pelo perfil correto para continuar.",
          tipo: "danger",
          link: {
            para: `/entrar/${erro.perfil}?email=${encodeURIComponent(emailLimpo)}`,
            rotulo: `Entrar como ${PERFIS[erro.perfil]?.nome || "outro perfil"}`,
          },
        });
      } else if (erro.codigo === "senha") {
        tentativas[chave] = (tentativas[chave] || 0) + 1;
        const restantes = 3 - tentativas[chave];
        setErroSenha(
          restantes > 0
            ? `Senha incorreta. ${
                restantes === 1
                  ? "Resta 1 tentativa"
                  : `Restam ${restantes} tentativas`
              } antes do bloqueio de 15 minutos.`
            : "Senha incorreta. O acesso foi bloqueado por 15 minutos.",
        );
        document.getElementById("senha")?.select();
      } else {
        // Falhas ao carregar os dados após o login (ex.: erro 500) não tinham
        // mensagem nenhuma na tela.
        setAlerta({
          titulo: "Não foi possível entrar",
          texto: erro.mensagem || "Tente novamente em alguns instantes.",
          tipo: "danger",
        });
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <LayoutAuth>
      <Link to="/entrar" className="voltar">
        <Icone nome="chevron-left" className="icon-sm" /> Trocar perfil
      </Link>

      <div className="stack-sm">
        <PilulaPerfil perfil={perfil} />
        <h1 id="page-title" tabIndex={-1}>
          Bem-vindo de volta
        </h1>
        <p className="text-2">Entre com o e-mail da sua conta.</p>
      </div>

      {volta && (
        <div className="alert info" role="status">
          <Icone nome="lock" />
          <div>
            <b>
              {motivo === "perfil"
                ? `Esta área é de ${dadosPerfil.nome}`
                : "Entre para continuar"}
            </b>
            {motivo === "perfil"
              ? ` Para abrir, entre com uma conta de ${dadosPerfil.nome}.`
              : " Esta tela só abre com login."}
          </div>
        </div>
      )}

      {alerta && (
        <div className={`alert ${alerta.tipo}`} role="alert">
          <Icone nome="alert" />
          <div>
            <b>{alerta.titulo}</b>
            {alerta.texto}{" "}
            {alerta.link && <Link to={alerta.link.para}>{alerta.link.rotulo}</Link>}
          </div>
        </div>
      )}

      <form className="stack" id="login-form" noValidate onSubmit={enviar}>
        <Campo
          id="email"
          label="E-mail"
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
        <Campo
          id="senha"
          label="Senha"
          tipo="password"
          valor={senha}
          aoMudar={setSenha}
          obrigatorio
          icone="lock"
          erro={erroSenha}
          autoComplete="current-password"
        />
        <div className="row-between">
          <label className="check">
            <input
              type="checkbox"
              checked={lembrar}
              onChange={(evento) => setLembrar(evento.target.checked)}
            />{" "}
            Lembrar de mim
          </label>
          <Link to="/recuperar-senha" style={{ fontWeight: 700 }}>
            Esqueci minha senha
          </Link>
        </div>
        <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={enviando}>
          {enviando ? "Entrando…" : "Entrar"} <Icone nome="chevron-right" />
        </button>
      </form>

      <p className="auth-rodape">
        Ainda não tem conta?{" "}
        <Link to={`/criar-conta/${perfil}`}>Criar conta de {dadosPerfil.nome}</Link>
      </p>
      <div className="alert info">
        <Icone nome="shield" />
        <div>Conexão segura. Seus dados e os dos alunos são protegidos conforme a LGPD.</div>
      </div>
    </LayoutAuth>
  );
}
