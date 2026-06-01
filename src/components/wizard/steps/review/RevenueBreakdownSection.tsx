import { Section, Row } from "./";
import type { MetricsSnapshot } from "../../../../calculations/types";
import type { FestivalConfig } from "../../../../types";

function fmt(n: number) {
  return `£${n.toLocaleString("en-GB")}`;
}

interface RevenueBreakdownSectionProps {
  pnl: MetricsSnapshot["pnl"];
  ticketRevenue: MetricsSnapshot["ticketRevenue"];
  catering: MetricsSnapshot["catering"];
  sponsorship: MetricsSnapshot["sponsorship"];
  parkingRevenue: number;
  siteAreaConfig: FestivalConfig["siteAreaConfig"];
}

export function RevenueBreakdownSection({
  pnl,
  ticketRevenue,
  catering,
  sponsorship,
  parkingRevenue,
  siteAreaConfig,
}: RevenueBreakdownSectionProps) {
  return (
    <Section title="Revenue Breakdown">
      <Row
        label="Ticket revenue (net of VAT)"
        value={fmt(ticketRevenue.netRevenueExVat)}
        sub={`${ticketRevenue.totalTicketsAllocated.toLocaleString("en-GB")} tickets · avg £${ticketRevenue.averageYield.toFixed(2)}`}
      />
      <Row
        label="Booking fee revenue"
        value={fmt(ticketRevenue.bookingFeeRevenue)}
      />
      <Row
        label="Catering & bar"
        value={fmt(catering.totalCateringRevenue)}
        sub={`£${catering.spendPerAttendee.toFixed(2)}/head`}
      />
      <Row
        label="Sponsorship"
        value={fmt(sponsorship.estimatedRevenue)}
        sub={sponsorship.tier !== "none" ? sponsorship.tier : undefined}
      />
      {parkingRevenue > 0 && (
        <Row
          label="Parking permits"
          value={fmt(parkingRevenue)}
          sub={`${siteAreaConfig.parkingSpaces} × £${siteAreaConfig.parkingPermitCostGBP}`}
        />
      )}
      <Row
        label="Total revenue"
        value={fmt(pnl.totalRevenue)}
        valueColor="text-green-700"
      />
    </Section>
  );
}
