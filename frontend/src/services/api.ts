import type {
  Alert,
  DashboardCharts,
  DashboardStats,
  DataFreshness,
  FloodSimulation,
  Lake,
  LakeHistoryPoint,
  LakePolygonCollection,
  Notification,
  Report,
  RiskAssessment,
  SatelliteObservation,
  SatelliteSource,
  SegmentationResult,
  SystemService,
} from '../types';

export const API_BASE_URL: string | null = import.meta.env.VITE_API_URL
  ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
  : null;
export const IS_LIVE = Boolean(API_BASE_URL);

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  if (!API_BASE_URL) throw new Error('Backend API URL is not configured.');

  const res = await fetch(`${API_BASE_URL}${path}`, {
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const body: unknown = await res.json();
    const detail = body && typeof body === 'object' && 'detail' in body && typeof body.detail === 'string'
      ? body.detail
      : `API error ${res.status}: ${path}`;
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export function fetchLakes(): Promise<Lake[]> {
  return apiFetch<Lake[]>('/lakes');
}

export function fetchLake(id: string): Promise<Lake> {
  return apiFetch<Lake>(`/lakes/${encodeURIComponent(id)}`);
}

export function fetchLakeHistory(id: string): Promise<LakeHistoryPoint[]> {
  return apiFetch<LakeHistoryPoint[]>(`/lakes/${encodeURIComponent(id)}/history`);
}

export function fetchRiskAssessment(id: string): Promise<RiskAssessment> {
  return apiFetch<RiskAssessment>(`/lakes/${encodeURIComponent(id)}/risk`);
}

export function fetchSegmentation(id: string): Promise<SegmentationResult> {
  return apiFetch<SegmentationResult>(`/lakes/${encodeURIComponent(id)}/segmentation`);
}

export function fetchFloodSimulations(): Promise<FloodSimulation[]> {
  return apiFetch<FloodSimulation[]>('/simulations');
}

export function fetchFloodSimulation(lakeId: string): Promise<FloodSimulation | null> {
  return apiFetch<FloodSimulation | null>(`/lakes/${encodeURIComponent(lakeId)}/flood-map`);
}

export function runFloodSimulation(
  lakeId: string,
  params: { scenario: FloodSimulation['scenario'] },
): Promise<FloodSimulation> {
  return apiFetch<FloodSimulation>('/analysis/run', {
    method: 'POST',
    body: JSON.stringify({ lakeId, ...params }),
  });
}

export function fetchAlerts(): Promise<Alert[]> {
  return apiFetch<Alert[]>('/alerts');
}

export function fetchSatelliteSources(): Promise<SatelliteSource[]> {
  return apiFetch<SatelliteSource[]>('/satellite/sources');
}

export function fetchObservations(lakeId?: string): Promise<SatelliteObservation[]> {
  const qs = lakeId ? `?lakeId=${encodeURIComponent(lakeId)}` : '';
  return apiFetch<SatelliteObservation[]>(`/satellite/observations${qs}`);
}

export function fetchReports(): Promise<Report[]> {
  return apiFetch<Report[]>('/reports');
}

export function generateReport(type: Report['type'], lakeId?: string): Promise<Report> {
  return apiFetch<Report>('/reports', {
    method: 'POST',
    body: JSON.stringify({ type, lakeId }),
  });
}

export function fetchNotifications(): Promise<Notification[]> {
  return apiFetch<Notification[]>('/notifications');
}

export function fetchSystemStatus(): Promise<SystemService[]> {
  return apiFetch<SystemService[]>('/system/status');
}

export function fetchDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>('/dashboard/stats');
}

export function fetchDashboardCharts(): Promise<DashboardCharts> {
  return apiFetch<DashboardCharts>('/dashboard/charts');
}

export function fetchDataFreshness(): Promise<DataFreshness> {
  return apiFetch<DataFreshness>('/data/status');
}

export function fetchPolygons(): Promise<LakePolygonCollection> {
  return apiFetch<LakePolygonCollection>('/polygons');
}

export function fetchLakePolygons(id: string): Promise<LakePolygonCollection> {
  return apiFetch<LakePolygonCollection>(`/lakes/${encodeURIComponent(id)}/polygon`);
}

export async function acknowledgeAlert(id: string): Promise<void> {
  await apiFetch<{ ok: boolean }>(`/alerts/${encodeURIComponent(id)}/acknowledge`, { method: 'POST' });
}

export function reportDownloadUrl(id: string): string {
  if (!API_BASE_URL) throw new Error('Backend API URL is not configured.');
  return `${API_BASE_URL}/reports/${encodeURIComponent(id)}/download`;
}
