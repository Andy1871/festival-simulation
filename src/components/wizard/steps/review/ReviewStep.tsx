import { exportToJSON, exportToCSV } from "../../../../export/exportUtils";
import { Section, Row } from "./";
import { ReadinessChecklistSection } from "./ReadinessChecklistSection";
import { SiteCapacitySection } from "./SiteCapacitySection";
import { FinancialOverviewSection } from "./FinancialOverviewSection";
import { RevenueBreakdownSection } from "./RevenueBreakdownSection";
import { CostsBreakdownSection } from "./CostsBreakdownSection";
import { StaffOperationsSection } from "./StaffOperationsSection";
import { EfficiencyRiskSection } from "./EfficiencyRiskSection";
import type { MetricsSnapshot } from "../../../../calculations/types";
import type { FestivalConfig, WizardStep } from "../../../../types";

interface ReviewStepProps {
  snapshot: MetricsSnapshot;
  config: FestivalConfig;
  isReady: boolean;
  errors: Record<WizardStep, string[]>;
}

export function ReviewStep({ snapshot, config }: ReviewStepProps) {
  const {
    pnl,
    siteCapacity,
    efficiencyScore,
    staffing,
    energy,
    ticketRevenue,
    weatherRisk,
    artistCosts,
    catering,
    sponsorship,
    capex,
    opex,
    parkingRevenue,
  } = snapshot;

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Overview</h2>
          <p className="text-sm text-gray-500 mt-1">
            Full simulation summary for {config.name || "your festival"}.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => exportToCSV(config, snapshot)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => exportToJSON(config, snapshot)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export JSON
          </button>
        </div>
      </div>

      <ReadinessChecklistSection snapshot={snapshot} config={config} />

      <Section title="Basic Info">
        <Row label="Festival" value={config.name || "—"} />
        <Row label="Date" value={config.dateISO || "—"} />
        <Row label="Location" value={config.location || "—"} />
        <Row label="Duration" value={`${config.durationHours}h`} />
        <Row
          label="Expected attendance"
          value={config.expectedAttendance.toLocaleString("en-GB")}
          sub={
            siteCapacity.maxAttendance > 0
              ? `Site max: ${siteCapacity.maxAttendance.toLocaleString("en-GB")}`
              : undefined
          }
          valueColor={
            siteCapacity.overAllocatedWarning ? "text-red-600" : "text-gray-800"
          }
        />
        <Row label="Licensed bar" value={config.hasAlcohol ? "Yes" : "No"} />
      </Section>

      <SiteCapacitySection config={config} siteCapacity={siteCapacity} />

      <FinancialOverviewSection
        pnl={pnl}
        totalTicketsAllocated={ticketRevenue.totalTicketsAllocated}
      />

      <RevenueBreakdownSection
        pnl={pnl}
        ticketRevenue={ticketRevenue}
        catering={catering}
        sponsorship={sponsorship}
        parkingRevenue={parkingRevenue}
        siteAreaConfig={config.siteAreaConfig}
      />

      <CostsBreakdownSection
        pnl={pnl}
        artistCosts={artistCosts}
        staffing={staffing}
        energy={energy}
        capex={capex}
        opex={opex}
      />

      <StaffOperationsSection
        staffing={staffing}
        energy={energy}
        vendorCount={config.vendors.length}
        sponsorCount={config.sponsors.length}
      />

      <EfficiencyRiskSection
        efficiencyScore={efficiencyScore}
        weatherRisk={weatherRisk}
      />
    </div>
  );
}
