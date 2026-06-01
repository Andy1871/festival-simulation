import { CROWD_DENSITY } from './constants';
import type { CrowdDensityResult } from './types';

type ZoneType = keyof typeof CROWD_DENSITY.zones;

export function calculateCrowdDensity(
  attendance: number,
  areaSqM: number,
  zoneType: ZoneType = 'generalArena'
): CrowdDensityResult {
  if (areaSqM <= 0) {
    return {
      density: 0,
      safeMax: CROWD_DENSITY.zones[zoneType].max,
      safetyStatus: 'safe',
      headroomPct: 100,
      recommendedMaxAttendance: 0,
    };
  }

  const zone = CROWD_DENSITY.zones[zoneType];
  const density = attendance / areaSqM;

  const safetyStatus =
    density >= CROWD_DENSITY.danger  ? 'danger'  :
    density >= CROWD_DENSITY.warning ? 'warning' :
                                       'safe';

  const headroomPct = Math.max(0, ((zone.max - density) / zone.max) * 100);
  const recommendedMaxAttendance = Math.floor(areaSqM * zone.target);

  return {
    density: Math.round(density * 100) / 100,
    safeMax: zone.max,
    safetyStatus,
    headroomPct: Math.round(headroomPct),
    recommendedMaxAttendance,
  };
}