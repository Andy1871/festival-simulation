import { TOILET_BUFFER, TOILET_RATIOS, HANDWASH_PER_TOILET, ACCESSIBLE_PER_STANDARD } from "./constants";
import type { ToiletResult } from "./types";

export function calculateToilets(
    attendance: number,
    durationHours: number,
    genderSplitFemalePct: number,
    hasAlcohol: boolean,
): ToiletResult {
    if (attendance <= 0) {
        return { femaleWCs: 0, maleWCs: 0, urinals: 0, accessibleWCs: 0, totalWCs: 0, handwashingStations: 0 };
    }
    const female = Math.round(attendance * genderSplitFemalePct)
    const male = attendance - female

    const ratios = durationHours <= 6 ? TOILET_RATIOS.under6h : hasAlcohol ? TOILET_RATIOS.over6hWithAlcohol : TOILET_RATIOS.over6hNoAlcohol;

    const minFemaleWCs = Math.ceil(female / ratios.femalePerPerson)
    const minMaleWCs = Math.ceil(male / ratios.maleWCPerPerson)
    const minUrinals = Math.ceil(male / ratios.maleUrinalPerPerson)

    const femaleWCs   = Math.ceil(minFemaleWCs * TOILET_BUFFER);
    const maleWCs     = Math.ceil(minMaleWCs   * TOILET_BUFFER);
    const maleUrinals = Math.ceil(minUrinals   * TOILET_BUFFER);
  
    const standardTotal = femaleWCs + maleWCs + maleUrinals;
    const accessibleWCs = Math.max(1, Math.ceil(standardTotal / ACCESSIBLE_PER_STANDARD)); // Ensure at least 1 accessible toilet
    const totalToiletUnits = standardTotal + accessibleWCs;
    const handwashingStations = Math.ceil(totalToiletUnits / HANDWASH_PER_TOILET);

    return {
        femaleWCs, maleWCs, urinals: maleUrinals, accessibleWCs, totalWCs: totalToiletUnits, handwashingStations
    }

    // With this return - we TELL the user what they need, rather than asking them to choose or calculate it.
}