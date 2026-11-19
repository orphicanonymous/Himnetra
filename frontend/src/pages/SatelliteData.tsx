import React, { useEffect, useState } from 'react';
import { Satellite } from 'lucide-react';
import { fetchSatelliteSources, fetchObservations } from '../services/api';
import type { SatelliteSource, SatelliteObservation } from '../types';
import { DemoBanner, PageHeader } from '../components/ui';
import { formatDate } from '../utils';
import { showToast } from '../components/layout/AppLayout';

const PIPELINE_STEPS = [
  { id: 1, label: 'Satellite Acquisition', sub: 'Sentinel-1 / Sentinel-2 imagery download' },
  { id: 2, label: 'Preprocessing', sub: 'Atmospheric correction, orthorectification, co-registration' },
  { id: 3, label: 'NDWI / SAR Processing', sub: 'Normalized Difference Water Index computation, backscatter analysis' },
  { id: 4, label: 'AI Segmentation (U-Net)', sub: 'Deep learning lake boundary extraction' },
  { id: 5, label: 'Change Detection', sub: 'Multi-temporal area comparison, anomaly flagging' },
  { id: 6, label: 'Risk Analysis', sub: 'Weighted risk scoring and rule-based alert generation' },
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

  return (
    <div style={{ padding: 24, minHeight: '100%' }}>
      <PageHeader
        title="Satellite Intelligence"
        description="Input-source metadata and the prepared dataset records available to HIMNETRA."
        icon={<Satellite size={18} />}
        actions={<DemoBanner message="Backend API not configured — no source records are loaded." liveMessage="Source cards show reference metadata. Acquisition records appear only when exported in the prepared dataset." />}
      />

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
                color: 'var(--cyan)',
                background: 'rgba(6,182,212,0.08)',
                border: '1px solid rgba(6,182,212,0.2)',
                letterSpacing: '0.06em',
              }}>
                INPUT SOURCE
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
          Reference workflow — these steps are not running as a live processing job
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
                    <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>WORKFLOW STEP</span>
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
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Exported Acquisition Records</span>
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
              {observations.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 28, textAlign: 'center', color: 'var(--text-muted)' }}>
                    No acquisition-level records are included in the prepared dataset.
                  </td>
                </tr>
              )}
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
