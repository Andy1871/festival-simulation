import { FormField, SectionCard, Toggle } from "../../../ui";
import type { useWizardState } from "../../../../hooks/useWizardState";
import type { FestivalConfig } from "../../../../types";

interface BarFoodPolicySectionProps {
  hasAlcohol: FestivalConfig["hasAlcohol"];
  attendeesBringFood: FestivalConfig["attendeesBringFood"];
  attendeesBringAlcohol: FestivalConfig["attendeesBringAlcohol"];
  updateBasic: ReturnType<typeof useWizardState>["updateBasic"];
}

export function BarFoodPolicySection({
  hasAlcohol,
  attendeesBringFood,
  attendeesBringAlcohol,
  updateBasic,
}: BarFoodPolicySectionProps) {
  return (
    <SectionCard
      title="Bar & Food Policy"
      description="Set what attendees can bring and whether alcohol is sold on site."
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Licensed Bar" isValid={true}>
          <Toggle
            checked={hasAlcohol}
            onChange={(val) => updateBasic({ hasAlcohol: val })}
          />
        </FormField>
        <FormField label="Attendees bring food" isValid={true}>
          <div className="flex flex-col gap-1">
            <Toggle
              checked={!!attendeesBringFood}
              onChange={(val) => updateBasic({ attendeesBringFood: val })}
            />
            <span className="text-xs text-gray-400">
              Reduces vendor dependency
            </span>
          </div>
        </FormField>
        <FormField label="Attendees bring alcohol" isValid={true}>
          <div className="flex flex-col gap-1">
            <Toggle
              checked={!!attendeesBringAlcohol}
              onChange={(val) => updateBasic({ attendeesBringAlcohol: val })}
            />
            <span className="text-xs text-gray-400">
              Reduces bar revenue ~65%
            </span>
          </div>
        </FormField>
      </div>
    </SectionCard>
  );
}
