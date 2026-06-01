import { useState } from "react";
import { ListRow, SectionCard, inputClass } from "../../../ui";
import { ARTIST_FEES } from "../../../../calculations/constants";
import type { useWizardState } from "../../../../hooks/useWizardState";
import type { FestivalConfig, ArtistTier } from "../../../../types";

const TIER_BADGE: Record<ArtistTier, string> = {
  local: "bg-gray-100 text-gray-600",
  emerging: "bg-blue-100 text-blue-700",
  midTier: "bg-purple-100 text-purple-700",
  headliner: "bg-amber-100 text-amber-700",
  international: "bg-green-100 text-green-700",
};

function artistFee(a: { tier: ArtistTier; feeOverrideGBP?: number }): number {
  return (
    a.feeOverrideGBP ??
    Math.round((ARTIST_FEES[a.tier].min + ARTIST_FEES[a.tier].max) / 2)
  );
}

interface StageArtistListsSectionProps {
  stages: FestivalConfig["stages"];
  lineup: FestivalConfig["lineup"];
  updateArtist: ReturnType<typeof useWizardState>["updateArtist"];
  removeArtist: ReturnType<typeof useWizardState>["removeArtist"];
}

export function StageArtistListsSection({
  stages,
  lineup,
  updateArtist,
  removeArtist,
}: StageArtistListsSectionProps) {
  const [editingArtistId, setEditingArtistId] = useState<string | null>(null);
  const [editingArtistName, setEditingArtistName] = useState("");
  const [editingArtistFee, setEditingArtistFee] = useState("");

  const byStage = stages.map((s) => ({
    stage: s,
    artists: lineup.filter((a) => a.stageId === s.id),
  }));
  const unassigned = lineup.filter(
    (a) => !stages.find((s) => s.id === a.stageId),
  );

  return (
    <>
      {byStage.map(({ stage, artists }) => (
        <SectionCard
          key={stage.id}
          title={stage.name}
          description={`${artists.length} artist${artists.length !== 1 ? "s" : ""}`}
        >
          {artists.length < 5 && (
            <p className="text-xs text-amber-600 -mt-3">
              Fewer than 5 artists — double-check scheduling works for your
              event duration.
            </p>
          )}
          {artists.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              No artists on this stage yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {artists.map((a) => {
                const fee = artistFee(a);
                const isEditing = editingArtistId === a.id;
                const commitEdit = () => {
                  if (editingArtistName.trim())
                    updateArtist(a.id, {
                      name: editingArtistName.trim(),
                      feeOverrideGBP: editingArtistFee
                        ? Number(editingArtistFee)
                        : undefined,
                    });
                  setEditingArtistId(null);
                };
                return isEditing ? (
                  <div
                    key={a.id}
                    className="grid items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5"
                    style={{ gridTemplateColumns: "1fr 110px auto" }}
                  >
                    <input
                      type="text"
                      className={inputClass + " py-1"}
                      value={editingArtistName}
                      onChange={(e) => setEditingArtistName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit();
                        if (e.key === "Escape") setEditingArtistId(null);
                      }}
                      autoFocus
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400 shrink-0">£</span>
                      <input
                        type="number"
                        className={inputClass + " py-1"}
                        placeholder="est."
                        min={0}
                        value={editingArtistFee}
                        onChange={(e) => setEditingArtistFee(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitEdit();
                          if (e.key === "Escape") setEditingArtistId(null);
                        }}
                      />
                    </div>
                    <button
                      onClick={commitEdit}
                      className="text-xs text-purple-500 hover:text-purple-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <ListRow
                    key={a.id}
                    right={
                      <span className="text-xs font-medium text-gray-600">
                        £{fee.toLocaleString("en-GB")}
                      </span>
                    }
                    onEdit={() => {
                      setEditingArtistId(a.id);
                      setEditingArtistName(a.name);
                      setEditingArtistFee(String(artistFee(a)));
                    }}
                    onRemove={() => removeArtist(a.id)}
                  >
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {a.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${TIER_BADGE[a.tier]}`}
                    >
                      {ARTIST_FEES[a.tier].label}
                    </span>
                  </ListRow>
                );
              })}
              <div className="flex justify-end pt-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">Stage total</span>
                  <span className="text-xs font-semibold text-gray-700">
                    £
                    {artists
                      .reduce((s, a) => s + artistFee(a), 0)
                      .toLocaleString("en-GB")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      ))}

      {unassigned.length > 0 && (
        <SectionCard
          title="Unassigned Artists"
          description="These artists have no valid stage."
        >
          {unassigned.map((a) => (
            <ListRow
              key={a.id}
              className="bg-red-50"
              onRemove={() => removeArtist(a.id)}
            >
              <span className="text-sm font-medium text-red-700">{a.name}</span>
            </ListRow>
          ))}
        </SectionCard>
      )}
    </>
  );
}
