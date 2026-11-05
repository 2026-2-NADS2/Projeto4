// Rodapé de paginação com contagem e navegação real (não é mais ilustrativa).
export default function Pagination({ de, ate, total, pagina, totalPaginas, aoMudar }) {
  if (total === 0) return null;

  const paginas = [];
  const inicio = Math.max(1, Math.min(pagina - 1, totalPaginas - 2));
  const fim = Math.min(totalPaginas, inicio + 2);
  for (let numero = inicio; numero <= fim; numero += 1) paginas.push(numero);

  return (
    <div className="pagination">
      <span>
        Mostrando {de}–{ate} de {total}
      </span>
      <div className="pages" role="group" aria-label="Paginação">
        <button
          type="button"
          aria-label="Página anterior"
          onClick={() => aoMudar?.(pagina - 1)}
          disabled={pagina <= 1}
        >
          ‹
        </button>
        {paginas.map((numero) => (
          <button
            key={numero}
            type="button"
            aria-current={numero === pagina ? "page" : undefined}
            onClick={() => aoMudar?.(numero)}
          >
            {numero}
          </button>
        ))}
        <button
          type="button"
          aria-label="Próxima página"
          onClick={() => aoMudar?.(pagina + 1)}
          disabled={pagina >= totalPaginas}
        >
          ›
        </button>
      </div>
    </div>
  );
}
