import { describe, it, expect } from 'vitest';
import { calculateToilets } from '../calculateToilets';

describe('calculateToilets', () => {
    it('returns all zeros for zero attendance', () => {
        const result = calculateToilets(0, 10, 0.5, true);
        expect(result.femaleWCs).toBe(0);
        expect(result.maleWCs).toBe(0);
        expect(result.urinals).toBe(0);
        expect(result.accessibleWCs).toBe(0);
        expect(result.totalWCs).toBe(0);
        expect(result.handwashingStations).toBe(0);
    });

    it('uses under-6h ratios for short events', () => {
        // 1000 attendees, 50/50 split, 4h event, no alcohol
        const short = calculateToilets(1000, 4, 0.5, false);
        // 4h event with alcohol (should still use under-6h ratios)
        const shortAlcohol = calculateToilets(1000, 4, 0.5, true);
        // Both should use the under-6h ratios, so results should be identical
        expect(short.femaleWCs).toBe(shortAlcohol.femaleWCs);
        expect(short.maleWCs).toBe(shortAlcohol.maleWCs);
    });

    it('requires more toilets with alcohol at long events', () => {
        const withAlcohol    = calculateToilets(2000, 10, 0.5, true);
        const withoutAlcohol = calculateToilets(2000, 10, 0.5, false);
        // Alcohol ratios are stricter (lower people-per-toilet), so more units required
        expect(withAlcohol.femaleWCs).toBeGreaterThan(withoutAlcohol.femaleWCs);
        expect(withAlcohol.urinals).toBeGreaterThan(withoutAlcohol.urinals);
    });

    it('scales proportionally with female gender split', () => {
        const mostlyFemale = calculateToilets(1000, 8, 0.8, true);
        const halfHalf     = calculateToilets(1000, 8, 0.5, true);
        expect(mostlyFemale.femaleWCs).toBeGreaterThan(halfHalf.femaleWCs);
        expect(mostlyFemale.maleWCs).toBeLessThan(halfHalf.maleWCs);
    });

    it('always provides at least 1 accessible WC for non-zero attendance', () => {
        // very small event
        const result = calculateToilets(10, 8, 0.5, false);
        expect(result.accessibleWCs).toBeGreaterThanOrEqual(1);
    });

    it('applies 10% buffer over Purple Guide minimums', () => {
        // 1000 female attendees, 6h+ with alcohol → 1 per 75 = ceil(1000/75) = 14 min → with 1.1 buffer = ceil(14 * 1.1) = 16
        const result = calculateToilets(1000, 10, 1.0, true);
        const rawMin = Math.ceil(1000 / 75);       // 14
        const buffered = Math.ceil(rawMin * 1.1);   // 16
        expect(result.femaleWCs).toBe(buffered);
    });

    it('provides handwashing stations proportional to total units', () => {
        const result = calculateToilets(500, 8, 0.5, true);
        // 1 handwashing station per 5 toilet units
        expect(result.handwashingStations).toBe(Math.ceil(result.totalWCs / 5));
    });
});
