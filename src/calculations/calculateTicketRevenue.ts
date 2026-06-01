import { VAT_RATE, BOOKING_FEE_PCT, PRS_LICENCE_PCT } from './constants'
import type { TicketTier } from '../types'
import type { TicketRevenueResult } from './types'

export function calculateTicketRevenue(
    ticketTiers: TicketTier[],
    maxAttendance: number = 0,
): TicketRevenueResult {
    const totalTicketsAllocated = ticketTiers.reduce((sum, t) => sum + t.allocation, 0);
    const grossRevenue = ticketTiers.reduce((sum, t) => sum + t.priceGBP * t.allocation, 0);

    const vatAmount = Math.round(grossRevenue * VAT_RATE);
    const netRevenueExVat = grossRevenue - vatAmount;
    const prsCost = Math.round(netRevenueExVat * PRS_LICENCE_PCT);
    const bookingFeeRevenue = Math.round(grossRevenue * BOOKING_FEE_PCT);
    const revenueAfterDeductions = netRevenueExVat - prsCost;

    const averageYield = totalTicketsAllocated > 0
        ? Math.round((grossRevenue / totalTicketsAllocated) * 100) / 100
        : 0;

    const maxGrossRevenue = maxAttendance > 0
        ? Math.round(maxAttendance * averageYield)
        : 0;


    return {
        grossRevenue,
        maxGrossRevenue,
        vatAmount,
        netRevenueExVat,
        prsCost,
        bookingFeeRevenue,
        revenueAfterDeductions,
        averageYield,
        overAllocatedWarning: maxAttendance > 0 && totalTicketsAllocated > maxAttendance,
        totalTicketsAllocated,
        totalTicketsSold: totalTicketsAllocated,
    };
}
