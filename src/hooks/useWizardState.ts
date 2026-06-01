import { useState, useMemo, useEffect } from 'react';
import { STAGE_AREAS_SQM, PARKING_AREA_PER_SPACE_SQM } from '../calculations/constants';
import type {
    FestivalConfig, Artist, Stage, Vendor, TicketTier,
    SiteAreaConfig, Sponsor, WizardStep,
} from '../types';

// --- Validation ---

function validateBasic(c: FestivalConfig): string[] {
    const errors: string[] = [];
    if (!c.name.trim()) errors.push('Festival name is required.');
    if (!c.dateISO) errors.push('Date is required.');
    if (!c.location.trim()) errors.push('Location is required.');
    if (c.durationHours <= 0) errors.push('Duration must be greater than 0.');
    if (c.expectedAttendance <= 0) errors.push('Expected attendance must be greater than 0.');
    if (c.genderSplitFemalePct < 0 || c.genderSplitFemalePct > 1) errors.push('Gender split must be between 0% and 100%.');
    return errors;
}

function validateSite(c: FestivalConfig): string[] {
    const errors: string[] = [];
    if (c.stages.length === 0) errors.push('At least one stage is required.');
    if (c.siteAreaConfig.totalAreaSqM <= 0) errors.push('Total site area must be greater than 0.');
    if (c.siteAreaConfig.stageAreaSqM <= 0) errors.push('Stage area must be greater than 0.');
    const chillZoneTotal = c.siteAreaConfig.chillZones.reduce((s, z) => s + z.areaSqM, 0);
    const parkingArea = c.siteAreaConfig.hasParking && c.siteAreaConfig.parkingSpaces
        ? c.siteAreaConfig.parkingSpaces * PARKING_AREA_PER_SPACE_SQM : 0;
    const allocated = c.siteAreaConfig.stageAreaSqM + c.siteAreaConfig.vendorAreaSqM + chillZoneTotal + parkingArea;
    if (allocated >= c.siteAreaConfig.totalAreaSqM) errors.push('Allocated areas exceed total site area — no usable audience space.');
    if (c.siteAreaConfig.hasParking) {
        if (!c.siteAreaConfig.parkingSpaces || c.siteAreaConfig.parkingSpaces <= 0)
            errors.push('Number of parking spaces is required.');
        if (!c.siteAreaConfig.parkingPermitCostGBP || c.siteAreaConfig.parkingPermitCostGBP <= 0)
            errors.push('Permit cost per parking space is required.');
    }
    return errors;
}

function validateLineup(c: FestivalConfig): string[] {
    const errors: string[] = [];
    if (c.lineup.length === 0) errors.push('At least one artist is required.');
    const stageIds = new Set(c.stages.map(s => s.id));
    const orphaned = c.lineup.filter(a => !stageIds.has(a.stageId)).length;
    if (orphaned > 0) errors.push(`${orphaned} artist(s) are assigned to a stage that no longer exists.`);
    return errors;
}

function validateTicketing(c: FestivalConfig): string[] {
    const errors: string[] = [];
    if (c.ticketTiers.length === 0) errors.push('At least one ticket tier is required.');
    const invalid = c.ticketTiers.filter(t => t.priceGBP <= 0 || t.allocation <= 0).length;
    if (invalid > 0) errors.push('All ticket tiers must have a price and allocation greater than 0.');
    return errors;
}

const VALIDATORS: Record<WizardStep, (c: FestivalConfig) => string[]> = {
    basic: validateBasic,
    site: validateSite,
    lineup: validateLineup,
    ticketing: validateTicketing,
    operations: () => [],
    review: () => [],
    compare: () => [],
};

// --- Warnings (informational only, never block simulation) ---

// If event is within 2 days, warn there may not be enough turn ar ound
function warnBasic(c: FestivalConfig): string[] {
    if (!c.dateISO) return [];
    const eventDate = new Date(c.dateISO + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 2)
        return ['This date is very soon — logistics and licensing may not be viable.'];
    return [];
}


// Less than 5 artists - warn to double check scheduling
function warnLineup(c: FestivalConfig): string[] {
    if (c.lineup.length > 0 && c.lineup.length < 5)
        return ['Fewer than 5 artists — double-check scheduling works for your event duration.'];
    return [];
}


// No food vendors or BYOF - warn attendees may be hungry
function warnOperations(c: FestivalConfig): string[] {
    if (!c.attendeesBringFood && !c.vendors.some(v => v.type === 'foodAndDrink'))
        return ['No food vendors added. Add a food vendor or enable "Attendees bring own food".'];
    return [];
}


// If allocated tickets is set below planned attendance
function warnTicketing(c: FestivalConfig): string[] {
    if (c.ticketTiers.length === 0) return [];
    const totalAllocated = c.ticketTiers.reduce((s, t) => s + t.allocation, 0);
    if (totalAllocated < c.expectedAttendance)
        return [`${totalAllocated.toLocaleString('en-GB')} tickets allocated — below your planned attendance of ${c.expectedAttendance.toLocaleString('en-GB')}.`];
    return [];
}

const WARNERS: Record<WizardStep, (c: FestivalConfig) => string[]> = {
    basic:      warnBasic,
    site:       () => [],
    lineup:     warnLineup,
    ticketing:  warnTicketing,
    operations: warnOperations,
    review:     () => [],
    compare:    () => [],
};

// --- Default config factory ---

function makeDefaultConfig(): FestivalConfig {
    return {
        id: crypto.randomUUID(),
        name: '',
        dateISO: '',
        location: '',
        durationHours: 16,
        expectedAttendance: 1000,
        genderSplitFemalePct: 0.5,
        hasAlcohol: true,
        lineup: [],
        stages: [],
        vendors: [],
        ticketTiers: [],
        siteAreaConfig: {
            totalAreaSqM: 0,
            stageAreaSqM: 0,
            vendorAreaSqM: 0,
            chillZones: [],
            hasParking: false,
            hasParkAndRide: false,
        },
        sponsors: [],
    };
}

// --- Draft persistence ---

function draftKey(userId?: string) {
    return `festival_sim_draft${userId ? `_${userId}` : ''}`;
}

function loadDraft(userId?: string): { config?: FestivalConfig; step?: WizardStep } {
    try {
        const raw = localStorage.getItem(draftKey(userId));
        if (raw) return JSON.parse(raw);
    } catch { /* corrupt localStorage — ignore */ }
    return {};
}

// --- Hook ---

export function useWizardState(userId?: string, initialConfig?: FestivalConfig) {
    const [config, setConfig] = useState<FestivalConfig>(() => {
        if (initialConfig) return initialConfig;
        return loadDraft(userId).config ?? makeDefaultConfig();
    });
    const [currentStep, setCurrentStep] = useState<WizardStep>(
        () => loadDraft(userId).step ?? 'basic'
    );

    useEffect(() => {
        try { localStorage.setItem(draftKey(userId), JSON.stringify({ config, step: currentStep })); } catch { /* quota exceeded — ignore */ }
    }, [config, currentStep, userId]);

    const errors = useMemo<Record<WizardStep, string[]>>(
        () => Object.fromEntries(
            Object.entries(VALIDATORS).map(([step, validate]) => [step, validate(config)])
        ) as Record<WizardStep, string[]>,
        [config],
    );

    const warnings = useMemo<Record<WizardStep, string[]>>(
        () => Object.fromEntries(
            Object.entries(WARNERS).map(([step, warn]) => [step, warn(config)])
        ) as Record<WizardStep, string[]>,
        [config],
    );

    const isSimulationReady = useMemo(
        () => Object.values(errors).every(e => e.length === 0),
        [errors],
    );

    // Config lifecycle
    const resetConfig      = () => { setConfig(makeDefaultConfig()); setCurrentStep('basic'); };
    const loadConfig       = (cfg: FestivalConfig) => { setConfig(cfg); setCurrentStep('basic'); };
    const updateAfterSave  = (id: string, name: string) => setConfig(c => ({ ...c, id, name }));

    // Basic info
    const updateBasic = (updates: Partial<Pick<FestivalConfig,
        'name' | 'dateISO' | 'location' | 'durationHours' | 'expectedAttendance' | 'genderSplitFemalePct' | 'hasAlcohol' | 'attendeesBringFood' | 'attendeesBringAlcohol'
    >>) => setConfig(c => ({ ...c, ...updates }));

    // Site
    const updateSiteArea = (updates: Partial<SiteAreaConfig>) =>
        setConfig(c => ({ ...c, siteAreaConfig: { ...c.siteAreaConfig, ...updates } }));
    const addStage = (stage: Stage) => setConfig(c => {
        const next = [...c.stages, stage];
        return { ...c, stages: next, siteAreaConfig: { ...c.siteAreaConfig, stageAreaSqM: next.reduce((sum, s) => sum + (STAGE_AREAS_SQM[s.type] ?? 0), 0) } };
    });
    const removeStage = (id: string) => setConfig(c => {
        const next = c.stages.filter(s => s.id !== id);
        return { ...c, stages: next, siteAreaConfig: { ...c.siteAreaConfig, stageAreaSqM: next.reduce((sum, s) => sum + (STAGE_AREAS_SQM[s.type] ?? 0), 0) } };
    });
    const updateStageName = (id: string, name: string) =>
        setConfig(c => ({ ...c, stages: c.stages.map(s => s.id === id ? { ...s, name } : s) }));
    const addChillZone = (zone: { name: string; areaSqM: number }) =>
        setConfig(c => ({ ...c, siteAreaConfig: { ...c.siteAreaConfig, chillZones: [...c.siteAreaConfig.chillZones, zone] } }));
    const removeChillZone = (index: number) =>
        setConfig(c => ({ ...c, siteAreaConfig: { ...c.siteAreaConfig, chillZones: c.siteAreaConfig.chillZones.filter((_, i) => i !== index) } }));
    const updateChillZone = (index: number, updates: Partial<{ name: string; areaSqM: number }>) =>
        setConfig(c => ({ ...c, siteAreaConfig: { ...c.siteAreaConfig, chillZones: c.siteAreaConfig.chillZones.map((z, i) => i === index ? { ...z, ...updates } : z) } }));

    // Lineup
    const addArtist    = (artist: Artist) => setConfig(c => ({ ...c, lineup: [...c.lineup, artist] }));
    const removeArtist = (id: string)     => setConfig(c => ({ ...c, lineup: c.lineup.filter(a => a.id !== id) }));
    const updateArtist = (id: string, updates: Partial<Artist>) =>
        setConfig(c => ({ ...c, lineup: c.lineup.map(a => a.id === id ? { ...a, ...updates } : a) }));

    // Ticketing
    const addTicketTier    = (tier: TicketTier) => setConfig(c => ({ ...c, ticketTiers: [...c.ticketTiers, tier] }));
    const removeTicketTier = (id: string)        => setConfig(c => ({ ...c, ticketTiers: c.ticketTiers.filter(t => t.id !== id) }));
    const updateTicketTier = (id: string, updates: Partial<TicketTier>) =>
        setConfig(c => ({ ...c, ticketTiers: c.ticketTiers.map(t => t.id === id ? { ...t, ...updates } : t) }));
    const addSponsor    = (sponsor: Sponsor) => setConfig(c => ({ ...c, sponsors: [...c.sponsors, sponsor] }));
    const removeSponsor = (id: string)       => setConfig(c => ({ ...c, sponsors: c.sponsors.filter(s => s.id !== id) }));
    const updateSponsor = (id: string, updates: Partial<Sponsor>) =>
        setConfig(c => ({ ...c, sponsors: c.sponsors.map(s => s.id === id ? { ...s, ...updates } : s) }));

    // Operations
    const addVendor       = (vendor: Vendor) => setConfig(c => ({ ...c, vendors: [...c.vendors, vendor] }));
    const removeVendor    = (id: string)      => setConfig(c => ({ ...c, vendors: c.vendors.filter(v => v.id !== id) }));
    const updateVendor    = (id: string, updates: Partial<Vendor>) =>
        setConfig(c => ({ ...c, vendors: c.vendors.map(v => v.id === id ? { ...v, ...updates } : v) }));
    const setStaffOverrides = (overrides: FestivalConfig['staffOverrides']) =>
        setConfig(c => ({ ...c, staffOverrides: overrides }));
    const setAttendeesBringFood    = (v: boolean) => setConfig(c => ({ ...c, attendeesBringFood: v }));
    const setAttendeesBringAlcohol = (v: boolean) => setConfig(c => ({ ...c, attendeesBringAlcohol: v }));

    return {
        config,
        currentStep,
        errors,
        isSimulationReady,
        warnings,
        setStep:            setCurrentStep,
        resetConfig,
        loadConfig,
        updateAfterSave,
        updateBasic,
        updateSiteArea,
        addStage,
        removeStage,
        updateStageName,
        addArtist,
        removeArtist,
        updateArtist,
        addTicketTier,
        removeTicketTier,
        updateTicketTier,
        addSponsor,
        removeSponsor,
        updateSponsor,
        addChillZone,
        removeChillZone,
        updateChillZone,
        addVendor,
        removeVendor,
        updateVendor,
        setStaffOverrides,
        setAttendeesBringFood,
        setAttendeesBringAlcohol,
    };
}
