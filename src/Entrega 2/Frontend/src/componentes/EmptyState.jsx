import Icone from "./Icone.jsx";

export default function EmptyState({ icone = "inbox", titulo, texto, acoes }) {
  return (
    <div className="empty">
      <div className="art">
        <Icone nome={icone} />
      </div>
      <h2>{titulo}</h2>
      <p>{texto}</p>
      {acoes && (
        <div className="row" style={{ justifyContent: "center" }}>
          {acoes}
        </div>
      )}
    </div>
  );
}
