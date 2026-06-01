import {
    UK_RAIN_PROBABILITY_BY_MONTH,
    RAIN_ATTENDANCE_DROP,
    RAIN_MEDICAL_UPLIFT_PER_HEAD,
} from './constants';
import type { PnLResult, WeatherRiskResult } from './types';

type RiskLevel = 'low' | 'medium' | 'high';

function riskLevel(probability: number): RiskLevel {
    if (probability >= 0.35) return 'high';
    if (probability >= 0.22) return 'medium';
    return 'low';
}

const RECOMMENDATIONS: Record<RiskLevel, string> = {
    low:    'Low rain risk. Standard wet weather provisions recommended.',
    medium: 'Moderate rain risk. Ensure adequate shelter, drainage, and additional medical supplies. Review cancellation insurance.',
    high:   'High rain risk. Enhanced shelter, site drainage, and welfare provisions essential. Cancellation insurance required. Brief all staff on wet weather protocols.',
};

export function calculateWeatherRisk(
    dateISO: string,
    pnl: PnLResult,
    expectedAttendance: number,
): WeatherRiskResult {
    const parsedDate = dateISO ? new Date(dateISO + 'T00:00:00') : null;
    const month = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getMonth() + 1 : 6;
    const rainProbability = UK_RAIN_PROBABILITY_BY_MONTH[month] ?? 0.25;
    const level = riskLevel(rainProbability);

    // Financial & attendance impacts of rain on festival.
    const attendanceImpactPct   = RAIN_ATTENDANCE_DROP[level];
    const attendanceUnderRain   = Math.round(expectedAttendance * (1 - attendanceImpactPct));
    const revenueImpact         = Math.round(pnl.revenuePerHead * (expectedAttendance - attendanceUnderRain));
    const medicalCostImpact     = Math.round(expectedAttendance * RAIN_MEDICAL_UPLIFT_PER_HEAD[level]);

    const revenueUnderRain = pnl.totalRevenue - revenueImpact;
    const costsUnderRain   = pnl.totalCosts + medicalCostImpact;
    const marginUnderRain  = revenueUnderRain > 0
        ? Math.round(((revenueUnderRain - costsUnderRain) / revenueUnderRain) * 1000) / 10
        : 0;

    return {
        rainRiskLevel:      level,
        rainProbabilityPct: Math.round(rainProbability * 100),
        attendanceImpactPct: Math.round(attendanceImpactPct * 100),
        attendanceUnderRain,
        revenueImpact,
        medicalCostImpact,
        marginUnderRain,
        recommendation: RECOMMENDATIONS[level],
    };
}
