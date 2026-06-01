import { useState } from "react";
import {
  FormField,
  ListRow,
  PickerCard,
  SectionCard,
  Button,
  inputClass,
} from "../../../ui";
import type { useWizardState } from "../../../../hooks/useWizardState";
import type { FestivalConfig, ticketType } from "../../../../types";

const TICKET_PRESETS: Array<{
  type: ticketType;
  label: string;
  suggested: number;
  description: string;
}> = [
  {
    type: "earlyBird",
    label: "Early Bird",
    suggested: 25,
    description: "Discounted advance tickets",
  },
  {
    type: "generalAdmission",
    label: "General Admission",
    suggested: 40,
    description: "Standard entry",
  },
  {
    type: "onTheDoor",
    label: "On the Door",
    suggested: 55,
    description: "Premium walk-up price",
  },
];

const TICKET_TYPE_COLOURS: Record<ticketType, string> = {
  earlyBird: "border-blue-200 bg-blue-50",
  generalAdmission: "border-purple-200 bg-purple-50",
  onTheDoor: "border-amber-200 bg-amber-50",
};

interface TicketTiersSectionProps {
  ticketTiers: FestivalConfig["ticketTiers"];
  addTicketTier: ReturnType<typeof useWizardState>["addTicketTier"];
  removeTicketTier: ReturnType<typeof useWizardState>["removeTicketTier"];
  updateTicketTier: ReturnType<typeof useWizardState>["updateTicketTier"];
  maxAttendance: number;
  overAllocatedWarning: boolean;
  expectedAttendance: number;
}

export function TicketTiersSection({
  ticketTiers,
  addTicketTier,
  removeTicketTier,
  updateTicketTier,
  maxAttendance,
  overAllocatedWarning,
  expectedAttendance,
}: TicketTiersSectionProps) {
  const [pendingPreset, setPendingPreset] = useState<
    (typeof TICKET_PRESETS)[number] | null
  >(null);
  const [form, setForm] = useState({ priceGBP: "", allocation: "" });
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState("");
  const [editingAllocation, setEditingAllocation] = useState("");

  const totalAllocated = ticketTiers.reduce((s, t) => s + t.allocation, 0);
  const remaining = maxAttendance > 0 ? maxAttendance - totalAllocated : null;

  const selectPreset = (preset: (typeof TICKET_PRESETS)[number]) => {
    setPendingPreset(preset);
    setForm({ priceGBP: String(preset.suggested), allocation: "" });
  };

  const handleAdd = () => {
    if (!pendingPreset || !form.priceGBP || !form.allocation) return;
    addTicketTier({
      id: crypto.randomUUID(),
      type: pendingPreset.type,
      priceGBP: Number(form.priceGBP),
      allocation: Number(form.allocation),
    });
    setPendingPreset(null);
    setForm({ priceGBP: "", allocation: "" });
  };

  const commitEdit = () => {
    if (editingTierId && editingPrice && editingAllocation) {
      updateTicketTier(editingTierId, {
        priceGBP: Number(editingPrice),
        allocation: Number(editingAllocation),
      });
    }
    setEditingTierId(null);
  };

  const grossRevenueTally = ticketTiers.reduce(
    (s, t) => s + t.priceGBP * t.allocation,
    0,
  );

  return (
    <SectionCard
      title="Ticket Tiers"
      description="Choose ticket types, set prices and allocate quantities."
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {TICKET_PRESETS.map((p) => {
          const added = ticketTiers.some((t) => t.type === p.type);
          return (
            <PickerCard
              key={p.type}
              label={p.label}
              description={p.description}
              countText={added ? "Added" : "Not added"}
              isActive={pendingPreset?.type === p.type}
              colorClass={TICKET_TYPE_COLOURS[p.type]}
              onClick={() => selectPreset(p)}
              disabled={added}
            />
          );
        })}
      </div>

      {ticketTiers.length > 0 && (
        <div className="flex flex-col gap-2">
          {ticketTiers.map((t) => {
            const isEditing = editingTierId === t.id;
            const preset = TICKET_PRESETS.find((p) => p.type === t.type)!;
            return isEditing ? (
              <div
                key={t.id}
                className="grid items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5"
                style={{ gridTemplateColumns: "100px 120px 1fr auto" }}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400 shrink-0">£</span>
                  <input
                    type="number"
                    className={inputClass + " py-1"}
                    min={0}
                    step={0.5}
                    value={editingPrice}
                    onChange={(e) => setEditingPrice(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit();
                      if (e.key === "Escape") setEditingTierId(null);
                    }}
                    autoFocus
                  />
                </div>
                <input
                  type="number"
                  className={inputClass + " py-1"}
                  min={1}
                  placeholder="allocation"
                  value={editingAllocation}
                  onChange={(e) => setEditingAllocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit();
                    if (e.key === "Escape") setEditingTierId(null);
                  }}
                />
                <span />
                <button
                  onClick={commitEdit}
                  className="text-xs text-purple-500 hover:text-purple-700 transition-colors"
                >
                  Save
                </button>
              </div>
            ) : (
              <ListRow
                key={t.id}
                right={
                  <span className="text-xs font-medium text-gray-500">
                    £{(t.priceGBP * t.allocation).toLocaleString("en-GB")}
                  </span>
                }
                onEdit={() => {
                  setEditingTierId(t.id);
                  setEditingPrice(String(t.priceGBP));
                  setEditingAllocation(String(t.allocation));
                }}
                onRemove={() => removeTicketTier(t.id)}
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {preset.label}
                  </p>
                  <p className="text-xs text-gray-400">
                    £{t.priceGBP.toFixed(2)} ·{" "}
                    {t.allocation.toLocaleString("en-GB")} tickets
                  </p>
                </div>
              </ListRow>
            );
          })}
          {overAllocatedWarning && (
            <p className="text-xs text-red-600 font-medium">
              Over site capacity — reduce allocation or increase site area.
            </p>
          )}
          {!overAllocatedWarning && totalAllocated < expectedAttendance && (
            <p className="text-xs text-amber-600">
              {totalAllocated.toLocaleString("en-GB")} tickets allocated —
              below your planned attendance of{" "}
              {expectedAttendance.toLocaleString("en-GB")}.
            </p>
          )}
        </div>
      )}

      <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Planned attendance</span>
          <span className="font-medium text-gray-900">
            {expectedAttendance.toLocaleString("en-GB")}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Max capacity</span>
          <span
            className={`font-medium ${maxAttendance > 0 ? "text-gray-900" : "text-gray-400"}`}
          >
            {maxAttendance > 0 ? maxAttendance.toLocaleString("en-GB") : "—"}
          </span>
        </div>
        <div className="flex justify-between text-sm border-t border-gray-100 pt-1 mt-1">
          <span className="text-gray-500">Tickets allocated</span>
          <span
            className={`font-medium ${overAllocatedWarning ? "text-red-600" : totalAllocated > 0 ? "text-gray-900" : "text-gray-400"}`}
          >
            {totalAllocated > 0 ? totalAllocated.toLocaleString("en-GB") : "—"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Gross revenue (all sold)</span>
          <span
            className={`font-medium ${grossRevenueTally > 0 ? "text-gray-900" : "text-gray-400"}`}
          >
            {grossRevenueTally > 0
              ? `£${grossRevenueTally.toLocaleString("en-GB")}`
              : "—"}
          </span>
        </div>
      </div>

      {pendingPreset && (
        <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-600">
            Configure {pendingPreset.label}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Price £"
              isValid={!!form.priceGBP && Number(form.priceGBP) > 0}
            >
              <input
                type="number"
                className={inputClass}
                min={0}
                step={0.5}
                value={form.priceGBP}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priceGBP: e.target.value }))
                }
              />
            </FormField>
            <FormField
              label="Allocation"
              isValid={!!form.allocation && Number(form.allocation) > 0}
              hint={
                remaining !== null && Number(form.allocation) > 0
                  ? `${Math.max(0, (remaining || 0) - Number(form.allocation)).toLocaleString("en-GB")} remaining after this`
                  : undefined
              }
            >
              <input
                type="number"
                className={inputClass}
                min={1}
                placeholder={
                  remaining !== null
                    ? `up to ${remaining.toLocaleString("en-GB")}`
                    : ""
                }
                value={form.allocation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, allocation: e.target.value }))
                }
              />
            </FormField>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAdd}
              disabled={!form.priceGBP || !form.allocation}
            >
              Add Tier
            </Button>
            <Button variant="ghost" onClick={() => setPendingPreset(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
