import { BarFoodPolicySection } from "./BarFoodPolicySection";
import { VendorsSection } from "./VendorsSection";
import { SponsorshipSection } from "./SponsorshipSection";
import { StaffingSection } from "./StaffingSection";
import type { useWizardState } from "../../../../hooks/useWizardState";
import type { FestivalConfig } from "../../../../types";
import type { StaffingResult } from "../../../../calculations/types";

interface OperationsStepProps {
  config: FestivalConfig;
  updateBasic: ReturnType<typeof useWizardState>["updateBasic"];
  addVendor: ReturnType<typeof useWizardState>["addVendor"];
  removeVendor: ReturnType<typeof useWizardState>["removeVendor"];
  updateVendor: ReturnType<typeof useWizardState>["updateVendor"];
  setStaffOverrides: ReturnType<typeof useWizardState>["setStaffOverrides"];
  addSponsor: ReturnType<typeof useWizardState>["addSponsor"];
  removeSponsor: ReturnType<typeof useWizardState>["removeSponsor"];
  updateSponsor: ReturnType<typeof useWizardState>["updateSponsor"];
  staffingSnapshot: StaffingResult;
}

export function OperationsStep({
  config,
  updateBasic,
  addVendor,
  removeVendor,
  updateVendor,
  setStaffOverrides,
  addSponsor,
  removeSponsor,
  updateSponsor,
  staffingSnapshot,
}: OperationsStepProps) {
  const { vendors, staffOverrides, sponsors, expectedAttendance } = config;

  const hasFood =
    !!config.attendeesBringFood ||
    vendors.some((v) => v.type === "foodAndDrink");

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Operations</h2>
        <p className="text-sm text-gray-500 mt-1">
          Vendors, sponsorship and staffing.
        </p>
      </div>

      <BarFoodPolicySection
        hasAlcohol={config.hasAlcohol}
        attendeesBringFood={config.attendeesBringFood}
        attendeesBringAlcohol={config.attendeesBringAlcohol}
        updateBasic={updateBasic}
      />

      <VendorsSection
        vendors={vendors}
        addVendor={addVendor}
        removeVendor={removeVendor}
        updateVendor={updateVendor}
        hasFood={hasFood}
      />

      <SponsorshipSection
        sponsors={sponsors}
        expectedAttendance={expectedAttendance}
        addSponsor={addSponsor}
        removeSponsor={removeSponsor}
        updateSponsor={updateSponsor}
      />

      <StaffingSection
        staffOverrides={staffOverrides}
        setStaffOverrides={setStaffOverrides}
        staffingSnapshot={staffingSnapshot}
      />
    </div>
  );
}
