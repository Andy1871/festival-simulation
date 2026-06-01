import { ARTIST_FEES } from "../../../../calculations/constants";
import type { FestivalConfig, ArtistTier } from "../../../../types";

const TIERS: ArtistTier[] = [
  "local",
  "emerging",
  "midTier",
  "headliner",
  "international",
];

const TIER_BADGE: Record<ArtistTier, string> = {
  local: "bg-gray-100 text-gray-600",
  emerging: "bg-blue-100 text-blue-700",
  midTier: "bg-purple-100 text-purple-700",
  headliner: "bg-amber-100 text-amber-700",
  international: "bg-green-100 text-green-700",
};

const TIER_SHORT: Record<ArtistTier, string> = {
  local: "Local",
  emerging: "Emerging",
  midTier: "Mid-tier",
  headliner: "Headliner",
  international: "Intl",
};

function artistFee(a: { tier: ArtistTier; feeOverrideGBP?: number }): number {
  return (
    a.feeOverrideGBP ??
    Math.round((ARTIST_FEES[a.tier].min + ARTIST_FEES[a.tier].max) / 2)
  );
}

interface LineupStatsSectionProps {
  lineup: FestivalConfig["lineup"];
}

export function LineupStatsSection({ lineup }: LineupStatsSectionProps) {
  const totalLineupCost = lineup.reduce((s, a) => s + artistFee(a), 0);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm px-4 py-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Artists
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{lineup.length}</p>
        <div className="flex flex-wrap gap-1 mt-2.5">
          {TIERS.filter((t) => lineup.some((a) => a.tier === t)).map((t) => {
            const count = lineup.filter((a) => a.tier === t).length;
            return (
              <span
                key={t}
                className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${TIER_BADGE[t]}`}
              >
                {count} {TIER_SHORT[t]}
              </span>
            );
          })}
        </div>
      </div>
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm px-4 py-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Cumulative Fee
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          £{totalLineupCost.toLocaleString("en-GB")}
        </p>
        <p className="text-xs text-gray-400 mt-2.5">
          avg. £
          {Math.round(totalLineupCost / lineup.length).toLocaleString("en-GB")}{" "}
          per artist
        </p>
      </div>
    </div>
  );
}
