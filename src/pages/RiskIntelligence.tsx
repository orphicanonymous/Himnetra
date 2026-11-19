import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Brain, Info, ArrowUpRight, ChevronRight } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { fetchLakes, fetchRiskAssessment } from '../services/api';
import type { Lake, RiskAssessment } from '../types';
import { RiskBadge } from '../components/ui/RiskBadge';
import { DemoBanner, PageHeader } from '../components/ui';
import { getRiskColor, formatDateTime } from '../utils';
import { showToast } from '../components/layout/AppLayout';

export const RiskIntelligence: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultLake = searchParams.get('lake');

  const [lakes, setLakes] = useState<Lake[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [loadingRisk, setLoadingRisk] = useState(true);

  useEffect(() => {
    fetchLakes().then(items => {
      setLakes(items);
      setSelectedId(current => current || (
        defaultLake && items.some(lake => lake.id === defaultLake)
          ? defaultLake
          : items.find(lake => lake.riskLevel === 'CRITICAL' || lake.riskLevel === 'HIGH')?.id ?? items[0]?.id ?? ''
      ));
    }).catch(() => showToast('Could not load lakes from the server.', 'error'));
  }, [defaultLake]);

  useEffect(() => {
    if (!selectedId) {
      setRisk(null);
      setLoadingRisk(false);
      return;
    }
    setLoadingRisk(true);
    fetchRiskAssessment(selectedId)
      .then(setRisk)
      .catch(() => {
        setRisk(null);
        showToast('Could not load the risk assessment from the server.', 'error');
      })
      .finally(() => setLoadingRisk(false));
  }, [selectedId]);

  const lake = lakes.find(l => l.id === selectedId);
  const riskColor = risk ? getRiskColor(risk.riskLevel) : 'var(--cyan)';

  const radarData = risk?.factors.map(f => ({
    factor: f.name.length > 18 ? f.name.slice(0, 18) + '…' : f.name,
    score: f.contribution,
    fullMark: 30,
  })) ?? [];

  return (
    <div style={{ padding: 24, minHeight: '100%' }}>
      <PageHeader
        title="Relative Risk Assessment"
        description="Relative six-factor weighted assessment from prepared lake attributes."
        icon={<Brain size={18} />}
        actions={<DemoBanner message="Backend API not configured — no risk outputs are loaded." liveMessage="Scores are relative weighted rankings, not calibrated probabilities or live alerts." />}
      />

      {/* Lake selector */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '16px 20px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
          Select Lake:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flex: 1 }}>
          {lakes
            .filter(l => l.riskLevel === 'CRITICAL' || l.riskLevel === 'HIGH')
            .map(l => (
              <button
                key={l.id}
                onClick={() => setSelectedId(l.id)}
                style={{
                  padding: '6px 14px', borderRadius: 7, fontSize: 12, cursor: 'pointer',
                  background: selectedId === l.id ? `${getRiskColor(l.riskLevel)}18` : 'var(--bg-elevated)',
                  border: `1px solid ${selectedId === l.id ? `${getRiskColor(l.riskLevel)}50` : 'var(--border)'}`,
                  color: selectedId === l.id ? getRiskColor(l.riskLevel) : 'var(--text-secondary)',
                  fontFamily: 'Inter,sans-serif', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {l.name}
                <RiskBadge level={l.riskLevel} size="sm" />
              </button>
            ))}
        </div>
        {lake && (
          <Link
            to={`/lakes/${lake.id}`}
            style={{
              fontSize: 12, color: 'var(--cyan)', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
            }}
          >
            View Lake Analysis <ArrowUpRight size={12} />
          </Link>
        )}
      </div>

      {loadingRisk || !risk ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--text-muted)', fontSize: 14 }}>
          {loadingRisk ? 'Loading risk assessment…' : 'Risk assessment is unavailable. Check the backend connection.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* LEFT: Score & Gauge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Risk Score Card */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '24px',
            }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 6 }}>RISK SCORE</div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 48, fontWeight: 800, color: riskColor, lineHeight: 1 }}>{risk.riskScore}</span>
                    <span style={{ fontSize: 24, color: 'var(--text-muted)', fontWeight: 300 }}>/100</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <RiskBadge level={risk.riskLevel} />
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                    Confidence: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{risk.confidence}%</span>
                  </div>
                </div>
              </div>

              {/* Score gauge */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 6 }}>
                  {[
                    { color: '#22c55e', width: '25%' },
                    { color: '#f59e0b', width: '25%' },
                    { color: '#f97316', width: '25%' },
                    { color: '#ef4444', width: '25%' },
                  ].map(({ color, width }) => (
                    <div key={color} style={{ width, background: color, opacity: 0.4 }} />
                  ))}
                </div>
                {/* Marker */}
                <div style={{ position: 'relative', height: 16 }}>
                  <div style={{
                    position: 'absolute', left: `${risk.riskScore}%`, transform: 'translateX(-50%)',
                    top: 0,
                  }}>
                    <div style={{ width: 2, height: 10, background: riskColor, margin: '0 auto' }} />
                    <div style={{ fontSize: 11, color: riskColor, fontWeight: 700, whiteSpace: 'nowrap', marginTop: 2, transform: 'translateX(-50%)' }}>
                      {risk.riskScore}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
                  <span>0 — LOW</span>
                  <span>25 — MEDIUM</span>
                  <span>50 — HIGH</span>
                  <span>75 — CRITICAL — 100</span>
                </div>
              </div>
            </div>

            {/* Risk Factors contribution bars */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '20px',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
                Contributing Factors
                <span className="demo-banner" style={{ marginLeft: 10, fontSize: 10 }}>Prepared score factors</span>
              </div>
              {risk.factors.map((factor, idx) => {
                const pct = (factor.contribution / 30) * 100;
                const colors = ['#06b6d4', '#22c55e', '#f59e0b', '#f97316', '#a78bfa', '#ec4899'];
                const color = colors[idx % colors.length];
                return (
                  <div key={factor.name} style={{ marginBottom: 14 }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{factor.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color }}>+{factor.contribution}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3 }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        width: `${pct}%`, background: color,
                        transition: 'width 0.6s ease',
                        boxShadow: `0 0 8px ${color}40`,
                      }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{factor.description}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Radar + Explanation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Radar Chart */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '20px',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Risk Factor Radar</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>
                Relative contribution of each prepared score factor
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis
                    dataKey="factor"
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  />
                  <Radar
                    name="Risk Contribution"
                    dataKey="score"
                    stroke={riskColor}
                    fill={riskColor}
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      borderRadius: 8, fontSize: 12,
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Risk Explanation */}
            <div style={{
              background: 'var(--bg-card)', border: `1px solid ${riskColor}30`,
              borderRadius: 12, padding: '20px',
              borderLeft: `3px solid ${riskColor}`,
            }}>
              <div className="flex items-center gap-2 mb-10">
                <Brain size={15} style={{ color: riskColor }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Risk Explanation</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {risk.explanation}
              </p>
              <div style={{
                marginTop: 16, padding: '10px 12px',
                background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)',
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>MODEL METADATA</div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Model Version</span>
                  <span style={{ fontSize: 11, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono,monospace' }}>{risk.modelVersion}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Assessed At</span>
                  <span style={{ fontSize: 11, color: 'var(--text-primary)' }}>{formatDateTime(risk.assessedAt)}</span>
                </div>
              </div>
              <div className="flex items-start gap-6 mt-3">
                <Info size={12} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 3 }} />
                <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  This is a relative weighted score, not a calibrated hazard probability. It depends on prepared input attributes and is not a substitute for validated hydrological analysis.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <Link
                to={`/flood?lake=${selectedId}`}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 8,
                  background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
                  color: '#f97316', textDecoration: 'none', fontSize: 13, fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                Run Flood Simulation <ChevronRight size={14} />
              </Link>
              <Link
                to={`/lakes/${selectedId}`}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 8,
                  background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)',
                  color: 'var(--cyan)', textDecoration: 'none', fontSize: 13, fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                Lake Analysis <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskIntelligence;
