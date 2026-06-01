import type { MetricsSnapshot } from "../../calculations/types";
import type { FestivalConfig } from "../../types";

interface ForecastBarProps {
  config: FestivalConfig;
  snapshot: MetricsSnapshot;
}

interface MetricProps {
  label: string;
  value: string;
  color?: "green" | "amber" | "red" | "neutral";
}

function Metric({ label, value, color = "neutral" }: MetricProps) {
  const valueColor =
    color === "green"
      ? "text-green-400"
      : color === "amber"
        ? "text-amber-400"
        : color === "red"
          ? "text-red-400"
          : "text-gray-100";
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-sm font-semibold tabular-nums ${valueColor}`}>
        {value}
      </span>
      <span className="text-xs text-gray-500 whitespace-nowrap">{label}</span>
    </div>
  );
}

function Divider() {
  return <span className="w-px h-6 bg-gray-700 shrink-0" />;
}

function marginColor(pct: number): MetricProps["color"] {
  if (pct >= 20) return "green";
  if (pct >= 10) return "amber";
  return "red";
}

function scoreColor(score: number): MetricProps["color"] {
  if (score >= 70) return "green";
  if (score >= 40) return "amber";
  return "red";
}

function fmt(n: number) {
  return n.toLocaleString("en-GB");
}

export function ForecastBar({ config, snapshot }: ForecastBarProps) {
  const { pnl, siteCapacity, efficiencyScore } = snapshot;

  const { ticketRevenue } = snapshot;
  const allocated = ticketRevenue.totalTicketsAllocated;
  const hasAllocated = allocated > 0;
  const hasCapacity = siteCapacity.maxAttendance > 0;
  const hasRevenue = pnl.totalRevenue > 0;

  const capacityColor: MetricProps["color"] =
    hasCapacity && allocated > siteCapacity.maxAttendance
      ? "red"
      : hasAllocated
        ? "green"
        : "neutral";

  const name = config.name || "New Festival";
  const dateLabel = config.dateISO
    ? new Date(config.dateISO).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No date set";
  const attendVal = hasAllocated
    ? `${fmt(allocated)} att${hasCapacity ? ` / ${fmt(siteCapacity.maxAttendance)} att` : ""}`
    : "—";
  const marginVal = hasRevenue ? `${pnl.marginPct.toFixed(1)}%` : "—";
  const scoreVal = `${efficiencyScore.overallScore}/100`;
  const netPnlVal = hasRevenue
    ? (pnl.netProfit >= 0 ? "+" : "-") + "£" + fmt(Math.abs(pnl.netProfit))
    : "—";
  const netPnlColor: MetricProps["color"] = !hasRevenue
    ? "neutral"
    : pnl.netProfit > 0 ? "green" : pnl.netProfit < 0 ? "red" : "neutral";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-gray-900 border-t border-gray-800">
      {/* Mobile: 3-column grid, wraps naturally */}
      <div className="md:hidden grid grid-cols-3 gap-x-3 gap-y-2 px-4 py-3">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm font-semibold text-gray-100 truncate max-w-full text-center">
            {name}
          </span>
          <span className="text-xs text-gray-500 truncate text-center">
            {dateLabel}
          </span>
        </div>
        <Metric
          label="Allocated / Max"
          value={attendVal}
          color={capacityColor}
        />
        <Metric
          label="Net P&L"
          value={netPnlVal}
          color={netPnlColor}
        />
        <Metric
          label="Margin"
          value={marginVal}
          color={hasRevenue ? marginColor(pnl.marginPct) : "neutral"}
        />
        <Metric
          label="Efficiency"
          value={scoreVal}
          color={scoreColor(efficiencyScore.overallScore)}
        />
        <div className="flex items-center justify-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${pnl.isViable ? "bg-green-400" : "bg-red-400"}`}
          />
          <span
            className={`text-sm font-medium ${pnl.isViable ? "text-green-400" : "text-red-400"}`}
          >
            {pnl.isViable ? "Viable" : "Not viable"}
          </span>
        </div>
      </div>

      {/* Desktop: single row with dividers */}
      <div className="hidden md:flex items-center h-14 gap-4 px-6">
        <div className="flex flex-col shrink-0 min-w-0">
          <span className="text-sm font-semibold text-gray-100 truncate max-w-36">
            {name}
          </span>
          <span className="text-xs text-gray-500">{dateLabel}</span>
        </div>
        <Divider />
        <Metric
          label="Allocated / Max"
          value={attendVal}
          color={capacityColor}
        />
        <Divider />
        <Metric
          label="Net P&L"
          value={netPnlVal}
          color={netPnlColor}
        />
        <Divider />
        <Metric
          label="Margin"
          value={marginVal}
          color={hasRevenue ? marginColor(pnl.marginPct) : "neutral"}
        />
        <Divider />
        <Metric
          label="Efficiency"
          value={scoreVal}
          color={scoreColor(efficiencyScore.overallScore)}
        />
        <Divider />
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${pnl.isViable ? "bg-green-400" : "bg-red-400"}`}
          />
          <span
            className={`text-sm font-medium ${pnl.isViable ? "text-green-400" : "text-red-400"}`}
          >
            {pnl.isViable ? "Viable" : "Not viable"}
          </span>
        </div>
      </div>
    </div>
  );
}
