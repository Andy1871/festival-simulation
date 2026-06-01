import type { PnLResult, CrowdDensityResult, ToiletResult, EnergyUsageResult, EfficiencyScoreResult } from './types';

const WEIGHTS = {
    financial: 0.30,
    crowd:     0.30,
    facility:  0.20,
    energy:    0.20,
} as const;

function clamp(n: number): number {
    return Math.min(100, Math.max(0, n));
}

function scoreFinancial(marginPct: number): number {
    if (marginPct <= 0)  return 0;
    if (marginPct >= 20) return 100;
    return clamp(Math.round((marginPct / 20) * 100));
}

function scoreCrowd(status: CrowdDensityResult['safetyStatus']): number {
    return status === 'safe' ? 100 : status === 'warning' ? 50 : 0;
}

function scoreFacility(required: ToiletResult, hasFoodProvision: boolean, actualTotalWCs?: number): number {
    const actual = actualTotalWCs ?? required.totalWCs;
    const toiletScore = actual >= required.totalWCs ? 100 : clamp(Math.round((actual / required.totalWCs) * 100));
    const foodScore = hasFoodProvision ? 100 : 0;
    return clamp(Math.round(toiletScore * 0.7 + foodScore * 0.3));
}

function scoreEnergy(totalKva: number, generatorSizingKva: number, warnings: string[]): number {
    if (generatorSizingKva === 0) return 0;
    const load = totalKva / generatorSizingKva;
    let base: number;
    if (load >= 0.4 && load <= 0.8)  base = 100;
    else if (load < 0.3 || load > 0.9) base = 0;
    else if (load < 0.4) base = clamp(Math.round(((load - 0.3) / 0.1) * 100));
    else                 base = clamp(Math.round(((0.9 - load) / 0.1) * 100));
    return clamp(base - warnings.length * 30);
}

export function calculateEfficiencyScore(
    pnl: PnLResult,
    crowd: CrowdDensityResult,
    toilets: ToiletResult,
    energy: EnergyUsageResult,
    hasFoodProvision: boolean,
    actualTotalWCs?: number,
): EfficiencyScoreResult {
    const financialScore = scoreFinancial(pnl.marginPct);
    const crowdScore = scoreCrowd(crowd.safetyStatus);
    const facilityScore = scoreFacility(toilets, hasFoodProvision, actualTotalWCs);
    const energyScore = scoreEnergy(energy.totalKva, energy.generatorSizingKva, energy.efficiencyWarnings);

    const overallScore = Math.round(
        financialScore * WEIGHTS.financial +
        crowdScore * WEIGHTS.crowd +
        facilityScore * WEIGHTS.facility +
        energyScore * WEIGHTS.energy,
    );

    return { 
        overallScore, 
        financialScore, 
        crowdScore, 
        facilityScore, 
        energyScore 
    };
}
