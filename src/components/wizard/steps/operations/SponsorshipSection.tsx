import { useState } from "react";
import {
  FormField,
  ListRow,
  PickerCard,
  SectionCard,
  Button,
  inputClass,
} from "../../../ui";
import { SPONSORSHIP_RATE_PER_HEAD } from "../../../../calculations/constants";
import type { useWizardState } from "../../../../hooks/useWizardState";
import type { SponsorshipTier } from "../../../../types";

interface SponsorshipSectionProps {
  sponsors: { id: string; name: string; tier: SponsorshipTier }[];
  expectedAttendance: number;
  addSponsor: ReturnType<typeof useWizardState>["addSponsor"];
  removeSponsor: ReturnType<typeof useWizardState>["removeSponsor"];
  updateSponsor: ReturnType<typeof useWizardState>["updateSponsor"];
}

type ActiveSponsorTier = Exclude<SponsorshipTier, "none">;

const SPONSOR_TIERS: ActiveSponsorTier[] = [
  "bronze",
  "silver",
  "gold",
  "platinum",
];

const SPONSOR_TIER_COLOURS: Record<ActiveSponsorTier, string> = {
  bronze: "border-amber-200 bg-amber-50",
  silver: "border-slate-200 bg-slate-50",
  gold: "border-yellow-200 bg-yellow-50",
  platinum: "border-purple-200 bg-purple-50",
};

const SPONSOR_TIER_BADGE: Record<ActiveSponsorTier, string> = {
  bronze: "bg-amber-100 text-amber-700",
  silver: "bg-slate-100 text-slate-600",
  gold: "bg-yellow-100 text-yellow-700",
  platinum: "bg-purple-100 text-purple-700",
};

const SPONSOR_TIER_INFO: Record<
  ActiveSponsorTier,
  { label: string; description: string }
> = {
  bronze: {
    label: "Bronze",
    description: `£${SPONSORSHIP_RATE_PER_HEAD.bronze.toFixed(2)}/head — logo, social`,
  },
  silver: {
    label: "Silver",
    description: `£${SPONSORSHIP_RATE_PER_HEAD.silver.toFixed(2)}/head — stage naming`,
  },
  gold: {
    label: "Gold",
    description: `£${SPONSORSHIP_RATE_PER_HEAD.gold.toFixed(2)}/head — title + activations`,
  },
  platinum: {
    label: "Platinum",
    description: `£${SPONSORSHIP_RATE_PER_HEAD.platinum.toFixed(2)}/head — presenting sponsor`,
  },
};

export function SponsorshipSection({
  sponsors,
  expectedAttendance,
  addSponsor,
  removeSponsor,
  updateSponsor,
}: SponsorshipSectionProps) {
  const [pendingTier, setPendingTier] = useState<ActiveSponsorTier | null>(
    null,
  );
  const [sponsorName, setSponsorName] = useState("");
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);
  const [editingSponsorName, setEditingSponsorName] = useState("");

  const handleAddSponsor = () => {
    if (!sponsorName.trim() || !pendingTier) return;
    addSponsor({
      id: crypto.randomUUID(),
      name: sponsorName.trim(),
      tier: pendingTier,
    });
    setSponsorName("");
    setPendingTier(null);
  };

  const commitSponsorEdit = () => {
    if (editingSponsorName.trim() && editingSponsorId) {
      updateSponsor(editingSponsorId, { name: editingSponsorName.trim() });
    }
    setEditingSponsorId(null);
  };

  const totalSponsorRevenue = sponsors.reduce(
    (sum, s) =>
      sum + Math.round(expectedAttendance * SPONSORSHIP_RATE_PER_HEAD[s.tier]),
    0,
  );

  return (
    <SectionCard
      title="Sponsorship"
      description="Brand partnership deals billed per expected attendee."
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SPONSOR_TIERS.map((tier) => (
          <PickerCard
            key={tier}
            label={SPONSOR_TIER_INFO[tier].label}
            description={SPONSOR_TIER_INFO[tier].description}
            countText={`Selected: ${sponsors.filter((s) => s.tier === tier).length}`}
            isActive={pendingTier === tier}
            colorClass={SPONSOR_TIER_COLOURS[tier]}
            onClick={() => {
              setPendingTier(tier);
              setSponsorName("");
            }}
          />
        ))}
      </div>

      {sponsors.length > 0 && (
        <div className="flex flex-col gap-2">
          {sponsors.map((s) => {
            const isEditing = editingSponsorId === s.id;
            const revenue = Math.round(
              expectedAttendance * SPONSORSHIP_RATE_PER_HEAD[s.tier],
            );
            return isEditing ? (
              <div
                key={s.id}
                className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5"
              >
                <input
                  type="text"
                  className={inputClass + " py-1"}
                  value={editingSponsorName}
                  onChange={(e) => setEditingSponsorName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitSponsorEdit();
                    if (e.key === "Escape") setEditingSponsorId(null);
                  }}
                  autoFocus
                />
                <button
                  onClick={commitSponsorEdit}
                  className="text-xs text-purple-500 hover:text-purple-700 transition-colors shrink-0"
                >
                  Save
                </button>
              </div>
            ) : (
              <ListRow
                key={s.id}
                right={
                  <span className="text-xs font-medium text-gray-600">
                    £{revenue.toLocaleString("en-GB")}
                  </span>
                }
                onEdit={() => {
                  setEditingSponsorId(s.id);
                  setEditingSponsorName(s.name);
                }}
                onRemove={() => removeSponsor(s.id)}
              >
                <span className="text-sm font-medium text-gray-800 truncate">
                  {s.name}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${SPONSOR_TIER_BADGE[s.tier as ActiveSponsorTier]}`}
                >
                  {SPONSOR_TIER_INFO[s.tier as ActiveSponsorTier].label}
                </span>
              </ListRow>
            );
          })}
          <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 flex items-center justify-between">
            <p className="text-xs text-gray-500">Total sponsorship revenue</p>
            <p className="text-sm font-semibold text-gray-900">
              £{totalSponsorRevenue.toLocaleString("en-GB")}
            </p>
          </div>
        </div>
      )}

      {pendingTier && (
        <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-600">
            Add {SPONSOR_TIER_INFO[pendingTier].label} sponsor
          </p>
          <FormField
            label="Company Name"
            isValid={sponsorName.trim().length > 0}
          >
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. Red Bull"
              value={sponsorName}
              onChange={(e) => setSponsorName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSponsor()}
              autoFocus
            />
          </FormField>
          <div className="flex gap-2">
            <Button onClick={handleAddSponsor} disabled={!sponsorName.trim()}>
              Add Sponsor
            </Button>
            <Button variant="ghost" onClick={() => setPendingTier(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
