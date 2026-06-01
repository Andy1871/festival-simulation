import type { FestivalConfig } from '../types';
import type { MetricsSnapshot } from '../calculations/types';

function download(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function exportToJSON(config: FestivalConfig, snapshot: MetricsSnapshot) {
    const payload = { exportedAt: new Date().toISOString(), config, metrics: snapshot };
    const slug = (config.name || 'festival').replace(/\s+/g, '-').toLowerCase();
    download(JSON.stringify(payload, null, 2), `${slug}-forecast.json`, 'application/json');
}

export function exportToCSV(config: FestivalConfig, snapshot: MetricsSnapshot) {
    const { pnl, ticketRevenue, artistCosts, staffing, energy, capex, opex, catering, sponsorship, crowdDensity, toilets, weatherRisk, efficiencyScore, siteCapacity } = snapshot;

    const rows: [string, string | number][] = [
        // Config summary
        ['Festival Name',              config.name],
        ['Date',                       config.dateISO],
        ['Location',                   config.location],
        ['Duration (hours)',           config.durationHours],
        ['Expected Attendance',        config.expectedAttendance],
        ['Stages',                     config.stages.length],
        ['Artists',                    config.lineup.length],
        ['Has Licensed Bar',           config.hasAlcohol ? 'Yes' : 'No'],
        // Financial
        ['Total Revenue (£)',          pnl.totalRevenue],
        ['Total Costs (£)',            pnl.totalCosts],
        ['Net Profit (£)',             pnl.netProfit],
        ['Margin (%)',                 pnl.marginPct],
        ['Break-even Attendance',      pnl.breakEvenAttendance],
        ['Revenue per Head (£)',       pnl.revenuePerHead],
        ['Cost per Head (£)',          pnl.costPerHead],
        ['Is Viable',                  pnl.isViable ? 'Yes' : 'No'],
        // Revenue streams
        ['Ticket Revenue Net of VAT (£)',   ticketRevenue.netRevenueExVat],
        ['Booking Fee Revenue (£)',         ticketRevenue.bookingFeeRevenue],
        ['Catering & Bar Revenue (£)',      catering.totalCateringRevenue],
        ['Sponsorship Revenue (£)',         sponsorship.estimatedRevenue],
        ['Parking Revenue (£)',             snapshot.parkingRevenue],
        // Costs
        ['Artist Fees & Riders (£)',        artistCosts.grandTotal],
        ['Staffing Cost (£)',               staffing.estimatedStaffCost],
        ['Energy / Fuel Cost (£)',          energy.fuelCostEstimate],
        ['CAPEX (£)',                       capex.totalCAPEX],
        ['Logistics + Waste + Insurance (£)', opex.logisticsCost + opex.wasteCost + opex.insuranceCost],
        ['Marketing (£)',                   opex.marketingCost],
        ['Licences (£)',                    opex.licenceCost],
        // Operations
        ['Total Staff Headcount',          staffing.totalHeadCount],
        ['SIA Security',                   staffing.securityCount],
        ['Stewards',                       staffing.stewardCount],
        ['First Aiders',                   staffing.medicalTeam.firstAiders],
        ['Paramedics',                     staffing.medicalTeam.paramedics],
        ['Doctors',                        staffing.medicalTeam.doctors],
        ['Bar Staff',                      staffing.barStaff],
        // Site & crowd
        ['Total Site Area (m²)',           config.siteAreaConfig.totalAreaSqM],
        ['Usable Audience Area (m²)',      siteCapacity.usableAreaSqM],
        ['Max Safe Attendance',            siteCapacity.maxAttendance],
        ['Crowd Density (p/m²)',           crowdDensity.density],
        ['Crowd Safety Status',            crowdDensity.safetyStatus],
        // Facilities
        ['Female WCs',                     toilets.femaleWCs],
        ['Male WCs',                       toilets.maleWCs],
        ['Urinals',                        toilets.urinals],
        ['Accessible WCs',                 toilets.accessibleWCs],
        ['Total Toilet Units',             toilets.totalWCs],
        ['Handwashing Stations',           toilets.handwashingStations],
        // Energy
        ['Total kVA',                      energy.totalKva],
        ['Fuel Cost (£)',                  energy.fuelCostEstimate],
        ['CO₂ Estimate (kg)',              energy.co2KgEstimate],
        // Risk & score
        ['Weather Risk Level',             weatherRisk.rainRiskLevel],
        ['Rain Probability (%)',           weatherRisk.rainProbabilityPct],
        ['Margin Under Rain (%)',          weatherRisk.marginUnderRain],
        ['Overall Efficiency Score',       efficiencyScore.overallScore],
        ['Financial Score',                efficiencyScore.financialScore],
        ['Crowd Score',                    efficiencyScore.crowdScore],
        ['Facility Score',                 efficiencyScore.facilityScore],
        ['Energy Score',                   efficiencyScore.energyScore],
    ];

    const csv = rows
        .map(([label, value]) => `"${label}","${value}"`)
        .join('\n');

    const slug = (config.name || 'festival').replace(/\s+/g, '-').toLowerCase();
    download(csv, `${slug}-forecast.csv`, 'text/csv');
}
