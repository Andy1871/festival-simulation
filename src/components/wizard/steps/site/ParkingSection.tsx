import { FormField, SectionCard, Toggle, inputClass } from "../../../ui";
import type { useWizardState } from "../../../../hooks/useWizardState";
import type { FestivalConfig } from "../../../../types";

interface ParkingSectionProps {
  siteAreaConfig: FestivalConfig["siteAreaConfig"];
  updateSiteArea: ReturnType<typeof useWizardState>["updateSiteArea"];
}

export function ParkingSection({ siteAreaConfig, updateSiteArea }: ParkingSectionProps) {
  return (
    <SectionCard
      title="Car Parking"
      description="Add on-site parking to generate permit revenue and manage site capacity."
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">On-site parking</span>
        <Toggle
          checked={siteAreaConfig.hasParking}
          onChange={(v) =>
            updateSiteArea({
              hasParking: v,
              parkingSpaces: undefined,
              parkingPermitCostGBP: undefined,
            })
          }
        />
      </div>
      {siteAreaConfig.hasParking && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pl-2 border-l-2 border-purple-100">
          <FormField
            label="Number of spaces"
            isValid={
              !!siteAreaConfig.parkingSpaces && siteAreaConfig.parkingSpaces > 0
            }
          >
            <input
              type="number"
              className={inputClass}
              min={1}
              placeholder="e.g. 500"
              value={siteAreaConfig.parkingSpaces ?? ""}
              onChange={(e) =>
                updateSiteArea({
                  parkingSpaces:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
            />
          </FormField>
          <FormField
            label="Permit cost per space £"
            isValid={
              !!siteAreaConfig.parkingPermitCostGBP &&
              siteAreaConfig.parkingPermitCostGBP > 0
            }
            hint={
              siteAreaConfig.parkingSpaces && siteAreaConfig.parkingPermitCostGBP
                ? `Total: £${(siteAreaConfig.parkingSpaces * siteAreaConfig.parkingPermitCostGBP).toLocaleString("en-GB")}`
                : undefined
            }
          >
            <input
              type="number"
              className={inputClass}
              min={0}
              step={0.5}
              placeholder="e.g. 10"
              value={siteAreaConfig.parkingPermitCostGBP || ""}
              onChange={(e) =>
                updateSiteArea({
                  parkingPermitCostGBP: Number(e.target.value) || undefined,
                })
              }
            />
          </FormField>
        </div>
      )}
    </SectionCard>
  );
}
