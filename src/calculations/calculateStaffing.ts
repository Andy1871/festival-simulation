import { STAFFING_RATIOS, STAFF_DAY_RATES } from './constants';
import type { FestivalConfig } from '../types';
import type { StaffingResult } from './types'

function fromRatio(attendance: number, attendeesPerStaff: number, override?: number): number {
    return override ?? Math.ceil(attendance / attendeesPerStaff);
}

function medicalTeamFor(
    attendance: number,
    firstAidersOverride?: number,
    paramedicOverride?: number,
    doctorOverride?: number,
): { firstAiders: number; paramedics: number; doctors: number } {
    let firstAiders: number;
    let paramedics: number;
    let doctors: number;

    if (attendance < 500) {
        [firstAiders, paramedics, doctors] = [2, 0, 0];
    } else if (attendance < 2000) {
        [firstAiders, paramedics, doctors] = [4, 1, 0];
    } else if (attendance < 5000) {
        [firstAiders, paramedics, doctors] = [6, 2, 1];
    } else if (attendance < 10000) {
        [firstAiders, paramedics, doctors] = [Math.ceil(attendance / 500), Math.ceil(attendance / 2000), 1];
    } else {
        [firstAiders, paramedics, doctors] = [Math.ceil(attendance / 300), Math.ceil(attendance / 1500), Math.ceil(attendance / 5000)];
    }

    return {
        firstAiders: firstAidersOverride ?? firstAiders,
        paramedics:  paramedicOverride  ?? paramedics,
        doctors:     doctorOverride     ?? doctors,
    };
}

export function calculateStaffing(attendance: number, durationHours: number, stageCount: number, overrides?: FestivalConfig['staffOverrides']): StaffingResult {
    // Each person works one 8h shift; longer festivals need proportionally more individuals
    const shifts = Math.ceil(durationHours / 8);

    // Per-shift concurrent need, then scale to total individuals unless the user has overridden
    const securityCount = overrides?.siaStaffCount       ?? fromRatio(attendance, STAFFING_RATIOS.attendeesPerSia,      ) * shifts;
    const stewardCount  = overrides?.stewardStaffCount   ?? fromRatio(attendance, STAFFING_RATIOS.attendeesPerSteward,  ) * shifts;
    const welfareStaff  = overrides?.welfareStaffCount   ?? fromRatio(attendance, STAFFING_RATIOS.attendeesPerWelfare,  ) * shifts;
    const barStaff      = overrides?.barStaffCount       ?? fromRatio(attendance, STAFFING_RATIOS.attendeesPerBarStaff, ) * shifts;

    const medBase = medicalTeamFor(attendance);
    const medicalTeam = {
        firstAiders: overrides?.firstAidersCount ?? medBase.firstAiders * shifts,
        paramedics:  overrides?.paramedicCount   ?? medBase.paramedics  * shifts,
        doctors:     overrides?.doctorCount      ?? medBase.doctors     * shifts,
    };

    // production crew - 3 per stage as baseline (no day rate defined — excluded from cost)
    const productionCrew = stageCount * 3;

    const totalHeadCount = securityCount + stewardCount + medicalTeam.firstAiders + medicalTeam.paramedics + medicalTeam.doctors + welfareStaff + barStaff + productionCrew;

    // Each individual works one shift, so cost = total individuals × day rate
    const estimatedStaffCost =
        (securityCount            * STAFF_DAY_RATES.sia      ) +
        (stewardCount             * STAFF_DAY_RATES.steward  ) +
        (medicalTeam.firstAiders  * STAFF_DAY_RATES.firstAider) +
        (medicalTeam.paramedics   * STAFF_DAY_RATES.paramedic ) +
        (medicalTeam.doctors      * STAFF_DAY_RATES.doctor    ) +
        (welfareStaff             * STAFF_DAY_RATES.welfare   ) +
        (barStaff                 * STAFF_DAY_RATES.barStaff  );

    return {
        securityCount,
        stewardCount,
        medicalTeam,
        welfareStaff,
        barStaff,
        totalHeadCount,
        estimatedStaffCost,
    };
}