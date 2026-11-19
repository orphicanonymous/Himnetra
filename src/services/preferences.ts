export type DashboardPreferences = {
  defaultMap: 'terrain' | 'satellite' | 'street';
  areaUnit: 'km2' | 'ha';
  distanceUnit: 'km' | 'm';
  elevationUnit: 'm' | 'ft';
  notifCritical: boolean;
  notifHigh: boolean;
  notifMedium: boolean;
  notifDataUpdate: boolean;
  notifReports: boolean;
  riskThreshold: number;
  updateInterval: '6h' | '12h' | '24h' | 'manual';
};

const STORAGE_KEY = 'himnetra.dashboard-preferences.v1';

export const DEFAULT_PREFERENCES: DashboardPreferences = {
  defaultMap: 'terrain',
  areaUnit: 'km2',
  distanceUnit: 'km',
  elevationUnit: 'm',
  notifCritical: true,
  notifHigh: true,
  notifMedium: false,
  notifDataUpdate: true,
  notifReports: true,
  riskThreshold: 70,
  updateInterval: '24h',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getDashboardPreferences(): DashboardPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const saved: unknown = JSON.parse(raw);
    if (!isRecord(saved)) return DEFAULT_PREFERENCES;
    return {
      defaultMap: saved.defaultMap === 'satellite' || saved.defaultMap === 'street' ? saved.defaultMap : DEFAULT_PREFERENCES.defaultMap,
      areaUnit: saved.areaUnit === 'ha' ? 'ha' : DEFAULT_PREFERENCES.areaUnit,
      distanceUnit: saved.distanceUnit === 'm' ? 'm' : DEFAULT_PREFERENCES.distanceUnit,
      elevationUnit: saved.elevationUnit === 'ft' ? 'ft' : DEFAULT_PREFERENCES.elevationUnit,
      notifCritical: typeof saved.notifCritical === 'boolean' ? saved.notifCritical : DEFAULT_PREFERENCES.notifCritical,
      notifHigh: typeof saved.notifHigh === 'boolean' ? saved.notifHigh : DEFAULT_PREFERENCES.notifHigh,
      notifMedium: typeof saved.notifMedium === 'boolean' ? saved.notifMedium : DEFAULT_PREFERENCES.notifMedium,
      notifDataUpdate: typeof saved.notifDataUpdate === 'boolean' ? saved.notifDataUpdate : DEFAULT_PREFERENCES.notifDataUpdate,
      notifReports: typeof saved.notifReports === 'boolean' ? saved.notifReports : DEFAULT_PREFERENCES.notifReports,
      riskThreshold: typeof saved.riskThreshold === 'number' && saved.riskThreshold >= 0 && saved.riskThreshold <= 100
        ? saved.riskThreshold
        : DEFAULT_PREFERENCES.riskThreshold,
      updateInterval: saved.updateInterval === '6h' || saved.updateInterval === '12h' || saved.updateInterval === 'manual'
        ? saved.updateInterval
        : DEFAULT_PREFERENCES.updateInterval,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveDashboardPreferences(preferences: DashboardPreferences): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
