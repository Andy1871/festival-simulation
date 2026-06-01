import { Section, Row, ScoreBar } from "./";
import type { MetricsSnapshot } from "../../../../calculations/types";

function fmt(n: number) {
  return `£${n.toLocaleString("en-GB")}`;
}
function pct(n: number) {
  return `${n.toFixed(1)}%`;
}

interface EfficiencyRiskSectionProps {
  efficiencyScore: MetricsSnapshot["efficiencyScore"];
  weatherRisk: MetricsSnapshot["weatherRisk"];
}

export function EfficiencyRiskSection({ efficiencyScore, weatherRisk }: EfficiencyRiskSectionProps) {
  const scoreColor =
    efficiencyScore.overallScore >= 70
      ? "text-green-600"
      : efficiencyScore.overallScore >= 40
        ? "text-amber-600"
        : "text-red-600";

  return (
    <Section title="Efficiency & Risk">
      <div className={`text-3xl font-bold mb-1 ${scoreColor}`}>
        {efficiencyScore.overallScore}
        <span className="text-base font-normal text-gray-400">/100</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">Overall efficiency score</p>
      <div className="flex flex-col gap-2 mb-4">
        <ScoreBar label="Financial" score={efficiencyScore.financialScore} />
        <ScoreBar label="Crowd safety" score={efficiencyScore.crowdScore} />
        <ScoreBar label="Facilities" score={efficiencyScore.facilityScore} />
        <ScoreBar label="Energy" score={efficiencyScore.energyScore} />
      </div>
      <div className="border-t border-gray-100 pt-3">
        <Row
          label="Weather risk"
          value={`${weatherRisk.rainProbabilityPct}% chance of rain`}
          sub={weatherRisk.recommendation}
          valueColor={
            weatherRisk.rainRiskLevel === "high"
              ? "text-red-600"
              : weatherRisk.rainRiskLevel === "medium"
                ? "text-amber-600"
                : "text-green-600"
          }
        />
        <Row
          label="Attendance under rain"
          value={weatherRisk.attendanceUnderRain.toLocaleString("en-GB")}
          sub={`${weatherRisk.attendanceImpactPct}% drop`}
        />
        <Row
          label="Revenue impact (rain)"
          value={fmt(weatherRisk.revenueImpact)}
          valueColor="text-red-600"
        />
        <Row
          label="Margin under rain"
          value={pct(weatherRisk.marginUnderRain)}
          valueColor={
            weatherRisk.marginUnderRain >= 20
              ? "text-green-600"
              : weatherRisk.marginUnderRain >= 10
                ? "text-amber-600"
                : "text-red-600"
          }
        />
      </div>
    </Section>
  );
}
