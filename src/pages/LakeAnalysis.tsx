import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin,
  Eye, BarChart2, Info,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from 'recharts';
import {
  fetchLake, fetchLakeHistory, fetchSegmentation,
} from '../services/api';
import type { Lake, LakeHistoryPoint, SegmentationResult } from '../types';
import { RiskBadge } from '../components/ui/RiskBadge';
import { DemoBanner, PageHeader, Skeleton, StatCard } from '../components/ui';
import { LakeOutlineMap } from '../components/maps/LakeOutlineMap';
import type { OutlineMode } from '../components/maps/LakeOutlineMap';
import { GlofMap } from '../components/maps/GlofMap';
import { formatDate, formatArea, formatElev } from '../utils';
import { showToast } from '../components/layout/AppLayout';

type ImageMode = 'before' | 'after' | 'segmentation';

export const LakeAnalysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lake, setLake] = useState<Lake | null>(null);
  const [history, setHistory] = useState<LakeHistoryPoint[]>([]);
  const [seg, setSeg] = useState<SegmentationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [historyUnavailable, setHistoryUnavailable] = useState(false);
  const [segmentationUnavailable, setSegmentationUnavailable] = useState(false);
  const [imageMode, setImageMode] = useState<ImageMode>('after');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setLoadError(false);
    setHistoryUnavailable(false);
    setSegmentationUnavailable(false);
    fetchLake(id).then(setLake).catch(() => {
      showToast('Could not load lake analysis from the server.', 'error');
      setLoadError(true);
    }).finally(() => setLoading(false));
    fetchLakeHistory(id).then(setHistory).catch(() => {
      setHistory([]);
      setHistoryUnavailable(true);
    });
    fetchSegmentation(id).then(setSeg).catch(() => {
      setSeg(null);
      setSegmentationUnavailable(true);
    });
  }, [id]);

  if (loading) return <LoadingSkeleton />;
  if (loadError) return (
    <div role="alert" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
      Could not load lake analysis. Check the backend connection and try again.
      <div><Link to="/lakes" style={{ color: 'var(--cyan)' }}>Back to monitoring</Link></div>
    </div>
  );
  if (!lake) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
      Lake not found. <Link to="/lakes" style={{ color: 'var(--cyan)' }}>Back to monitoring</Link>
    </div>
  );

  const areaChange = lake.currentArea - lake.previousArea;
  const formattedAreaChange = `${areaChange > 0 ? '+' : ''}${formatArea(areaChange)}`;
  const minArea = history.length ? Math.min(...history.map(h => h.area)) : 0;
  const maxArea = history.length ? Math.max(...history.map(h => h.area)) : 0;

  const CustomTooltip = ({ active, payload, label }: {active?:boolean;payload?:{value:number}[];label?:string}) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontSize: 12 }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
        <div style={{ color: 'var(--cyan)', fontWeight: 600 }}>{formatArea(payload[0].value)}</div>
      </div>
    );
  };

  return (
    <div style={{ padding: 24, minHeight: '100%' }}>
      <PageHeader
        title={lake.name}
        before={<button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', color: 'var(--text-secondary)',
              cursor: 'pointer', fontSize: 13, padding: 0,
            }}
          >
            <ArrowLeft size={15} /> Back to Lake Monitoring
          </button>}
        meta={<div className="flex items-center gap-2">
            <MapPin size={13} style={{ color: 'var(--cyan)' }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{lake.region}</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{lake.id}</span>
            <RiskBadge level={lake.riskLevel} />
          </div>}
        actions={<>
          <DemoBanner message="Backend API not configured — no lake outputs are loaded." liveMessage="These are prepared pipeline outputs, not live satellite imagery. Area estimates can vary between yearly composites." />
          <Link
            to={`/risk?lake=${lake.id}`}
            style={{
              background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)',
              color: 'var(--cyan)', padding: '7px 16px', borderRadius: 8,
              textDecoration: 'none', fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <BarChart2 size={14} /> Risk Intelligence
          </Link>
          <Link
            to={`/flood?lake=${lake.id}`}
            style={{
              background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
              color: '#f97316', padding: '7px 16px', borderRadius: 8,
              textDecoration: 'none', fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            Run Flood Simulation
          </Link>
        </>}
      />

      {/* ── KPI Row ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Current Area', value: formatArea(lake.currentArea), sub: 'Latest prepared estimate' },
          { label: 'Prev. Area', value: formatArea(lake.previousArea), sub: 'Previous prepared estimate' },
          { label: 'Area Change', value: formattedAreaChange, sub: `${lake.areaChangePct > 0 ? '+' : ''}${lake.areaChangePct.toFixed(1)}%`, warn: areaChange > 0 },
          { label: 'Growth Rate', value: `${lake.growthRate.toFixed(1)}%/yr`, sub: 'Annual expansion', warn: lake.growthRate > 4 },
          { label: 'Elevation', value: formatElev(lake.elevation), sub: 'Above MSL' },
          { label: 'Risk Score', value: `${lake.riskScore}/100`, sub: 'Relative weighted score', warn: lake.riskScore > 60 },
          { label: 'Latest Record', value: formatDate(lake.lastUpdated), sub: lake.satelliteSource },
        ].map(({ label, value, sub, warn }) => (
          <StatCard key={label} label={label} value={value} description={sub} accent={warn ? '#f97316' : 'var(--cyan)'} compact smallValue />
        ))}
      </div>

      {/* ── Main grid ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Satellite image viewer */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{
              padding: '10px 14px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Lake Boundary Outputs</span>
              <div className="flex items-center gap-2">
                {(['before', 'after', 'segmentation'] as ImageMode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setImageMode(m)}
                    style={{
                      padding: '4px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                      background: imageMode === m ? 'rgba(6,182,212,0.15)' : 'transparent',
                      border: `1px solid ${imageMode === m ? 'rgba(6,182,212,0.4)' : 'var(--border)'}`,
                      color: imageMode === m ? 'var(--cyan)' : 'var(--text-secondary)',
                      textTransform: 'capitalize', fontFamily: 'Inter,sans-serif',
                    }}
                  >
                    {m === 'segmentation' ? 'Both' : m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <LakeOutlineMap
              lakeId={lake.id}
              center={lake.coordinates}
              mode={(imageMode === 'segmentation' ? 'both' : imageMode) as OutlineMode}
            />
          </div>

          {/* Historical Change Chart */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Lake Area History</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Prepared yearly area estimates</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {history.length ? `Range: ${formatArea(minArea)} – ${formatArea(maxArea)}` : 'No history range'}
              </span>
            </div>
            {historyUnavailable || history.length === 0 ? (
              <div style={{ height: 200, display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                No time-series output is available for this lake.
              </div>
            ) : <ResponsiveContainer width="100%" height={200}>
              <LineChart data={history} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={d => d.split('-')[0]}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                  width={40}
                  domain={[minArea * 0.9, maxArea * 1.05]}
                  tickFormatter={v => `${v.toFixed(1)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={lake.previousArea} stroke="#475569" strokeDasharray="4 4" label={{ value: 'Prev.', fill: '#475569', fontSize: 10 }} />
                <Line
                  type="monotone" dataKey="area"
                  stroke="url(#lineGrad)" strokeWidth={2.5}
                  dot={{ fill: 'var(--bg-card)', stroke: '#06b6d4', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, fill: '#06b6d4' }}
                />
              </LineChart>
            </ResponsiveContainer>}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Map */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, overflow: 'hidden', height: 260,
          }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Location Map</span>
            </div>
            <GlofMap
              lakes={[lake]}
              selectedLakeId={lake.id}
              height="calc(100% - 41px)"
              showLayers={false}
            />
          </div>

          {/* Area Change Summary */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>Area Change Summary</div>
            {[
              { label: 'Current Area', val: formatArea(lake.currentArea), color: 'var(--cyan)' },
              { label: 'Previous Observation', val: formatArea(lake.previousArea), color: 'var(--text-secondary)' },
              { label: 'Absolute Change', val: formattedAreaChange, color: areaChange > 0 ? '#f97316' : 'var(--text-secondary)' },
              { label: 'Percentage Change', val: `+${lake.areaChangePct.toFixed(1)}%`, color: '#f97316' },
              { label: 'Annual Growth Rate', val: `${lake.growthRate.toFixed(1)}% / year`, color: '#f59e0b' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex items-center justify-between" style={{
                padding: '8px 0', borderBottom: '1px solid var(--border-subtle)',
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color }}>{val}</span>
              </div>
            ))}
          </div>

          {/* AI Segmentation */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px' }}>
            <div className="flex items-center gap-2 mb-3">
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>AI Segmentation</div>
              {seg?.split && <div className="demo-banner" style={{ padding: '2px 8px', fontSize: 10 }}>{seg.split.toUpperCase()} SET</div>}
            </div>
            <div style={{
              background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)',
              borderRadius: 8, padding: '12px',
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
            }}>
              <Eye size={16} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, color: 'var(--cyan)', fontWeight: 600 }}>Model: {seg?.model ?? 'Unavailable'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>CNN-based lake boundary segmentation</div>
              </div>
            </div>
            {seg ? [
              { label: 'IoU Score', val: `${seg.iou.toFixed(1)}%`, desc: 'Intersection over Union' },
              { label: 'Dice Score', val: `${seg.diceScore.toFixed(1)}%`, desc: 'F1-based overlap metric' },
              { label: 'Confidence', val: `${seg.confidence.toFixed(1)}%`, desc: 'Model output confidence' },
            ].map(({ label, val, desc }) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 6 }}>{desc}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--cyan)' }}>{val}</span>
                </div>
                <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 3 }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: val,
                    background: 'linear-gradient(90deg, var(--cyan-dim), var(--cyan))',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            )) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 10 }}>
                {segmentationUnavailable ? 'No per-lake segmentation result is exported.' : 'Loading segmentation result…'}
              </div>
            )}
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <Info size={12} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Segmentation metrics are shown only when exported for this lake. Validation metrics should not be read as per-lake performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Loading skeleton ──────────────────────────────────────────
const LoadingSkeleton: React.FC = () => (
  <div style={{ padding: 24 }}>
    <Skeleton height={28} width={200} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 14, margin: '20px 0' }}>
      {Array(7).fill(0).map((_, i) => <Skeleton key={i} height={80} />)}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Skeleton height={340} />
        <Skeleton height={240} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Skeleton height={260} />
        <Skeleton height={120} />
        <Skeleton height={200} />
      </div>
    </div>
  </div>
);

export default LakeAnalysis;
