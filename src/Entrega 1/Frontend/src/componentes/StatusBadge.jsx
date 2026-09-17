import { statusLabel } from "../dados/constantes.js";

function StatusBadge({ value }) {
    return <span className={`status status--${value}`}>{statusLabel[value]}</span>;
}

export default StatusBadge;