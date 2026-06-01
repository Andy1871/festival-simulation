import { Section, ChecklistItem, deriveReadinessStatuses } from "./";
import type { MetricsSnapshot } from "../../../../calculations/types";
import type { FestivalConfig } from "../../../../types";

interface ReadinessChecklistSectionProps {
  snapshot: MetricsSnapshot;
  config: FestivalConfig;
}

function pct(n: number) {
  return `${n.toFixed(1)}%`;
}

export function ReadinessChecklistSection({
  snapshot,
  config,
}: ReadinessChecklistSectionProps) {
  const { pnl, toilets, crowdDensity, energy, artistCosts, weatherRisk, staffing, ticketRevenue, siteCapacity, catering } = snapshot;

  const {
    toiletStatus, densityStatus, energyStatus, financialStatus,
    artistStatus, weatherStatus, lineupStatus, ticketingStatus,
    siteAreaStatus, staffingStatus, staffingIssues, foodDrinkStatus, foodDrinkParts,
  } = deriveReadinessStatuses(snapshot, config);

  return (
    <Section title="Readiness Checklist">
      <ChecklistItem
        label="Toilet provision"
        status={toiletStatus}
        detail={`${toilets.totalWCs} units`}
        sub={`${toilets.femaleWCs} female · ${toilets.maleWCs} male · ${toilets.urinals} urinals · ${toilets.accessibleWCs} accessible`}
      />
      <ChecklistItem
        label="Crowd density"
        status={densityStatus}
        detail={`${crowdDensity.density.toFixed(2)} p/m²`}
        sub={`Safe max ${crowdDensity.safeMax.toFixed(2)} p/m²`}
      />
      <ChecklistItem
        label="Energy provision"
        status={energyStatus}
        detail={`${energy.totalKva.toLocaleString("en-GB")} kVA total`}
        sub={
          energy.efficiencyWarnings.length > 0
            ? energy.efficiencyWarnings
            : "No warnings"
        }
      />
      <ChecklistItem
        label="Financial viability"
        status={financialStatus}
        detail={`${pct(pnl.marginPct)} margin`}
        sub={`Break-even at ${pnl.breakEvenAttendance.toLocaleString("en-GB")} attendees`}
      />
      <ChecklistItem
        label="Artist budget"
        status={artistStatus}
        detail={`${artistCosts.percentageOfRevenue.toFixed(1)}% of revenue`}
        sub={
          artistCosts.overBudgetWarning
            ? "Over industry threshold (45%)"
            : "Within budget"
        }
      />
      <ChecklistItem
        label="Weather risk"
        status={weatherStatus}
        detail={`${weatherRisk.rainProbabilityPct}% chance of rain`}
        sub={`Rain scenario pushes margin to ${pct(weatherRisk.marginUnderRain)}`}
      />
      <ChecklistItem
        label="Lineup"
        status={lineupStatus}
        detail={`${config.lineup.length} artist${config.lineup.length !== 1 ? "s" : ""}`}
        sub={`Across ${config.stages.length} stage${config.stages.length !== 1 ? "s" : ""}`}
      />
      <ChecklistItem
        label="Ticketing"
        status={ticketingStatus}
        detail={`${config.ticketTiers.length} tier${config.ticketTiers.length !== 1 ? "s" : ""}`}
        sub={
          ticketRevenue.overAllocatedWarning
            ? `Over capacity — ${ticketRevenue.totalTicketsAllocated.toLocaleString("en-GB")} allocated`
            : `${ticketRevenue.totalTicketsAllocated.toLocaleString("en-GB")} tickets allocated`
        }
      />
      <ChecklistItem
        label="Total site area"
        status={siteAreaStatus}
        detail={
          config.siteAreaConfig.totalAreaSqM > 0
            ? `${config.siteAreaConfig.totalAreaSqM.toLocaleString("en-GB")} m²`
            : "Not set"
        }
        sub={
          siteCapacity.overAllocatedWarning
            ? "Allocated areas exceed site — no usable audience space"
            : `${siteCapacity.usableAreaSqM.toLocaleString("en-GB")} m² usable for audiences`
        }
      />
      <ChecklistItem
        label="Food & drinks"
        status={foodDrinkStatus}
        detail={
          catering.totalCateringRevenue > 0
            ? `£${catering.totalCateringRevenue.toLocaleString("en-GB")}`
            : "No provision"
        }
        sub={
          foodDrinkParts.length > 0
            ? foodDrinkParts.join(" · ")
            : "No food or drink configured"
        }
      />
      <ChecklistItem
        label="Staffing"
        status={staffingStatus}
        detail={`${staffing.totalHeadCount} total`}
        sub={
          staffingIssues.length > 0
            ? staffingIssues.map(
                (item) =>
                  `${item.role}: ${item.actual} (rec. ${item.recommended})`,
              )
            : "All roles meet recommendations"
        }
      />
    </Section>
  );
}
