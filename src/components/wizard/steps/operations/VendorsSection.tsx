import { useState } from "react";
import {
  FormField,
  ListRow,
  PickerCard,
  SectionCard,
  Button,
  inputClass,
} from "../../../ui";
import { VENDOR_PITCH_FEES } from "../../../../calculations/constants";
import type { useWizardState } from "../../../../hooks/useWizardState";
import type { VendorType } from "../../../../types";

interface VendorsSectionProps {
  vendors: { id: string; name: string; type: VendorType; pitchFee?: number }[];
  addVendor: ReturnType<typeof useWizardState>["addVendor"];
  removeVendor: ReturnType<typeof useWizardState>["removeVendor"];
  updateVendor: ReturnType<typeof useWizardState>["updateVendor"];
  hasFood: boolean;
}

const VENDOR_PRESETS: Array<{
  type: VendorType;
  label: string;
  pitchFee: number;
  description: string;
}> = [
  {
    type: "foodAndDrink",
    label: "Food & Drink",
    pitchFee: VENDOR_PITCH_FEES.medium.foodAndDrink,
    description: "Catering unit",
  },
  {
    type: "merch",
    label: "Merchandise",
    pitchFee: VENDOR_PITCH_FEES.medium.merch,
    description: "Merch stand",
  },
  {
    type: "sponsor",
    label: "Sponsor Pitch",
    pitchFee: VENDOR_PITCH_FEES.medium.sponsor,
    description: "On-site presence",
  },
];

const VENDOR_TYPE_COLOURS: Record<VendorType, string> = {
  foodAndDrink: "border-amber-200 bg-amber-50",
  merch: "border-blue-200 bg-blue-50",
  sponsor: "border-green-200 bg-green-50",
};

const VENDOR_TYPE_BADGE: Record<VendorType, string> = {
  foodAndDrink: "bg-amber-100 text-amber-700",
  merch: "bg-blue-100 text-blue-700",
  sponsor: "bg-green-100 text-green-700",
};

export function VendorsSection({
  vendors,
  addVendor,
  removeVendor,
  updateVendor,
  hasFood,
}: VendorsSectionProps) {
  const [pendingVendor, setPendingVendor] = useState<
    (typeof VENDOR_PRESETS)[number] | null
  >(null);
  const [vendorForm, setVendorForm] = useState({ name: "", pitchFee: "" });
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [editingVendorName, setEditingVendorName] = useState("");
  const [editingVendorFee, setEditingVendorFee] = useState("");

  const selectVendorPreset = (preset: (typeof VENDOR_PRESETS)[number]) => {
    setPendingVendor(preset);
    setVendorForm({ name: "", pitchFee: String(preset.pitchFee) });
  };

  const handleAddVendor = () => {
    if (!vendorForm.name.trim() || !pendingVendor) return;
    addVendor({
      id: crypto.randomUUID(),
      name: vendorForm.name.trim(),
      type: pendingVendor.type,
      pitchFee: vendorForm.pitchFee ? Number(vendorForm.pitchFee) : undefined,
    });
    setPendingVendor(null);
    setVendorForm({ name: "", pitchFee: "" });
  };

  const commitVendorEdit = () => {
    if (editingVendorName.trim() && editingVendorId) {
      updateVendor(editingVendorId, {
        name: editingVendorName.trim(),
        pitchFee: editingVendorFee ? Number(editingVendorFee) : undefined,
      });
    }
    setEditingVendorId(null);
  };

  return (
    <SectionCard
      title="Vendors"
      description="Add a vendor type, then fill in their details."
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {VENDOR_PRESETS.map((p) => (
          <PickerCard
            key={p.type}
            label={p.label}
            description={`£${p.pitchFee.toLocaleString("en-GB")} · ${p.description}`}
            countText={`Selected: ${vendors.filter((v) => v.type === p.type).length}`}
            isActive={pendingVendor?.type === p.type}
            colorClass={VENDOR_TYPE_COLOURS[p.type]}
            onClick={() => selectVendorPreset(p)}
          />
        ))}
      </div>

      {vendors.length > 0 && (
        <div className="flex flex-col gap-2">
          {vendors.map((v) => {
            const isEditing = editingVendorId === v.id;
            return isEditing ? (
              <div
                key={v.id}
                className="grid items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5"
                style={{ gridTemplateColumns: "1fr 110px auto" }}
              >
                <input
                  type="text"
                  className={inputClass + " py-1"}
                  value={editingVendorName}
                  onChange={(e) => setEditingVendorName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitVendorEdit();
                    if (e.key === "Escape") setEditingVendorId(null);
                  }}
                  autoFocus
                />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400 shrink-0">£</span>
                  <input
                    type="number"
                    className={inputClass + " py-1"}
                    placeholder="fee"
                    value={editingVendorFee}
                    min={0}
                    onChange={(e) => setEditingVendorFee(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitVendorEdit();
                      if (e.key === "Escape") setEditingVendorId(null);
                    }}
                  />
                </div>
                <button
                  onClick={commitVendorEdit}
                  className="text-xs text-purple-500 hover:text-purple-700 transition-colors"
                >
                  Save
                </button>
              </div>
            ) : (
              <ListRow
                key={v.id}
                right={
                  v.pitchFee !== undefined ? (
                    <span className="text-xs font-medium text-gray-600">
                      £{v.pitchFee.toLocaleString("en-GB")}
                    </span>
                  ) : undefined
                }
                onEdit={() => {
                  setEditingVendorId(v.id);
                  setEditingVendorName(v.name);
                  setEditingVendorFee(
                    v.pitchFee !== undefined ? String(v.pitchFee) : "",
                  );
                }}
                onRemove={() => removeVendor(v.id)}
              >
                <span className="text-sm font-medium text-gray-800 truncate">
                  {v.name}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${VENDOR_TYPE_BADGE[v.type]}`}
                >
                  {VENDOR_PRESETS.find((p) => p.type === v.type)?.label ??
                    v.type}
                </span>
              </ListRow>
            );
          })}
        </div>
      )}

      {pendingVendor && (
        <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-600">
            Configure {pendingVendor.label}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Vendor Name"
              isValid={vendorForm.name.trim().length > 0}
            >
              <input
                type="text"
                className={inputClass}
                placeholder={`e.g. ${pendingVendor.label}`}
                value={vendorForm.name}
                onChange={(e) =>
                  setVendorForm((f) => ({ ...f, name: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleAddVendor()}
                autoFocus
              />
            </FormField>
            <FormField label="Pitch Fee £ (optional)">
              <input
                type="number"
                className={inputClass}
                min={0}
                value={vendorForm.pitchFee}
                onChange={(e) =>
                  setVendorForm((f) => ({ ...f, pitchFee: e.target.value }))
                }
              />
            </FormField>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAddVendor}
              disabled={!vendorForm.name.trim()}
            >
              Add Vendor
            </Button>
            <Button variant="ghost" onClick={() => setPendingVendor(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {!hasFood && (
        <p className="text-xs text-amber-600">
          No food provision — add a food vendor below or enable "Attendees bring
          own food".
        </p>
      )}
    </SectionCard>
  );
}
