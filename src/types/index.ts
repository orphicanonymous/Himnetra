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
  estimatedRelease: number; // million m³, from prepared flood-routing output
  peakDischarge: number; // m³/s, from prepared flood-routing output
  floodExtent: number | null; // km²
  timeToImpact: number | null; // minutes
  affectedSettlements: number | null;
  affectedRoads: number | null; // km
  riskZone: RiskLevel;
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

export interface SubscriberRegistration {
  name: string;
  phone?: string;
  email?: string;
  lat: number;
  lng: number;
}

export interface AlertDispatch {
  lake: string;
  radiusKm: number;
  recipients: number;
  results: { name: string; email: string | null; sms: string | null }[];
}

export interface SatelliteSource {
  id: string;
  name: string;
  shortName: string;
  type: 'OPTICAL' | 'SAR' | 'DEM' | 'METEO';
  resolution: string;
  coverage: string;
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

export interface FloodPolygonCollection {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    geometry: { type: string; coordinates: unknown };
    properties: { lakeId: string; scenario: FloodSimulation['scenario']; extent_km2: number };
  }[];
}

export interface DashboardCharts {
  riskDistribution: { name: string; value: number; color: string }[];
  expansionByYear: { month: string; critical: number; high: number; medium: number }[];
}

export interface DashboardStats {
  totalLakes: number;
  highRiskLakes: number;
  mediumRiskLakes: number;
  lowRiskLakes: number;
  criticalAlerts: number;
  activeAlerts: number;
  latestDataDate: string;
  monitoringRegion: string;
}

export interface DataOutputStatus {
  name: string;
  file: string;
  available: boolean;
  lastModified: string | null;
}

export interface DataFreshness {
  checkedAt: string;
  files: DataOutputStatus[];
}
