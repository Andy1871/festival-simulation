import { describe, it, expect } from 'vitest';
import { calculateCrowdDensity } from '../calculateCrowdDensity';

describe('calculateCrowdDensity', () => {
    it('returns safe status and density=0 when area is zero', () => {
        const result = calculateCrowdDensity(1000, 0);
        expect(result.density).toBe(0);
        expect(result.safetyStatus).toBe('safe');
        expect(result.headroomPct).toBe(100);
    });

    it('returns safe for comfortable density', () => {
        // 1000 attendees in 1000m² = 1.0 p/m² — well under 2.0 comfortable limit
        const result = calculateCrowdDensity(1000, 1000);
        expect(result.density).toBe(1.0);
        expect(result.safetyStatus).toBe('safe');
    });

    it('returns warning between comfortable and danger thresholds', () => {
        // 3000 attendees in 1000m² = 3.0 p/m² — warning zone (≥3.0, <5.0)
        const result = calculateCrowdDensity(3000, 1000);
        expect(result.density).toBe(3.0);
        expect(result.safetyStatus).toBe('warning');
    });

    it('returns danger at or above 5 p/m²', () => {
        // 5000 attendees in 1000m² = 5.0 p/m²
        const result = calculateCrowdDensity(5000, 1000);
        expect(result.safetyStatus).toBe('danger');
    });

    it('calculates headroom as 0 when at or over the zone max', () => {
        // generalArena max = 2.0, density = 2.0 → headroom 0%
        const result = calculateCrowdDensity(2000, 1000);
        expect(result.headroomPct).toBe(0);
    });

    it('returns positive headroom when under zone max', () => {
        // 500 in 1000m² = 0.5 p/m² — plenty of headroom
        const result = calculateCrowdDensity(500, 1000);
        expect(result.headroomPct).toBeGreaterThan(0);
    });

    it('recommendedMaxAttendance is floor(area * zone target)', () => {
        // default zone = generalArena, target = 1.5
        const result = calculateCrowdDensity(100, 1000);
        expect(result.recommendedMaxAttendance).toBe(Math.floor(1000 * 1.5));
    });

    it('density is rounded to 2 decimal places', () => {
        // 1000 in 3000m² = 0.333... → rounds to 0.33
        const result = calculateCrowdDensity(1000, 3000);
        expect(result.density).toBe(0.33);
    });
});
