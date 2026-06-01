import { useState } from "react";
import {
  FormField,
  PickerCard,
  SectionCard,
  SelectField,
  Button,
  inputClass,
} from "../../../ui";
import { ARTIST_FEES } from "../../../../calculations/constants";
import type { useWizardState } from "../../../../hooks/useWizardState";
import type { FestivalConfig, ArtistTier } from "../../../../types";

const TIERS: ArtistTier[] = [
  "local",
  "emerging",
  "midTier",
  "headliner",
  "international",
];

const TIER_COLOURS: Record<ArtistTier, string> = {
  local: "border-gray-200 bg-white",
  emerging: "border-blue-200 bg-blue-50",
  midTier: "border-purple-200 bg-purple-50",
  headliner: "border-amber-200 bg-amber-50",
  international: "border-green-200 bg-green-50",
};

function fmtRange(min: number, max: number) {
  const k = (n: number) => (n >= 1000 ? `£${n / 1000}k` : `£${n}`);
  return `${k(min)} – ${k(max)}`;
}

interface AddArtistSectionProps {
  stages: FestivalConfig["stages"];
  lineup: FestivalConfig["lineup"];
  addArtist: ReturnType<typeof useWizardState>["addArtist"];
}

export function AddArtistSection({ stages, lineup, addArtist }: AddArtistSectionProps) {
  const [pendingTier, setPendingTier] = useState<ArtistTier | null>(null);
  const [form, setForm] = useState({
    name: "",
    stageId: stages[0]?.id ?? "",
    feeOverride: "",
  });

  const selectTier = (tier: ArtistTier) => {
    setPendingTier(tier);
    setForm((f) => ({ ...f, stageId: stages[0]?.id ?? "", feeOverride: "" }));
  };

  const handleAdd = () => {
    if (!form.name.trim() || !form.stageId || !pendingTier) return;
    addArtist({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      tier: pendingTier,
      stageId: form.stageId,
      feeOverrideGBP: form.feeOverride ? Number(form.feeOverride) : undefined,
    });
    setForm((f) => ({ ...f, name: "", feeOverride: "" }));
    setPendingTier(null);
  };

  return (
    <SectionCard
      title="Add Artist"
      description="Choose a tier, then fill in the artist details."
    >
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
        {TIERS.map((tier) => {
          const fees = ARTIST_FEES[tier];
          return (
            <PickerCard
              key={tier}
              label={fees.label}
              description={fmtRange(fees.min, fees.max)}
              countText={`Selected: ${lineup.filter((a) => a.tier === tier).length}`}
              isActive={pendingTier === tier}
              colorClass={TIER_COLOURS[tier]}
              onClick={() => selectTier(tier)}
            />
          );
        })}
      </div>

      {pendingTier && (
        <div className="flex flex-col gap-4 pt-1 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Artist Name"
              isValid={form.name.trim().length > 0}
            >
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. The Midnight"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                autoFocus
              />
            </FormField>
            <SelectField
              label="Stage"
              value={form.stageId}
              onChange={(v) => setForm((f) => ({ ...f, stageId: v }))}
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </SelectField>
          </div>
          <FormField
            label={`Fee override £ (optional — midpoint: £${Math.round((ARTIST_FEES[pendingTier].min + ARTIST_FEES[pendingTier].max) / 2).toLocaleString("en-GB")})`}
          >
            <input
              type="number"
              className={inputClass}
              placeholder="Leave blank to use tier midpoint"
              value={form.feeOverride}
              onChange={(e) =>
                setForm((f) => ({ ...f, feeOverride: e.target.value }))
              }
            />
          </FormField>
          <div className="flex gap-2">
            <Button
              onClick={handleAdd}
              disabled={!form.name.trim() || !form.stageId}
            >
              Add Artist
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
