import { Section, Row } from "./";
import type { MetricsSnapshot } from "../../../../calculations/types";

function fmt(n: number) {
  return `£${n.toLocaleString("en-GB")}`;
}

interface CostsBreakdownSectionProps {
  pnl: MetricsSnapshot["pnl"];
  artistCosts: MetricsSnapshot["artistCosts"];
  staffing: MetricsSnapshot["staffing"];
  energy: MetricsSnapshot["energy"];
  capex: MetricsSnapshot["capex"];
  opex: MetricsSnapshot["opex"];
}

export function CostsBreakdownSection({
  pnl,
  artistCosts,
  staffing,
  energy,
  capex,
  opex,
}: CostsBreakdownSectionProps) {
  return (
    <Section title="Costs Breakdown">
      <Row
        label="Artist fees (incl. riders)"
        value={fmt(artistCosts.grandTotal)}
        valueColor={
          artistCosts.overBudgetWarning ? "text-amber-600" : "text-gray-800"
        }
      />
      <Row
        label="Staffing"
        value={fmt(staffing.estimatedStaffCost)}
        sub={`${staffing.totalHeadCount} total staff`}
      />
      <Row
        label="Energy (fuel)"
        value={fmt(energy.fuelCostEstimate)}
        sub={`${energy.totalKva.toLocaleString("en-GB")} kVA total`}
      />
      <Row
        label="CAPEX (infra & stages)"
        value={fmt(capex.totalCAPEX)}
        sub={`£${capex.costPerAttendee.toFixed(2)}/head`}
      />
      <Row
        label="Logistics, waste & insurance"
        value={fmt(opex.logisticsCost + opex.wasteCost + opex.insuranceCost)}
      />
      <Row label="Marketing" value={fmt(opex.marketingCost)} />
      <Row
        label="Licences (PRS, PPL, premises)"
        value={fmt(opex.licenceCost)}
      />
      <Row
        label="Total costs"
        value={fmt(pnl.totalCosts)}
        valueColor="text-red-700"
      />
    </Section>
  );
}
