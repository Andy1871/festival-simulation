import { ARTIST_FEES, ARTIST_RIDER_MULTIPLIER, TALENT_BUDGET_MAX_PCT, PRS_LICENCE_PCT } from './constants'
import type { Artist, ArtistTier } from '../types'
import type { ArtistCostResult } from './types'

export function calculateArtistCost(
    lineup: Artist[],
    totalTicketRevenueAfterDeductions: number
): ArtistCostResult {
    // Use midpoint of tier range unless the artist has a manual override
  const feesByTier = {} as Record<ArtistTier, number>;

  for (const tier of Object.keys(ARTIST_FEES) as ArtistTier[]) {
    feesByTier[tier] = 0;
  }

  let totalFees = 0;

  for (const artist of lineup) {
    const range     = ARTIST_FEES[artist.tier];
    const midpoint  = Math.round((range.min + range.max) / 2);
    const fee       = artist.feeOverrideGBP ?? midpoint;

    feesByTier[artist.tier] = (feesByTier[artist.tier] ?? 0) + fee;
    totalFees += fee;
  }

  const riderEstimate      = Math.round(totalFees * ARTIST_RIDER_MULTIPLIER);
  // Production/backline: scale roughly with lineup size and tier complexity
  const productionEstimate = lineup.reduce((sum, artist) => {
    const base =
      artist.tier === 'international' ? 5000 :
      artist.tier === 'headliner'     ? 3000 :
      artist.tier === 'midTier'       ? 1500 :
      artist.tier === 'emerging'      ? 800  :
                                        500;
    return sum + base;
  }, 0);

  const prsLicenceCost     = Math.round(totalTicketRevenueAfterDeductions * PRS_LICENCE_PCT);
  const grandTotal         = totalFees + riderEstimate + productionEstimate + prsLicenceCost;

  const percentageOfRevenue =
    totalTicketRevenueAfterDeductions > 0
      ? Math.round((grandTotal / totalTicketRevenueAfterDeductions) * 1000) / 10
      : 0;

  const overBudgetWarning = grandTotal > totalTicketRevenueAfterDeductions * TALENT_BUDGET_MAX_PCT;

  return {
    totalFees,
    feesByTier,
    riderEstimate,
    productionEstimate,
    prsLicenceCost,
    grandTotal,
    percentageOfRevenue,
    overBudgetWarning,
  };
}