// ============================================================
// HIMNETRA – API Service Layer
// 
// This layer abstracts all data fetching.
// With VITE_API_URL set (see .env.example) every call goes to the FastAPI
// backend; without it the app runs on the built-in mock data.
//
// Backend API endpoints:
//   GET  /lakes
//   GET  /lakes/{id}
//   GET  /lakes/{id}/history
//   GET  /lakes/{id}/risk
//   GET  /lakes/{id}/flood-map
//   POST /analysis/run
//   GET  /alerts
//   GET  /reports
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
  LakePolygonCollection,
  DashboardCharts,
} from '../types';

import {
  MOCK_LAKES,
  MOCK_ALERTS,
  MOCK_REPORTS,
  MOCK_NOTIFICATIONS,
  MOCK_SYSTEM_SERVICES,
  MOCK_SATELLITE_SOURCES,
  MOCK_OBSERVATIONS,
  MOCK_FLOOD_SIMULATIONS,
  MOCK_DASHBOARD_STATS,
  MOCK_RISK_DISTRIBUTION,
  MOCK_ALERTS_OVER_TIME,
  MOCK_OBSERVATION_FREQUENCY,
  getLakeHistory,
  getRiskAssessment,
  getSegmentation,
} from './mockData';

// ── Configuration ─────────────────────────────────────────
// When backend is ready, set VITE_API_URL in your .env file.
const API_BASE: string | null = import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '') : null;
const USE_MOCK = !API_BASE;
export const IS_LIVE = !USE_MOCK;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// ── Helper for future real fetch ──────────────────────────
async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// ── Lakes ─────────────────────────────────────────────────
export async function fetchLakes(): Promise<Lake[]> {
  if (USE_MOCK) { await delay(400); return MOCK_LAKES; }
  return apiFetch<Lake[]>('/lakes');
}

export async function fetchLake(id: string): Promise<Lake | null> {
  if (USE_MOCK) {
    await delay(200);
    return MOCK_LAKES.find(l => l.id === id) ?? null;
  }
  return apiFetch<Lake>(`/lakes/${id}`);
}

export async function fetchLakeHistory(id: string): Promise<LakeHistoryPoint[]> {
  if (USE_MOCK) { await delay(300); return getLakeHistory(id); }
  return apiFetch<LakeHistoryPoint[]>(`/lakes/${id}/history`);
}

export async function fetchRiskAssessment(id: string): Promise<RiskAssessment> {
  if (USE_MOCK) { await delay(350); return getRiskAssessment(id); }
  return apiFetch<RiskAssessment>(`/lakes/${id}/risk`);
}

export async function fetchSegmentation(id: string): Promise<SegmentationResult> {
  if (USE_MOCK) { await delay(300); return getSegmentation(id); }
  return apiFetch<SegmentationResult>(`/lakes/${id}/segmentation`);
}

// ── Flood Simulations ─────────────────────────────────────
export async function fetchFloodSimulations(): Promise<FloodSimulation[]> {
  if (USE_MOCK) { await delay(400); return MOCK_FLOOD_SIMULATIONS; }
  return apiFetch<FloodSimulation[]>('/simulations');
}

export async function fetchFloodSimulation(lakeId: string): Promise<FloodSimulation | null> {
  if (USE_MOCK) {
    await delay(200);
    return MOCK_FLOOD_SIMULATIONS.find(s => s.lakeId === lakeId) ?? null;
  }
  return apiFetch<FloodSimulation>(`/lakes/${lakeId}/flood-map`);
}

export async function runFloodSimulation(
  lakeId: string,
  params: { scenario: string; breachSeverity: string }
): Promise<FloodSimulation> {
  if (USE_MOCK) {
    await delay(2500); // simulate processing time
    const existing = MOCK_FLOOD_SIMULATIONS.find(s => s.lakeId === lakeId);
    const lake = MOCK_LAKES.find(l => l.id === lakeId);
    return existing ?? {
      id: `SIM-NEW-${Date.now()}`,
      lakeId,
      lakeName: lake?.name ?? 'Unknown Lake',
      scenario: params.scenario as FloodSimulation['scenario'],
      waterVolume: 8.5,
      estimatedRelease: 6.2,
      breachSeverity: params.breachSeverity as FloodSimulation['breachSeverity'],
      floodExtent: 22.4,
      timeToImpact: 55,
      affectedSettlements: 4,
      affectedRoads: 14,
      riskZone: 'MEDIUM',
      simulationDuration: 6,
      status: 'COMPLETE',
      timestamp: new Date().toISOString(),
    };
  }
  return apiFetch<FloodSimulation>('/analysis/run', {
    method: 'POST',
    body: JSON.stringify({ lakeId, ...params }),
  });
}

// ── Alerts ────────────────────────────────────────────────
export async function fetchAlerts(): Promise<Alert[]> {
  if (USE_MOCK) { await delay(300); return MOCK_ALERTS; }
  return apiFetch<Alert[]>('/alerts');
}

// ── Satellite ─────────────────────────────────────────────
export async function fetchSatelliteSources(): Promise<SatelliteSource[]> {
  if (USE_MOCK) { await delay(300); return MOCK_SATELLITE_SOURCES; }
  return apiFetch<SatelliteSource[]>('/satellite/sources');
}

export async function fetchObservations(lakeId?: string): Promise<SatelliteObservation[]> {
  if (USE_MOCK) {
    await delay(250);
    return lakeId
      ? MOCK_OBSERVATIONS.filter(o => o.lakeId === lakeId)
      : MOCK_OBSERVATIONS;
  }
  const qs = lakeId ? `?lakeId=${lakeId}` : '';
  return apiFetch<SatelliteObservation[]>(`/satellite/observations${qs}`);
}

// ── Reports ───────────────────────────────────────────────
export async function fetchReports(): Promise<Report[]> {
  if (USE_MOCK) { await delay(300); return MOCK_REPORTS; }
  return apiFetch<Report[]>('/reports');
}

export async function generateReport(
  type: Report['type'],
  lakeId?: string
): Promise<Report> {
  if (USE_MOCK) {
    await delay(1500);
    const lake = lakeId ? MOCK_LAKES.find(l => l.id === lakeId) : undefined;
    return {
      id: `RPT-NEW-${Date.now()}`,
      title: `${type.replace('_', ' ')} — ${lake?.name ?? 'All Lakes'}`,
      type,
      lakeId,
      lakeName: lake?.name,
      generatedAt: new Date().toISOString(),
      status: 'READY',
      fileSize: '3.2 MB',
    };
  }
  return apiFetch<Report>('/reports', {
    method: 'POST',
    body: JSON.stringify({ type, lakeId }),
  });
}

// ── Notifications ─────────────────────────────────────────
export async function fetchNotifications(): Promise<Notification[]> {
  if (USE_MOCK) { await delay(200); return MOCK_NOTIFICATIONS; }
  return apiFetch<Notification[]>('/notifications');
}

// ── System Status ─────────────────────────────────────────
export async function fetchSystemStatus(): Promise<SystemService[]> {
  if (USE_MOCK) { await delay(200); return MOCK_SYSTEM_SERVICES; }
  return apiFetch<SystemService[]>('/system/status');
}

// ── Dashboard Stats ───────────────────────────────────────
export async function fetchDashboardStats(): Promise<typeof MOCK_DASHBOARD_STATS> {
  if (USE_MOCK) { await delay(300); return MOCK_DASHBOARD_STATS; }
  return apiFetch<typeof MOCK_DASHBOARD_STATS>('/dashboard/stats');
}

// ── Dashboard charts ──────────────────────────────────────
export async function fetchDashboardCharts(): Promise<DashboardCharts> {
  if (USE_MOCK) {
    await delay(200);
    return {
      riskDistribution: MOCK_RISK_DISTRIBUTION,
      expansionByYear: MOCK_ALERTS_OVER_TIME.map(m => ({ ...m })),
      observationFrequency: MOCK_OBSERVATION_FREQUENCY,
    };
  }
  return apiFetch<DashboardCharts>('/dashboard/charts');
}

// ── Lake outlines (GeoJSON from the segmentation model) ───
const EMPTY_FC: LakePolygonCollection = { type: 'FeatureCollection', features: [] };

export async function fetchPolygons(): Promise<LakePolygonCollection> {
  if (USE_MOCK) return EMPTY_FC;
  return apiFetch<LakePolygonCollection>('/polygons');
}

export async function fetchLakePolygons(id: string): Promise<LakePolygonCollection> {
  if (USE_MOCK) return EMPTY_FC;
  return apiFetch<LakePolygonCollection>(`/lakes/${id}/polygon`);
}

// ── Alert actions / downloads ─────────────────────────────
export async function acknowledgeAlert(id: string): Promise<void> {
  if (USE_MOCK) return;
  await apiFetch<{ ok: boolean }>(`/alerts/${id}/acknowledge`, { method: 'POST' });
}

export function reportDownloadUrl(id: string): string {
  return `${API_BASE ?? ''}/reports/${id}/download`;
}
