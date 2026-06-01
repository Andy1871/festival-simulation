import { Section, Row } from "./";
import type { MetricsSnapshot } from "../../../../calculations/types";

interface StaffOperationsSectionProps {
  staffing: MetricsSnapshot["staffing"];
  energy: MetricsSnapshot["energy"];
  vendorCount: number;
  sponsorCount: number;
}

export function StaffOperationsSection({
  staffing,
  energy,
  vendorCount,
  sponsorCount,
}: StaffOperationsSectionProps) {
  return (
    <Section title="Staff & Operations">
      <p className="text-xs text-gray-400 mb-3 -mt-2">
        Staffing numbers are total individuals required across all shifts, based on each person working a single 8-hour shift. A 16-hour festival requires double the staff of an 8-hour one.
      </p>
      <Row
        label="SIA security"
        value={staffing.securityCount.toLocaleString("en-GB")}
      />
      <Row
        label="Stewards"
        value={staffing.stewardCount.toLocaleString("en-GB")}
      />
      <Row
        label="Medical (first aiders + paramedics + doctors)"
        value={`${staffing.medicalTeam.firstAiders + staffing.medicalTeam.paramedics + staffing.medicalTeam.doctors}`}
        sub={`${staffing.medicalTeam.firstAiders} FA · ${staffing.medicalTeam.paramedics} para · ${staffing.medicalTeam.doctors} doc`}
      />
      <Row
        label="Bar staff"
        value={staffing.barStaff.toLocaleString("en-GB")}
      />
      <Row
        label="Total staff headcount"
        value={staffing.totalHeadCount.toLocaleString("en-GB")}
      />
      <Row label="Vendors on site" value={`${vendorCount}`} />
      <Row
        label="Sponsors"
        value={
          sponsorCount > 0
            ? `${sponsorCount} sponsor${sponsorCount !== 1 ? "s" : ""}`
            : "None"
        }
      />
      <Row
        label="Generators needed"
        value={`${Math.ceil(energy.generatorSizingKva / 250)} units`}
        sub={`${energy.generatorSizingKva.toLocaleString("en-GB")} kVA capacity`}
      />
    </Section>
  );
}
