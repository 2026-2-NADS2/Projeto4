import { Component } from "react";
import Icone from "./Icone.jsx";

// Sem um limite de erro, uma falha de render (inclusive a de um chunk lazy que
// não pôde ser baixado) desmonta a árvore inteira e deixa só o fundo da página.
// Aqui a interface continua viva e oferece recarregar, que busca o index.html
// atual e, com ele, os chunks do deploy vigente.
export default class LimiteDeErro extends Component {
  constructor(props) {
    super(props);
    this.state = { erro: null };
    this.recarregar = this.recarregar.bind(this);
  }

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    console.error("Falha ao renderizar a tela:", erro, info?.componentStack);
  }

  recarregar() {
    this.setState({ erro: null });
    window.location.reload();
  }

  render() {
    if (!this.state.erro) return this.props.children;

    return (
      <section
        className="section"
        role="alert"
        style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}
      >
        <div style={{ maxWidth: 520, display: "grid", gap: 12, textAlign: "center" }}>
          <Icone nome="alert" style={{ width: 40, height: 40, margin: "0 auto" }} />
          <h1 style={{ margin: 0 }}>Não foi possível carregar esta tela</h1>
          <p className="text-2" style={{ margin: 0 }}>
            A página provavelmente foi atualizada enquanto esta aba estava aberta.
            Recarregue para continuar de onde parou.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <button type="button" className="btn btn-primary" onClick={this.recarregar}>
              <Icone nome="refresh" className="icon-sm" /> Recarregar página
            </button>
            <a className="btn btn-secondary" href="/">
              <Icone nome="home" className="icon-sm" /> Página inicial
            </a>
          </div>
        </div>
      </section>
    );
  }
}
