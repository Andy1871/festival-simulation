import { CROWD_DENSITY, PARKING_AREA_PER_SPACE_SQM } from './constants';
import type { SiteAreaConfig } from '../types';
import type { SiteCapacityResult } from './types';

export function calculateSiteCapacity(
    siteAreaConfig: SiteAreaConfig,
    totalTicketsAllocated: number = 0,
): SiteCapacityResult {
    const parkingArea = siteAreaConfig.hasParking && siteAreaConfig.parkingSpaces
        ? siteAreaConfig.parkingSpaces * PARKING_AREA_PER_SPACE_SQM
        : 0;
    const usableAreaSqM = Math.max(
        0,
        siteAreaConfig.totalAreaSqM - siteAreaConfig.vendorAreaSqM - parkingArea,
    );
    const maxAttendance = Math.floor(usableAreaSqM * CROWD_DENSITY.comfortable);

    return {
        usableAreaSqM,
        maxAttendance,
        overAllocatedWarning: totalTicketsAllocated > 0 && totalTicketsAllocated > maxAttendance,
    };
}
