import type { PnLResult, TicketRevenueResult, CAPEXResult, OPEXResult, CateringRevenueResult, SponsorshipResult } from './types';

export function calculatePnL(
    ticketRevenue: TicketRevenueResult,
    catering: CateringRevenueResult,
    sponsorship: SponsorshipResult,
    opex: OPEXResult,
    capex: CAPEXResult,
    expectedAttendance: number,
    parkingRevenue: number = 0,
): PnLResult {
    const totalRevenue =
        ticketRevenue.revenueAfterDeductions -
        ticketRevenue.bookingFeeRevenue +
        catering.totalCateringRevenue +
        sponsorship.estimatedRevenue +
        parkingRevenue;

    const totalCosts = opex.totalOPEX + capex.totalCAPEX;

    const grossProfit = totalRevenue - totalCosts;
    const netProfit   = grossProfit; // no tax added for simplicity

    const marginPct = totalRevenue > 0
        ? Math.round((grossProfit / totalRevenue) * 1000) / 10
        : 0;

    const revenuePerHead = expectedAttendance > 0
        ? Math.round((totalRevenue / expectedAttendance) * 100) / 100
        : 0;

    // Break-even: how many attendees needed to cover all costs, given the full per-head revenue
    const breakEvenAttendance = revenuePerHead > 0
        ? Math.ceil(totalCosts / revenuePerHead)
        : 0;

    const costPerHead = expectedAttendance > 0
        ? Math.round((totalCosts / expectedAttendance) * 100) / 100
        : 0;

    return {
        totalRevenue,
        totalCosts,
        grossProfit,
        netProfit,
        marginPct,
        breakEvenAttendance,
        revenuePerHead,
        costPerHead,
        isViable: marginPct >= 10,
    };
}
