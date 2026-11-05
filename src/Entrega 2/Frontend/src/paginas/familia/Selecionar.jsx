import { Link, Navigate, useNavigate } from "react-router-dom";
import Icone from "../../componentes/Icone.jsx";
import Marca from "../../componentes/Marca.jsx";
import { useAutenticacao } from "../../contextos/AutenticacaoContexto.jsx";
import { useAviso } from "../../contextos/AvisoContexto.jsx";
import { api } from "../../dados/dados.js";
import { iniciais, primeiroNome } from "../../utilitarios/formatadores.js";
import { useTitulo } from "../../utilitarios/useTitulo.js";

export default function Selecionar() {
  useTitulo("Escolha o aluno");
  const { usuario, sair } = useAutenticacao();
  const { avisar } = useAviso();
  const navegar = useNavigate();
  const responsavel = api.resp(usuario?.respId || "r1");

  if (!responsavel) return <Navigate to="/acesso-negado" replace />;

  function sairConta() {
    sair();
    avisar("Você saiu da sua conta", "Sessão encerrada neste navegador.", "info");
    navegar("/entrar");
  }

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="pick-screen" id="conteudo">
        <Link className="logo" to="/">
          <Marca />
          <span className="word">KFKA</span>
        </Link>

        <div className="stack-sm" style={{ textAlign: "center" }}>
          <h1 id="page-title" tabIndex={-1}>
            Quem você quer acompanhar?
          </h1>
          <p className="lead">
            Olá, {primeiroNome(responsavel.nome)}. Escolha um dos alunos vinculados à sua conta.
          </p>
        </div>

        <div className="pick-grid">
          {responsavel.alunos.map((id) => {
            const aluno = api.aluno(id);
            const turma = api.turma(aluno.turma);
            const novos = api.relsDaFamilia(responsavel.id, aluno.id).filter((r) => !r.lido).length;

            return (
              <Link
                className="pick-card"
                key={aluno.id}
                to={`/familia/painel?aluno=${aluno.id}`}
              >
                <span className="pick-avatar" style={{ background: aluno.cor }}>
                  {iniciais(aluno.nome)}
                </span>
                <b>{primeiroNome(aluno.nome)}</b>
                <small>
                  {turma.nome} · {turma.turno}
                </small>
                {novos ? (
                  <span className="status nao-lido">
                    <Icone nome="bell" />
                    {novos} novo{novos > 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className="status lido">
                    <Icone nome="check" />
                    Tudo lido
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="alert neutral" style={{ maxWidth: 520 }}>
          <Icone nome="shield" />
          <div>
            Você vê apenas os alunos vinculados pela escola à sua conta. Algum aluno faltando?
            Fale com a secretaria.
          </div>
        </div>

        <button type="button" className="btn btn-ghost" onClick={sairConta}>
          <Icone nome="logout" /> Sair
        </button>
      </div>
    </>
  );
}
