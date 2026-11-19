# HIMNETRA — Full Repository Context Snapshot

> **Purpose of this file:** Hand this document to any AI agent (or human developer) who needs a complete snapshot of the HIMNETRA codebase — what it is, how it is structured, every file's role, every API endpoint, all data schemas, and how the pieces connect. Reading this file alone should give full context without opening any other file.

---

## 1. Project Overview

**HIMNETRA** (HIM = Himalayan, NETRA = eye/vision) is an **AI-powered Glacial Lake Outburst Flood (GLOF) early-warning and monitoring platform** focused on **Himachal Pradesh, India**.

### What it does
- Includes a Google Colab workflow for **Sentinel-1 SAR + Sentinel-2 MSI + SRTM DEM + ERA5-Land** processing; the running API serves prepared output files, not a live feed.
- The notebook contains **U-Net (ResNet34)** training/inference code; prepared metrics report IoU ≈ 87%, but notebook execution outputs are not saved in this checkout.
- Computes relative GLOF risk scores with a normalized, six-factor weighted formula; the current pipeline does not use Random Forest.
- Presents results via a **React + Leaflet WebGIS dashboard** (dark-themed, cyan accent) with interactive maps, charts, alerts, prepared flood-routing outputs, and PDF report generation.
- Can send **email (SMTP) and SMS (Twilio)** alerts to downstream subscribers.
- Runs a **FastAPI** backend that serves ML pipeline outputs from `backend/data/` and flood-routing outputs from `backend/` to the React frontend.

### Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind CSS 4, React Router 7 |
| Maps | Leaflet 1.9 + react-leaflet 5 |
| Charts | Recharts 3 |
| Icons | Lucide-React |
| Backend | Python 3.10+, FastAPI, Uvicorn |
| PDF Reports | ReportLab |
| Alert Delivery | SMTP (email), Twilio REST (SMS) |
| ML/Training | Google Colab notebook (Jupyter .ipynb) |
| Build/Lint | Vite, oxlint, TypeScript |

---

## 2. Repository Directory Structure

```
project -major/
│
├── src/                        # ROOT-LEVEL Vite app source (primary build target)
│   ├── App.tsx                 # Router root — 10 routes
│   ├── main.tsx                # React DOM entry point
│   ├── index.css               # Global CSS variables (dark theme, cyan palette)
│   ├── App.css                 # Additional app-level styles
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx   # Shell: Sidebar + Header + Outlet + Toast system
│   │   │   ├── Header.tsx      # Top bar with notifications bell
│   │   │   └── Sidebar.tsx     # Collapsible nav sidebar with system-status dot
│   │   ├── maps/
│   │   │   ├── GlofMap.tsx     # Leaflet map — markers, lake/flood polygons, 3 tile layers
│   │   │   └── LakeOutlineMap.tsx  # Simplified outline-only map
│   │   └── ui/
│   │       ├── index.tsx       # DemoBanner, Skeleton, Toast, StatusDot re-exports
│   │       └── RiskBadge.tsx   # Coloured pill badge for risk levels
│   ├── pages/
│   │   ├── Landing.tsx         # Public marketing / product page (route: /)
│   │   ├── Dashboard.tsx       # Overview KPIs + charts + lake table; refreshes API data every minute and shows output file timestamps
│   │   ├── LakeMonitoring.tsx  # Filterable lake list + map (route: /lakes)
│   │   ├── LakeAnalysis.tsx    # Per-lake detail: history chart, segmentation, risk (route: /lakes/:id)
│   │   ├── RiskIntelligence.tsx# AI risk assessment radar chart + factor breakdown (route: /risk)
│   │   ├── FloodSimulation.tsx # Scenario selector + simulation results (route: /flood)
│   │   ├── SatelliteData.tsx   # Data sources panel + processing pipeline view (route: /satellite)
│   │   ├── Alerts.tsx          # Alert feed, subscriptions, manual geofenced delivery (route: /alerts)
│   │   ├── Reports.tsx         # PDF report generator + download list (route: /reports)
│   │   └── Settings.tsx        # Browser-local display preferences and runtime status (route: /settings)
│   ├── services/
│   │   ├── api.ts              # Backend-only service layer; no mock fallback
│   │   ├── preferences.ts      # Browser-local map and display preferences
│   ├── types/
│   │   └── index.ts            # All TypeScript interfaces (Lake, Alert, FloodSimulation, etc.)
│   └── utils/
│       └── index.ts            # cn(), getRiskColor(), formatDate(), timeAgo(), formatArea()
│
├── frontend/                   # Duplicate/merged frontend source tree (same structure as src/)
│   └── src/                    # (The root src/ is the actual build source; this is kept for reference)
│
├── backend/                    # Python FastAPI backend
│   ├── main.py                 # FastAPI app — all endpoints defined here
│   ├── flood.py                # GLOF scenario simulation + flood-routing output integration
│   ├── notify.py               # Email (SMTP) + SMS (Twilio) alert delivery
│   ├── reports.py              # PDF generation with ReportLab
│   ├── requirements.txt        # fastapi, uvicorn[standard], reportlab, httpx
│   ├── flood_results.json      # Per-lake/per-scenario flood impact metrics
│   ├── flood_polygons.geojson  # Per-lake/per-scenario flood footprint GeoJSON
│   └── data/                   # ML pipeline outputs (read by API; write-able by reports)
│       ├── lakes.json          # Array of lake objects (ground truth / ML enriched)
│       ├── risk.json           # Risk assessment per lake (factors + scores)
│       ├── timeseries.json     # Area time series per lake per year
│       ├── segmentation.json   # U-Net segmentation IoU/Dice results per lake
│       ├── metrics.json        # Model validation results (U-Net vs DeepLabv3+)
│       ├── polygons.geojson    # GeoJSON lake boundary polygons
│       ├── backtest.json       # South Lhonak backtest yearly areas (validation only)
│       └── reports/            # Generated PDF reports (auto-created)
│
├── model_training/
│   └── Himnetra_Part1_Pipeline.ipynb   # Google Colab notebook: data ingestion → U-Net training → risk scoring
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── dist/                       # Vite production build output (do not edit)
│
├── index.html                  # Vite HTML entry point
├── vite.config.ts              # Vite config: react() + tailwindcss() plugins
├── package.json                # npm scripts + all JS dependencies
├── tsconfig.json               # TypeScript project references
├── tsconfig.app.json           # App TS config
├── tsconfig.node.json          # Node TS config (vite.config.ts)
├── .env.example                # VITE_API_URL=http://localhost:8000
├── .oxlintrc.json              # Linter config
├── .gitignore
├── README.md                   # Setup instructions
└── Himnetra synopsis.docx      # Project synopsis document (Word)
```

---

## 3. Frontend Architecture

### 3.1 Routing (`src/App.tsx`)

```
/               → Landing (public, no shell)
/dashboard      → Dashboard          (AppLayout shell)
/lakes          → LakeMonitoring     (AppLayout shell)
/lakes/:id      → LakeAnalysis       (AppLayout shell)
/risk           → RiskIntelligence   (AppLayout shell)
/flood          → FloodSimulation    (AppLayout shell)
/alerts         → Alerts             (AppLayout shell)
/satellite      → SatelliteData      (AppLayout shell)
/reports        → Reports            (AppLayout shell)
/settings       → Settings           (AppLayout shell)
*               → redirect /dashboard
```

### 3.2 Shell Layout (`AppLayout.tsx`)
- **Sidebar** (collapsible, 60px ↔ 230px): nav items, logo, system status dot
- **Header**: HIMNETRA title bar, notifications bell dropdown
- **Outlet**: page content area (overflow-y scroll)
- **Toast**: global toast system exposed via `window.__himnetraToast` / `showToast()` helper
- Fetches notifications on mount from `/notifications`

### 3.3 Key Pages Summary

| Page | Key Features |
|---|---|
| **Landing** | Hero, 5-step methodology walkthrough, 6 feature cards, tech stack grid, animated SVG mini-map |
| **Dashboard** | 5 KPI cards, Leaflet map, PieChart (risk distribution), BarChart (lake expansion by year), top-5 risk lake table |
| **LakeMonitoring** | Search + filter (district / basin / risk level), sortable table, side Leaflet map, `useSearchParams` for pre-filtering |
| **LakeAnalysis** | Per-lake detail: Recharts area history chart, segmentation metrics card, risk factor table, GeoJSON polygon map |
| **RiskIntelligence** | Lake picker, RadarChart of risk factors, factor contribution table, model metadata |
| **FloodSimulation** | Lake + scenario (MINOR/MODERATE/MAJOR/EXTREME), POST `/analysis/run` for an existing prepared routing output, and scenario-specific flood polygon layer |
| **SatelliteData** | Source metadata, reference workflow, and prepared observation table (not live acquisition) |
| **Alerts** | Alert feed, filters, acknowledge, contact registration, and manually confirmed geofenced notification |
| **Reports** | 4 report type cards, generate (POST `/reports`), download (GET `/reports/{id}/download`) |

### 3.4 API Service Layer (`src/services/api.ts`)

**Backend configuration:** `VITE_API_URL` configures the backend URL. No mock-data fallback is used.
```ts
export const IS_LIVE = Boolean(API_BASE_URL);
```

All functions:
```ts
fetchLakes()                              → Lake[]
fetchLake(id)                             → Lake | null
fetchLakeHistory(id)                      → LakeHistoryPoint[]
fetchRiskAssessment(id)                   → RiskAssessment
fetchSegmentation(id)                     → SegmentationResult
fetchFloodSimulations()                   → FloodSimulation[]
fetchFloodSimulation(lakeId)              → FloodSimulation | null
runFloodSimulation(lakeId, {scenario})  → FloodSimulation
fetchFloodPolygon(lakeId, scenario)        → FloodPolygonCollection
fetchAlerts()                             → Alert[]
acknowledgeAlert(id)                      → void
registerSubscriber(contact)                → stored contact, live backend only
notifyNearbySubscribers(lakeId, radiusKm)  → delivery results, manually confirmed
fetchSatelliteSources()                   → SatelliteSource[]
fetchObservations(lakeId?)                → SatelliteObservation[]
fetchReports()                            → Report[]
generateReport(type, lakeId?)             → Report
fetchNotifications()                      → Notification[]
fetchSystemStatus()                       → SystemService[]
fetchDashboardStats()                     → DashboardStats
fetchDashboardCharts()                    → DashboardCharts
fetchPolygons()                           → LakePolygonCollection
fetchLakePolygons(id)                     → LakePolygonCollection
reportDownloadUrl(id)                     → string   (direct URL)
```

### 3.5 Data Source Behavior

The frontend has no mock dataset or successful fallback. It requires `VITE_API_URL` and reads the backend's prepared JSON outputs. The dashboard re-fetches those outputs every minute while visible and on tab focus, but this does not ingest new satellite or sensor data. If the API URL or an output is unavailable, the UI shows an error or an empty/unavailable state instead of fabricated measurements. Satellite acquisition records are returned only from `backend/data/observations.json`; no such records are currently included.

### 3.6 TypeScript Types (`src/types/index.ts`)

```ts
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

interface Lake {
  id: string;             // e.g. "GL-HP-001"
  name: string;           // e.g. "Gepang Gath"
  district: string;       // "Lahaul & Spiti" | "Kullu" | "Chamba" | "Kinnaur"
  basin: string;          // "Chenab" | "Beas" | "Ravi" | "Sutlej" | "Baspa" | "Chandra"
  region: string;
  coordinates: LatLng;    // { lat, lng }
  elevation: number;      // metres
  currentArea: number;    // km²
  previousArea: number;   // km²
  areaChange: number;     // km² absolute
  areaChangePct: number;  // %
  growthRate: number;     // % per year
  riskLevel: RiskLevel;
  riskScore: number;      // 0–100
  lastUpdated: string;    // ISO date
  satelliteSource: string;
  priority?: boolean;
  growthReliable?: boolean;
}

interface LakeHistoryPoint { date: string; area: number; ndwi?: number; }

interface RiskFactor { name: string; contribution: number; description: string; }

interface RiskAssessment {
  lakeId: string; riskScore: number; riskLevel: RiskLevel;
  confidence: number; factors: RiskFactor[];
  explanation: string; assessedAt: string; modelVersion: string;
}

interface FloodSimulation {
  id: string; lakeId: string; lakeName: string;
  scenario: 'MINOR' | 'MODERATE' | 'MAJOR' | 'EXTREME';
  estimatedRelease: number;  // million m³, prepared routing output
  peakDischarge: number;     // m³/s, prepared routing output
  floodExtent: number | null; // km²
  timeToImpact: number | null;        // minutes
  affectedSettlements: number | null;
  affectedRoads: number | null;       // km
  riskZone: RiskLevel;
  status: 'PENDING' | 'RUNNING' | 'COMPLETE';
  timestamp: string;
}

interface FloodPolygonCollection {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    geometry: { type: string; coordinates: unknown };
    properties: { lakeId: string; scenario: FloodSimulation['scenario']; extent_km2: number };
  }[];
}

interface Alert {
  id: string;
  type: 'GLOF_RISK' | 'RAPID_EXPANSION' | 'ANOMALY' | 'SIMULATION' | 'DATA_UPDATE';
  title: string; lakeId?: string; lakeName?: string;
  riskLevel: RiskLevel;
  status: 'ACTIVE' | 'MONITORING' | 'RESOLVED' | 'ACKNOWLEDGED';
  detectedAt: string; updatedAt: string;
  description: string; acknowledged: boolean;
}

interface SatelliteSource {
  id: string; name: string; shortName: string;
  type: 'OPTICAL' | 'SAR' | 'DEM' | 'METEO';
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'DEGRADED';
  lastAcquisition: string; resolution: string;
  coverage: string; processingStatus: 'IDLE' | 'PROCESSING' | 'QUEUED';
  revisitTime: string;
}

interface SatelliteObservation {
  id: string; lakeId: string;
  source: 'Sentinel-2' | 'Sentinel-1' | 'Landsat-8' | 'DEM';
  acquisitionDate: string; resolution: string;
  cloudCover?: number;
  processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'FAILED';
  bands?: string[];
}

interface SegmentationResult {
  lakeId: string; model: string;
  iou: number; diceScore: number; confidence: number;
  timestamp: string; split?: string;
}

interface Report {
  id: string; title: string;
  type: 'RISK_ASSESSMENT' | 'LAKE_CHANGE' | 'FLOOD_SIMULATION' | 'MONTHLY';
  lakeId?: string; lakeName?: string;
  generatedAt: string; status: 'READY' | 'GENERATING' | 'FAILED';
  fileSize?: string;
}

interface Notification {
  id: string; title: string; message: string;
  type: 'ALERT' | 'DATA' | 'REPORT' | 'SYSTEM';
  read: boolean; timestamp: string; lakeId?: string;
}

interface SystemService {
  name: string; status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN'; lastChecked: string;
}

interface LakePolygonCollection {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    geometry: { type: string; coordinates: unknown };
    properties: { lakeId: string; which: 'first_year' | 'latest_year'; year: number; area_km2: number };
  }[];
}

interface DashboardCharts {
  riskDistribution: { name: string; value: number; color: string }[];
  expansionByYear: { month: string; critical: number; high: number; medium: number }[];
}
```

### 3.7 Map Component (`GlofMap.tsx`)

- Uses raw `Leaflet` (not react-leaflet hooks) for full imperative control.
- Three switchable tile layers: **Terrain** (OpenTopoMap), **Satellite** (ESRI), **Street** (OSM).
- Renders lake positions as coloured `CircleMarker`s (colour = risk level).
- Fetches GeoJSON polygon outlines from `/polygons` (live mode) and renders them as `L.GeoJSON`.
- Props: `lakes`, `selectedLakeId`, `onLakeClick`, `height`, `showLayers`, `simulationLakeId`.

### 3.8 Utilities (`src/utils/index.ts`)

```ts
cn(...classes)                 // clsx + tailwind-merge
getRiskColor(level)            // → hex: LOW=#22c55e, MEDIUM=#f59e0b, HIGH=#f97316, CRITICAL=#ef4444
getRiskBg(level)               // → rgba background variants
formatDate(iso)                // en-IN locale date string
formatDateTime(iso)            // en-IN locale date+time string
timeAgo(iso)                   // "5m ago" / "2h ago" / "3d ago"
formatArea(km2)                // browser preference: km² or ha
formatElev(m)                  // browser preference: m or ft
```

---

## 4. Backend Architecture (`backend/`)

### 4.1 `main.py` — FastAPI Application

**Start command:**
```powershell
uvicorn main:app --app-dir backend --reload --port 8000
```

**Data directory:** `backend/data/` (override with `HIMNETRA_DATA` env var).

**Caching:** Files are re-read automatically when their `mtime` changes (thread-safe, dict-based `_cache`).
The flood polygon endpoint reads `backend/flood_polygons.geojson`. Flood metrics are read from `HIMNETRA_DATA/flood_results.json` when present, otherwise from `backend/flood_results.json`.

#### All REST Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check → `{ok, lakes count, time}` |
| GET | `/lakes` | All lakes array |
| GET | `/lakes/{lid}` | Single lake by id |
| GET | `/lakes/{lid}/history` | Area time-series `[{date, area}]` |
| GET | `/lakes/{lid}/risk` | Risk assessment object |
| GET | `/lakes/{lid}/segmentation` | U-Net segmentation result |
| GET | `/lakes/{lid}/polygon` | GeoJSON polygon for one lake |
| GET | `/lakes/{lid}/flood-map` | Last simulation for the lake, or a default MAJOR scenario |
| GET | `/lakes/{lid}/flood-polygon?scenario=MAJOR` | Flood footprint GeoJSON filtered by lake and scenario |
| GET | `/polygons` | All lake polygons GeoJSON |
| GET | `/backtest` | South Lhonak yearly validation data |
| POST | `/analysis/run` | Run flood simulation → `FloodSimulation` |
| GET | `/simulations` | Default MAJOR simulations for priority lakes |
| POST | `/alerts/{aid}/acknowledge` | Acknowledge an alert |
| POST | `/subscribers` | Register a contact and coordinates for community alerts |
| GET | `/subscribers` | List subscribers (phone masked; prototype endpoint, not authenticated) |
| POST | `/alerts/notify/{lid}` | Manually notify subscribers within a radius |
| GET | `/alerts` | All alerts (derived from lakes + risk data) |
| GET | `/satellite/sources` | 4 satellite data sources |
| GET | `/satellite/observations` | Exported acquisition records from `observations.json` (empty if absent) |
| GET | `/reports` | List of generated PDF reports |
| POST | `/reports` | Generate a new PDF report |
| GET | `/reports/{rid}/download` | Download PDF file |
| GET | `/notifications` | Last 6 notifications from alerts |
| GET | `/system/status` | 6-service health status list |
| GET | `/dashboard/stats` | KPI summary object |
| GET | `/dashboard/charts` | Risk distribution + area-expansion chart |
| GET | `/data/status` | Available prepared-output files and their backend modification timestamps (not acquisition times) |

**Alert generation logic (inline in `main.py`):** Uses prepared risk/time-series data. It creates alerts for HIGH/CRITICAL risk, reliable area growth above 25% for lakes at least 0.1 km², and a latest area more than 25% above the earlier-series mean. Acknowledgements and subscriber records are stored in `state.json`. Community delivery is manual, not automatically triggered by alerts.

**State file** (`data/state.json`): tracks `acked` alert ids, `last_sim` results, `subscribers` list, `reports` list.

---

### 4.2 `flood.py` — Prepared Flood-Routing Outputs

`simulate(lake, scenario, data_dir)` reads the matching per-lake/per-scenario object from `flood_results.json`. It does not derive lake volume, release volume, peak discharge, or downstream impacts. Missing or incomplete routing output returns an explicit API error rather than a generated estimate. The returned values are prepared routing outputs, not trained ML predictions or a validated hydrodynamic forecast.

The frontend requests `GET /lakes/{lid}/flood-polygon?scenario={scenario}` and renders the matching FeatureCollection in `GlofMap.tsx` when the Flood Extent layer is enabled.
---

### 4.3 `notify.py` — Alert Delivery

- **Email:** SMTP/SSL. Env vars: `SMTP_HOST`, `SMTP_PORT` (default 465), `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`
- **SMS:** Twilio REST API. Env vars: `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_FROM`
- **Dry-run:** returns `"dry-run (SMTP not configured)"` / `"dry-run (Twilio not configured)"` when env vars missing.
- **Geofencing:** `affected_subscribers(lake, subs, radius_km=30)` uses haversine formula to find subscribers within 30 km of a lake.
- Dashboard registration and manual dispatch are implemented. The API has no authentication and stores contacts in a local JSON file; use test contacts only and do not expose it publicly.

---

### 4.4 `reports.py` — PDF Generation (ReportLab)

Report types: `RISK_ASSESSMENT`, `LAKE_CHANGE`, `FLOOD_SIMULATION`, `MONTHLY`

PDF sections generated:
1. Title (HIMNETRA + report type + region + datetime)
2. Lake summary table (name, district, area, change %, risk level, score)
3. For single-lake reports: Risk factors table + explanation paragraph
4. Lake area time-series table (year by year)
5. For FLOOD_SIMULATION: Existing prepared release, discharge, and impact metrics when available
6. Methodology disclaimer footnote

---

## 5. Data Files (`backend/data/`)

### `lakes.json`
Array of real lake objects from ML pipeline. Sample fields:
```json
{
  "id": "GL-HP-001",
  "name": "Gepang Gath",
  "district": "Lahaul & Spiti",
  "basin": "Chenab",
  "region": "Lahaul & Spiti, Himachal Pradesh",
  "coordinates": { "lat": 32.542, "lng": 77.215 },
  "elevation": 4387,
  "currentArea": 1.72,
  "previousArea": 1.60,
  "areaChange": 0.12,
  "areaChangePct": 7.4,
  "growthRate": 4.8,
  "growthReliable": true,
  "riskLevel": "HIGH",
  "riskScore": 54,
  "lastUpdated": "2025-09-30",
  "satelliteSource": "Sentinel-1/2 (DL segmentation)",
  "priority": false
}
```
The current file contains 19 lakes (not the 67 vulnerable lakes described in the synopsis). Known lakes include GL-HP-001 (Gepang Gath), GL-HP-002 (Samudra Tapu), GL-HP-004 (Baspa-head lake), GL-HP-015 (Ravi lake), and GL-HP-021 (Chandra lake/NDMA437). The prepared observations are dated 2025-09-30.

### `risk.json`
Array of risk assessments. Risk factors per lake:
- `growth` — lake area growth rate (% per year, 2018-2025)
- `area` — current lake size contribution
- `dam_slope` — steepness of terrain / moraine rim
- `ice_nearby` — snow/ice cover share within 1 km
- `temp_anom` — summer temperature anomaly (ERA5-Land, vs 2018-2024)
- `precip_anom` — summer precipitation anomaly (ERA5-Land, vs 2018-2024)

Model version: `HIMNETRA-v1 / U-Net (ResNet34)`

### `metrics.json`
Validation results for two segmentation models:

| Model | IoU | Dice | Precision | Recall |
|---|---|---|---|---|
| **U-Net (ResNet34)** ← best | 87.1% | 93.1% | 95.3% | 91.0% |
| DeepLabv3+ (ResNet34) | 85.1% | 91.9% | 96.7% | 87.6% |

Input channels for both: `RGB + Sentinel-1 VV + DEM + slope`
Label strategy: `optical-index weak labels` (NDWI-based)
Validation lakes: GL-HP-005, GL-HP-012, GL-HP-016

### `timeseries.json`
Map of `lakeId → [{date, area, year}]`. Yearly (Sep 30) snapshots from 2018–2025 for each monitored lake.

### `backtest.json`
Yearly area records for South Lhonak lake (Sikkim), used only to validate event detection (outside Himachal, not in main monitoring set). Includes `area` and `area_weak_label` per year.

### `segmentation.json`
Per-lake U-Net segmentation results (IoU, Dice, confidence, timestamp).

### `polygons.geojson`
GeoJSON FeatureCollection. Each feature has `lakeId`, `which` (`first_year`/`latest_year`), `year`, `area_km2` in properties.

### Flood-routing outputs (`backend/`)

- `flood_results.json` maps each lake ID to `MINOR`, `MODERATE`, `MAJOR`, and `EXTREME` result objects. Objects include flood extent, time to impact, affected settlements/roads, release volume, peak discharge, and supporting routing metadata.
- `flood_polygons.geojson` is a FeatureCollection with one flood footprint feature per available lake/scenario pair. Properties contain `lakeId`, `scenario`, and `extent_km2`.
- The simulation endpoint returns only existing complete prepared metrics; it returns 404 if the lake/scenario has no usable routing result. The flood-polygon endpoint returns only the feature matching the requested lake and scenario.

---

## 6. ML Training Pipeline (`model_training/`)

**File:** `Himnetra_Part1_Pipeline.ipynb` (Google Colab notebook)

**Pipeline stages:**
1. **Data acquisition** — Notebook code downloads Sentinel-1 SAR, Sentinel-2 MSI, SRTM DEM, and ERA5-Land from Google Earth Engine; it requires Colab authentication and a configured project.
2. **Preprocessing** — Atmospheric correction, orthorectification, band co-registration.
3. **Weak label generation** — NDWI (Normalized Difference Water Index) thresholding on optical imagery to auto-label training patches.
4. **U-Net training** — ResNet34 encoder, 6-channel input (RGB + S1 VV + DEM + slope), trained on weak labels. The supplied metrics artifact reports IoU=87.1%.
5. **DeepLabv3+ training** — Alternative architecture, slightly lower IoU.
6. **Lake boundary extraction** — Inference on all Himachal Pradesh glacial lake candidates.
7. **Risk scoring** — normalized weighted score with features: growth rate, area, dam slope, ice proximity, temperature/precipitation anomalies. This is a relative ranking, not a trained Random Forest or calibrated probability.
8. **Output export** — Saves `lakes.json`, `risk.json`, `timeseries.json`, `segmentation.json`, `metrics.json`, `polygons.geojson` → copy to `backend/data/`.

The notebook still contains `YOUR_PROJECT_ID` and has no saved execution counts or outputs in this checkout. Its code and the prepared metrics file do not independently prove a successful training run here.

---

## 7. Environment & Configuration

### Frontend (`.env.example`)
```
VITE_API_URL=http://localhost:8000
```
The frontend has no mock/demo fallback. If `VITE_API_URL` is not set or the backend is unavailable, data-backed screens show an error or unavailable state.

### Backend (env vars, no .env file — set in shell)
```
HIMNETRA_DATA      # Path to data directory (default: backend/data/)
SMTP_HOST          # Email alerts
SMTP_PORT          # Default: 465
SMTP_USER
SMTP_PASS
MAIL_FROM
TWILIO_SID         # SMS alerts
TWILIO_TOKEN
TWILIO_FROM
```

---

## 8. Running the Project

### Frontend only (backend data unavailable)
```powershell
npm ci
Copy-Item .env.example .env
npm run dev
# → http://localhost:5173
# Data-backed screens require the backend API.
```

### Full stack (frontend + backend)

**Terminal 1 — Backend:**
```powershell
py -m venv backend\.venv
backend\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
python -m uvicorn main:app --app-dir backend --reload --port 8000
# → API: http://localhost:8000
# → Docs: http://localhost:8000/docs
# → Health: http://localhost:8000/health
```

**Terminal 2 — Frontend:**
```powershell
Copy-Item .env.example .env   # sets VITE_API_URL=http://localhost:8000
npm run dev
# → http://localhost:5173
```

### Production build
```powershell
npm run build    # tsc + vite build → dist/
npm run preview
```

---

## 9. Key Design Decisions & Notes

1. **Dual source of truth:** `src/` (root) is the actual Vite build source. `frontend/src/` appears to be a copy/merge artifact — the root `src/` takes precedence for `npm run dev/build`.

2. **Backend-only data:** `IS_LIVE` reflects whether `VITE_API_URL` is configured; API calls do not substitute mock measurements.

3. **Alert generation is server-side:** Alerts are not stored as a separate JSON file; they are computed on-the-fly in `main.py`'s `build_alerts()` function from `risk.json` + `timeseries.json`. Acknowledgements are persisted to `state.json`.

4. **Flood-routing outputs are separate from `backend/data/`:** `backend/flood_results.json` supplies prepared scenario metrics, and `backend/flood_polygons.geojson` supplies map footprints. A custom `HIMNETRA_DATA/flood_results.json` takes precedence. Missing or incomplete scenario metrics are unavailable; they are not estimated.

5. **GeoJSON polygons optional:** When `polygons.geojson` is populated by the Colab pipeline, the Leaflet map shows actual lake boundary outlines. Otherwise the map shows only point markers.

6. **Risk scores are relative rankings:** Not absolute probabilities. The score is a weighted sum of normalized feature contributions, ranked across the monitored lake set.

7. **Backtest lake (South Lhonak) is excluded from main monitoring:** It is in Sikkim, used only for validating the GLOF event detection capability of the model.

8. **Toast system uses a global window reference:** `AppLayout` registers `window.__himnetraToast`; child pages import and call `showToast(message, type)` from `AppLayout.tsx`.

9. **PDF reports are real files:** Generated on demand by `reports.py` using ReportLab, stored in `backend/data/reports/{rid}.pdf`, served as `FileResponse`.

10. **Segmentation model details:** The notebook defines a six-channel U-Net input: optical RGB (3 channels), Sentinel-1 VV, elevation (DEM), and slope. The stored metric artifact reports its result; training is not run by the FastAPI service.

---

## 10. Himnetra Synopsis (from `Himnetra synopsis.docx`)

> **Note:** The `.docx` file is binary; the following is derived from README, Landing page, and ML pipeline content which mirrors the synopsis.

**Problem Statement:**
Glacial Lake Outburst Floods (GLOFs) in the Himalayas pose a severe threat to downstream communities, infrastructure, and livelihoods. Traditional monitoring methods are insufficient in scale, frequency, and speed.

**Solution — HIMNETRA:**
An end-to-end AI-powered satellite monitoring platform that:
- Automates glacial lake detection using deep-learning (U-Net) on freely available Sentinel satellite data.
- Tracks multi-temporal lake area changes from 2018 to present.
- Scores GLOF risk using a six-feature normalized weighted ranking, not a Random Forest model.
- Displays prepared flood-routing scenario outputs (MINOR to EXTREME); missing values are not estimated. These outputs are not trained-model predictions or validated forecasts.
- Delivers early warnings via email/SMS to downstream stakeholders.
- Presents all intelligence through a WebGIS dashboard accessible to disaster management authorities.

**Geographic Focus:** Himachal Pradesh, India — covering Lahaul & Spiti, Kullu, Chamba, Kinnaur districts and the Chenab, Beas, Ravi, Sutlej, Baspa, Chandra river basins.

**Model Performance:**
- U-Net (ResNet34): **IoU = 87.1%, Dice = 93.1%** on validation lakes (GL-HP-005, 012, 016)
- Risk model: Relative weighted scoring across 6 geophysical features (growth, area, dam slope, ice proximity, temperature anomaly, precipitation anomaly)
- Backtest: South Lhonak 2023 GLOF event used to validate event-detection capability

**Monitored Lakes (current backend snapshot):** 19 lakes in Himachal Pradesh, with prepared records dated 2025-09-30.

**Technology:**
- Satellite data: Sentinel-1 (SAR, C-band, VV), Sentinel-2 (MSI, 10 m), SRTM DEM (30 m), ERA5-Land (temperature/precipitation, ~9 km, monthly)
- AI: U-Net (ResNet34) + DeepLabv3+ for segmentation; transparent weighted formula for relative risk scoring
- Platform: React + FastAPI + Leaflet + ReportLab

---

## 11. File-by-File Quick Reference

| File | Role |
|---|---|
| `src/App.tsx` | React Router setup, 10 routes |
| `src/main.tsx` | ReactDOM.createRoot entry point |
| `src/index.css` | CSS custom properties (dark theme) |
| `src/pages/Landing.tsx` | Public product/marketing page |
| `src/pages/Dashboard.tsx` | Main overview with KPIs, maps, charts |
| `src/pages/LakeMonitoring.tsx` | Searchable/filterable lake list |
| `src/pages/LakeAnalysis.tsx` | Deep-dive per lake |
| `src/pages/RiskIntelligence.tsx` | AI risk breakdown with RadarChart |
| `src/pages/FloodSimulation.tsx` | Scenario runner |
| `src/pages/SatelliteData.tsx` | Source metadata, reference workflow, and prepared observation table |
| `src/pages/Alerts.tsx` | Alert feed, subscription, and manual geofenced notification UI |
| `src/pages/Reports.tsx` | PDF report generator |
| `src/pages/Settings.tsx` | Browser-local display preferences and runtime status |
| `src/components/layout/AppLayout.tsx` | App shell (Sidebar + Header + Toast) |
| `src/components/layout/Sidebar.tsx` | Nav sidebar (collapsible) |
| `src/components/layout/Header.tsx` | Top bar + notifications |
| `src/components/maps/GlofMap.tsx` | Leaflet map with risk markers, lake boundaries, and scenario flood polygons |
| `src/components/maps/LakeOutlineMap.tsx` | Simplified polygon-only map |
| `src/components/ui/index.tsx` | DemoBanner, Skeleton, Toast, StatusDot |
| `src/components/ui/RiskBadge.tsx` | Coloured risk pill badge |
| `src/services/api.ts` | Unified API service layer |
| `src/services/preferences.ts` | Browser-local display preferences |
| `src/types/index.ts` | All TypeScript interfaces |
| `src/utils/index.ts` | Shared utility functions |
| `backend/main.py` | FastAPI app + all endpoints |
| `backend/flood.py` | Prepared per-scenario routing output integration |
| `backend/flood_results.json` | Per-lake/per-scenario impact and routing metrics |
| `backend/flood_polygons.geojson` | Per-lake/per-scenario flood footprint GeoJSON |
| `backend/notify.py` | Email + SMS alert delivery |
| `backend/reports.py` | PDF generation with ReportLab |
| `backend/requirements.txt` | Python dependencies |
| `backend/tests/test_subscribers.py` | Subscriber validation and manual delivery tests |
| `backend/data/lakes.json` | Ground-truth lake objects |
| `backend/data/risk.json` | Per-lake risk assessments |
| `backend/data/timeseries.json` | Yearly area time series |
| `backend/data/segmentation.json` | Segmentation results per lake |
| `backend/data/metrics.json` | Model validation metrics |
| `backend/data/polygons.geojson` | Lake boundary polygons |
| `backend/data/backtest.json` | South Lhonak validation data |
| `model_training/Himnetra_Part1_Pipeline.ipynb` | Colab ML pipeline notebook |
| `vite.config.ts` | Vite + React + Tailwind plugins |
| `package.json` | npm scripts + all JS deps |
| `.env.example` | `VITE_API_URL=http://localhost:8000` |
| `README.md` | Setup / run instructions |

---

*Generated by Antigravity on 2026-11-15; updated on 2026-11-17 to reflect the weighted risk formula and community-alert controls.*
