import { LineupStatsSection } from "./LineupStatsSection";
import { AddArtistSection } from "./AddArtistSection";
import { StageArtistListsSection } from "./StageArtistListsSection";
import type { useWizardState } from "../../../../hooks/useWizardState";
import type { FestivalConfig } from "../../../../types";

interface LineupStepProps {
  config: FestivalConfig;
  addArtist: ReturnType<typeof useWizardState>["addArtist"];
  removeArtist: ReturnType<typeof useWizardState>["removeArtist"];
  updateArtist: ReturnType<typeof useWizardState>["updateArtist"];
  onGoToSite: () => void;
}

export function LineupStep({
  config,
  addArtist,
  removeArtist,
  updateArtist,
  onGoToSite,
}: LineupStepProps) {
  const { lineup, stages } = config;

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Lineup</h2>
        <p className="text-sm text-gray-500 mt-1">
          Add artists and assign them to stages.
        </p>
      </div>

      {lineup.length > 0 && <LineupStatsSection lineup={lineup} />}

      {stages.length === 0 ? (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-red-700 font-medium">
            No stages configured yet — add stages in Site &amp; Stages first.
          </p>
          <button
            onClick={onGoToSite}
            className="shrink-0 text-sm font-medium text-red-700 underline hover:text-red-900 transition-colors"
          >
            Go to Site &amp; Stages
          </button>
        </div>
      ) : (
        <AddArtistSection
          stages={stages}
          lineup={lineup}
          addArtist={addArtist}
        />
      )}

      <StageArtistListsSection
        stages={stages}
        lineup={lineup}
        updateArtist={updateArtist}
        removeArtist={removeArtist}
      />
    </div>
  );
}
