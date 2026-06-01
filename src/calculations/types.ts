import type { ArtistTier } from '../types';

// Return types from calculation functions

export interface ArtistCostResult {
    totalFees: number;
    feesByTier: Record<ArtistTier, number>;
    riderEstimate: number;
    productionEstimate: number;
    prsLicenceCost: number;
    grandTotal: number;
    percentageOfRevenue: number;
    overBudgetWarning: boolean;
}

export interface CAPEXResult {
    stagesCost: number;
    fencingCost: number;
    powerInfrastructureCost: number;
    totalCAPEX: number;
    costPerAttendee: number;
}

export interface CateringRevenueResult {
    pitchFeeRevenue: number;
    internalBarRevenue: number;
    totalCateringRevenue: number;
    spendPerAttendee: number;
}

export interface CrowdDensityResult {
    density: number;
    safeMax: number;
    safetyStatus: 'safe' | 'warning' | 'danger';
    headroomPct: number;
    recommendedMaxAttendance: number;
}

export interface EnergyUsageResult {
    totalKva: number;
    generatorSizingKva: number;
    fuelLitresPerHour: number;
    fuelCostEstimate: number;
    co2KgEstimate: number;
    efficiencyWarnings: string[];
    barUnitCount: number;
}

export interface EfficiencyScoreResult {
    overallScore: number;
    financialScore: number;
    crowdScore: number;
    facilityScore: number;
    energyScore: number;
}

export interface OPEXResult {
    staffCost: number;
    energyCost: number;
    artistCost: number;
    logisticsCost: number;
    wasteCost: number;
    insuranceCost: number;
    marketingCost: number;
    licenceCost: number;
    totalOPEX: number;
}

export interface PnLResult {
    totalRevenue: number;
    totalCosts: number;
    grossProfit: number;
    netProfit: number;
    marginPct: number;
    breakEvenAttendance: number;
    revenuePerHead: number;
    costPerHead: number;
    isViable: boolean;
}

export interface QueueResult {
    avgWaitSeconds: number;
    avgWaitMinute: number;
    utilisation: number; // 0-1 scale. Above 0.85 is a warning
    queueLength: number; 
    status: 'clear' | 'busy' | 'overwhelmed';
    recommendation: string;
}

export interface StaffingResult {
    securityCount: number;
    stewardCount: number;
    medicalTeam: { firstAiders: number; paramedics: number; doctors: number };
    welfareStaff: number;
    barStaff: number;
    totalHeadCount: number;
    estimatedStaffCost: number;
}

export interface SponsorshipResult {
    tier: string;
    ratePerHead: number;
    estimatedRevenue: number;
}

export interface SiteCapacityResult {
    usableAreaSqM: number;
    maxAttendance: number;
    overAllocatedWarning: boolean;
}

export interface TicketRevenueResult {
    grossRevenue: number;
    maxGrossRevenue: number;
    vatAmount: number;
    netRevenueExVat: number;
    prsCost: number;
    bookingFeeRevenue: number;
    revenueAfterDeductions: number;
    averageYield: number;
    overAllocatedWarning: boolean;
    totalTicketsAllocated: number;
    totalTicketsSold: number;
}

export interface ToiletResult {
    femaleWCs: number;
    maleWCs: number;
    urinals: number;
    accessibleWCs: number;
    totalWCs: number;
    handwashingStations: number;
}

export interface WeatherRiskResult {
    rainRiskLevel: 'low' | 'medium' | 'high';
    rainProbabilityPct: number;
    attendanceImpactPct: number;
    attendanceUnderRain: number;
    revenueImpact: number;
    medicalCostImpact: number;
    marginUnderRain: number;
    recommendation: string;
}

// Aggregated snapshot of all simulation results — returned by runSimulation()
export interface MetricsSnapshot {
    siteCapacity:    SiteCapacityResult;
    ticketRevenue:   TicketRevenueResult;
    artistCosts:     ArtistCostResult;
    staffing:        StaffingResult;
    energy:          EnergyUsageResult;
    opex:            OPEXResult;
    capex:           CAPEXResult;
    catering:        CateringRevenueResult;
    sponsorship:     SponsorshipResult;
    parkingRevenue:  number;
    pnl:             PnLResult;
    toilets:         ToiletResult;
    crowdDensity:    CrowdDensityResult;
    weatherRisk:     WeatherRiskResult;
    efficiencyScore: EfficiencyScoreResult;
}
