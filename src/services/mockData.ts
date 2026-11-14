// ============================================================
// HIMNETRA – Mock Data Layer
// All data here is DEMO / PROTOTYPE data.
// Replace with real API responses once backend is connected.
// ============================================================

import type {
  Lake,
  LakeHistoryPoint,
  RiskAssessment,
  FloodSimulation,
  Alert,
  SatelliteSource,
  SatelliteObservation,
  SegmentationResult,
  Report,
  Notification,
  SystemService,
} from '../types';

// ─────────────────────────────────────────────
// LAKES
// ─────────────────────────────────────────────
export const MOCK_LAKES: Lake[] = [
  {
    id: 'GL-HP-001',
    name: 'Gepang Gath',
    district: 'Lahaul & Spiti',
    basin: 'Chenab',
    region: 'Lahaul & Spiti, Himachal Pradesh',
    coordinates: { lat: 32.542, lng: 77.215 },
    elevation: 4387,
    currentArea: 1.72,
    previousArea: 1.60,
    areaChange: 0.12,
    areaChangePct: 7.4,
    growthRate: 4.8,
    riskLevel: 'HIGH',
    riskScore: 78,
    lastUpdated: '2026-10-06',
    satelliteSource: 'Sentinel-2',
  },
  {
    id: 'GL-HP-002',
    name: 'Samudra Tapu',
    district: 'Lahaul & Spiti',
    basin: 'Chenab',
    region: 'Lahaul & Spiti, Himachal Pradesh',
    coordinates: { lat: 32.478, lng: 77.435 },
    elevation: 4620,
    currentArea: 2.14,
    previousArea: 1.91,
    areaChange: 0.23,
    areaChangePct: 12.1,
    growthRate: 7.3,
    riskLevel: 'CRITICAL',
    riskScore: 91,
    lastUpdated: '2026-10-05',
    satelliteSource: 'Sentinel-2',
  },
  {
    id: 'GL-HP-003',
    name: 'Batal Lake',
    district: 'Lahaul & Spiti',
    basin: 'Chenab',
    region: 'Lahaul & Spiti, Himachal Pradesh',
    coordinates: { lat: 32.387, lng: 77.642 },
    elevation: 3980,
    currentArea: 0.87,
    previousArea: 0.84,
    areaChange: 0.03,
    areaChangePct: 3.6,
    growthRate: 1.9,
    riskLevel: 'MEDIUM',
    riskScore: 45,
    lastUpdated: '2026-10-04',
    satelliteSource: 'Sentinel-2',
  },
  {
    id: 'GL-HP-004',
    name: 'Chandertal',
    district: 'Lahaul & Spiti',
    basin: 'Beas',
    region: 'Lahaul & Spiti, Himachal Pradesh',
    coordinates: { lat: 32.493, lng: 77.617 },
    elevation: 4270,
    currentArea: 1.21,
    previousArea: 1.19,
    areaChange: 0.02,
    areaChangePct: 1.7,
    growthRate: 0.8,
    riskLevel: 'LOW',
    riskScore: 22,
    lastUpdated: '2026-10-03',
    satelliteSource: 'Sentinel-2',
  },
  {
    id: 'GL-HP-005',
    name: 'Suraj Tal',
    district: 'Lahaul & Spiti',
    basin: 'Chenab',
    region: 'Lahaul & Spiti, Himachal Pradesh',
    coordinates: { lat: 32.395, lng: 77.398 },
    elevation: 4883,
    currentArea: 0.54,
    previousArea: 0.51,
    areaChange: 0.03,
    areaChangePct: 5.9,
    growthRate: 3.1,
    riskLevel: 'MEDIUM',
    riskScore: 52,
    lastUpdated: '2026-10-06',
    satelliteSource: 'Sentinel-2',
  },
  {
    id: 'GL-HP-006',
    name: 'Hubber Lake',
    district: 'Kullu',
    basin: 'Beas',
    region: 'Kullu, Himachal Pradesh',
    coordinates: { lat: 32.051, lng: 77.383 },
    elevation: 4125,
    currentArea: 0.38,
    previousArea: 0.35,
    areaChange: 0.03,
    areaChangePct: 8.6,
    growthRate: 5.2,
    riskLevel: 'HIGH',
    riskScore: 74,
    lastUpdated: '2026-10-07',
    satelliteSource: 'Sentinel-2',
  },
  {
    id: 'GL-HP-007',
    name: 'Dashaur Lake',
    district: 'Kullu',
    basin: 'Beas',
    region: 'Kullu, Himachal Pradesh',
    coordinates: { lat: 32.189, lng: 77.321 },
    elevation: 3892,
    currentArea: 0.29,
    previousArea: 0.28,
    areaChange: 0.01,
    areaChangePct: 3.6,
    growthRate: 1.4,
    riskLevel: 'LOW',
    riskScore: 18,
    lastUpdated: '2026-10-02',
    satelliteSource: 'Sentinel-2',
  },
  {
    id: 'GL-HP-008',
    name: 'Khajjiar Lake',
    district: 'Chamba',
    basin: 'Ravi',
    region: 'Chamba, Himachal Pradesh',
    coordinates: { lat: 32.553, lng: 76.582 },
    elevation: 1920,
    currentArea: 0.11,
    previousArea: 0.11,
    areaChange: 0.00,
    areaChangePct: 0.9,
    growthRate: 0.3,
    riskLevel: 'LOW',
    riskScore: 12,
    lastUpdated: '2026-09-28',
    satelliteSource: 'Sentinel-2',
  },
  {
    id: 'GL-HP-009',
    name: 'Manimahesh Lake',
    district: 'Chamba',
    basin: 'Ravi',
    region: 'Chamba, Himachal Pradesh',
    coordinates: { lat: 32.393, lng: 76.678 },
    elevation: 4080,
    currentArea: 0.48,
    previousArea: 0.44,
    areaChange: 0.04,
    areaChangePct: 9.1,
    growthRate: 5.8,
    riskLevel: 'HIGH',
    riskScore: 71,
    lastUpdated: '2026-10-05',
    satelliteSource: 'Sentinel-2',
  },
  {
    id: 'GL-HP-010',
    name: 'Dhundhar Lake',
    district: 'Kinnaur',
    basin: 'Sutlej',
    region: 'Kinnaur, Himachal Pradesh',
    coordinates: { lat: 31.972, lng: 78.432 },
    elevation: 4520,
    currentArea: 0.73,
    previousArea: 0.67,
    areaChange: 0.06,
    areaChangePct: 8.9,
    growthRate: 4.1,
    riskLevel: 'HIGH',
    riskScore: 76,
    lastUpdated: '2026-10-06',
    satelliteSource: 'Sentinel-2',
  },
  {
    id: 'GL-HP-011',
    name: 'Chitkul Lake',
    district: 'Kinnaur',
    basin: 'Sutlej',
    region: 'Kinnaur, Himachal Pradesh',
    coordinates: { lat: 31.352, lng: 78.465 },
    elevation: 3450,
    currentArea: 0.22,
    previousArea: 0.21,
    areaChange: 0.01,
    areaChangePct: 4.8,
    growthRate: 2.1,
    riskLevel: 'MEDIUM',
    riskScore: 38,
    lastUpdated: '2026-10-01',
    satelliteSource: 'Sentinel-2',
  },
  {
    id: 'GL-HP-012',
    name: 'Parbati Proglacial Lake',
    district: 'Kullu',
    basin: 'Beas',
    region: 'Kullu, Himachal Pradesh',
    coordinates: { lat: 31.895, lng: 77.458 },
    elevation: 4210,
    currentArea: 1.05,
    previousArea: 0.89,
    areaChange: 0.16,
    areaChangePct: 18.0,
    growthRate: 9.7,
    riskLevel: 'CRITICAL',
    riskScore: 88,
    lastUpdated: '2026-10-07',
    satelliteSource: 'Sentinel-2',
  },
];

// ─────────────────────────────────────────────
// LAKE HISTORY
// ─────────────────────────────────────────────
export const MOCK_LAKE_HISTORY: Record<string, LakeHistoryPoint[]> = {
  'GL-HP-001': [
    { date: '2015-06', area: 0.98 },
    { date: '2016-06', area: 1.05 },
    { date: '2017-06', area: 1.09 },
    { date: '2018-06', area: 1.18 },
    { date: '2019-06', area: 1.28 },
    { date: '2020-06', area: 1.35 },
    { date: '2021-06', area: 1.41 },
    { date: '2022-06', area: 1.50 },
    { date: '2023-06', area: 1.58 },
    { date: '2024-06', area: 1.64 },
    { date: '2025-06', area: 1.68 },
    { date: '2026-06', area: 1.72 },
  ],
  'GL-HP-002': [
    { date: '2015-06', area: 1.12 },
    { date: '2016-06', area: 1.22 },
    { date: '2017-06', area: 1.34 },
    { date: '2018-06', area: 1.48 },
    { date: '2019-06', area: 1.59 },
    { date: '2020-06', area: 1.68 },
    { date: '2021-06', area: 1.74 },
    { date: '2022-06', area: 1.85 },
    { date: '2023-06', area: 1.92 },
    { date: '2024-06', area: 2.01 },
    { date: '2025-06', area: 2.09 },
    { date: '2026-06', area: 2.14 },
  ],
  'GL-HP-012': [
    { date: '2015-06', area: 0.41 },
    { date: '2016-06', area: 0.48 },
    { date: '2017-06', area: 0.55 },
    { date: '2018-06', area: 0.61 },
    { date: '2019-06', area: 0.68 },
    { date: '2020-06', area: 0.74 },
    { date: '2021-06', area: 0.79 },
    { date: '2022-06', area: 0.85 },
    { date: '2023-06', area: 0.90 },
    { date: '2024-06', area: 0.97 },
    { date: '2025-06', area: 1.01 },
    { date: '2026-06', area: 1.05 },
  ],
};

// Default history for lakes without specific history
const defaultHistory = (lake: Lake): LakeHistoryPoint[] => {
  const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const base = lake.currentArea * 0.7;
  return years.map((y, i) => ({
    date: `${y}-06`,
    area: parseFloat((base + (lake.currentArea - base) * (i / 11)).toFixed(2)),
  }));
};

export function getLakeHistory(lakeId: string): LakeHistoryPoint[] {
  const lake = MOCK_LAKES.find(l => l.id === lakeId);
  if (!lake) return [];
  return MOCK_LAKE_HISTORY[lakeId] ?? defaultHistory(lake);
}

// ─────────────────────────────────────────────
// RISK ASSESSMENTS
// ─────────────────────────────────────────────
export const MOCK_RISK_ASSESSMENTS: Record<string, RiskAssessment> = {
  'GL-HP-001': {
    lakeId: 'GL-HP-001',
    riskScore: 78,
    riskLevel: 'HIGH',
    confidence: 86,
    factors: [
      { name: 'Lake Area Growth', contribution: 24, description: 'Significant area expansion over monitoring period' },
      { name: 'Rapid Boundary Change', contribution: 18, description: 'Boundary changes detected in multiple observations' },
      { name: 'Rainfall Anomaly', contribution: 14, description: 'Above-average precipitation in upstream region' },
      { name: 'Terrain Exposure', contribution: 10, description: 'Steep downstream terrain with settlements' },
      { name: 'Historical Anomaly', contribution: 7, description: 'Area increase exceeds historical norms' },
      { name: 'Glacier Retreat', contribution: 5, description: 'Upstream glacier melt contributing to inflow' },
    ],
    explanation:
      'Lake area has increased significantly compared with historical observations. Combined with recent environmental changes and terrain conditions, the prototype model assigns a HIGH-risk classification. This is a demonstration output pending integration with a validated hydrological model.',
    assessedAt: '2026-10-08T08:00:00Z',
    modelVersion: 'HIMNETRA-RA-v0.1-demo',
  },
  'GL-HP-002': {
    lakeId: 'GL-HP-002',
    riskScore: 91,
    riskLevel: 'CRITICAL',
    confidence: 91,
    factors: [
      { name: 'Lake Area Growth', contribution: 28, description: 'Exceptionally rapid expansion' },
      { name: 'Moraine Instability Proxy', contribution: 22, description: 'Terrain roughness proxies suggest moraine weakening' },
      { name: 'Rainfall Anomaly', contribution: 16, description: 'Multi-year precipitation trend above baseline' },
      { name: 'Terrain Exposure', contribution: 12, description: 'Dense downstream settlements' },
      { name: 'Historical Anomaly', contribution: 9, description: 'Highest 10-year growth rate in dataset' },
      { name: 'Seasonal Pattern', contribution: 4, description: 'Peak-season risk window active' },
    ],
    explanation:
      'Samudra Tapu exhibits the highest growth rate in the monitoring dataset. Multiple risk factors are elevated simultaneously. CRITICAL classification reflects urgency for field verification. This is a prototype/demo output only.',
    assessedAt: '2026-10-08T08:00:00Z',
    modelVersion: 'HIMNETRA-RA-v0.1-demo',
  },
};

export function getRiskAssessment(lakeId: string): RiskAssessment {
  if (MOCK_RISK_ASSESSMENTS[lakeId]) return MOCK_RISK_ASSESSMENTS[lakeId];
  const lake = MOCK_LAKES.find(l => l.id === lakeId)!;
  return {
    lakeId,
    riskScore: lake?.riskScore ?? 30,
    riskLevel: lake?.riskLevel ?? 'LOW',
    confidence: 72,
    factors: [
      { name: 'Lake Area Growth', contribution: 12, description: 'Moderate area expansion' },
      { name: 'Rainfall Anomaly', contribution: 8, description: 'Near-average precipitation' },
      { name: 'Terrain Exposure', contribution: 6, description: 'Moderate downstream exposure' },
    ],
    explanation: 'Prototype assessment based on satellite-derived area changes and terrain analysis. Pending integration with validated hydrological model.',
    assessedAt: '2026-10-08T08:00:00Z',
    modelVersion: 'HIMNETRA-RA-v0.1-demo',
  };
}

// ─────────────────────────────────────────────
// SEGMENTATION RESULTS
// ─────────────────────────────────────────────
export const MOCK_SEGMENTATION: Record<string, SegmentationResult> = {
  'GL-HP-001': { lakeId: 'GL-HP-001', model: 'U-Net', iou: 87.3, diceScore: 89.1, confidence: 91.4, timestamp: '2026-10-06T10:22:00Z' },
  'GL-HP-002': { lakeId: 'GL-HP-002', model: 'U-Net', iou: 84.7, diceScore: 86.9, confidence: 88.2, timestamp: '2026-10-05T09:14:00Z' },
};

export function getSegmentation(lakeId: string): SegmentationResult {
  return MOCK_SEGMENTATION[lakeId] ?? {
    lakeId,
    model: 'U-Net',
    iou: 82.1,
    diceScore: 84.5,
    confidence: 86.0,
    timestamp: '2026-10-04T08:00:00Z',
  };
}

// ─────────────────────────────────────────────
// SATELLITE SOURCES
// ─────────────────────────────────────────────
export const MOCK_SATELLITE_SOURCES: SatelliteSource[] = [
  {
    id: 'S2-MSI',
    name: 'Sentinel-2 MSI (Multispectral)',
    shortName: 'Sentinel-2',
    type: 'OPTICAL',
    status: 'AVAILABLE',
    lastAcquisition: '2026-10-06T04:30:00Z',
    resolution: '10m / 20m / 60m',
    coverage: 'Himachal Pradesh (12 tiles)',
    processingStatus: 'IDLE',
    revisitTime: '5 days',
  },
  {
    id: 'S1-SAR',
    name: 'Sentinel-1 C-SAR (Synthetic Aperture Radar)',
    shortName: 'Sentinel-1',
    type: 'SAR',
    status: 'AVAILABLE',
    lastAcquisition: '2026-10-07T02:10:00Z',
    resolution: '5m × 20m (IW mode)',
    coverage: 'Himachal Pradesh (8 frames)',
    processingStatus: 'IDLE',
    revisitTime: '12 days',
  },
  {
    id: 'SRTM-DEM',
    name: 'SRTM Digital Elevation Model',
    shortName: 'SRTM DEM',
    type: 'DEM',
    status: 'AVAILABLE',
    lastAcquisition: '2000-02-11T00:00:00Z',
    resolution: '30m',
    coverage: 'Global (HP region loaded)',
    processingStatus: 'IDLE',
    revisitTime: 'Static dataset',
  },
  {
    id: 'ALOS-DEM',
    name: 'ALOS World 3D DEM',
    shortName: 'ALOS DEM',
    type: 'DEM',
    status: 'AVAILABLE',
    lastAcquisition: '2011-01-01T00:00:00Z',
    resolution: '12.5m',
    coverage: 'HP high-altitude zones',
    processingStatus: 'IDLE',
    revisitTime: 'Static dataset',
  },
  {
    id: 'ERA5-METEO',
    name: 'ERA5 Reanalysis (Meteorological)',
    shortName: 'ERA5 Meteo',
    type: 'METEO',
    status: 'DEMO',
    lastAcquisition: '2026-10-07T00:00:00Z',
    resolution: '31km (0.25° grid)',
    coverage: 'HP river basins',
    processingStatus: 'IDLE',
    revisitTime: 'Daily',
  },
];

// ─────────────────────────────────────────────
// SATELLITE OBSERVATIONS
// ─────────────────────────────────────────────
export const MOCK_OBSERVATIONS: SatelliteObservation[] = [
  { id: 'OBS-001', lakeId: 'GL-HP-001', source: 'Sentinel-2', acquisitionDate: '2026-10-06', resolution: '10m', cloudCover: 4.2, processingStatus: 'COMPLETE', bands: ['B2','B3','B4','B8','B11'] },
  { id: 'OBS-002', lakeId: 'GL-HP-002', source: 'Sentinel-2', acquisitionDate: '2026-10-05', resolution: '10m', cloudCover: 7.8, processingStatus: 'COMPLETE', bands: ['B2','B3','B4','B8','B11'] },
  { id: 'OBS-003', lakeId: 'GL-HP-001', source: 'Sentinel-1', acquisitionDate: '2026-10-07', resolution: '5m×20m', processingStatus: 'COMPLETE' },
  { id: 'OBS-004', lakeId: 'GL-HP-012', source: 'Sentinel-2', acquisitionDate: '2026-10-07', resolution: '10m', cloudCover: 2.1, processingStatus: 'COMPLETE' },
];

// ─────────────────────────────────────────────
// FLOOD SIMULATIONS
// ─────────────────────────────────────────────
export const MOCK_FLOOD_SIMULATIONS: FloodSimulation[] = [
  {
    id: 'SIM-001',
    lakeId: 'GL-HP-001',
    lakeName: 'Gepang Gath',
    scenario: 'MAJOR',
    waterVolume: 14.8,
    estimatedRelease: 11.2,
    breachSeverity: 'HIGH',
    floodExtent: 38.4,
    timeToImpact: 42,
    affectedSettlements: 7,
    affectedRoads: 23,
    riskZone: 'HIGH',
    simulationDuration: 6,
    status: 'COMPLETE',
    timestamp: '2026-10-08T06:00:00Z',
  },
  {
    id: 'SIM-002',
    lakeId: 'GL-HP-002',
    lakeName: 'Samudra Tapu',
    scenario: 'EXTREME',
    waterVolume: 22.3,
    estimatedRelease: 19.7,
    breachSeverity: 'EXTREME',
    floodExtent: 62.1,
    timeToImpact: 28,
    affectedSettlements: 14,
    affectedRoads: 41,
    riskZone: 'CRITICAL',
    simulationDuration: 8,
    status: 'COMPLETE',
    timestamp: '2026-10-07T14:00:00Z',
  },
];

// ─────────────────────────────────────────────
// ALERTS
// ─────────────────────────────────────────────
export const MOCK_ALERTS: Alert[] = [
  {
    id: 'ALT-001',
    type: 'GLOF_RISK',
    title: 'GLOF Risk Alert — Gepang Gath',
    lakeId: 'GL-HP-001',
    lakeName: 'Gepang Gath',
    riskLevel: 'CRITICAL',
    status: 'ACTIVE',
    detectedAt: '2026-10-08T08:32:00Z',
    updatedAt: '2026-10-08T08:32:00Z',
    description: 'AI risk model has assigned CRITICAL risk to Gepang Gath based on rapid area expansion and terrain analysis. Field verification recommended.',
    acknowledged: false,
  },
  {
    id: 'ALT-002',
    type: 'RAPID_EXPANSION',
    title: 'Rapid Lake Expansion — Samudra Tapu',
    lakeId: 'GL-HP-002',
    lakeName: 'Samudra Tapu',
    riskLevel: 'CRITICAL',
    status: 'ACTIVE',
    detectedAt: '2026-10-07T11:15:00Z',
    updatedAt: '2026-10-08T07:00:00Z',
    description: 'Samudra Tapu has shown a 12.1% area increase in the latest Sentinel-2 observation. Growth rate is the highest in the monitoring dataset.',
    acknowledged: false,
  },
  {
    id: 'ALT-003',
    type: 'RAPID_EXPANSION',
    title: 'High Growth Rate — Parbati Proglacial Lake',
    lakeId: 'GL-HP-012',
    lakeName: 'Parbati Proglacial Lake',
    riskLevel: 'HIGH',
    status: 'MONITORING',
    detectedAt: '2026-10-07T09:45:00Z',
    updatedAt: '2026-10-08T06:30:00Z',
    description: 'Parbati Proglacial Lake recorded 18% area growth in the last observation period. Under close monitoring.',
    acknowledged: false,
  },
  {
    id: 'ALT-004',
    type: 'ANOMALY',
    title: 'Boundary Anomaly Detected — Manimahesh Lake',
    lakeId: 'GL-HP-009',
    lakeName: 'Manimahesh Lake',
    riskLevel: 'HIGH',
    status: 'MONITORING',
    detectedAt: '2026-10-06T14:20:00Z',
    updatedAt: '2026-10-07T08:00:00Z',
    description: 'Unusual boundary shape change detected in Manimahesh Lake from Sentinel-2 imagery. Possible calving or moraine displacement.',
    acknowledged: true,
  },
  {
    id: 'ALT-005',
    type: 'DATA_UPDATE',
    title: 'New Sentinel-2 Imagery Available',
    riskLevel: 'LOW',
    status: 'RESOLVED',
    detectedAt: '2026-10-06T06:00:00Z',
    updatedAt: '2026-10-06T07:30:00Z',
    description: 'New Sentinel-2 MSI imagery acquired and processed for 8 monitored lakes in Lahaul & Spiti.',
    acknowledged: true,
  },
  {
    id: 'ALT-006',
    type: 'SIMULATION',
    title: 'Flood Simulation Completed — Gepang Gath',
    lakeId: 'GL-HP-001',
    lakeName: 'Gepang Gath',
    riskLevel: 'HIGH',
    status: 'RESOLVED',
    detectedAt: '2026-10-08T06:05:00Z',
    updatedAt: '2026-10-08T06:10:00Z',
    description: 'Flood propagation simulation for Gepang Gath (MAJOR breach scenario) completed. Estimated 7 settlements potentially affected.',
    acknowledged: true,
  },
];

// ─────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────
export const MOCK_REPORTS: Report[] = [
  {
    id: 'RPT-001',
    title: 'GLOF Risk Assessment — Gepang Gath',
    type: 'RISK_ASSESSMENT',
    lakeId: 'GL-HP-001',
    lakeName: 'Gepang Gath',
    generatedAt: '2026-10-08T08:45:00Z',
    status: 'READY',
    fileSize: '2.4 MB',
  },
  {
    id: 'RPT-002',
    title: 'Lake Change Analysis — Oct 2026',
    type: 'LAKE_CHANGE',
    generatedAt: '2026-10-07T16:00:00Z',
    status: 'READY',
    fileSize: '5.1 MB',
  },
  {
    id: 'RPT-003',
    title: 'Flood Simulation Report — Samudra Tapu',
    type: 'FLOOD_SIMULATION',
    lakeId: 'GL-HP-002',
    lakeName: 'Samudra Tapu',
    generatedAt: '2026-10-07T14:30:00Z',
    status: 'READY',
    fileSize: '3.8 MB',
  },
  {
    id: 'RPT-004',
    title: 'Monthly Monitoring Summary — September 2026',
    type: 'MONTHLY',
    generatedAt: '2026-10-01T09:00:00Z',
    status: 'READY',
    fileSize: '8.2 MB',
  },
  {
    id: 'RPT-005',
    title: 'GLOF Risk Assessment — Samudra Tapu',
    type: 'RISK_ASSESSMENT',
    lakeId: 'GL-HP-002',
    lakeName: 'Samudra Tapu',
    generatedAt: '2026-10-08T09:00:00Z',
    status: 'GENERATING',
  },
];

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'NTF-001', title: 'High-Risk Alert', message: 'High-risk change detected in Gepang Gath', type: 'ALERT', read: false, timestamp: '2026-10-08T08:32:00Z', lakeId: 'GL-HP-001' },
  { id: 'NTF-002', title: 'New Imagery Available', message: 'New Sentinel-2 imagery processed for 8 lakes', type: 'DATA', read: false, timestamp: '2026-10-08T06:00:00Z' },
  { id: 'NTF-003', title: 'Simulation Complete', message: 'Flood simulation for Gepang Gath completed', type: 'REPORT', read: false, timestamp: '2026-10-08T06:10:00Z', lakeId: 'GL-HP-001' },
  { id: 'NTF-004', title: 'Monthly Report Ready', message: 'September 2026 monitoring summary is ready for download', type: 'REPORT', read: true, timestamp: '2026-10-01T09:00:00Z' },
  { id: 'NTF-005', title: 'Critical Alert — Samudra Tapu', message: 'Samudra Tapu risk score has escalated to CRITICAL', type: 'ALERT', read: true, timestamp: '2026-10-07T11:15:00Z', lakeId: 'GL-HP-002' },
];

// ─────────────────────────────────────────────
// SYSTEM SERVICES
// ─────────────────────────────────────────────
export const MOCK_SYSTEM_SERVICES: SystemService[] = [
  { name: 'Satellite Data', status: 'OPERATIONAL', lastChecked: '2026-10-08T11:00:00Z' },
  { name: 'AI Processing', status: 'OPERATIONAL', lastChecked: '2026-10-08T11:00:00Z' },
  { name: 'Risk Engine', status: 'OPERATIONAL', lastChecked: '2026-10-08T11:00:00Z' },
  { name: 'GIS Services', status: 'OPERATIONAL', lastChecked: '2026-10-08T11:00:00Z' },
  { name: 'Alert Service', status: 'OPERATIONAL', lastChecked: '2026-10-08T11:00:00Z' },
];

// ─────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────
export const MOCK_DASHBOARD_STATS = {
  totalLakes: 67,
  highRiskLakes: 8,
  mediumRiskLakes: 17,
  lowRiskLakes: 42,
  criticalAlerts: 2,
  activeAlerts: 4,
  lastSatelliteUpdate: '2026-10-08',
  monitoringRegion: 'Himachal Pradesh, India',
};

// ─────────────────────────────────────────────
// RISK DISTRIBUTION (for charts)
// ─────────────────────────────────────────────
export const MOCK_RISK_DISTRIBUTION = [
  { name: 'Critical', value: 2, color: '#ef4444' },
  { name: 'High', value: 8, color: '#f97316' },
  { name: 'Medium', value: 17, color: '#f59e0b' },
  { name: 'Low', value: 40, color: '#22c55e' },
];

export const MOCK_ALERTS_OVER_TIME = [
  { month: 'Apr', critical: 0, high: 1, medium: 2 },
  { month: 'May', critical: 1, high: 2, medium: 3 },
  { month: 'Jun', critical: 1, high: 3, medium: 4 },
  { month: 'Jul', critical: 2, high: 4, medium: 5 },
  { month: 'Aug', critical: 2, high: 3, medium: 4 },
  { month: 'Sep', critical: 1, high: 3, medium: 6 },
  { month: 'Oct', critical: 2, high: 4, medium: 5 },
];

export const MOCK_OBSERVATION_FREQUENCY = [
  { month: 'Apr', sentinel2: 4, sentinel1: 3 },
  { month: 'May', sentinel2: 5, sentinel1: 4 },
  { month: 'Jun', sentinel2: 3, sentinel1: 3 },
  { month: 'Jul', sentinel2: 4, sentinel1: 4 },
  { month: 'Aug', sentinel2: 5, sentinel1: 4 },
  { month: 'Sep', sentinel2: 6, sentinel1: 5 },
  { month: 'Oct', sentinel2: 4, sentinel1: 3 },
];
