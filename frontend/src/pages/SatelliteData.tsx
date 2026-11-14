import React, { useEffect, useState } from 'react';
import { Satellite, CheckCircle } from 'lucide-react';
import { fetchSatelliteSources, fetchObservations } from '../services/api';
import type { SatelliteSource, SatelliteObservation } from '../types';
import { DemoBanner } from '../components/ui';
import { formatDateTime, formatDate } from '../utils';
import { showToast } from '../components/layout/AppLayout';

const PIPELINE_STEPS = [
  { id: 1, label: 'Satellite Acquisition', sub: 'Sentinel-1 / Sentinel-2 imagery download', status: 'COMPLETE' as const },
  { id: 2, label: 'Preprocessing', sub: 'Atmospheric correction, orthorectification, co-registration', status: 'COMPLETE' as const },
  { id: 3, label: 'NDWI / SAR Processing', sub: 'Normalized Difference Water Index computation, backscatter analysis', status: 'COMPLETE' as const },
  { id: 4, label: 'AI Segmentation (U-Net)', sub: 'Deep learning lake boundary extraction', status: 'COMPLETE' as const },
  { id: 5, label: 'Change Detection', sub: 'Multi-temporal area comparison, anomaly flagging', status: 'COMPLETE' as const },
  { id: 6, label: 'Risk Analysis', sub: 'ML risk scoring, alert generation', status: 'COMPLETE' as const },
];

export const SatelliteData: React.FC = () => {
  const [sources, setSources] = useState<SatelliteSource[]>([]);
  const [observations, setObservations] = useState<SatelliteObservation[]>([]);
  useEffect(() => {
    Promise.all([fetchSatelliteSources(), fetchObservations()])
      .then(([s, o]) => {
        setSources(s);
        setObservations(o);
      })
      .catch(() => showToast('Could not load satellite data from the server.', 'error'));
  }, []);

  const statusColor = (s: SatelliteSource['status']) => {
    switch (s) {
      case 'AVAILABLE': return '#22c55e';
      case 'DEMO': return '#f59e0b';
      case 'DEGRADED': return '#f97316';
      case 'UNAVAILABLE': return '#ef4444';
    }
  };

  return (
    <div style={{ padding: 24, minHeight: '100%' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Satellite size={18} style={{ color: 'var(--cyan)' }} />
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Satellite Intelligence</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Data sources, acquisition status, and processing pipeline for HIMNETRA monitoring.
          </p>
        </div>
        <DemoBanner message="Demo — Live ESA data feed not yet connected. Showing metadata only." />
      </div>

      {/* Sources grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 28 }}>
        {sources.map(src => (
          <div
            key={src.id}
            className="himnetra-card"
            style={{ padding: '18px' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{src.shortName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{src.name}</div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                color: statusColor(src.status),
                background: `${statusColor(src.status)}15`,
                border: `1px solid ${statusColor(src.status)}30`,
                letterSpacing: '0.06em',
              }}>
                {src.status === 'DEMO' ? 'DEMO MODE' : src.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {[
                { label: 'Type', val: src.type },
                { label: 'Resolution', val: src.resolution },
                { label: 'Revisit', val: src.revisitTime },
                { label: 'Coverage', val: src.coverage },
              ].map(({ label, val }) => (
                <div key={label} style={{ background: 'var(--bg-elevated)', borderRadius: 6, padding: '7px 9px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 500 }}>{val}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Last acquisition: <span style={{ color: 'var(--text-secondary)' }}>
                {src.type === 'DEM' ? formatDate(src.lastAcquisition) : formatDateTime(src.lastAcquisition)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Processing Pipeline */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '24px', marginBottom: 24,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Processing Pipeline</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
          Satellite-to-alert data flow — prototype architecture
        </div>

        <div style={{ position: 'relative' }}>
          {/* Connector */}
          <div style={{
            position: 'absolute', left: 19, top: 24, bottom: 24, width: 2,
            background: 'linear-gradient(180deg, rgba(6,182,212,0.5), rgba(249,115,22,0.3))',
            zIndex: 0,
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {PIPELINE_STEPS.map((step, idx) => (
              <div key={step.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative', paddingBottom: idx < PIPELINE_STEPS.length - 1 ? 24 : 0 }}>
                {/* Step icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--bg-elevated)',
                  border: `2px solid ${idx === PIPELINE_STEPS.length - 1 ? 'rgba(249,115,22,0.5)' : 'rgba(6,182,212,0.4)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, zIndex: 1,
                  color: idx === PIPELINE_STEPS.length - 1 ? '#f97316' : 'var(--cyan)',
                  fontSize: 13, fontWeight: 700,
                }}>
                  {step.id}
                </div>

                <div style={{ paddingTop: 8 }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{step.label}</span>
                    <CheckCircle size={14} style={{ color: '#22c55e' }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{step.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Observations */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Acquisitions</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)' }}>
                {['Observation ID', 'Lake', 'Source', 'Date', 'Resolution', 'Cloud Cover', 'Status'].map(h => (
                  <th key={h} style={{
                    padding: '9px 16px', textAlign: 'left',
                    color: 'var(--text-muted)', fontSize: 11, fontWeight: 600,
                    borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {observations.map(obs => (
                <tr
                  key={obs.id}
                  style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                >
                  <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono,monospace', fontSize: 12, color: 'var(--text-muted)' }}>{obs.id}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-primary)' }}>{obs.lakeId}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{obs.source}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{formatDate(obs.acquisitionDate)}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{obs.resolution}</td>
                  <td style={{ padding: '10px 16px', color: obs.cloudCover !== undefined && obs.cloudCover > 20 ? '#f59e0b' : 'var(--text-secondary)' }}>
                    {obs.cloudCover !== undefined ? `${obs.cloudCover}%` : 'N/A'}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 99,
                      color: '#22c55e', background: 'rgba(34,197,94,0.12)',
                      border: '1px solid rgba(34,197,94,0.3)',
                    }}>
                      {obs.processingStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SatelliteData;
