import { TicketTiersSection } from "./TicketTiersSection";
import type { useWizardState } from "../../../../hooks/useWizardState";
import type { FestivalConfig } from "../../../../types";

interface TicketingStepProps {
  config: FestivalConfig;
  addTicketTier: ReturnType<typeof useWizardState>["addTicketTier"];
  removeTicketTier: ReturnType<typeof useWizardState>["removeTicketTier"];
  updateTicketTier: ReturnType<typeof useWizardState>["updateTicketTier"];
  maxAttendance: number;
  overAllocatedWarning: boolean;
  onGoToSite: () => void;
}

export function TicketingStep({
  config,
  addTicketTier,
  removeTicketTier,
  updateTicketTier,
  maxAttendance,
  overAllocatedWarning,
  onGoToSite,
}: TicketingStepProps) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Ticketing</h2>
        <p className="text-sm text-gray-500 mt-1">
          Set your ticket tiers and pricing.
        </p>
      </div>

      {maxAttendance === 0 && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-red-700 font-medium">
            No attendance capacity available — allocated areas exceed total site
            area.
          </p>
          <button
            onClick={onGoToSite}
            className="shrink-0 text-sm font-medium text-red-700 underline hover:text-red-900 transition-colors"
          >
            Go to Site &amp; Stages
          </button>
        </div>
      )}

      <TicketTiersSection
        ticketTiers={config.ticketTiers}
        addTicketTier={addTicketTier}
        removeTicketTier={removeTicketTier}
        updateTicketTier={updateTicketTier}
        maxAttendance={maxAttendance}
        overAllocatedWarning={overAllocatedWarning}
        expectedAttendance={config.expectedAttendance}
      />
    </div>
  );
}
