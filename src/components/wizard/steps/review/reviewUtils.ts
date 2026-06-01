import { calculateStaffing } from "../../../../calculations/calculateStaffing";
import type { MetricsSnapshot } from "../../../../calculations/types";
import type { FestivalConfig } from "../../../../types";
import type { CheckStatus } from "./ChecklistItem";

interface StaffingIssue {
  role: string;
  actual: number;
  recommended: number;
}

export interface ReadinessStatuses {
  toiletStatus: CheckStatus;
  densityStatus: CheckStatus;
  energyStatus: CheckStatus;
  financialStatus: CheckStatus;
  artistStatus: CheckStatus;
  weatherStatus: CheckStatus;
  lineupStatus: CheckStatus;
  ticketingStatus: CheckStatus;
  siteAreaStatus: CheckStatus;
  staffingStatus: CheckStatus;
  staffingIssues: StaffingIssue[];
  foodDrinkStatus: CheckStatus;
  foodDrinkParts: string[];
}

export function deriveReadinessStatuses(
  snapshot: MetricsSnapshot,
  config: FestivalConfig,
): ReadinessStatuses {
  const { pnl, siteCapacity, energy, ticketRevenue, weatherRisk, artistCosts, crowdDensity, staffing } = snapshot;

  const toiletStatus: CheckStatus = config.expectedAttendance > 0 ? "green" : "amber";

  const densityStatus: CheckStatus =
    crowdDensity.safetyStatus === "safe"
      ? "green"
      : crowdDensity.safetyStatus === "warning"
        ? "amber"
        : "red";

  const energyStatus: CheckStatus =
    energy.efficiencyWarnings.length === 0
      ? "green"
      : energy.efficiencyWarnings.length <= 2
        ? "amber"
        : "red";

  const financialStatus: CheckStatus =
    pnl.marginPct >= 20 ? "green" : pnl.marginPct >= 10 ? "amber" : "red";

  const artistStatus: CheckStatus =
    !artistCosts.overBudgetWarning && artistCosts.percentageOfRevenue < 35
      ? "green"
      : !artistCosts.overBudgetWarning
        ? "amber"
        : "red";

  const weatherStatus: CheckStatus =
    weatherRisk.rainRiskLevel === "low"
      ? "green"
      : weatherRisk.rainRiskLevel === "medium"
        ? "amber"
        : "red";

  const lineupStatus: CheckStatus =
    config.lineup.length >= 5
      ? "green"
      : config.lineup.length >= 1
        ? "amber"
        : "red";

  const ticketingStatus: CheckStatus = ticketRevenue.overAllocatedWarning
    ? "red"
    : config.ticketTiers.length >= 2
      ? "green"
      : config.ticketTiers.length >= 1
        ? "amber"
        : "red";

  const siteAreaStatus: CheckStatus =
    config.siteAreaConfig.totalAreaSqM === 0 || siteCapacity.overAllocatedWarning
      ? "red"
      : "green";

  const staffingBaseline = calculateStaffing(
    config.expectedAttendance,
    config.durationHours,
    config.stages.length,
  );
  const staffingCheckItems: StaffingIssue[] = [
    { role: "SIA Security", actual: staffing.securityCount,           recommended: staffingBaseline.securityCount },
    { role: "Stewards",     actual: staffing.stewardCount,            recommended: staffingBaseline.stewardCount },
    { role: "First Aiders", actual: staffing.medicalTeam.firstAiders, recommended: staffingBaseline.medicalTeam.firstAiders },
    { role: "Welfare",      actual: staffing.welfareStaff,            recommended: staffingBaseline.welfareStaff },
    { role: "Bar Staff",    actual: staffing.barStaff,                recommended: staffingBaseline.barStaff },
  ];
  const staffingIssues = staffingCheckItems.filter((item) => item.actual < item.recommended);
  const staffingStatus: CheckStatus = staffingIssues.some(
    (item) => item.actual === 0 || item.actual < item.recommended * 0.5,
  )
    ? "red"
    : staffingIssues.length > 0
      ? "amber"
      : "green";

  const foodVendorCount = config.vendors.filter((v) => v.type === "foodAndDrink").length;
  const hasFood = foodVendorCount > 0 || !!config.attendeesBringFood;
  const hasDrink = config.hasAlcohol || !!config.attendeesBringAlcohol;
  const foodDrinkStatus: CheckStatus = !hasFood ? "red" : !hasDrink ? "amber" : "green";
  const foodDrinkParts: string[] = [];
  if (foodVendorCount > 0)
    foodDrinkParts.push(`${foodVendorCount} food vendor${foodVendorCount !== 1 ? "s" : ""}`);
  else if (config.attendeesBringFood)
    foodDrinkParts.push("BYOF enabled");
  if (config.hasAlcohol)
    foodDrinkParts.push("licensed bar");
  else if (config.attendeesBringAlcohol)
    foodDrinkParts.push("BYOB enabled");
  if (!hasFood)
    foodDrinkParts.push("no food provision");

  return {
    toiletStatus, densityStatus, energyStatus, financialStatus,
    artistStatus, weatherStatus, lineupStatus, ticketingStatus,
    siteAreaStatus, staffingStatus, staffingIssues, foodDrinkStatus, foodDrinkParts,
  };
}
