# Festival Sim

A browser-based festival planning and simulation tool. Design a music festival, simulate its financial and operational performance, and export the results.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Tests | Vitest |
| Storage | Browser localStorage (no backend) |

## Running Locally

The app runs entirely in the browser. There is no backend, no database, and no internet connection required — once the dev server is started, the app works fully offline. All data (accounts, saved festivals) is stored in your browser's localStorage.

**Prerequisites**: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).


## Running Tests

```bash
npm test
```

Tests live in `src/calculations/__tests__/` and cover calculation modules: `calculatePnL`, `calculateToilets`, and `calculateCrowdDensity`.


## Features

### Wizard (6 steps + Compare tab)

| Step | What you configure |
|---|---|
| Basic Info | Festival name, date, location, duration, expected attendance, gender split |
| Site & Stages | Total site area, stage types (main / second / acoustic / small), vendor area, chill zones, parking |
| Lineup | Artists with tier (local → international), optional fee override, stage assignment |
| Ticketing | Ticket tiers (GA / early bird / on the door etc.) with price and allocation, sponsorship deals |
| Operations | Food & drink vendors with size tier, staff count overrides, BYOF / BYOB toggles |
| Overview | Full simulation results with Export CSV / Export JSON buttons |
| Compare | Load any saved festival and compare key metrics side by side |

### Simulation Engine

14 independent calculation modules run on every config change:

- **Financial**: ticket revenue (VAT, PRS, booking fee), catering & bar, sponsorship, parking, CAPEX, OPEX, P&L
- **Safety**: crowd density (Purple Guide), toilet provision (Purple Guide ratios by gender, duration, and alcohol)
- **Operations**: staffing (SIA ratios, medical, welfare, bar — scaled to shift count), energy (kVA, diesel cost, CO₂)
- **Risk**: weather risk (UK rain probability by month), weather-adjusted margin
- **Score**: weighted efficiency score (financial 40%, crowd safety 25%, facilities 20%, energy 15%)

### Forecast Bar

A persistent bar at the bottom of every page shows a live snapshot of key metrics as you build: allocated attendance vs site capacity, net P&L, margin, efficiency score, and viability status. It updates instantly on every change.

### Accounts & Persistence

- Register / sign in with email and password (localStorage only — no server)
- Save and load festival configurations per account
- Saving with a different name creates a new independent save file, preserving the original
- All data is private to your browser

### Compare Tab

Load any saved festival alongside the current one and compare key metrics side by side in a table. Green highlights the better value for each metric.

### Additional Revenue Streams

Beyond basic ticket sales, the simulation models:

- **Ticket tiers** — multiple tiers (GA, early bird, VIP, etc.) each with their own price and allocation
- **Vendor income** — pitch fees from food & drink vendors, sized small / medium / large
- **Bar revenue** — internal bar modelled against attendance, duration, and BYOB status
- **Sponsorship deals** — bronze through platinum tiers, each driving a per-head revenue rate
- **Parking** — optional car park with configurable spaces and permit price

### Export

From the Overview tab, export the current forecast as:
- **CSV** — flat key/value file, opens in Excel or Google Sheets
- **JSON** — full config + all metrics, suitable for programmatic use

## Project Structure

```
src/
├── auth/               AuthContext (register, login, logout, localStorage session)
├── calculations/       14 pure calculation functions + runSimulation orchestrator
│   └── __tests__/      Vitest unit tests
├── components/
│   ├── auth/           LoginPage
│   ├── layout/         ForecastBar (live metrics strip)
│   ├── ui/             Button, Toggle, FormField, StatusDot, etc.
│   └── wizard/         WizardLayout, WizardSidebar, all step components
├── export/             exportToJSON, exportToCSV
├── hooks/              useWizardState, useSimulation
├── storage/            Per-user config persistence (localStorage)
└── types.ts            Shared TypeScript interfaces
```
