import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers, ShieldAlert, AlertTriangle, TrendingUp,
  Satellite, RefreshCw, ArrowUpRight, ArrowRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { GlofMap } from '../components/maps/GlofMap';
import { RiskBadge } from '../components/ui/RiskBadge';
import { DemoBanner, Skeleton } from '../components/ui';
import {
  fetchLakes, fetchDashboardStats, fetchAlerts, fetchDashboardCharts, IS_LIVE,
} from '../services/api';
import type { Lake, Alert, DashboardCharts } from '../types';
import { getRiskColor, formatDate } from '../utils';
import { showToast } from '../components/layout/AppLayout';

const CHART_COLORS = {
  cyan: '#06b6d4',
  orange: '#f97316',
  amber: '#f59e0b',
  green: '#22c55e',
};

const CustomTooltip = ({ active, payload, label }: {active?:boolean;payload?:{name:string;value:number;color:string}[];label?:string}) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '8px 14px', fontSize: 12,
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: 'var(--text-secondary)' }}>{p.name}:</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const [lakes, setLakes] = useState<Lake[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchDashboardStats>> | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [charts, setCharts] = useState<DashboardCharts>({ riskDistribution: [], expansionByYear: [], observationFrequency: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedLake, setSelectedLake] = useState<Lake | null>(null);

  useEffect(() => {
    Promise.all([fetchLakes(), fetchDashboardStats(), fetchAlerts(), fetchDashboardCharts()])
      .then(([l, s, a, c]) => {
        setLakes(l);
        setStats(s);
        setAlerts(a);
        setCharts(c);
      })
      .catch(() => {
        setLoadError(true);
        showToast('Could not load dashboard data from the server.', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');

  return (
    <div style={{ padding: 24, minHeight: '100%' }}>
      {/* Header row */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Glacial Lake Risk Overview
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Real-time intelligence for high-altitude glacial lakes across Himachal Pradesh.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DemoBanner message="Demo Data — Mock values. Connect backend for live data." />
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '7px 14px', color: 'var(--text-secondary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {loadError && (
        <div role="alert" style={{ marginBottom: 16, color: '#ef4444', fontSize: 13 }}>
          Dashboard data is unavailable. Check the backend connection and refresh.
        </div>
      )}

      {/* ── KPI Cards ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="himnetra-card"><Skeleton height={80} /></div>
          ))
        ) : (
          <>
            <KpiCard icon={<Layers size={20} />} value={stats?.totalLakes ?? 0} label="Monitored Lakes" sub="Himachal Pradesh" color="var(--cyan)" trend="+4" />
            <KpiCard icon={<ShieldAlert size={20} />} value={stats?.highRiskLakes ?? 0} label="High Risk Lakes" sub="Require monitoring" color="#f97316" trend="+1" trendBad />
            <KpiCard icon={<AlertTriangle size={20} />} value={stats?.mediumRiskLakes ?? 0} label="Medium Risk" sub="Under observation" color="#f59e0b" trend="+2" trendBad />
            <KpiCard icon={<TrendingUp size={20} />} value={stats?.criticalAlerts ?? 0} label="Critical Alerts" sub="Active this period" color="#ef4444" trend="+1" trendBad />
            <KpiCard icon={<Satellite size={20} />} value={formatDate(stats?.lastSatelliteUpdate ?? '')} label="Last Satellite Update" sub="Sentinel-2 MSI" color="var(--cyan)" isDate />
          </>
        )}
      </div>

      {/* ── Map + Active Alerts ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 24 }}>
        {/* Map */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden', height: 440,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '10px 14px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Glacial Lake Distribution Map
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Interactive — click lake to explore</span>
          </div>
          <div style={{ flex: 1 }}>
            <GlofMap
              lakes={lakes}
              selectedLakeId={selectedLake?.id}
              onLakeClick={setSelectedLake}
              height="100%"
            />
          </div>
        </div>

        {/* Active alerts sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, overflow: 'hidden', flex: 1,
          }}>
            <div style={{
              padding: '10px 14px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Active Alerts</span>
              <Link to="/alerts" style={{ fontSize: 11, color: 'var(--cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                All <ArrowRight size={11} />
              </Link>
            </div>
            <div style={{ padding: '8px', overflowY: 'auto', maxHeight: 360 }}>
              {activeAlerts.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No active alerts</div>
              ) : (
                activeAlerts.map(a => (
                  <Link
                    key={a.id}
                    to="/alerts"
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      padding: '10px 12px', borderRadius: 8, marginBottom: 6,
                      background: `${getRiskColor(a.riskLevel)}0d`,
                      border: `1px solid ${getRiskColor(a.riskLevel)}25`,
                      transition: 'all 0.15s', cursor: 'pointer',
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${getRiskColor(a.riskLevel)}18`}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${getRiskColor(a.riskLevel)}0d`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <RiskBadge level={a.riskLevel} size="sm" />
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          {new Date(a.detectedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', margin: '4px 0 2px', lineHeight: 1.3 }}>
                        {a.title}
                      </p>
                      {a.lakeName && (
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>⛰ {a.lakeName}</p>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts Row ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Risk distribution */}
        <ChartCard title="Risk Distribution" subtitle={IS_LIVE ? 'Lakes by relative risk level' : 'Lakes by category (demo)'}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={charts.riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {charts.riskDistribution.map(entry => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 8, fontSize: 12,
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Alerts over time */}
        <ChartCard title={IS_LIVE ? 'Area Increases by Year' : 'Alerts Over Time'} subtitle={IS_LIVE ? 'Lakes whose area rose >12 / 25 / 40% vs the previous composite' : 'Last 7 months (demo)'}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={charts.expansionByYear} barSize={7} barGap={2}>
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={20} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="critical" name="Critical" fill="#ef4444" radius={[2, 2, 0, 0]} />
              <Bar dataKey="high" name="High" fill="#f97316" radius={[2, 2, 0, 0]} />
              <Bar dataKey="medium" name="Medium" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Satellite observations */}
        <ChartCard title="Satellite Acquisitions" subtitle={IS_LIVE ? 'Yearly composites processed (Jul 15 - Sep 30)' : 'Observations per month (demo)'}>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={charts.observationFrequency}>
              <defs>
                <linearGradient id="s2grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.cyan} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.cyan} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="s1grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.orange} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.orange} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={20} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="sentinel2" name="Sentinel-2" stroke={CHART_COLORS.cyan} fill="url(#s2grad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="sentinel1" name="Sentinel-1" stroke={CHART_COLORS.orange} fill="url(#s1grad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Top Lakes Table ───────────────────────────── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{
          padding: '12px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            High-Priority Lakes
          </span>
          <Link to="/lakes" style={{ fontSize: 12, color: 'var(--cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            View All Lakes <ArrowRight size={12} />
          </Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)' }}>
                {['Lake', 'District', 'Elevation', 'Area', 'Change', 'Risk', ''].map(h => (
                  <th key={h} style={{
                    padding: '9px 16px', textAlign: 'left',
                    color: 'var(--text-muted)', fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.06em', whiteSpace: 'nowrap',
                    borderBottom: '1px solid var(--border)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lakes
                .filter(l => l.riskLevel === 'CRITICAL' || l.riskLevel === 'HIGH')
                .slice(0, 5)
                .map(lake => (
                  <tr
                    key={lake.id}
                    style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                  >
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{lake.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lake.id}</div>
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{lake.district}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{lake.elevation.toLocaleString()} m</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-primary)' }}>{lake.currentArea.toFixed(2)} km²</td>
                    <td style={{ padding: '10px 16px', color: lake.areaChangePct > 5 ? '#f97316' : 'var(--text-secondary)', fontWeight: 500 }}>
                      +{lake.areaChangePct.toFixed(1)}%
                    </td>
                    <td style={{ padding: '10px 16px' }}><RiskBadge level={lake.riskLevel} /></td>
                    <td style={{ padding: '10px 16px' }}>
                      <Link
                        to={`/lakes/${lake.id}`}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 12, color: 'var(--cyan)', textDecoration: 'none',
                          background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
                          padding: '4px 10px', borderRadius: 6,
                        }}
                      >
                        Analyse <ArrowUpRight size={12} />
                      </Link>
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

// ── KPI Card ───────────────────────────────────────────────────
const KpiCard: React.FC<{
  icon: React.ReactNode; value: string | number;
  label: string; sub: string; color: string;
  trend?: string; trendBad?: boolean; isDate?: boolean;
}> = ({ icon, value, label, sub, color, trend, trendBad, isDate }) => (
  <div className="himnetra-card" style={{ position: 'relative', overflow: 'hidden' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color,
      }}>
        {icon}
      </div>
      {trend && (
        <span style={{
          fontSize: 11, fontWeight: 600, color: trendBad ? '#ef4444' : '#22c55e',
          background: trendBad ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
          padding: '2px 8px', borderRadius: 99,
        }}>
          {trend}
        </span>
      )}
    </div>
    <div style={{ fontSize: isDate ? 15 : 28, fontWeight: isDate ? 600 : 700, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 6 }}>
      {value}
    </div>
    <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
  </div>
);

// ── Chart Card ──────────────────────────────────────────────────
const ChartCard: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="himnetra-card" style={{ padding: '14px 16px' }}>
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{subtitle}</div>
    </div>
    {children}
  </div>
);

export default Dashboard;
