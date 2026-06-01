import type { OPEXResult, StaffingResult, EnergyUsageResult, ArtistCostResult } from './types';
import {
  WASTE_COST_PER_ATTENDEE,
  INSURANCE_COST_PER_ATTENDEE,
  LOGISTICS_COST_PER_ATTENDEE,
  MARKETING_REVENUE_PCT,
  PREMISES_LICENCE_COST,
  PPL_LICENCE_COST,
} from './constants';

export function calculateOPEX(
  staffing: StaffingResult,
  energy: EnergyUsageResult,
  artistCosts: ArtistCostResult,
  expectedAttendance: number,
  grossTicketRevenue: number,
): OPEXResult {
  const staffCost   = staffing.estimatedStaffCost;
  const energyCost  = energy.fuelCostEstimate;
  const artistCost  = artistCosts.grandTotal;

  const logisticsCost = Math.round(expectedAttendance * LOGISTICS_COST_PER_ATTENDEE);
  const wasteCost     = Math.round(expectedAttendance * WASTE_COST_PER_ATTENDEE);
  const insuranceCost = Math.round(expectedAttendance * INSURANCE_COST_PER_ATTENDEE);
  const marketingCost = Math.round(grossTicketRevenue * MARKETING_REVENUE_PCT);
  const licenceCost   = PREMISES_LICENCE_COST + PPL_LICENCE_COST;

  const totalOPEX =
    staffCost + energyCost + artistCost +
    logisticsCost + wasteCost + insuranceCost +
    marketingCost + licenceCost;

  return {
    staffCost,
    energyCost,
    artistCost,
    logisticsCost,
    wasteCost,
    insuranceCost,
    marketingCost,
    licenceCost,
    totalOPEX: Math.round(totalOPEX),
  };
}
