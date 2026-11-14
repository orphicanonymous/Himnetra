import React, { useState } from 'react';
import { Settings as SettingsIcon, Map, Bell, Database, Cpu, Save } from 'lucide-react';
import { DemoBanner } from '../components/ui';
import { showToast } from '../components/layout/AppLayout';

type SettingsTab = 'general' | 'map' | 'notifications' | 'data' | 'system';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState({
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
    demoMode: true,
  });

  const update = (key: keyof typeof settings, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const save = () => {
    showToast('Settings saved (demo — not persisted to backend).', 'success');
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
      {/* Header */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <SettingsIcon size={18} style={{ color: 'var(--cyan)' }} />
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Settings</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Configure HIMNETRA dashboard preferences and display options.
          </p>
        </div>
        <DemoBanner message="Demo — Settings are not persisted to backend." liveMessage="Settings are not persisted to the backend." />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
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
              <SettingRow label="Area Unit" desc="Unit for lake area display">
                <select value={settings.areaUnit} onChange={e => update('areaUnit', e.target.value)} style={selectStyle}>
                  <option value="km2">km²</option>
                  <option value="ha">hectares</option>
                </select>
              </SettingRow>
              <SettingRow label="Distance Unit" desc="Unit for distance measurements">
                <select value={settings.distanceUnit} onChange={e => update('distanceUnit', e.target.value)} style={selectStyle}>
                  <option value="km">km</option>
                  <option value="m">m</option>
                </select>
              </SettingRow>
              <SettingRow label="Elevation Unit" desc="Unit for altitude display">
                <select value={settings.elevationUnit} onChange={e => update('elevationUnit', e.target.value)} style={selectStyle}>
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
                  {[
                    { val: 'terrain', label: 'Terrain' },
                    { val: 'satellite', label: 'Satellite' },
                    { val: 'street', label: 'Street' },
                  ].map(({ val, label }) => (
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
            <SettingsSection title="Notification Settings" desc="Configure which alerts trigger notifications">
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
              <SettingRow label="Risk Alert Threshold" desc="Minimum risk score to trigger notification">
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
              <SettingRow label="Update Interval" desc="How often to check for new satellite data">
                <select value={settings.updateInterval} onChange={e => update('updateInterval', e.target.value)} style={selectStyle}>
                  <option value="6h">Every 6 hours</option>
                  <option value="12h">Every 12 hours</option>
                  <option value="24h">Daily</option>
                  <option value="manual">Manual only</option>
                </select>
              </SettingRow>
              <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>Backend API Endpoint</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                  Set VITE_API_URL environment variable to connect to FastAPI backend
                </div>
                <input
                  readOnly
                  value="Not configured (DEMO MODE)"
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
                { label: 'Mode', val: 'DEMO — Backend not connected' },
                { label: 'Frontend Stack', val: 'React 19 + TypeScript + Vite' },
                { label: 'Mapping Library', val: 'Leaflet + React-Leaflet' },
                { label: 'AI Model', val: 'U-Net (pending integration)' },
                { label: 'Risk Engine', val: 'Random Forest prototype (pending)' },
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
                  ⬡ DEMO MODE ACTIVE
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  All data displayed is prototype/mock data. The system is not connected to live Sentinel satellite feeds,
                  U-Net processing pipeline, or the FastAPI backend. Connect VITE_API_URL to enable live operation.
                </p>
              </div>
            </SettingsSection>
          )}

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
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
