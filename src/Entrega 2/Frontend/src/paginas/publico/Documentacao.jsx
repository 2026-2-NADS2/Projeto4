import { Link } from "react-router-dom";
import Icone from "../../componentes/Icone.jsx";
import LayoutPublico from "../../componentes/LayoutPublico.jsx";
import { useTitulo } from "../../utilitarios/useTitulo.js";

export default function Documentacao() {
  useTitulo("Documentação");

  return (
    <LayoutPublico>
      <div className="section">
        <div className="section-head" style={{ marginBottom: "var(--s6)" }}>
          <h1 id="page-title" tabIndex={-1}>
            Documentação do frontend
          </h1>
          <p>
            Esta versão do KFKA foi migrada para React + Vite preservando o design system, as telas e
            os fluxos do protótipo da Entrega 2.
          </p>
        </div>

        <div className="grid-3">
          <div className="card stack-sm">
            <span className="ico ico-blue">
              <Icone nome="layers" />
            </span>
            <h2>React + Vite</h2>
            <p className="text-2">
              Rotas com React Router, componentes reutilizáveis, contextos de autenticação, tema e
              avisos. O CSS original foi mantido em <code>src/estilos</code>.
            </p>
          </div>

          <div className="card stack-sm">
            <span className="ico ico-teal">
              <Icone nome="folder" />
            </span>
            <h2>Protótipo preservado</h2>
            <p className="text-2">
              A versão em HTML, CSS e JavaScript puro está em <code>legado/prototipo-entrega2</code>,
              junto da documentação, dos testes e das referências de design.
            </p>
          </div>

          <div className="card stack-sm">
            <span className="ico ico-warn">
              <Icone nome="server" />
            </span>
            <h2>Próxima etapa: API</h2>
            <p className="text-2">
              As telas usam uma camada de dados simulada, pronta para ser substituída pelas rotas da
              API Express com autenticação, validação e respostas padronizadas.
            </p>
          </div>
        </div>

        <div className="card stack" style={{ marginTop: "var(--s6)" }}>
          <h2>Como executar</h2>
          <pre style={{ overflowX: "auto", margin: 0, fontFamily: "var(--font-mono)" }}>
            <code>{`cd "src/Entrega 2/Frontend"\nnpm install\nnpm run dev\nnpm run build`}</code>
          </pre>
          <p className="text-2">
            O servidor de desenvolvimento usa o proxy <code>/api</code> para a API Express em{" "}
            <code>http://localhost:3000</code>. A variável <code>VITE_API_URL</code> define a URL da
            API em produção.
          </p>
          <div className="row">
            <Link className="btn btn-secondary" to="/privacidade">
              <Icone nome="shield" className="icon-sm" /> Privacidade
            </Link>
            <Link className="btn btn-primary" to="/">
              <Icone nome="home" className="icon-sm" /> Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    </LayoutPublico>
  );
}
