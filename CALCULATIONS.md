# Calculations Reference

All formulas, constants, assumptions, and added features used by the simulation engine.

---

## 1. Ticket Revenue (`calculateTicketRevenue`)

```
grossRevenue           = Σ (tier.priceGBP × tier.allocation)
vatAmount              = grossRevenue × 0.20          (UK standard rate VAT)
netRevenueExVat        = grossRevenue − vatAmount
prsCost                = netRevenueExVat × 0.03       (PRS for Music live music licence)
bookingFeeRevenue      = grossRevenue × 0.10          (booking platform fee retained)
revenueAfterDeductions = netRevenueExVat − prsCost
averageYield           = grossRevenue / totalTicketsAllocated
```

**Assumption**: All ticket types are subject to VAT. PRS is taken from net revenue. 

**Effective attendance**: all financial and operational calculations use `totalTicketsAllocated` as the attendance figure so costs and revenues are consistent. If no ticket tiers have been configured yet, `expectedAttendance` is used as a fallback so the simulation produces useful numbers throughout the wizard.

**Edge case**: zero-allocation tiers return 0 for all values; `averageYield` is 0 if no tickets are allocated.

---

## 2. Artist Costs (`calculateArtistCost`)

```
fee per artist     = artist.feeOverrideGBP ?? midpoint(tier range)
totalFees          = Σ fees
riderEstimate      = totalFees × 0.10          (10% of fees, industry standard)
productionEstimate = Σ per-artist production uplift:
    international → £5,000  |  headliner → £3,000  |  midTier → £1,500
    emerging → £800          |  local → £500
prsLicenceCost     = revenueAfterDeductions × 0.03
grandTotal         = totalFees + riderEstimate + productionEstimate + prsLicenceCost
percentageOfRevenue = grandTotal / revenueAfterDeductions × 100
overBudgetWarning   = grandTotal > revenueAfterDeductions × 0.45
```

**Tier fee ranges (midpoint used as default)**:

| Tier | Min | Max | Default fee |
|---|---|---|---|
| Local / Unsigned | £500 | £2,000 | £1,250 |
| Emerging | £2,000 | £8,000 | £5,000 |
| Mid-tier | £8,000 | £40,000 | £24,000 |
| Headliner | £40,000 | £200,000 | £120,000 |
| International | £200,000 | £1,000,000 | £600,000 |

**Assumption**: Over-budget warning fires at >45% of ticket revenue (industry norm).

---

## 3. Staffing (`calculateStaffing`)

Staffing is calculated in two stages: first the number of staff needed concurrently (per shift), then scaled to total individuals required across all shifts.

```
shifts            = ceil(durationHours / 8)     (each person works one 8h shift)

per-shift counts (Purple Guide / SIA ratios):
    securityPerShift = ceil(attendance / 125)   (SIA: 1 per 125, licensing requirement)
    stewardPerShift  = ceil(attendance / 250)
    welfarePerShift  = ceil(attendance / 500)
    barPerShift      = ceil(attendance / 83)

total individuals = perShiftCount × shifts
```

If a user sets a manual override for any role, the override is treated as the total individuals required (not per shift) and is used as-is.

**Medical team** scales by attendance (per shift), then multiplied by shifts:

| Attendance | First aiders | Paramedics | Doctors |
|---|---|---|---|
| < 500 | 2 | 0 | 0 |
| < 2,000 | 4 | 1 | 0 |
| < 5,000 | 6 | 2 | 1 |
| < 10,000 | ceil(att / 500) | ceil(att / 2,000) | 1 |
| ≥ 10,000 | ceil(att / 300) | ceil(att / 1,500) | ceil(att / 5,000) |

**Stage crew**: 3 per stage (excluded from cost — no day rate).

**Staff cost** = total individuals × day rate (each person is paid for one shift):

| Role | Day rate |
|---|---|
| SIA Security | £180 |
| Steward | £95 |
| First aider | £150 |
| Paramedic | £200 |
| Doctor | £450 |
| Welfare | £90 |
| Bar staff | £85 |

**Assumption**: A 16-hour festival requires double the total staff of an 8-hour festival. Staff do not work back-to-back shifts.

---

## 4. Toilets (`calculateToilets`)

Based on the [Purple Guide](https://www.thepurpleguide.co.uk/) (UK industry standard for outdoor events).

```
female = attendance × genderSplitFemalePct
male   = attendance − female

ratios used:
    event ≤ 6h             : 1 female WC per 100 · 1 male WC per 500 · 1 urinal per 150
    event > 6h, no alcohol : 1 female WC per 85  · 1 male WC per 425 · 1 urinal per 125
    event > 6h, alcohol    : 1 female WC per 75  · 1 male WC per 400 · 1 urinal per 100

femaleWCs          = ceil(ceil(female / femaleRatio) × 1.10)   ← 10% buffer
maleWCs            = ceil(ceil(male   / maleWCRatio) × 1.10)
maleUrinals        = ceil(ceil(male   / urinalRatio) × 1.10)

accessibleWCs      = max(1, ceil(standardTotal / 20))   (1 per 20 standard units)
handwashingStations = ceil(totalUnits / 5)
```

**Edge case**: zero attendance returns all zeros.

---

## 5. Crowd Density (`calculateCrowdDensity`)

```
density = attendance / usableAreaSqM

safetyStatus:
    density < 3.0  → safe
    density < 5.0  → warning
    density ≥ 5.0  → danger

headroomPct = max(0, (zoneMax − density) / zoneMax × 100)
```

**Zone max values** (Purple Guide / crowd safety guidelines):

| Zone | Target (p/m²) | Max (p/m²) |
|---|---|---|
| General arena | 1.5 | 2.0 |
| Front of stage | 3.0 | 4.0 |
| Chill-out | 0.4 | 0.5 |
| Walkway | 1.0 | 1.5 |
| Bar queue | 2.0 | 2.5 |

Default zone: general arena.

---

## 6. Energy Usage (`calculateEnergyUsage`)

```
kVA per stage type:
    Main stage → 325 kVA  |  Second → 125 kVA  |  Small → 75 kVA  |  Acoustic → 45 kVA

kVA per vendor:   15 kVA
kVA per bar unit: 20 kVA  (1 bar unit per 250 attendees when alcohol licensed)
Site lighting:    10 kVA
Production office: 12 kVA

totalKva            = Σ all above
generatorSizingKva  = totalKva / (0.8 power factor × 0.65 optimal load)
fuelLitresPerHour   = generatorSizingKva × 0.27
fuelCostEstimate    = fuelLitresPerHour × durationHours × £1.10/litre
co2KgEstimate       = fuelLitresPerHour × durationHours × 2.68 kg CO₂/litre
```

**Assumption**: diesel generators at £1.10/litre, 0.27 L/kVA/h fuel consumption. Generators sized so peak load sits at 65% of capacity. Grid connection is not modelled.

---

## 7. CAPEX (`calculateCAPEX`)

```
stagesCost = Σ (structure + PA + lighting) per stage type:
    Main:     £40,000 + £5,000 + £8,000 = £53,000
    Second:   £15,000 + £2,500 + £3,500 = £21,000
    Small:    £7,500  + £1,500 + £2,250 = £11,250
    Acoustic: £5,000  + £850   + £1,500 = £7,350

perimeterM       = 4 × sqrt(totalAreaSqM)   (assumes square site)
fencingCost      = perimeterM × £5/m

powerInfrastructure = generatorHire + tempRoadway + survey + management + signage + welfare tent + medical tent
    generator hire = ceil(generatorSizingKva / 250) × £1,500 per unit
    temp roadway   = ceil(sqrt(totalAreaSqM) / 100) × £3,000 per 100m
    site survey    = £2,000  |  management = £5,000  |  signage = £1,500
    welfare tent   = £2,000  |  medical tent = £3,000

totalCAPEX      = stagesCost + fencingCost + powerInfrastructure
costPerAttendee = totalCAPEX / attendance
```

---

## 8. OPEX (`calculateOPEX`)

```
staffCost     = staffing.estimatedStaffCost
energyCost    = energy.fuelCostEstimate
artistCost    = artistCosts.grandTotal
logisticsCost = attendance × £8          (toilets, water, waste vehicles)
wasteCost     = attendance × £3.50
insuranceCost = attendance × £1.00       (public liability, cancellation)
marketingCost = grossTicketRevenue × 0.12
licenceCost   = premisesLicence(£1,500) + PPL(£500) + artistPRS (included in artist costs)
totalOPEX     = sum of all above
```

---

## 9. Catering Revenue (`calculateCateringRevenue`)

```
pitchFeeRevenue = Σ vendor pitch fees
    food & drink: small=£500, medium=£1,000, large=£2,000   (per vendor, default medium)

internalBarRevenue = attendanceSpend × BAR_GROSS_MARGIN
    attendanceSpend  = attendance × £45/12h × (durationHours / 12)
    BYOB multiplier  : if attendees bring own alcohol → spend × 0.35 (65% revenue drop)
    BAR_GROSS_MARGIN = 0.65

totalCateringRevenue = pitchFeeRevenue + internalBarRevenue
spendPerAttendee     = totalCateringRevenue / attendance
```

**Assumption**: BYOF (bring your own food) does not affect bar revenue; BYOB reduces bar spend by 65% as the majority of alcohol consumption is self-supplied.

---

## 10. Sponsorship Revenue (`calculateSponsorshipRevenue`)

The highest tier across all sponsors in the config is used. Sponsorship deals are not additive — one headline deal drives the rate.

| Tier | Rate per head |
|---|---|
| None | £0 |
| Bronze | £1.50 |
| Silver | £3.00 |
| Gold | £6.00 |
| Platinum | £12.00 |

```
estimatedRevenue = attendance × ratePerHead
```

**Assumption**: Rates are based on typical UK festival brand partnership benchmarks. Platinum tier represents a major naming-rights or headline sponsor.

---

## 11. P&L (`calculatePnL`)

```
totalRevenue = ticketRevenue.revenueAfterDeductions
             + ticketRevenue.bookingFeeRevenue
             + catering.totalCateringRevenue
             + sponsorship.estimatedRevenue
             + parkingRevenue

totalCosts   = opex.totalOPEX + capex.totalCAPEX
grossProfit  = totalRevenue − totalCosts
marginPct    = grossProfit / totalRevenue × 100
isViable     = marginPct ≥ 10%

revenuePerHead      = totalRevenue / attendance
breakEvenAttendance = ceil(totalCosts / revenuePerHead)
```

**Edge cases**: if `totalRevenue = 0`, margin and break-even both return 0. If `attendance = 0`, per-head figures return 0.

---

## 12. Weather Risk (`calculateWeatherRisk`)

UK heavy rain probability by month (>10 mm event, materially impacts outdoor attendance):

| Month | Probability |
|---|---|
| January / December | 42% |
| February / November | 38% |
| March / October | 33% |
| April | 27% |
| May | 22% |
| June / August | 20% |
| July | 18% (driest) |
| September | 25% |

```
level:
    probability ≥ 35% → high
    probability ≥ 22% → medium
    else              → low

attendanceImpactPct : low=5%  medium=15%  high=25%
attendanceUnderRain  = attendance × (1 − attendanceImpactPct)
revenueImpact        = revenuePerHead × (attendance − attendanceUnderRain)
medicalCostImpact    = attendance × upliftPerHead (low=£0.75, medium=£2, high=£4)

marginUnderRain = (totalRevenue − revenueImpact − totalCosts − medicalCostImpact)
                / (totalRevenue − revenueImpact) × 100
```

**Edge case**: if `dateISO` is empty or invalid, defaults to June (probability 20%).

---

## 13. Efficiency Score (`calculateEfficiencyScore`)

Weighted composite of four sub-scores (each 0–100):

| Sub-score | Weight | Criteria |
|---|---|---|
| Financial | 40% | margin ≥ 20% → 100; ≥ 10% → 60; ≥ 0% → 30; negative → 0 |
| Crowd safety | 25% | safe → 100; warning → 50; danger → 0 |
| Facilities | 20% | food + toilets provided → 100; one missing → 50; neither → 0 |
| Energy | 15% | 0 warnings → 100; 1–2 → 70; > 2 → 30 |

```
overallScore = round(financial×0.40 + crowd×0.25 + facility×0.20 + energy×0.15)
```

---

## 14. Site Capacity (`calculateSiteCapacity`)

```
chillZoneTotal = Σ chillZone.areaSqM
parkingArea    = parkingSpaces × 12.5 m²/space  (if enabled)

usableAreaSqM  = totalAreaSqM − stageAreaSqM − vendorAreaSqM − chillZoneTotal − parkingArea
maxAttendance  = floor(usableAreaSqM × 2.0)     (Purple Guide comfortable limit: 2.0 p/m²)

overAllocatedWarning = usableAreaSqM ≤ 0
```

---

## General Assumptions & Limitations

- All monetary values are in GBP (£).
- Calculations use UK-specific standards (Purple Guide, SIA licensing ratios, UK rain probability by month).
- Ticket revenue is calculated against allocated tickets, not a dynamic sell-through model. Allocated tickets are assumed to sell out.
- No tax (corporation tax, income tax) is deducted from net profit.
- Energy modelling assumes diesel generators only; grid connection is not modelled.
- Staffing costs assume one 8-hour shift per individual. Staff do not work consecutive shifts.
- Passwords are stored as plaintext in localStorage. This is intentional for a local-only demo tool; do not use real passwords.

---

## Added Features & Inputs

### Features added beyond the brief

| Feature | Description |
|---|---|
| Forecast bar | Persistent bottom bar showing live metrics (allocated attendance, net P&L, margin, efficiency score, viability) on every wizard step |
| Compare tab | Load any saved festival alongside the current config; side-by-side metric table with green highlights for the better value |


### Inputs added beyond the brief

| Input | Rationale |
|---|---|
| Ticket tiers | Multiple tiers (GA, early bird, on the door) each with independent price and allocation, enabling realistic mixed-revenue ticketing models |
| Vendor tiers | Food & drink vendors of different sizes each contributing different pitch fee revenue |
| Sponsorship deals | Bronze–Platinum tiers driving per-head brand revenue, reflecting real festival commercial partnerships |
| BYOF / BYOB toggles | Materially affects catering revenue: BYOB reduces bar spend by 65% |
| Gender split | Required for accurate Purple Guide toilet provision ratios |
| Artist fee override | Allows precise modelling of known or negotiated deals rather than tier midpoints |
| Staff count overrides | Allows testing above/below recommended ratios for each role independently |

