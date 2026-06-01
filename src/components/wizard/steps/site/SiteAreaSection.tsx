import { FormField, SectionCard, inputClass } from "../../../ui";
import { PARKING_AREA_PER_SPACE_SQM } from "../../../../calculations/constants";
import type { useWizardState } from "../../../../hooks/useWizardState";
import type { FestivalConfig } from "../../../../types";

interface SiteAreaSectionProps {
  siteAreaConfig: FestivalConfig["siteAreaConfig"];
  usableAreaSqM: number;
  maxAttendance: number;
  updateSiteArea: ReturnType<typeof useWizardState>["updateSiteArea"];
}

export function SiteAreaSection({
  siteAreaConfig,
  usableAreaSqM,
  maxAttendance,
  updateSiteArea,
}: SiteAreaSectionProps) {
  const chillZoneTotal = siteAreaConfig.chillZones.reduce(
    (s, z) => s + z.areaSqM,
    0,
  );

  const parkingArea =
    siteAreaConfig.hasParking && siteAreaConfig.parkingSpaces
      ? siteAreaConfig.parkingSpaces * PARKING_AREA_PER_SPACE_SQM
      : 0;

  const allocatedArea =
    siteAreaConfig.stageAreaSqM +
    siteAreaConfig.vendorAreaSqM +
    chillZoneTotal +
    parkingArea;

  const areaRatio =
    siteAreaConfig.totalAreaSqM > 0
      ? allocatedArea / siteAreaConfig.totalAreaSqM
      : 0;

  const areaWarningTight =
    siteAreaConfig.totalAreaSqM > 0 && areaRatio > 0.85 && areaRatio <= 1;

  const areaWarningOver = siteAreaConfig.totalAreaSqM > 0 && areaRatio > 1;

  return (
    <SectionCard
      title="Site Area"
      description="Enter your total site area. Stage area is calculated automatically as you add stages."
    >
      <FormField
        label="Total Site Area (m²)"
        isValid={siteAreaConfig.totalAreaSqM > 0}
      >
        <input
          type="number"
          className={inputClass}
          min={0}
          value={siteAreaConfig.totalAreaSqM || ""}
          onChange={(e) =>
            updateSiteArea({
              totalAreaSqM: Math.max(0, Number(e.target.value) || 0),
            })
          }
        />
      </FormField>
      <FormField label="Vendor Area (m²)">
        <input
          type="number"
          className={inputClass}
          min={0}
          value={siteAreaConfig.vendorAreaSqM || ""}
          onChange={(e) =>
            updateSiteArea({
              vendorAreaSqM: Math.max(0, Number(e.target.value) || 0),
            })
          }
        />
      </FormField>

      {areaWarningOver && (
        <div className="rounded-lg px-4 py-3 text-sm bg-red-50 border border-red-200 text-red-700">
          {`Allocated areas (${allocatedArea.toLocaleString("en-GB")} m²) exceed total site area — no usable audience space.`}
        </div>
      )}
      {areaWarningTight && !areaWarningOver && (
        <p className="text-xs text-amber-600">
          Less than 15% of your site is left for audiences — consider increasing
          total area.
        </p>
      )}

      <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Stage area (auto)</span>
          <span
            className={`font-medium ${siteAreaConfig.stageAreaSqM > 0 ? "text-gray-900" : "text-gray-400"}`}
          >
            {siteAreaConfig.stageAreaSqM > 0
              ? `${siteAreaConfig.stageAreaSqM.toLocaleString("en-GB")} m²`
              : "—"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Vendor area</span>
          <span
            className={`font-medium ${siteAreaConfig.vendorAreaSqM > 0 ? "text-gray-900" : "text-gray-400"}`}
          >
            {siteAreaConfig.vendorAreaSqM > 0
              ? `${siteAreaConfig.vendorAreaSqM.toLocaleString("en-GB")} m²`
              : "—"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            {siteAreaConfig.chillZones.length > 0
              ? `Chill zones (${siteAreaConfig.chillZones.length})`
              : "Chill zones"}
          </span>
          <span
            className={`font-medium ${chillZoneTotal > 0 ? "text-gray-900" : "text-gray-400"}`}
          >
            {chillZoneTotal > 0
              ? `${chillZoneTotal.toLocaleString("en-GB")} m²`
              : "—"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            {siteAreaConfig.parkingSpaces
              ? `Parking (${siteAreaConfig.parkingSpaces} spaces)`
              : "Parking"}
          </span>
          <span
            className={`font-medium ${parkingArea > 0 ? "text-gray-900" : "text-gray-400"}`}
          >
            {parkingArea > 0
              ? `${parkingArea.toLocaleString("en-GB")} m²`
              : "—"}
          </span>
        </div>
        <div className="flex justify-between text-sm border-t border-gray-100 pt-1 mt-1">
          <span className="text-gray-500">Usable audience area</span>
          <span className="font-medium text-gray-900">
            {usableAreaSqM.toLocaleString("en-GB")} m²
          </span>
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <span className="text-gray-900">Max safe attendance</span>
          <span
            className={maxAttendance > 0 ? "text-gray-900" : "text-gray-400"}
          >
            {maxAttendance > 0
              ? maxAttendance.toLocaleString("en-GB") + " people"
              : "Add total area first"}
          </span>
        </div>
      </div>
    </SectionCard>
  );
}
