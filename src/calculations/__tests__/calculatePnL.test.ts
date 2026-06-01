import { describe, it, expect } from 'vitest';
import { calculatePnL } from '../calculatePnL';
import type { TicketRevenueResult, CateringRevenueResult, SponsorshipResult, OPEXResult, CAPEXResult } from '../types';

function makeTicket(overrides: Partial<TicketRevenueResult> = {}): TicketRevenueResult {
    return {
        grossRevenue: 100_000, maxGrossRevenue: 100_000, vatAmount: 20_000,
        netRevenueExVat: 80_000, prsCost: 2_400, bookingFeeRevenue: 10_000,
        revenueAfterDeductions: 77_600, averageYield: 50,
        overAllocatedWarning: false, totalTicketsAllocated: 2000, totalTicketsSold: 2000,
        ...overrides,
    };
}
function makeCatering(overrides: Partial<CateringRevenueResult> = {}): CateringRevenueResult {
    return { pitchFeeRevenue: 5_000, internalBarRevenue: 20_000, totalCateringRevenue: 25_000, spendPerAttendee: 12.5, ...overrides };
}
function makeSponsorship(overrides: Partial<SponsorshipResult> = {}): SponsorshipResult {
    return { tier: 'silver', ratePerHead: 3, estimatedRevenue: 6_000, ...overrides };
}
function makeOPEX(overrides: Partial<OPEXResult> = {}): OPEXResult {
    return { staffCost: 15_000, energyCost: 5_000, artistCost: 30_000, logisticsCost: 8_000, wasteCost: 3_500, insuranceCost: 2_000, marketingCost: 12_000, licenceCost: 2_500, totalOPEX: 78_000, ...overrides };
}
function makeCAPEX(overrides: Partial<CAPEXResult> = {}): CAPEXResult {
    return { stagesCost: 21_000, fencingCost: 5_000, powerInfrastructureCost: 4_500, totalCAPEX: 30_500, costPerAttendee: 15.25, ...overrides };
}

describe('calculatePnL', () => {
    it('computes profit and margin correctly', () => {
        const result = calculatePnL(makeTicket(), makeCatering(), makeSponsorship(), makeOPEX(), makeCAPEX(), 2000);
        // Total revenue = 77600 + 10000 + 25000 + 6000 = 118600
        expect(result.totalRevenue).toBe(118_600);
        // Total costs = 78000 + 30500 = 108500
        expect(result.totalCosts).toBe(108_500);
        expect(result.grossProfit).toBe(118_600 - 108_500);
        expect(result.marginPct).toBeCloseTo(8.6, 0);
        expect(result.isViable).toBe(false); // margin < 10%
    });

    it('returns zero margin and break-even 0 when revenue is zero', () => {
        const result = calculatePnL(
            makeTicket({ revenueAfterDeductions: 0, bookingFeeRevenue: 0 }),
            makeCatering({ totalCateringRevenue: 0 }),
            makeSponsorship({ estimatedRevenue: 0 }),
            makeOPEX({ totalOPEX: 50_000 }),
            makeCAPEX({ totalCAPEX: 0 }),
            1000,
        );
        expect(result.totalRevenue).toBe(0);
        expect(result.marginPct).toBe(0);
        expect(result.breakEvenAttendance).toBe(0);
        expect(result.isViable).toBe(false);
    });

    it('returns zero per-head figures when attendance is zero', () => {
        const result = calculatePnL(makeTicket(), makeCatering(), makeSponsorship(), makeOPEX(), makeCAPEX(), 0);
        expect(result.revenuePerHead).toBe(0);
        expect(result.costPerHead).toBe(0);
    });

    it('marks festival as viable when margin >= 10%', () => {
        // make revenue very high relative to costs
        const result = calculatePnL(
            makeTicket({ revenueAfterDeductions: 500_000, bookingFeeRevenue: 50_000 }),
            makeCatering({ totalCateringRevenue: 50_000 }),
            makeSponsorship({ estimatedRevenue: 0 }),
            makeOPEX({ totalOPEX: 50_000 }),
            makeCAPEX({ totalCAPEX: 10_000 }),
            5000,
        );
        expect(result.isViable).toBe(true);
        expect(result.marginPct).toBeGreaterThanOrEqual(10);
    });

    it('includes parking revenue in total', () => {
        const result = calculatePnL(makeTicket(), makeCatering(), makeSponsorship(), makeOPEX(), makeCAPEX(), 2000, 5000);
        expect(result.totalRevenue).toBe(118_600 + 5000);
    });

    it('break-even is capped when revenuePerHead is zero', () => {
        const result = calculatePnL(
            makeTicket({ revenueAfterDeductions: 0, bookingFeeRevenue: 0 }),
            makeCatering({ totalCateringRevenue: 0 }),
            makeSponsorship({ estimatedRevenue: 0 }),
            makeOPEX({ totalOPEX: 10_000 }),
            makeCAPEX({ totalCAPEX: 5_000 }),
            0,
        );
        expect(result.breakEvenAttendance).toBe(0);
    });
});
