import { useState } from "react";
import { FormField, ListRow, SectionCard, Button, inputClass } from "../../../ui";
import type { useWizardState } from "../../../../hooks/useWizardState";

interface ChillZone {
  name: string;
  areaSqM: number;
}

interface ChillZonesSectionProps {
  chillZones: ChillZone[];
  addChillZone: ReturnType<typeof useWizardState>["addChillZone"];
  removeChillZone: ReturnType<typeof useWizardState>["removeChillZone"];
  updateChillZone: ReturnType<typeof useWizardState>["updateChillZone"];
}

export function ChillZonesSection({
  chillZones,
  addChillZone,
  removeChillZone,
  updateChillZone,
}: ChillZonesSectionProps) {
  const [chillForm, setChillForm] = useState({ name: "", areaSqM: "" });
  const [editingChillIdx, setEditingChillIdx] = useState<number | null>(null);
  const [editingChillName, setEditingChillName] = useState("");
  const [editingChillArea, setEditingChillArea] = useState("");

  const handleAddChillZone = () => {
    if (!chillForm.name.trim()) return;
    addChillZone({
      name: chillForm.name.trim(),
      areaSqM: Number(chillForm.areaSqM) || 0,
    });
    setChillForm({ name: "", areaSqM: "" });
  };

  return (
    <SectionCard
      title="Chill Zones"
      description="Optional areas (subtracted from usable crowd space)."
    >
      {chillZones.length > 0 && (
        <div className="flex flex-col gap-2 mb-1">
          {chillZones.map((z, i) => {
            const isEditing = editingChillIdx === i;
            const commitChillEdit = () => {
              if (editingChillName.trim())
                updateChillZone(i, {
                  name: editingChillName.trim(),
                  areaSqM: Number(editingChillArea) || 0,
                });
              setEditingChillIdx(null);
            };
            return isEditing ? (
              <div
                key={i}
                className="grid items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5"
                style={{ gridTemplateColumns: "1fr 90px auto" }}
              >
                <input
                  type="text"
                  className={inputClass + " py-1"}
                  value={editingChillName}
                  onChange={(e) => setEditingChillName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitChillEdit();
                    if (e.key === "Escape") setEditingChillIdx(null);
                  }}
                  autoFocus
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    className={inputClass + " py-1"}
                    value={editingChillArea}
                    min={0}
                    onChange={(e) => setEditingChillArea(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitChillEdit();
                      if (e.key === "Escape") setEditingChillIdx(null);
                    }}
                  />
                  <span className="text-xs text-gray-400 shrink-0">m²</span>
                </div>
                <button
                  onClick={commitChillEdit}
                  className="text-xs text-purple-500 hover:text-purple-700 transition-colors"
                >
                  Save
                </button>
              </div>
            ) : (
              <ListRow
                key={i}
                onEdit={() => {
                  setEditingChillIdx(i);
                  setEditingChillName(z.name);
                  setEditingChillArea(String(z.areaSqM));
                }}
                onRemove={() => removeChillZone(i)}
              >
                <p className="text-sm text-gray-800 truncate">
                  {z.name} — {z.areaSqM.toLocaleString("en-GB")} m²
                </p>
              </ListRow>
            );
          })}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <FormField label="Zone Name">
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. Welfare Area"
            value={chillForm.name}
            onChange={(e) =>
              setChillForm((f) => ({ ...f, name: e.target.value }))
            }
          />
        </FormField>
        <FormField label="Area (m²)">
          <input
            type="number"
            className={inputClass}
            min={0}
            value={chillForm.areaSqM}
            onChange={(e) =>
              setChillForm((f) => ({ ...f, areaSqM: e.target.value }))
            }
          />
        </FormField>
        <Button
          variant="secondary"
          onClick={handleAddChillZone}
          disabled={!chillForm.name.trim()}
        >
          Add Zone
        </Button>
      </div>
    </SectionCard>
  );
}
