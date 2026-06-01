import { AVG_ATTENDEE_AlC_SPEND_PER_12h, BAR_GROSS_MARGIN_PCT, BYOB_BAR_SPEND_MULTIPLIER } from './constants'
import type { Vendor } from '../types'
import type { CateringRevenueResult } from './types'

export function calculateCateringRevenue(
    vendors: Vendor[],
    expectedAttendance: number,
    durationHours: number,
    hasAlcohol: boolean,
    attendeesBringAlcohol: boolean = false,
): CateringRevenueResult {
    const pitchFeeRevenue = vendors.reduce((sum, vendor) => sum + (vendor.pitchFee ?? 0), 0);

    const alcMultiplier  = attendeesBringAlcohol ? BYOB_BAR_SPEND_MULTIPLIER : 1;
    const scaledAlcSpend = AVG_ATTENDEE_AlC_SPEND_PER_12h * (durationHours / 12) * alcMultiplier;
    const internalBarRevenue = hasAlcohol
        ? Math.round(expectedAttendance * scaledAlcSpend * BAR_GROSS_MARGIN_PCT)
        : 0;

    const totalCateringRevenue = pitchFeeRevenue + internalBarRevenue;
    const spendPerAttendee = expectedAttendance > 0
        ? Math.round((totalCateringRevenue / expectedAttendance) * 100) / 100
        : 0;

    return { pitchFeeRevenue, internalBarRevenue, totalCateringRevenue, spendPerAttendee };
}
