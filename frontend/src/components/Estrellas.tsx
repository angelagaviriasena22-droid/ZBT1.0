import "./Estrellas.css";

interface Props {
  valor: number;
  onCambio?: (n: number) => void;
  tamano?: "normal" | "grande";
}

function Estrellas({ valor, onCambio, tamano = "normal" }: Props) {
  const redondeado = Math.round(valor);

  return (
    <span className={`estrellas estrellas-${tamano}`} aria-label={`${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) =>
        onCambio ? (
          <button
            key={n}
            type="button"
            className={n <= valor ? "on" : ""}
            onClick={() => onCambio(n)}
            aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
          >
            ★
          </button>
        ) : (
          <span key={n} className={n <= redondeado ? "on" : ""}>★</span>
        )
      )}
    </span>
  );
}

export default Estrellas;