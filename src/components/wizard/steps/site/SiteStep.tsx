import { SiteAreaSection } from "./SiteAreaSection";
import { StagesSection } from "./StagesSection";
import { ParkingSection } from "./ParkingSection";
import { ChillZonesSection } from "./ChillZonesSection";
import type { useWizardState } from "../../../../hooks/useWizardState";
import type { FestivalConfig } from "../../../../types";

interface SiteStepProps {
  config: FestivalConfig;
  updateSiteArea: ReturnType<typeof useWizardState>["updateSiteArea"];
  addStage: ReturnType<typeof useWizardState>["addStage"];
  removeStage: ReturnType<typeof useWizardState>["removeStage"];
  updateStageName: ReturnType<typeof useWizardState>["updateStageName"];
  addChillZone: ReturnType<typeof useWizardState>["addChillZone"];
  removeChillZone: ReturnType<typeof useWizardState>["removeChillZone"];
  updateChillZone: ReturnType<typeof useWizardState>["updateChillZone"];
  maxAttendance: number;
  usableAreaSqM: number;
}

export function SiteStep({
  config,
  updateSiteArea,
  addStage,
  removeStage,
  updateStageName,
  addChillZone,
  removeChillZone,
  updateChillZone,
  maxAttendance,
  usableAreaSqM,
}: SiteStepProps) {
  const { siteAreaConfig, stages } = config;

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Site &amp; Stages
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Define your site layout and stage configuration.
        </p>
      </div>

      <SiteAreaSection
        siteAreaConfig={siteAreaConfig}
        usableAreaSqM={usableAreaSqM}
        maxAttendance={maxAttendance}
        updateSiteArea={updateSiteArea}
      />

      <StagesSection
        stages={stages}
        addStage={addStage}
        removeStage={removeStage}
        updateStageName={updateStageName}
      />

      <ParkingSection
        siteAreaConfig={siteAreaConfig}
        updateSiteArea={updateSiteArea}
      />

      <ChillZonesSection
        chillZones={siteAreaConfig.chillZones}
        addChillZone={addChillZone}
        removeChillZone={removeChillZone}
        updateChillZone={updateChillZone}
      />
    </div>
  );
}
