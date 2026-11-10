import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../../componentes/Avatar.jsx";
import Campo from "../../componentes/Campo.jsx";
import Icone from "../../componentes/Icone.jsx";
import LayoutApp from "../../componentes/LayoutApp.jsx";
import PageHead from "../../componentes/PageHead.jsx";
import { useAutenticacao } from "../../contextos/AutenticacaoContexto.jsx";
import { useAviso } from "../../contextos/AvisoContexto.jsx";
import { api, dados } from "../../dados/dados.js";
import { api as apiServidor } from "../../servicos/api.js";
import {
  formatarDecisao,
  lerConsentimento,
  registrarConsentimento,
} from "../../utilitarios/consentimento.js";
import { useTitulo } from "../../utilitarios/useTitulo.js";

const VOLTA = {
  admin: { rotulo: "Coordenação", para: "/admin/painel" },
  professor: { rotulo: "Professor", para: "/professor/painel" },
  familia: { rotulo: "Início", para: "/familia/painel" },
};

const PERFIL_ROTULO = {
  admin: "Administrador",
  professor: "Professor",
  familia: "Responsável",
};

export default function Perfil({ papel }) {
  useTitulo("Meu perfil");
  const { usuario, atualizarSessao } = useAutenticacao();
  const { avisar } = useAviso();

  const professor =
    papel === "professor"
      ? dados.professores.find(
          (item) =>
            item.id === usuario?.profId ||
            item.email?.toLowerCase() === usuario?.email?.toLowerCase(),
        )
      : null;
  const responsavel =
    papel === "familia"
      ? dados.responsaveis.find(
          (item) =>
            item.id === usuario?.respId ||
            item.email?.toLowerCase() === usuario?.email?.toLowerCase(),
        )
      : null;

  const [form, setForm] = useState({
    nome: usuario?.nome || "",
    email: usuario?.email || "",
    telefone: usuario?.telefone || responsavel?.tel || professor?.tel || "",
    cargo: usuario?.sub || PERFIL_ROTULO[papel],
  });
  const [prefs, setPrefs] = useState({ revisao: true, devolvidos: true, resumo: false });
  const [enviando, setEnviando] = useState(false);
  // Prefere o id da conta: ele não muda se o e-mail for editado aqui.
  const contaConsentimento = usuario?.idUsuario ?? usuario?.email;
  const [consentimento, setConsentimento] = useState(() =>
    lerConsentimento(contaConsentimento),
  );

  useEffect(() => {
    setConsentimento(lerConsentimento(contaConsentimento));
  }, [contaConsentimento]);

  function decidirConsentimento(autorizado) {
    const registro = registrarConsentimento(contaConsentimento, autorizado);
    if (!registro) return;

    setConsentimento(registro);
    avisar(
      "Preferência de privacidade atualizada",
      autorizado
        ? "Você autorizou as finalidades opcionais."
        : "Você não autorizou as finalidades opcionais; o acesso essencial segue liberado.",
      autorizado ? "ok" : "info",
    );
  }

  const voltar = VOLTA[papel];

  async function salvar(evento) {
    evento.preventDefault();

    if (!form.nome.trim() || !form.email.includes("@")) {
      avisar(
        "Revise os campos destacados",
        "Nome e e-mail são obrigatórios.",
        "err",
      );
      return;
    }

    setEnviando(true);

    try {
      const { usuario: atualizado } = await apiServidor("/auth/perfil", {
        metodo: "PUT",
        corpo: {
          nome: form.nome.trim(),
          email: form.email.trim(),
          telefone: form.telefone.trim(),
        },
      });

      atualizarSessao(atualizado);

      // Mantém os dados em memória coerentes até a próxima hidratação.
      if (professor) {
        professor.nome = atualizado.nome;
        professor.email = atualizado.email;
        professor.tel = atualizado.telefone || "";
      }
      if (responsavel) {
        responsavel.nome = atualizado.nome;
        responsavel.email = atualizado.email;
        responsavel.tel = atualizado.telefone || "";
      }

      setForm((atual) => ({
        ...atual,
        nome: atualizado.nome,
        email: atualizado.email,
        telefone: atualizado.telefone || "",
      }));

      avisar("Perfil atualizado", "Seus dados foram salvos no banco.", "ok");
    } catch (erro) {
      avisar("Não foi possível salvar o perfil", erro.message, "err");
    } finally {
      setEnviando(false);
    }
  }

  const vinculos = professor ? api.vinculosDoProf(professor.id) : [];
  const turmasDoProfessor = [...new Set(vinculos.map((vinculo) => vinculo.turma))];

  return (
    <LayoutApp papel={papel} ativo="perfil">
      <PageHead
        crumbs={[{ label: voltar.rotulo, to: voltar.para }, { label: "Meu perfil" }]}
        title="Meu perfil"
        lead="Seus dados de acesso, preferências de aviso e informações da conta."
      />

      <div className="grid-main-side">
        <section className="card stack">
          <div className="row" style={{ gap: 16, alignItems: "center" }}>
            <Avatar nome={form.nome} cor={usuario?.cor || "#FFC94A"} />
            <div className="grow">
              <h2 style={{ fontSize: "1.25rem" }}>{form.nome}</h2>
              <p className="muted" style={{ fontSize: "0.875rem" }}>
                {form.cargo} · {dados.escola.nome}
              </p>
            </div>
            <span className="tag t-verde">Conta ativa</span>
          </div>

          <hr />

          <form className="stack" onSubmit={salvar}>
            <h3 className="config-h">
              <Icone nome="user" /> Dados pessoais
            </h3>
            <div className="form-grid">
              <Campo
                label="Nome completo"
                valor={form.nome}
                obrigatorio
                aoMudar={(valor) => setForm((atual) => ({ ...atual, nome: valor }))}
              />
              <Campo
                label="E-mail"
                tipo="email"
                valor={form.email}
                obrigatorio
                aoMudar={(valor) => setForm((atual) => ({ ...atual, email: valor }))}
              />
              <Campo
                label="Telefone"
                valor={form.telefone}
                aoMudar={(valor) => setForm((atual) => ({ ...atual, telefone: valor }))}
              />
              <Campo
                label="Perfil de acesso"
                valor={form.cargo}
                disabled
                dica="O perfil é definido pela coordenação da escola."
                aoMudar={(valor) => setForm((atual) => ({ ...atual, cargo: valor }))}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={enviando}>
                <Icone nome="check" /> {enviando ? "Salvando…" : "Salvar alterações"}
              </button>
            </div>
          </form>

          <hr />

          <div className="stack-sm">
            <h3 className="config-h">
              <Icone nome="bell" /> Notificações
            </h3>
            <label className="switch switch-longo">
              <input
                type="checkbox"
                role="switch"
                checked={prefs.revisao}
                onChange={(evento) =>
                  setPrefs((atual) => ({ ...atual, revisao: evento.target.checked }))
                }
              />
              <span className="track" aria-hidden="true" />
              <span className="switch-txt">
                <b>{papel === "familia" ? "Novos relatórios publicados" : "Novidades na revisão"}</b>
                <small>
                  {papel === "familia"
                    ? "Receber um aviso quando a escola publicar um acompanhamento."
                    : "Avisos de registros enviados, publicados ou devolvidos."}
                </small>
              </span>
            </label>
            <label className="switch switch-longo">
              <input
                type="checkbox"
                role="switch"
                checked={prefs.devolvidos}
                onChange={(evento) =>
                  setPrefs((atual) => ({ ...atual, devolvidos: evento.target.checked }))
                }
              />
              <span className="track" aria-hidden="true" />
              <span className="switch-txt">
                <b>{papel === "familia" ? "Retorno da escola" : "Devoluções e observações"}</b>
                <small>
                  {papel === "familia"
                    ? "Respostas da escola às observações enviadas pela família."
                    : "Avisos quando um registro voltar para ajustes."}
                </small>
              </span>
            </label>
            <label className="switch switch-longo">
              <input
                type="checkbox"
                role="switch"
                checked={prefs.resumo}
                onChange={(evento) =>
                  setPrefs((atual) => ({ ...atual, resumo: evento.target.checked }))
                }
              />
              <span className="track" aria-hidden="true" />
              <span className="switch-txt">
                <b>Resumo semanal por e-mail</b>
                <small>Um consolidado curto toda sexta-feira.</small>
              </span>
            </label>
          </div>
        </section>

        <div className="stack">
          {papel === "professor" && professor && (
            <section className="card stack-sm">
              <h2 style={{ fontSize: "1.125rem" }}>Minhas disciplinas</h2>
              <span className="tag-group">
                {professor.disc.map((id) => (
                  <span className="tag t-azul" key={id}>
                    {api.disc(id)?.nome || id}
                  </span>
                ))}
              </span>
              <h3 style={{ fontSize: "0.9375rem", marginTop: 8 }}>Turmas vinculadas</h3>
              {turmasDoProfessor.map((id) => {
                const turma = api.turma(id);
                return (
                  <div className="row-between" key={id}>
                    <Link to={`/professor/turmas/${id}`}>{turma?.nome}</Link>
                    <small className="muted">
                      {vinculos.filter((v) => v.turma === id).length} disciplina(s)
                    </small>
                  </div>
                );
              })}
            </section>
          )}

          {papel === "familia" && responsavel && (
            <section className="card stack-sm">
              <h2 style={{ fontSize: "1.125rem" }}>Meus alunos</h2>
              {responsavel.alunos.map((id) => {
                const aluno = api.aluno(id);
                const turma = api.turma(aluno?.turma);
                if (!aluno) return null;
                return (
                  <Link className="row" key={id} to={`/familia/painel?aluno=${id}`}>
                    <Avatar nome={aluno.nome} cor={aluno.cor} tamanho="sm" />
                    <span className="grow">
                      <b>{aluno.nome}</b>
                      <small className="muted" style={{ display: "block" }}>
                        {turma?.nome} · RA {aluno.ra}
                      </small>
                    </span>
                    <Icone nome="chevron-right" className="icon-sm" />
                  </Link>
                );
              })}
              <p className="muted" style={{ fontSize: "0.8125rem" }}>
                Consentimento LGPD registrado em {responsavel.consentimento}.
              </p>
            </section>
          )}

          <section className="card stack-sm">
            <h2 style={{ fontSize: "1.125rem" }}>Sessões ativas</h2>
            <div className="row-between">
              <span className="row">
                <Icone nome="monitor" className="icon-sm" />
                <span>
                  <b>Este navegador</b>
                  <small className="muted" style={{ display: "block" }}>
                    Sessão atual · agora
                  </small>
                </span>
              </span>
              <span className="tag t-verde">Atual</span>
            </div>
            <div className="row-between">
              <span className="row">
                <Icone nome="phone" className="icon-sm" />
                <span>
                  <b>Celular</b>
                  <small className="muted" style={{ display: "block" }}>
                    Último acesso em 27/09, às 19:40
                  </small>
                </span>
              </span>
              <button type="button" className="btn btn-ghost btn-sm">
                Encerrar
              </button>
            </div>
          </section>

          <section className="card stack-sm">
            <h2 style={{ fontSize: "1.125rem" }}>Privacidade</h2>
            <p className="muted" style={{ fontSize: "0.875rem" }}>
              Os dados desta demonstração são fictícios. Em produção, o acesso aos relatórios segue
              a LGPD e a política de privacidade da escola.
            </p>
            <p style={{ fontSize: "0.875rem" }}>
              <b>
                {consentimento
                  ? formatarDecisao(consentimento)
                  : "Você ainda não decidiu sobre as finalidades opcionais."}
              </b>
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => decidirConsentimento(true)}
                disabled={consentimento?.autorizado === true}
              >
                <Icone nome="check" className="icon-sm" /> Autorizar
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => decidirConsentimento(false)}
                disabled={consentimento?.autorizado === false}
              >
                <Icone nome="x" className="icon-sm" /> Não autorizar
              </button>
            </div>
            <Link className="link-config" to="/privacidade">
              <Icone nome="lock" className="icon-sm" /> Ver política de privacidade
            </Link>
          </section>
        </div>
      </div>
    </LayoutApp>
  );
}
