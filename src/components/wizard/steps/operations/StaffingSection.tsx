import { SectionCard, inputClass } from "../../../ui";
import type { useWizardState } from "../../../../hooks/useWizardState";
import type { FestivalConfig } from "../../../../types";
import type { StaffingResult } from "../../../../calculations/types";

const staffRowDefs: Array<{
  key: keyof NonNullable<FestivalConfig["staffOverrides"]>;
  label: string;
}> = [
  { key: "siaStaffCount", label: "SIA Security" },
  { key: "stewardStaffCount", label: "Stewards" },
  { key: "welfareStaffCount", label: "Welfare" },
  { key: "firstAidersCount", label: "First Aiders" },
  { key: "paramedicCount", label: "Paramedics" },
  { key: "doctorCount", label: "Doctors" },
  { key: "barStaffCount", label: "Bar Staff" },
];

interface StaffingSectionProps {
  staffOverrides: FestivalConfig["staffOverrides"];
  setStaffOverrides: ReturnType<typeof useWizardState>["setStaffOverrides"];
  staffingSnapshot: StaffingResult;
}

export function StaffingSection({
  staffOverrides,
  setStaffOverrides,
  staffingSnapshot,
}: StaffingSectionProps) {
  const staffRecommended: Partial<
    Record<keyof NonNullable<FestivalConfig["staffOverrides"]>, number>
  > = {
    siaStaffCount: staffingSnapshot.securityCount,
    stewardStaffCount: staffingSnapshot.stewardCount,
    welfareStaffCount: staffingSnapshot.welfareStaff,
    firstAidersCount: staffingSnapshot.medicalTeam.firstAiders,
    paramedicCount: staffingSnapshot.medicalTeam.paramedics,
    doctorCount: staffingSnapshot.medicalTeam.doctors,
    barStaffCount: staffingSnapshot.barStaff,
  };

  const override = (
    key: keyof NonNullable<FestivalConfig["staffOverrides"]>,
    val: string,
  ) =>
    setStaffOverrides({
      ...staffOverrides,
      [key]: val ? Number(val) : undefined,
    });

  return (
    <SectionCard
      title="Staffing"
      description="Total individuals required across all shifts, based on 8-hour shifts per person. Override with your confirmed totals."
    >
      <div className="grid grid-cols-3 gap-3">
        {staffRowDefs.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              {label}
            </label>
            <input
              type="number"
              className={inputClass}
              min={0}
              placeholder={String(staffRecommended[key] ?? 0)}
              value={staffOverrides?.[key] ?? ""}
              onChange={(e) => override(key, e.target.value)}
            />
            <p className="text-xs text-gray-400">
              Rec: {staffRecommended[key] ?? 0}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total headcount</span>
          <span className="font-semibold text-gray-900">
            {staffingSnapshot.totalHeadCount}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-500">Estimated staff cost</span>
          <span className="font-semibold text-gray-900">
            £{staffingSnapshot.estimatedStaffCost.toLocaleString("en-GB")}
          </span>
        </div>
      </div>
    </SectionCard>
  );
}
