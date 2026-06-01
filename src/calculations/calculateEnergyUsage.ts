import {
  KVA_REQUIREMENTS,
  GENERATOR_POWER_FACTOR,
  GENERATOR_OPTIMAL_LOAD,
  DIESEL_LITRES_PER_KVA_HOUR,
  DIESEL_COST_PER_LITRE_GBP,
  DIESEL_CO2_KG_PER_LITRE,
} from './constants';
import type { Stage, Vendor } from '../types';
import type { EnergyUsageResult } from './types';

const STAGE_KVA: Record<string, number> = {
    main: KVA_REQUIREMENTS.mainStage.default,
    second: KVA_REQUIREMENTS.secondStage.default,
    small: KVA_REQUIREMENTS.smallStage.default,
    acoustic: KVA_REQUIREMENTS.acousticTent.default,
};

const VENDOR_KVA: Record<string, number> = {
    foodAndDrink: KVA_REQUIREMENTS.foodVendor.default,
    merch: 3,     // POS terminal + minimal lighting
    sponsor: 3,
};

export function calculateEnergyUsage(
    stages: Stage[],
    vendors: Vendor[],
    expectedAttendance: number,
    durationHours: number,
    hasAlcohol: boolean,
): EnergyUsageResult {
    const warnings: string[] = [];

    // Calculate stage power requirements
    const stageKva = stages.reduce((sum, stage) => sum + (STAGE_KVA[stage.type] ?? KVA_REQUIREMENTS.acousticTent.default), 0);

    // calculate vendor power requirements
    const vendorKva = vendors.reduce((sum, vendor) => sum + (VENDOR_KVA[vendor.type] ?? KVA_REQUIREMENTS.foodVendor.default), 0);

    // internal bar units estimate 1 unit per 200 attendees
    const barUnitCount = hasAlcohol ? Math.ceil(expectedAttendance / 200) : 0;
    const barKva = barUnitCount * KVA_REQUIREMENTS.barUnit.default;

    const infrastructureKva = KVA_REQUIREMENTS.siteLighting.default + KVA_REQUIREMENTS.productionOffice.default;

    const totalKva = stageKva + vendorKva + barKva + infrastructureKva;

    // size generators so peak load sits at GENERATOR_OPTIMAL_LOAD (65%)
    const generatorSizingKva = Math.ceil(totalKva / GENERATOR_OPTIMAL_LOAD);

    const fuelLitresPerHour = totalKva * GENERATOR_POWER_FACTOR * DIESEL_LITRES_PER_KVA_HOUR;
    const fuelCostEstimate = Math.round(fuelLitresPerHour * durationHours * DIESEL_COST_PER_LITRE_GBP);
    const co2KgEstimate = Math.round(fuelLitresPerHour * durationHours * DIESEL_CO2_KG_PER_LITRE);

    if ((totalKva / generatorSizingKva) < 0.4) {
        warnings.push('Generators will run under 40% load — consider consolidating to fewer, larger units.');
    }
    if (co2KgEstimate > 5000) {
        warnings.push('High CO₂ output — consider hybrid generator or solar supplementation.');
    }

    return {
        totalKva,
        generatorSizingKva,
        fuelLitresPerHour: Math.round(fuelLitresPerHour * 10) / 10,
        fuelCostEstimate,
        co2KgEstimate,
        efficiencyWarnings: warnings,
        barUnitCount,
    };
}
