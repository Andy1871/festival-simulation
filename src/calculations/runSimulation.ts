import type { FestivalConfig } from '../types';
import type { MetricsSnapshot } from './types';

import { calculateArtistCost }         from './calculateArtistCosts';
import { calculateCAPEX }              from './calculateCAPEX';
import { calculateCateringRevenue }    from './calculateCateringRevenue';
import { calculateCrowdDensity }       from './calculateCrowdDensity';
import { calculateEfficiencyScore }    from './calculateEfficiencyScore';
import { calculateEnergyUsage }        from './calculateEnergyUsage';
import { calculateOPEX }               from './calculateOPEX';
import { calculatePnL }                from './calculatePnL';
import { calculateSiteCapacity }       from './calculateSiteCapacity';
import { calculateSponsorshipRevenue } from './calculateSponsorshipRevenue';
import { calculateStaffing }           from './calculateStaffing';
import { calculateTicketRevenue }      from './calculateTicketRevenue';
import { calculateToilets }            from './calculateToilets';
import { calculateWeatherRisk }        from './calculateWeatherRisk';

export function runSimulation(config: FestivalConfig): MetricsSnapshot {
    const {
        lineup, stages, vendors, ticketTiers, siteAreaConfig,
        expectedAttendance, durationHours, genderSplitFemalePct,
        hasAlcohol, dateISO, sponsors, staffOverrides,
        attendeesBringAlcohol,
    } = config;

    // 1 — Site capacity gates everything: max attendance and over-allocation warning
    const siteCapacity = calculateSiteCapacity(
        siteAreaConfig,
        ticketTiers.reduce((sum, t) => sum + t.allocation, 0),
    );

    // 2 — Ticket revenue: revenueAfterDeductions feeds into artist cost budget check
    const ticketRevenue = calculateTicketRevenue(ticketTiers, siteCapacity.maxAttendance);

    // Use allocated tickets as the effective attendance so all financials are consistent.
    // Fall back to expectedAttendance when no tickets have been configured yet.
    const effectiveAttendance = ticketRevenue.totalTicketsAllocated || expectedAttendance;

    // 3 — Artist costs need revenueAfterDeductions for the over-budget warning
    const artistCosts = calculateArtistCost(lineup, ticketRevenue.revenueAfterDeductions);

    // 4 — Staffing and energy are independent of each other
    const staffing = calculateStaffing(effectiveAttendance, durationHours, stages.length, staffOverrides);
    const energy = calculateEnergyUsage(stages, vendors, effectiveAttendance, durationHours, hasAlcohol);

    // 5 — Remaining cost and revenue blocks (all independent at this point)
    const opex = calculateOPEX(staffing, energy, artistCosts, effectiveAttendance, ticketRevenue.grossRevenue);
    const capex = calculateCAPEX(stages, siteAreaConfig, effectiveAttendance);
    const catering = calculateCateringRevenue(vendors, effectiveAttendance, durationHours, hasAlcohol, attendeesBringAlcohol ?? false);
    const sponsorship = calculateSponsorshipRevenue(sponsors, effectiveAttendance);

    // 6 — PnL depends on all revenue and cost blocks above
    const parkingRevenue = siteAreaConfig.hasParking && siteAreaConfig.parkingSpaces && siteAreaConfig.parkingPermitCostGBP
        ? siteAreaConfig.parkingSpaces * siteAreaConfig.parkingPermitCostGBP
        : 0;
    const pnl = calculatePnL(ticketRevenue, catering, sponsorship, opex, capex, effectiveAttendance, parkingRevenue);

    // 7 — Compliance calculations are independent
    const toilets = calculateToilets(effectiveAttendance, durationHours, genderSplitFemalePct, hasAlcohol);
    const crowdDensity = calculateCrowdDensity(effectiveAttendance, siteCapacity.usableAreaSqM);

    // 8 — Risk and score depend on PnL being finalised
    const weatherRisk = calculateWeatherRisk(dateISO, pnl, effectiveAttendance);
    const hasFoodProvision = !!config.attendeesBringFood || vendors.some(v => v.type === 'foodAndDrink');
    const efficiencyScore = calculateEfficiencyScore(pnl, crowdDensity, toilets, energy, hasFoodProvision);

    return {
        siteCapacity,
        ticketRevenue,
        artistCosts,
        staffing,
        energy,
        opex,
        capex,
        catering,
        sponsorship,
        parkingRevenue,
        pnl,
        toilets,
        crowdDensity,
        weatherRisk,
        efficiencyScore,
    };
}
