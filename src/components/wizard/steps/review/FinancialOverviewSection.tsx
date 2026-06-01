import { Section, Row } from "./";
import type { MetricsSnapshot } from "../../../../calculations/types";

function fmt(n: number) {
  return `£${n.toLocaleString("en-GB")}`;
}
function pct(n: number) {
  return `${n.toFixed(1)}%`;
}

interface FinancialOverviewSectionProps {
  pnl: MetricsSnapshot["pnl"];
  totalTicketsAllocated: number;
}

export function FinancialOverviewSection({ pnl, totalTicketsAllocated }: FinancialOverviewSectionProps) {
  const marginColor =
    pnl.marginPct >= 20
      ? "text-green-600"
      : pnl.marginPct >= 10
        ? "text-amber-600"
        : "text-red-600";

  return (
    <Section title="Financial Overview">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Gross Revenue", value: fmt(pnl.totalRevenue) },
          { label: "Total Costs", value: fmt(pnl.totalCosts) },
          { label: "Net Profit", value: fmt(pnl.netProfit) },
          { label: "Margin", value: pct(pnl.marginPct), color: marginColor },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-lg font-semibold ${color ?? "text-gray-800"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>
      <Row
        label="Break-even attendance"
        value={pnl.breakEvenAttendance.toLocaleString("en-GB")}
        sub="tickets needed"
        valueColor={
          pnl.breakEvenAttendance > totalTicketsAllocated
            ? "text-red-600"
            : "text-green-600"
        }
      />
      <Row label="Revenue per head" value={fmt(pnl.revenuePerHead)} />
      <Row label="Cost per head" value={fmt(pnl.costPerHead)} />
      <Row
        label="Viability (Profit margin > 10%)"
        value={pnl.isViable ? "Viable" : "Not viable"}
        valueColor={pnl.isViable ? "text-green-600" : "text-red-600"}
      />
    </Section>
  );
}
