import { STATUS, STATUS_PADRAO } from "../dados/status.js";
import Icone from "./Icone.jsx";

export default function StatusBadge({ status, curto = false }) {
  const info = STATUS[status] || STATUS_PADRAO;
  return (
    <span className={`status ${status}`}>
      <Icone nome={info.icon} />
      {curto && info.short ? info.short : info.label}
    </span>
  );
}
