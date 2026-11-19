import React, { useState } from 'react';
import { Settings as SettingsIcon, Map, Bell, Database, Cpu, Save } from 'lucide-react';
import { DemoBanner, PageHeader } from '../components/ui';
import { showToast } from '../components/layout/AppLayout';
import { API_BASE_URL, IS_LIVE } from '../services/api';
import { getDashboardPreferences, saveDashboardPreferences, type DashboardPreferences } from '../services/preferences';

type SettingsTab = 'general' | 'map' | 'notifications' | 'data' | 'system';

const MAP_OPTIONS: { val: DashboardPreferences['defaultMap']; label: string }[] = [
  { val: 'terrain', label: 'Terrain' },
  { val: 'satellite', label: 'Satellite' },
  { val: 'street', label: 'Street' },
];

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<DashboardPreferences>(getDashboardPreferences);

  const update = <K extends keyof DashboardPreferences>(key: K, value: DashboardPreferences[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const save = () => {
    try {
      saveDashboardPreferences(settings);
      showToast('Preferences saved in this browser.', 'success');
    } catch {
      showToast('Could not save preferences in this browser.', 'error');
    }
  };

  const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'general',       label: 'General',        icon: SettingsIcon },
    { id: 'map',           label: 'Map Preferences', icon: Map },
    { id: 'notifications', label: 'Notifications',  icon: Bell },
    { id: 'data',          label: 'Data Sources',   icon: Database },
    { id: 'system',        label: 'System',         icon: Cpu },
  ];

  return (
    <div style={{ padding: 24, minHeight: '100%' }}>
      <PageHeader
        title="Settings"
        description="Configure HIMNETRA dashboard preferences and display options."
        icon={<SettingsIcon size={18} />}
        actions={<DemoBanner message="Preferences are stored locally in this browser; they are not sent to the backend." liveMessage="Preferences are stored locally in this browser; they are not sent to the backend." />}
      />

      <div className="settings-layout" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
        {/* Tab nav */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '8px', height: 'fit-content',
        }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 7,
                background: activeTab === id ? 'rgba(6,182,212,0.1)' : 'transparent',
                border: 'none', cursor: 'pointer',
                color: activeTab === id ? 'var(--cyan)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: activeTab === id ? 500 : 400,
                fontFamily: 'Inter,sans-serif', transition: 'all 0.15s',
                textAlign: 'left', marginBottom: 2,
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px' }}>
          {activeTab === 'general' && (
            <SettingsSection title="General Settings" desc="Basic display and unit preferences">
              <SettingRow label="Area Unit" desc="Used in dashboard, lake analysis, and flood views">
                <select value={settings.areaUnit} onChange={e => update('areaUnit', e.target.value === 'ha' ? 'ha' : 'km2')} style={selectStyle}>
                  <option value="km2">km²</option>
                  <option value="ha">hectares</option>
                </select>
              </SettingRow>
              <SettingRow label="Distance Unit" desc="Used for road lengths in flood results">
                <select value={settings.distanceUnit} onChange={e => update('distanceUnit', e.target.value === 'm' ? 'm' : 'km')} style={selectStyle}>
                  <option value="km">km</option>
                  <option value="m">m</option>
                </select>
              </SettingRow>
              <SettingRow label="Elevation Unit" desc="Used for lake elevation display">
                <select value={settings.elevationUnit} onChange={e => update('elevationUnit', e.target.value === 'ft' ? 'ft' : 'm')} style={selectStyle}>
                  <option value="m">m (metres)</option>
                  <option value="ft">ft (feet)</option>
                </select>
              </SettingRow>
            </SettingsSection>
          )}

          {activeTab === 'map' && (
            <SettingsSection title="Map Preferences" desc="Default map view and layer settings">
              <SettingRow label="Default Base Map" desc="Map style shown on first load">
                <div style={{ display: 'flex', gap: 8 }}>
                  {MAP_OPTIONS.map(({ val, label }) => (
                    <button
                      key={val}
                      onClick={() => update('defaultMap', val)}
                      style={{
                        padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 12,
                        background: settings.defaultMap === val ? 'rgba(6,182,212,0.15)' : 'var(--bg-elevated)',
                        border: `1px solid ${settings.defaultMap === val ? 'rgba(6,182,212,0.4)' : 'var(--border)'}`,
                        color: settings.defaultMap === val ? 'var(--cyan)' : 'var(--text-secondary)',
                        fontFamily: 'Inter,sans-serif', transition: 'all 0.15s',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </SettingRow>
            </SettingsSection>
          )}

          {activeTab === 'notifications' && (
            <SettingsSection title="Notification Settings" desc="Saved preferences only; these do not change backend alert rules or send messages">
              <SettingRow label="Critical Alerts" desc="GLOF risk reaching CRITICAL level">
                <Toggle value={settings.notifCritical} onChange={v => update('notifCritical', v)} />
              </SettingRow>
              <SettingRow label="High Risk Alerts" desc="Lakes escalating to HIGH risk">
                <Toggle value={settings.notifHigh} onChange={v => update('notifHigh', v)} />
              </SettingRow>
              <SettingRow label="Medium Risk Alerts" desc="Lakes escalating to MEDIUM risk">
                <Toggle value={settings.notifMedium} onChange={v => update('notifMedium', v)} />
              </SettingRow>
              <SettingRow label="Data Updates" desc="New satellite imagery available">
                <Toggle value={settings.notifDataUpdate} onChange={v => update('notifDataUpdate', v)} />
              </SettingRow>
              <SettingRow label="Report Ready" desc="Generated reports available for download">
                <Toggle value={settings.notifReports} onChange={v => update('notifReports', v)} />
              </SettingRow>
              <SettingRow label="Risk Alert Threshold" desc="Preference only; current risk scores are already prepared by the pipeline">
                <div className="flex items-center gap-3">
                  <input
                    type="range" min={0} max={100} value={settings.riskThreshold}
                    onChange={e => update('riskThreshold', Number(e.target.value))}
                    style={{ width: 140, accentColor: 'var(--cyan)' }}
                  />
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, minWidth: 30 }}>
                    {settings.riskThreshold}
                  </span>
                </div>
              </SettingRow>
            </SettingsSection>
          )}

          {activeTab === 'data' && (
            <SettingsSection title="Data Sources" desc="Configure satellite data and update intervals">
              <SettingRow label="Preferred Update Interval" desc="Saved preference only; no satellite polling scheduler is configured">
                <select
                  value={settings.updateInterval}
                  onChange={e => {
                    const value = e.target.value;
                    if (value === '6h' || value === '12h' || value === '24h' || value === 'manual') {
                      update('updateInterval', value);
                    }
                  }}
                  style={selectStyle}
                >
                  <option value="6h">Every 6 hours</option>
                  <option value="12h">Every 12 hours</option>
                  <option value="24h">Daily</option>
                  <option value="manual">Manual only</option>
                </select>
              </SettingRow>
              <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>Backend API Endpoint</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                  {IS_LIVE ? 'API URL configured; backend connectivity is checked when data is requested' : 'Set VITE_API_URL and restart Vite to load prepared backend outputs'}
                </div>
                <input
                  readOnly
                  value={API_BASE_URL ?? 'Not configured — no backend data is displayed'}
                  style={{
                    width: '100%', background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)', borderRadius: 7,
                    padding: '8px 12px', color: 'var(--text-muted)',
                    fontSize: 12, fontFamily: 'JetBrains Mono,monospace',
                    outline: 'none',
                  }}
                />
              </div>
            </SettingsSection>
          )}

          {activeTab === 'system' && (
            <SettingsSection title="System Information" desc="Platform and environment details">
              {[
                { label: 'Application', val: 'HIMNETRA v0.1.0-prototype' },
                { label: 'Mode', val: IS_LIVE ? 'Prepared-data API URL configured' : 'Unavailable — no API configured' },
                { label: 'Frontend Stack', val: 'React 19 + TypeScript + Vite' },
                { label: 'Mapping Library', val: 'Leaflet' },
                { label: 'Segmentation', val: 'Prepared U-Net outputs; no live inference' },
                { label: 'Risk Engine', val: 'Six-factor relative weighted score' },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between" style={{
                  padding: '10px 0', borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono,monospace' }}>{val}</span>
                </div>
              ))}
              <div style={{
                marginTop: 20, padding: 16,
                background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)',
                borderRadius: 10,
              }}>
                <div style={{ fontSize: 12, color: 'var(--cyan)', fontWeight: 600, marginBottom: 6 }}>
                  {IS_LIVE ? 'ℹ PREPARED-DATA API' : 'NO DATA SOURCE'}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {IS_LIVE
                    ? 'The API URL is configured. The dashboard reads prepared backend outputs; satellite acquisition is not live, and segmentation is not run on demand.'
                    : 'No fallback dataset is used. Configure VITE_API_URL and start FastAPI to load prepared backend outputs.'}
                </p>
              </div>
            </SettingsSection>
          )}

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
              Update interval is not a satellite scheduler. Notification toggles and threshold are stored for reference and do not alter backend alert generation.
            </p>
            <button
              onClick={save}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 24px', borderRadius: 8,
                background: 'var(--cyan)', border: 'none',
                color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter,sans-serif',
                boxShadow: '0 4px 16px rgba(6,182,212,0.25)',
              }}
            >
              <Save size={14} /> Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────
const SettingsSection: React.FC<{ title: string; desc: string; children: React.ReactNode }> = ({ title, desc, children }) => (
  <div>
    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{title}</div>
    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>{desc}</div>
    <div>{children}</div>
  </div>
);

const SettingRow: React.FC<{ label: string; desc: string; children: React.ReactNode }> = ({ label, desc, children }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 0', borderBottom: '1px solid var(--border-subtle)', gap: 20,
  }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
    </div>
    {children}
  </div>
);

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    style={{
      width: 44, height: 24, borderRadius: 12,
      background: value ? 'var(--cyan)' : 'var(--bg-elevated)',
      border: `1px solid ${value ? 'var(--cyan)' : 'var(--border)'}`,
      position: 'relative', cursor: 'pointer',
      transition: 'all 0.2s', flexShrink: 0,
    }}
  >
    <div style={{
      width: 18, height: 18, borderRadius: '50%', background: '#fff',
      position: 'absolute', top: 2, left: value ? 22 : 2,
      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    }} />
  </button>
);

const selectStyle: React.CSSProperties = {
  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 7, padding: '7px 10px', color: 'var(--text-primary)',
  fontSize: 12, outline: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif',
};

export default Settings;
