import {STAGE_HIRE_COSTS, FENCING_COST_PER_METRE, TEMP_ROADWAY_PER_100M, GENERATOR_HIRE_PER_UNIT, SITE_SURVEY_COST, SITE_MANAGEMENT_COST, SIGNAGE_COST, WELFARE_TENT_COST, MEDICAL_TENT_COST} from './constants';
import type { Stage, SiteAreaConfig } from '../types'
import type { CAPEXResult } from './types'

export function calculateCAPEX(stages: Stage[], siteAreaConfig: SiteAreaConfig, expectedAttendance: number): CAPEXResult { 
    const stagesCost = stages.reduce((sum, stage) => {
        const costs = STAGE_HIRE_COSTS[stage.type];
        return sum + costs.structure + costs.pa + costs.lighting;
    }, 0)

    const perimeterMetres = Math.round(Math.sqrt(siteAreaConfig.totalAreaSqM) * 4); // Approximate perimeter for a square area
    const fencingCost = perimeterMetres * FENCING_COST_PER_METRE;

    const roadwayCost = Math.ceil(expectedAttendance / 5000) * TEMP_ROADWAY_PER_100M; // Assume 1 roadway per 5000 attendees

    const generatorCost = (stages.length + 1) * GENERATOR_HIRE_PER_UNIT; // 1 generator per stage + 1 for general power needs

    const powerInfrastructureCost = generatorCost + roadwayCost; // For simplicity, we can combine generator and power infrastructure costs

    const additionalFixedSiteCosts = SITE_SURVEY_COST + SITE_MANAGEMENT_COST + SIGNAGE_COST + WELFARE_TENT_COST + MEDICAL_TENT_COST;

    const totalCAPEX = stagesCost + fencingCost + powerInfrastructureCost + additionalFixedSiteCosts;

    const costPerAttendee = totalCAPEX / expectedAttendance;

    return {
        stagesCost,
        fencingCost,
        powerInfrastructureCost,
        totalCAPEX,
        costPerAttendee,
    }
 }