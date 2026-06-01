export type ArtistTier = 'local' | 'emerging' | 'midTier' | 'headliner' | 'international';
export type StageType = 'main' | 'second' | 'acoustic' | 'small';
export type SponsorshipTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
export type VendorType = 'foodAndDrink' | 'merch' | 'sponsor';
export type WizardStep = 'basic' | 'site' | 'lineup' | 'ticketing' | 'operations' | 'review' | 'compare';
export type ticketType = 'generalAdmission' | 'onTheDoor' | 'earlyBird';

export interface Artist {
    id: string;
    name: string;
    tier: ArtistTier;
    feeOverrideGBP?: number;
    stageId: string;
}

export interface SiteAreaConfig {
    totalAreaSqM: number;
    stageAreaSqM: number;
    vendorAreaSqM: number;
    chillZones: Array<{ name: string; areaSqM: number }>;
    hasParking: boolean;
    parkingSpaces?: number;
    parkingPermitCostGBP?: number;
    hasParkAndRide: boolean;
}

export interface Stage {
    id: string;
    name: string;
    type: StageType;
    capacitySqM: number;
}

export interface TicketTier {
    id: string;
    type: ticketType;
    priceGBP: number;
    allocation: number;
}

export interface Vendor {
    id: string;
    name: string;
    type: VendorType;
    pitchFee?: number;
}

export interface Sponsor {
    id: string;
    name: string;
    tier: SponsorshipTier;
}


// Main Festival Config - all user inputs run through this.

export interface FestivalConfig {
    id: string;
    name: string;
    dateISO: string;
    location: string;
    durationHours: number;
    expectedAttendance: number;
    genderSplitFemalePct: number;
    hasAlcohol: boolean;

    lineup: Artist[];
    stages: Stage[];
    vendors: Vendor[];
    ticketTiers: TicketTier[];
    siteAreaConfig: SiteAreaConfig;

    sponsors: Sponsor[];
    attendeesBringFood?: boolean;
    attendeesBringAlcohol?: boolean;

    staffOverrides?: {
        siaStaffCount?: number;
        stewardStaffCount?: number;
        firstAidersCount?: number;
        paramedicCount?: number;
        doctorCount?: number;
        welfareStaffCount?: number;
        cleanupCrewCount?: number;
        barStaffCount?: number;
    }
}
