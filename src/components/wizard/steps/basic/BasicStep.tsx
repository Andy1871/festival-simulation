import { FormField, SectionCard } from "../../../ui";
import type { FestivalConfig } from "../../../../types";
import type { useWizardState } from "../../../../hooks/useWizardState";

interface BasicStepProps {
  config: FestivalConfig;
  updateBasic: ReturnType<typeof useWizardState>["updateBasic"];
  warnings: string[];
}

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow";

const today = new Date().toISOString().split("T")[0];

export function BasicStep({ config, updateBasic, warnings }: BasicStepProps) {
  const femalePct = Math.round(config.genderSplitFemalePct * 100);

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Basic Info</h2>
        <p className="text-sm text-gray-500 mt-1">
          Tell us the essentials about your festival.
        </p>
      </div>

      <SectionCard
        title="Festival Details"
        description="The core identity of your event."
      >
        <FormField
          label="Festival Name"
          isValid={config.name.trim().length > 0}
        >
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. Greenfield Festival"
            value={config.name}
            onChange={(e) => updateBasic({ name: e.target.value })}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            label="Date"
            isValid={config.dateISO !== ""}
            warning={warnings[0]}
          >
            <input
              type="date"
              className={inputClass}
              min={today}
              value={config.dateISO}
              onChange={(e) => updateBasic({ dateISO: e.target.value })}
            />
          </FormField>

          <FormField
            label="Location"
            isValid={config.location.trim().length > 0}
          >
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. Bristol, UK"
              value={config.location}
              onChange={(e) => updateBasic({ location: e.target.value })}
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard
        title="Event Settings"
        description="Capacity, duration and audience details."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            label="Duration (hours)"
            isValid={config.durationHours > 0}
            hint={
              config.durationHours >= 20
                ? "Long events may require additional licensing and welfare provisions."
                : undefined
            }
          >
            <input
              type="number"
              className={inputClass}
              min={1}
              max={24}
              value={config.durationHours || ""}
              onChange={(e) =>
                updateBasic({
                  durationHours: Math.min(24, Number(e.target.value)),
                })
              }
            />
          </FormField>

          <FormField
            label="Preferred Attendance"
            isValid={config.expectedAttendance > 0}
          >
            <input
              type="number"
              className={inputClass}
              min={1}
              placeholder="e.g. 2500"
              value={config.expectedAttendance || ""}
              onChange={(e) =>
                updateBasic({ expectedAttendance: Number(e.target.value) })
              }
            />
          </FormField>
        </div>

        <FormField
          label="Audience Gender Split"
          isValid={
            config.genderSplitFemalePct >= 0 && config.genderSplitFemalePct <= 1
          }
          hint={`${femalePct}% female · ${100 - femalePct}% male`}
        >
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={femalePct}
            onChange={(e) =>
              updateBasic({
                genderSplitFemalePct: Number(e.target.value) / 100,
              })
            }
            className="w-full accent-purple-600"
          />
        </FormField>
      </SectionCard>
    </div>
  );
}
