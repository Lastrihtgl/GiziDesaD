import { formatRiskLabel } from "../../utils/formatters";

function RiskBadge({ value }) {
  return (
    <span className={`risk-badge risk-badge-${value || "unknown"}`}>
      {formatRiskLabel(value)}
    </span>
  );
}

export default RiskBadge;