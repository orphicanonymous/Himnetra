// ============================================================
// HIMNETRA – Type Definitions
// ============================================================

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Lake {
  id: string;
  name: string;
  district: string;
  basin: string;
  region: string;
  coordinates: LatLng;
  elevation: number; // metres
  currentArea: number; // km²
  previousArea: number; // km²
  areaChange: number; // km² absolute
  areaChangePct: number; // %
  growthRate: number; // % per year
  riskLevel: RiskLevel;
  riskScore: number; // 0–100
  lastUpdated: string; // ISO date string
  satelliteSource: string;
  priority?: boolean;
  growthReliable?: boolean;
}

export interface LakeHistoryPoint {
  date: string;
  area: number; // km²
  ndwi?: number;
}

export interface RiskFactor {
  name: string;
  contribution: number;
  description: string;
}

export interface RiskAssessment {
  lakeId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number; // %
  factors: RiskFactor[];
  explanation: string;
  assessedAt: string;
  modelVersion: string;
}

export interface SatelliteObservation {
  id: string;
  lakeId: string;
  source: 'Sentinel-2' | 'Sentinel-1' | 'Landsat-8' | 'DEM';
  acquisitionDate: string;
  resolution: string;
  cloudCover?: number; // %
  processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'FAILED';
  bands?: string[];
}

export interface SegmentationResult {
  lakeId: string;
  model: string;
  iou: number; // %
  diceScore: number; // %
  confidence: number; // %
  timestamp: string;
  split?: string; // 'validation' | 'train'
}

export interface FloodSimulation {
  id: string;
  lakeId: string;
  lakeName: string;
  scenario: 'MINOR' | 'MODERATE' | 'MAJOR' | 'EXTREME';
  waterVolume: number; // million m³
  estimatedRelease: number; // million m³
  breachSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  peakDischarge?: number; // m³/s (empirical)
  floodExtent: number | null; // km² (null until flood-routing results exist)
  timeToImpact: number | null; // minutes
  affectedSettlements: number | null;
  affectedRoads: number | null; // km
  downstreamAvailable?: boolean;
  riskZone: RiskLevel;
  simulationDuration: number; // hours
  status: 'PENDING' | 'RUNNING' | 'COMPLETE';
  timestamp: string;
}

export interface Alert {
  id: string;
  type: 'GLOF_RISK' | 'RAPID_EXPANSION' | 'ANOMALY' | 'SIMULATION' | 'DATA_UPDATE';
  title: string;
  lakeId?: string;
  lakeName?: string;
  riskLevel: RiskLevel;
  status: 'ACTIVE' | 'MONITORING' | 'RESOLVED' | 'ACKNOWLEDGED';
  detectedAt: string;
  updatedAt: string;
  description: string;
  acknowledged: boolean;
}

export interface SatelliteSource {
  id: string;
  name: string;
  shortName: string;
  type: 'OPTICAL' | 'SAR' | 'DEM' | 'METEO';
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'DEGRADED' | 'DEMO';
  lastAcquisition: string;
  resolution: string;
  coverage: string;
  processingStatus: 'IDLE' | 'PROCESSING' | 'QUEUED';
  revisitTime: string;
}

export interface Report {
  id: string;
  title: string;
  type: 'RISK_ASSESSMENT' | 'LAKE_CHANGE' | 'FLOOD_SIMULATION' | 'MONTHLY';
  lakeId?: string;
  lakeName?: string;
  generatedAt: string;
  status: 'READY' | 'GENERATING' | 'FAILED';
  fileSize?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'ALERT' | 'DATA' | 'REPORT' | 'SYSTEM';
  read: boolean;
  timestamp: string;
  lakeId?: string;
}

export interface SystemService {
  name: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
  lastChecked: string;
}

export interface LakePolygonCollection {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    geometry: { type: string; coordinates: unknown };
    properties: { lakeId: string; which: 'first_year' | 'latest_year'; year: number; area_km2: number };
  }[];
}

export interface DashboardCharts {
  riskDistribution: { name: string; value: number; color: string }[];
  expansionByYear: { month: string; critical: number; high: number; medium: number }[];
  observationFrequency: { month: string; sentinel2: number; sentinel1: number }[];
}
