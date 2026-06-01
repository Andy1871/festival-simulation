import { Section, Row } from "./";
import type { MetricsSnapshot } from "../../../../calculations/types";
import type { FestivalConfig } from "../../../../types";

interface SiteCapacitySectionProps {
  config: FestivalConfig;
  siteCapacity: MetricsSnapshot["siteCapacity"];
}

export function SiteCapacitySection({ config, siteCapacity }: SiteCapacitySectionProps) {
  return (
    <Section title="Site & Capacity">
      <Row
        label="Total site area"
        value={`${config.siteAreaConfig.totalAreaSqM.toLocaleString("en-GB")} m²`}
      />
      <Row
        label="Stage area"
        value={`${config.siteAreaConfig.stageAreaSqM.toLocaleString("en-GB")} m²`}
        sub={`${config.stages.length} stage${config.stages.length !== 1 ? "s" : ""}`}
      />
      <Row
        label="Vendor area"
        value={`${config.siteAreaConfig.vendorAreaSqM.toLocaleString("en-GB")} m²`}
      />
      {config.siteAreaConfig.chillZones.length > 0 && (
        <Row
          label="Chill zones"
          value={`${config.siteAreaConfig.chillZones.reduce((s, z) => s + z.areaSqM, 0).toLocaleString("en-GB")} m²`}
          sub={`${config.siteAreaConfig.chillZones.length} zone${config.siteAreaConfig.chillZones.length !== 1 ? "s" : ""}`}
        />
      )}
      {config.siteAreaConfig.hasParking && config.siteAreaConfig.parkingSpaces && (
        <Row
          label="Parking"
          value={`${config.siteAreaConfig.parkingSpaces.toLocaleString("en-GB")} spaces`}
        />
      )}
      <Row
        label="Usable audience area"
        value={`${siteCapacity.usableAreaSqM.toLocaleString("en-GB")} m²`}
      />
      <Row
        label="Max safe attendance"
        value={siteCapacity.maxAttendance.toLocaleString("en-GB")}
      />
    </Section>
  );
}
