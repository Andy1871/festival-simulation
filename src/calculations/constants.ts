// Constants all relating to the calculation files - all constants in alphabetical order to match files.

// Artist fee related constants
export const ARTIST_FEES = {
    local: { min: 500, max: 2000, label: 'Local / Unsigned'},
    emerging: { min: 2000, max: 8000, label: 'Emerging'}, 
    midTier: { min: 8000, max: 40000, label: 'Mid-tier'},
    headliner: { min: 40000, max: 200000, label: 'Headliner'},
    international: { min: 200000, max: 1000000, label: 'International'},
} as const;

export const ARTIST_RIDER_MULTIPLIER = 0.10;  // 10% on top of fee
export const TALENT_BUDGET_MAX_PCT = 0.45;    // industry warning: >45% of costs
export const PRS_LICENCE_PCT = 0.03;          // 3% of ticket revenue


// CAPEX — stage hire costs (structure + PA + lighting, per stage type)
export const STAGE_HIRE_COSTS = {
  main: { structure: 40000, pa: 5000, lighting: 8000 },
  second: { structure: 15000, pa: 2500, lighting: 3500 },
  small: { structure: 7500, pa: 1500, lighting: 2250},
  acoustic: { structure: 5000, pa: 850, lighting: 1500 },
} as const;
export const FENCING_COST_PER_METRE   = 5;       // £/m, perimeter fencing
export const TEMP_ROADWAY_PER_100M    = 3000;   // per 100m section
export const GENERATOR_HIRE_PER_UNIT  = 1500;   // daily hire per unit
export const SITE_SURVEY_COST         = 2000;   // one-off cost for site survey and planning
export const SITE_MANAGEMENT_COST     = 5000;   // one-off cost for site management and logistics planning
export const SIGNAGE_COST             = 1500;
export const WELFARE_TENT_COST        = 2000;
export const MEDICAL_TENT_COST        = 3000;


// Catering 
export const AVG_ATTENDEE_AlC_SPEND_PER_12h = 45
export const BAR_GROSS_MARGIN_PCT = 0.65; // 65% gross margin on bar sales
export const VENDOR_PITCH_FEES = {
    small: { foodAndDrink: 500, merch: 300, sponsor: 1000 },
    medium: { foodAndDrink: 1000, merch: 600, sponsor: 2000 },
    large: { foodAndDrink: 2000, merch: 1200, sponsor: 4000 },
} as const; // Range for vendor pitch fees, depending on type and size


// Crowd Density
export const CROWD_DENSITY = {
  comfortable: 2.0,   // Purple Guide safe capacity limit
  warning: 3.0,       // movement becomes difficult
  danger: 5.0,        // unstable — never allow
  zones: {
    generalArena: { target: 1.5, max: 2.0 },
    frontOfStage: { target: 3.0, max: 4.0 },
    chillOut: { target: 0.4, max: 0.5 },
    walkway: { target: 1.0, max: 1.5 },
    barQueue: { target: 2.0, max: 2.5 },
  }
} as const;

// Energy kVA ranges (midpoints used as defaults)
export const KVA_REQUIREMENTS = {
  mainStage: { min: 250, max: 400, default: 325 },
  secondStage: { min: 100, max: 150, default: 125 },
  smallStage: { min: 50, max: 100, default: 75 },
  acousticTent: { min: 30, max: 60, default: 45 },
  barUnit: { min: 15, max: 25, default: 20 },
  foodVendor: { min: 10, max: 20, default: 15 },
  siteLighting: { min: 5, max: 15, default: 10 },
  productionOffice: { min: 10, max: 15, default: 12 },
} as const;

export const GENERATOR_POWER_FACTOR = 0.8;
export const GENERATOR_OPTIMAL_LOAD = 0.65; // size so peak sits at 65%
export const DIESEL_LITRES_PER_KVA_HOUR = 0.27;
export const DIESEL_COST_PER_LITRE_GBP = 1.10;
export const DIESEL_CO2_KG_PER_LITRE = 2.68;

// OPEX operating costs
export const WASTE_COST_PER_ATTENDEE = 3.50;  // £/head
export const INSURANCE_COST_PER_ATTENDEE = 1.00;  // £/head
export const LOGISTICS_COST_PER_ATTENDEE = 8;     // £/head (toilets, water, waste vehicles)
export const MARKETING_REVENUE_PCT = 0.12;  // 12% of gross ticket revenue
export const PREMISES_LICENCE_COST = 1_500;
export const PPL_LICENCE_COST = 500;


// Sponsorship — estimated brand deal value per head by tier
export const SPONSORSHIP_RATE_PER_HEAD = {
    none:     0,
    bronze:   1.50,  // logo on materials, social mentions
    silver:   3.00,  // stage naming rights, banner presence
    gold:     6.00,  // title association, brand activations on site
    platinum: 12.00, // presenting sponsor, full site presence + exclusivity
} as const;


export const BYOB_BAR_SPEND_MULTIPLIER = 0.35; // 65% revenue drop when attendees bring own alcohol


// Parking
export const PARKING_AREA_PER_SPACE_SQM = 12.5; // m² per space incl. access lanes


// Stage footprint areas (m²) — used to auto-compute stage area from added stages
export const STAGE_AREAS_SQM = {
    main:     2500,
    second:   1200,
    small:     600,
    acoustic:  400,
} as const;


// Staffing ratios — attendees per 1 staff member
export const STAFFING_RATIOS = {
  attendeesPerSia: 125,       // 1 SIA per 125 attendees (SIA licensing requirement)
  attendeesPerSteward: 250,
  attendeesPerWelfare: 500,
  attendeesPerBarStaff: 83,   
} as const;

// day rate = 8h shift each for ease.
export const STAFF_DAY_RATES = {
  sia: 180,
  steward: 95,
  firstAider: 150,
  paramedic: 200,
  doctor: 450,
  welfare: 90,
  barStaff: 85,
} as const;

// Ticket revenue
export const VAT_RATE = 0.20;
export const BOOKING_FEE_PCT = 0.10;


// Weather risk — UK heavy rain probability by month 
export const UK_RAIN_PROBABILITY_BY_MONTH: Record<number, number> = {
    1: 0.42,  // January  
    2: 0.38,  // February
    3: 0.33,  // March
    4: 0.27,  // April     
    5: 0.22,  // May
    6: 0.20,  // June     
    7: 0.18,  // July      
    8: 0.20,  // August    
    9: 0.25,  // September 
    10: 0.33, // October
    11: 0.38, // November
    12: 0.42, // December
} as const;

// Attendance drop under heavy rain, by risk tier
export const RAIN_ATTENDANCE_DROP: Record<'low' | 'medium' | 'high', number> = {
    low:    0.05,  // 5%  — some late arrivals and early departures
    medium: 0.15,  // 15% — meaningful drop, casual attendees stay home
    high:   0.25,  // 25% — significant drop, only committed attendees attend
} as const;

// Additional medical cost per head under heavy rain (hypothermia, slips, exposure)
export const RAIN_MEDICAL_UPLIFT_PER_HEAD: Record<'low' | 'medium' | 'high', number> = {
    low:    0.75,
    medium: 2.00,
    high:   4.00,
} as const;


// Purple Guide toilet ratios
export const TOILET_RATIOS = {
  under6h: { femalePerPerson: 100, maleWCPerPerson: 500, maleUrinalPerPerson: 150 },
  over6hNoAlcohol: { femalePerPerson: 85, maleWCPerPerson: 425, maleUrinalPerPerson: 125 },
  over6hWithAlcohol: { femalePerPerson: 75, maleWCPerPerson: 400, maleUrinalPerPerson: 100 },
} as const;

export const TOILET_BUFFER = 1.10; // 10% above Purple Guide minimum
export const HANDWASH_PER_TOILET = 5; // 1 unit per 5 toilets
export const ACCESSIBLE_PER_STANDARD = 20; // 1 accessible per 20 standard

