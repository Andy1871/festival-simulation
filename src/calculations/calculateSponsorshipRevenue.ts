import { SPONSORSHIP_RATE_PER_HEAD } from './constants';
import type { Sponsor } from '../types';
import type { SponsorshipResult } from './types';

export function calculateSponsorshipRevenue(
    sponsors: Sponsor[],
    expectedAttendance: number,
): SponsorshipResult {
    if (sponsors.length === 0) {
        return { tier: 'none', ratePerHead: 0, estimatedRevenue: 0 };
    }

    const estimatedRevenue = sponsors.reduce(
        (sum, s) => sum + Math.round(expectedAttendance * SPONSORSHIP_RATE_PER_HEAD[s.tier]),
        0,
    );

    const ratePerHead = expectedAttendance > 0 ? estimatedRevenue / expectedAttendance : 0;
    const tier = `${sponsors.length} sponsor${sponsors.length !== 1 ? 's' : ''}`;

    return { tier, ratePerHead, estimatedRevenue };
}
