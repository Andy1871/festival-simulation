import { useState } from "react";
import {
  FormField,
  ListRow,
  PickerCard,
  SectionCard,
  Button,
  inputClass,
} from "../../../ui";
import {
  STAGE_AREAS_SQM,
  KVA_REQUIREMENTS,
} from "../../../../calculations/constants";
import type { useWizardState } from "../../../../hooks/useWizardState";
import type { Stage, StageType } from "../../../../types";

interface StagesSectionProps {
  stages: Stage[];
  addStage: ReturnType<typeof useWizardState>["addStage"];
  removeStage: ReturnType<typeof useWizardState>["removeStage"];
  updateStageName: ReturnType<typeof useWizardState>["updateStageName"];
}

const STAGE_PRESETS: Array<{ type: StageType; label: string; kva: number }> = [
  {
    type: "acoustic",
    label: "Acoustic Tent",
    kva: KVA_REQUIREMENTS.acousticTent.default,
  },
  {
    type: "small",
    label: "Small Stage",
    kva: KVA_REQUIREMENTS.smallStage.default,
  },
  {
    type: "second",
    label: "Second Stage",
    kva: KVA_REQUIREMENTS.secondStage.default,
  },
  {
    type: "main",
    label: "Main Stage",
    kva: KVA_REQUIREMENTS.mainStage.default,
  },
];

const STAGE_TYPE_COLOURS: Record<StageType, string> = {
  acoustic: "border-blue-200 bg-blue-50",
  small: "border-purple-200 bg-purple-50",
  second: "border-yellow-200 bg-yellow-50",
  main: "border-green-200 bg-green-50",
};

const STAGE_TYPE_BADGE: Record<StageType, string> = {
  acoustic: "bg-blue-100 text-blue-700",
  small: "bg-purple-100 text-purple-700",
  second: "bg-yellow-100 text-yellow-700",
  main: "bg-green-100 text-green-700",
};

export function StagesSection({
  stages,
  addStage,
  removeStage,
  updateStageName,
}: StagesSectionProps) {
  const [stageName, setStageName] = useState("");
  const [pendingType, setPendingType] = useState<StageType | null>(null);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const selectPreset = (preset: (typeof STAGE_PRESETS)[number]) => {
    setPendingType(preset.type);
    setStageName(preset.label);
  };

  const handleAddStage = () => {
    if (!stageName.trim() || !pendingType) return;
    addStage({
      id: crypto.randomUUID(),
      name: stageName.trim(),
      type: pendingType,
      capacitySqM: STAGE_AREAS_SQM[pendingType],
    });
    setStageName("");
    setPendingType(null);
  };

  return (
    <SectionCard
      title="Stages"
      description="Select a stage type to add it. You can rename it before adding."
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STAGE_PRESETS.map((p) => (
          <PickerCard
            key={p.type}
            label={p.label}
            description={`${STAGE_AREAS_SQM[p.type].toLocaleString("en-GB")} m² · ${p.kva} kVA`}
            countText={`Selected: ${stages.filter((s) => s.type === p.type).length}`}
            isActive={pendingType === p.type}
            colorClass={STAGE_TYPE_COLOURS[p.type]}
            onClick={() => selectPreset(p)}
          />
        ))}
      </div>

      {pendingType && (
        <div className="flex gap-2 items-end mt-1">
          <FormField label="Stage name" isValid={stageName.trim().length > 0}>
            <input
              type="text"
              className={inputClass}
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddStage()}
              autoFocus
            />
          </FormField>
          <Button
            onClick={handleAddStage}
            disabled={!stageName.trim()}
            className="mb-0.5"
          >
            Add
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setPendingType(null);
              setStageName("");
            }}
            className="mb-0.5"
          >
            Cancel
          </Button>
        </div>
      )}

      {stages.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {stages.map((s) => {
            const preset = STAGE_PRESETS.find((p) => p.type === s.type)!;
            const isEditing = editingStageId === s.id;
            const commitEdit = () => {
              if (editingName.trim()) updateStageName(s.id, editingName.trim());
              setEditingStageId(null);
            };
            return isEditing ? (
              <div
                key={s.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5 gap-2"
              >
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    className={inputClass + " py-1"}
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit();
                      if (e.key === "Escape") setEditingStageId(null);
                    }}
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-0.5">
                    {STAGE_AREAS_SQM[s.type].toLocaleString("en-GB")} m² ·{" "}
                    {preset.kva} kVA
                  </p>
                </div>
                <button
                  onClick={commitEdit}
                  className="text-xs text-purple-500 hover:text-purple-700 transition-colors shrink-0"
                >
                  Save
                </button>
              </div>
            ) : (
              <ListRow
                key={s.id}
                onEdit={() => {
                  setEditingStageId(s.id);
                  setEditingName(s.name);
                }}
                onRemove={() => removeStage(s.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {s.name}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STAGE_TYPE_BADGE[s.type]}`}
                    >
                      {preset.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {STAGE_AREAS_SQM[s.type].toLocaleString("en-GB")} m² ·{" "}
                    {preset.kva} kVA
                  </p>
                </div>
              </ListRow>
            );
          })}
          <div className="flex flex-col items-end gap-1 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">Total stage area</span>
              <span className="text-xs font-semibold text-gray-700">
                {stages
                  .reduce((sum, s) => sum + STAGE_AREAS_SQM[s.type], 0)
                  .toLocaleString("en-GB")}{" "}
                m²
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">Total energy</span>
              <span className="text-xs font-semibold text-gray-700">
                {stages
                  .reduce(
                    (sum, s) =>
                      sum +
                      (STAGE_PRESETS.find((p) => p.type === s.type)?.kva ?? 0),
                    0,
                  )
                  .toLocaleString("en-GB")}{" "}
                kVA
              </span>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
