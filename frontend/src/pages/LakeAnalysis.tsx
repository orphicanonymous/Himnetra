import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Maximize2,
  Eye, BarChart2, Info,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from 'recharts';
import {
  fetchLake, fetchLakeHistory, fetchSegmentation,
  IS_LIVE,
} from '../services/api';
import type { Lake, LakeHistoryPoint, SegmentationResult } from '../types';
import { RiskBadge } from '../components/ui/RiskBadge';
import { DemoBanner, Skeleton } from '../components/ui';
import { LakeOutlineMap } from '../components/maps/LakeOutlineMap';
import type { OutlineMode } from '../components/maps/LakeOutlineMap';
import { GlofMap } from '../components/maps/GlofMap';
import { formatDate, formatArea, formatElev } from '../utils';
import { showToast } from '../components/layout/AppLayout';

type ImageMode = 'before' | 'after' | 'ndwi' | 'segmentation';

export const LakeAnalysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lake, setLake] = useState<Lake | null>(null);
  const [history, setHistory] = useState<LakeHistoryPoint[]>([]);
  const [seg, setSeg] = useState<SegmentationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [imageMode, setImageMode] = useState<ImageMode>('after');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetchLake(id),
      fetchLakeHistory(id),
      fetchSegmentation(id),
    ]).then(([l, h, s]) => {
      setLake(l);
      setHistory(h);
      setSeg(s);
    }).catch(() => {
      showToast('Could not load lake analysis from the server.', 'error');
      setLoadError(true);
    }).finally(() => setLoading(false));
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
  const minArea = Math.min(...history.map(h => h.area));
  const maxArea = Math.max(...history.map(h => h.area));

  const CustomTooltip = ({ active, payload, label }: {active?:boolean;payload?:{value:number}[];label?:string}) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontSize: 12 }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
        <div style={{ color: 'var(--cyan)', fontWeight: 600 }}>{payload[0].value.toFixed(2)} km²</div>
      </div>
    );
  };

  return (
    <div style={{ padding: 24, minHeight: '100%' }}>
      {/* ── Back button + header ──────────────────── */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', color: 'var(--text-secondary)',
              cursor: 'pointer', fontSize: 13, marginBottom: 10, padding: 0,
            }}
          >
            <ArrowLeft size={15} /> Back to Lake Monitoring
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{lake.name}</h1>
            <RiskBadge level={lake.riskLevel} />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <MapPin size={13} style={{ color: 'var(--cyan)' }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{lake.region}</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{lake.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <DemoBanner message="Prototype Data — Pending real satellite integration." liveMessage="Outlines come from a U-Net trained on optical-index weak labels. Area differs about 10-15% between yearly composites, so read trends with care." />
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
        </div>
      </div>

      {/* ── KPI Row ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Current Area', value: formatArea(lake.currentArea), sub: 'Latest satellite obs.' },
          { label: 'Prev. Area', value: formatArea(lake.previousArea), sub: 'Previous observation' },
          { label: 'Area Change', value: `+${formatArea(areaChange)}`, sub: `+${lake.areaChangePct.toFixed(1)}%`, warn: true },
          { label: 'Growth Rate', value: `${lake.growthRate.toFixed(1)}%/yr`, sub: 'Annual expansion', warn: lake.growthRate > 4 },
          { label: 'Elevation', value: formatElev(lake.elevation), sub: 'Above MSL' },
          { label: 'Risk Score', value: `${lake.riskScore}/100`, sub: IS_LIVE ? 'Relative ranking (0-100)' : 'AI model output (demo)', warn: lake.riskScore > 60 },
          { label: 'Last Obs.', value: formatDate(lake.lastUpdated), sub: lake.satelliteSource },
        ].map(({ label, value, sub, warn }) => (
          <div key={label} className="himnetra-card" style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.06em' }}>{label.toUpperCase()}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: warn ? '#f97316' : 'var(--text-primary)', marginBottom: 3 }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
          </div>
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
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Satellite View</span>
              <div className="flex items-center gap-2">
                {((IS_LIVE ? ['before', 'after', 'segmentation'] : ['before', 'after', 'ndwi', 'segmentation']) as ImageMode[]).map(m => (
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
                    {m === 'ndwi' ? 'NDWI' : m === 'segmentation' ? (IS_LIVE ? 'Both' : 'AI Seg.') : m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {IS_LIVE
              ? <LakeOutlineMap lakeId={lake.id} center={lake.coordinates} mode={(imageMode === 'segmentation' ? 'both' : imageMode === 'ndwi' ? 'after' : imageMode) as OutlineMode} />
              : <SatelliteImagePlaceholder mode={imageMode} lake={lake} />}
          </div>

          {/* Historical Change Chart */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Lake Area History</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{IS_LIVE ? 'Yearly composites from Sentinel-1/2 segmentation' : 'Historical expansion (demo data, not real satellite measurements)'}</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Range: {minArea.toFixed(2)} – {maxArea.toFixed(2)} km²
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
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
            </ResponsiveContainer>
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
              { label: 'Absolute Change', val: `+${formatArea(areaChange)}`, color: '#f97316' },
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
              <div className="demo-banner" style={{ padding: '2px 8px', fontSize: 10 }}>{IS_LIVE ? (seg?.split === 'validation' ? 'HELD-OUT LAKE' : 'TRAINING LAKE') : 'PROTOTYPE'}</div>
            </div>
            <div style={{
              background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)',
              borderRadius: 8, padding: '12px',
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
            }}>
              <Eye size={16} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, color: 'var(--cyan)', fontWeight: 600 }}>Model: {seg?.model ?? 'U-Net'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>CNN-based lake boundary segmentation</div>
              </div>
            </div>
            {seg && [
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
            ))}
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <Info size={12} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {IS_LIVE ? 'Overlap with the optical-index weak label for the latest year. Held-out lakes give the honest estimate.' : 'Demo scores. Actual model performance depends on training data and backend integration.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Satellite image placeholder ───────────────────────────────
const SatelliteImagePlaceholder: React.FC<{ mode: ImageMode; lake: Lake }> = ({ mode, lake }) => {
  const colors: Record<ImageMode, { bg: string; overlay: string; label: string }> = {
    before: { bg: 'linear-gradient(135deg,#0d1f35,#1a3a5c)', overlay: 'rgba(6,182,212,0.4)', label: 'Before (Historical)' },
    after: { bg: 'linear-gradient(135deg,#0a1628,#0d2040)', overlay: 'rgba(6,182,212,0.65)', label: 'After (Latest)' },
    ndwi: { bg: 'linear-gradient(135deg,#0c1a0c,#1a3a1a)', overlay: 'rgba(34,197,94,0.6)', label: 'NDWI Index' },
    segmentation: { bg: 'linear-gradient(135deg,#1a1028,#0d1a35)', overlay: 'rgba(249,115,22,0.55)', label: 'AI Segmentation (U-Net)' },
  };
  const c = colors[mode];

  return (
    <div style={{
      height: 300, position: 'relative', overflow: 'hidden',
      background: c.bg,
    }}>
      {/* Simulated satellite terrain */}
      <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        </defs>
        <rect width="800" height="300" fill="url(#terrain-bg)" />
        {/* Terrain lines */}
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M0,${100 + i * 14} C100,${90 + i * 14} 200,${110 + i * 14} 300,${95 + i * 14} S500,${100 + i * 14} 600,${105 + i * 14} S750,${98 + i * 14} 800,${102 + i * 14}`}
            stroke={`rgba(255,255,255,${0.04 - i * 0.002})`} strokeWidth={1} fill="none" />
        ))}
        {/* Lake body */}
        <ellipse cx="400" cy="160" rx={mode === 'after' ? 90 : 78} ry={mode === 'after' ? 48 : 42}
          fill={c.overlay} />
        {mode === 'segmentation' && (
          <ellipse cx="400" cy="160" rx={90} ry={48}
            fill="none" stroke="#f97316" strokeWidth="2.5" strokeDasharray="8 4" opacity={0.9} />
        )}
        {mode === 'ndwi' && (
          <>
            <ellipse cx="400" cy="160" rx={95} ry={52} fill="rgba(34,197,94,0.15)" />
            <ellipse cx="400" cy="160" rx={85} ry={44} fill="rgba(34,197,94,0.35)" />
          </>
        )}
        {/* Grid overlay */}
        {mode !== 'ndwi' && Array.from({ length: 10 }, (_, i) => (
          <React.Fragment key={i}>
            <line x1={i * 80} y1={0} x2={i * 80} y2={300} stroke="rgba(6,182,212,0.06)" strokeWidth={1} />
            <line x1={0} y1={i * 30} x2={800} y2={i * 30} stroke="rgba(6,182,212,0.06)" strokeWidth={1} />
          </React.Fragment>
        ))}
      </svg>
      {/* Labels */}
      <div style={{ position: 'absolute', top: 12, left: 14, fontSize: 11, color: 'var(--cyan)', fontWeight: 600, letterSpacing: '0.08em', background: 'rgba(6,12,24,0.7)', padding: '4px 10px', borderRadius: 4 }}>
        {c.label}
      </div>
      <div style={{ position: 'absolute', top: 12, right: 14, fontSize: 11, color: 'var(--text-muted)', background: 'rgba(6,12,24,0.7)', padding: '4px 10px', borderRadius: 4 }}>
        {lake.name} · {formatDate(lake.lastUpdated)}
      </div>
      <div style={{ position: 'absolute', bottom: 12, left: 14, fontSize: 10, color: 'rgba(148,163,184,0.6)', background: 'rgba(6,12,24,0.7)', padding: '3px 8px', borderRadius: 4 }}>
        Prototype visualization — not real satellite imagery
      </div>
      <div style={{ position: 'absolute', bottom: 12, right: 14 }}>
        <button style={{
          background: 'rgba(13,22,41,0.8)', border: '1px solid var(--border)',
          color: 'var(--text-secondary)', borderRadius: 6, padding: '4px 10px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11,
        }}>
          <Maximize2 size={11} /> Fullscreen
        </button>
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
