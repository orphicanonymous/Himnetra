import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Waves, Play, AlertTriangle, CheckCircle, Loader, Info } from 'lucide-react';
import { fetchLakes, fetchFloodSimulation, runFloodSimulation, IS_LIVE } from '../services/api';
import type { Lake, FloodSimulation } from '../types';
import { RiskBadge } from '../components/ui/RiskBadge';
import { DemoBanner, PageHeader } from '../components/ui';
import { GlofMap } from '../components/maps/GlofMap';
import { formatDateTime, getRiskColor } from '../utils';
import { showToast } from '../components/layout/AppLayout';

const fmtN = (v: number | null | undefined, d = 0, unit = '') =>
  v == null ? '—' : `${v.toLocaleString(undefined, { maximumFractionDigits: d })}${unit}`;

const SCENARIOS = ['MINOR', 'MODERATE', 'MAJOR', 'EXTREME'] as const;

export const FloodSimulationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultLake = searchParams.get('lake');

  const [lakes, setLakes] = useState<Lake[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [scenario, setScenario] = useState<typeof SCENARIOS[number]>('MAJOR');
  const [simulation, setSimulation] = useState<FloodSimulation | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetchLakes().then(items => {
      setLakes(items);
      setSelectedId(current => current || (
        defaultLake && items.some(lake => lake.id === defaultLake)
          ? defaultLake
          : items[0]?.id ?? ''
      ));
    }).catch(() => showToast('Could not load lakes from the server.', 'error'));
  }, [defaultLake]);

  useEffect(() => {
    setSimulation(null);
    if (!selectedId) return;
    fetchFloodSimulation(selectedId)
      .then(setSimulation)
      .catch(() => showToast('Could not load the flood map from the server.', 'error'));
  }, [selectedId]);

  const lake = lakes.find(l => l.id === selectedId);

  const handleRun = async () => {
    setRunning(true);
    setSimulation(null);
    try {
      const result = await runFloodSimulation(selectedId, { scenario });
      setSimulation(result);
      showToast('Prepared routing results loaded.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not load prepared routing results.', 'error');
    } finally {
      setRunning(false);
    }
  };

  const riskColor = simulation ? getRiskColor(simulation.riskZone) : 'var(--text-muted)';

  return (
    <div style={{ padding: 24, minHeight: '100%' }}>
      <PageHeader
        title="Flood Propagation Simulation"
        description="Visualize potential downstream flood extent after a hypothetical glacial lake breach."
        icon={<Waves size={18} />}
        actions={<DemoBanner message="Backend API not configured — no scenario results are loaded." liveMessage="Only existing per-lake flood-routing outputs are shown. No values are estimated when an output is missing; these are not trained-model predictions or validated forecasts." />}
      />

      <div className="flood-simulation-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, minHeight: 600 }}>
        {/* Map */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '10px 14px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Flood Extent Map
            </span>
            <div className="flex items-center gap-6" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1.5"><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4', display: 'inline-block' }} /> Lake</span>
              <span className="flex items-center gap-1.5"><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316', display: 'inline-block' }} /> Flood Zone (sim.)</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <GlofMap
              lakes={lakes}
              selectedLakeId={selectedId}
              onLakeClick={l => setSelectedId(l.id)}
              height="100%"
              showFloodExtent={!!simulation}
              simulationLakeId={simulation ? selectedId : undefined}
            />
          </div>
          {simulation && (
            <div className="animate-fade-in" style={{
              padding: '10px 14px', borderTop: '1px solid var(--border)',
              display: 'flex', gap: 20, flexWrap: 'wrap',
            }}>
              {[
                { label: 'Flood Extent', val: fmtN(simulation.floodExtent, 1, ' km²') },
                { label: 'Time to Impact', val: fmtN(simulation.timeToImpact, 0, ' min') },
                { label: 'Settlements', val: fmtN(simulation.affectedSettlements) },
                { label: 'Roads', val: fmtN(simulation.affectedRoads, 1, ' km') },
              ].map(({ label, val }) => (
                <div key={label}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f97316' }}>{val}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Lake selector */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 10, fontWeight: 600 }}>SELECT LAKE</div>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              style={{
                width: '100%', background: 'var(--bg-elevated)',
                border: '1px solid var(--border)', borderRadius: 8,
                padding: '9px 12px', color: 'var(--text-primary)',
                fontSize: 13, outline: 'none', cursor: 'pointer',
                fontFamily: 'Inter,sans-serif',
              }}
            >
              {lakes.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.riskLevel})</option>
              ))}
            </select>
            {lake && (
              <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 10px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Area</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{lake.currentArea.toFixed(2)} km²</div>
                </div>
                <div style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 10px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Risk</div>
                  <RiskBadge level={lake.riskLevel} />
                </div>
              </div>
            )}
          </div>

          {/* Scenario config */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 14, fontWeight: 600 }}>BREACH SCENARIO</div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Scenario Type</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                {SCENARIOS.map(s => (
                  <button
                    key={s}
                    onClick={() => setScenario(s)}
                    style={{
                      padding: '7px', borderRadius: 7, fontSize: 12, cursor: 'pointer',
                      background: scenario === s ? 'rgba(249,115,22,0.12)' : 'var(--bg-elevated)',
                      border: `1px solid ${scenario === s ? 'rgba(249,115,22,0.4)' : 'var(--border)'}`,
                      color: scenario === s ? '#f97316' : 'var(--text-secondary)',
                      fontFamily: 'Inter,sans-serif', transition: 'all 0.15s',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 16 }}>
              <Info size={12} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 3 }} />
              <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Results are loaded only when a prepared output exists for this lake and scenario.
              </p>
            </div>

            <button
              onClick={handleRun}
              disabled={running}
              style={{
                width: '100%', padding: '11px', borderRadius: 9,
                background: running ? 'var(--bg-elevated)' : 'linear-gradient(135deg, #c2410c, #f97316)',
                border: 'none', color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: running ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'Inter,sans-serif', transition: 'opacity 0.2s',
                opacity: running ? 0.7 : 1,
                boxShadow: running ? 'none' : '0 4px 20px rgba(249,115,22,0.3)',
              }}
            >
              {running ? <><Loader size={15} className="animate-spin" /> Running Simulation…</> : <><Play size={15} /> Run Simulation</>}
            </button>
            {!simulation && !running && selectedId && IS_LIVE && (
              <p style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                No saved output is available. Running a scenario succeeds only if a prepared routing result exists.
              </p>
            )}
          </div>

          {/* Results */}
          {simulation && (
            <div className="animate-fade-in" style={{
              background: 'var(--bg-card)',
              border: `1px solid ${riskColor}30`,
              borderRadius: 12, padding: 16,
              borderLeft: `3px solid ${riskColor}`,
            }}>
              <div className="flex items-center gap-2 mb-12">
                <CheckCircle size={15} style={{ color: '#22c55e' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Simulation Results</span>
                <div className="demo-banner" style={{ fontSize: 10, padding: '2px 7px' }}>SCENARIO</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                {formatDateTime(simulation.timestamp)} · {simulation.scenario} scenario
              </div>
              {[
                { label: 'Estimated Flood Extent', val: fmtN(simulation.floodExtent, 1, ' km²'), warn: true },
                { label: 'Time to Impact', val: fmtN(simulation.timeToImpact, 0, ' minutes'), warn: true },
                { label: 'Prepared Release Volume', val: fmtN(simulation.estimatedRelease, 2, ' M m³'), warn: true },
                { label: 'Prepared Peak Discharge', val: fmtN(simulation.peakDischarge, 0, ' m³/s') },
                { label: 'Potentially Affected Settlements', val: fmtN(simulation.affectedSettlements), warn: true },
                { label: 'Affected Roads', val: fmtN(simulation.affectedRoads, 1, ' km'), warn: false },
              ].map(({ label, val, warn }) => (
                <div key={label} className="flex items-center justify-between" style={{
                  padding: '7px 0', borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: warn ? '#f97316' : 'var(--text-primary)' }}>{val}</span>
                </div>
              ))}

              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Risk Zone:</span>
                <RiskBadge level={simulation.riskZone} />
              </div>

              <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <AlertTriangle size={12} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 3 }} />
                <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  These prepared routing outputs are not trained-model predictions or validated forecasts. Actual impact requires validated hydrodynamic modeling and current field conditions.
                </p>
              </div>

              <Link
                to="/reports"
                style={{
                  marginTop: 14, display: 'block',
                  padding: '8px 14px', borderRadius: 7, textAlign: 'center',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 12,
                }}
              >
                Generate Report
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloodSimulationPage;
