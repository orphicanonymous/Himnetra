import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers, ShieldAlert, AlertTriangle, TrendingUp,
  Satellite, RefreshCw, ArrowUpRight, ArrowRight,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { GlofMap } from '../components/maps/GlofMap';
import { RiskBadge } from '../components/ui/RiskBadge';
import { Button, DemoBanner, PageFrame, PageHeader, SectionCard, Skeleton, StatCard } from '../components/ui';
import {
  fetchLakes, fetchDashboardStats, fetchAlerts, fetchDashboardCharts, fetchDataFreshness,
} from '../services/api';
import type { Lake, Alert, DashboardCharts, DataFreshness } from '../types';
import { getRiskColor, formatDate, formatDateTime } from '../utils';

const REFRESH_INTERVAL_MS = 60_000;
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
  const [charts, setCharts] = useState<DashboardCharts>({ riskDistribution: [], expansionByYear: [] });
  const [freshness, setFreshness] = useState<DataFreshness | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [selectedLake, setSelectedLake] = useState<Lake | null>(null);
  const refreshInFlight = useRef(false);

  const refreshDashboard = useCallback(async () => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    setRefreshing(true);
    try {
      const [l, s, a, c, f] = await Promise.all([
        fetchLakes(), fetchDashboardStats(), fetchAlerts(), fetchDashboardCharts(), fetchDataFreshness(),
      ]);
      setLakes(l);
      setStats(s);
      setAlerts(a);
      setCharts(c);
      setFreshness(f);
      setLastChecked(new Date());
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load dashboard data from the server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      refreshInFlight.current = false;
    }
  }, []);

  useEffect(() => {
    void refreshDashboard();
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refreshDashboard();
    }, REFRESH_INTERVAL_MS);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void refreshDashboard();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshDashboard]);

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');

  return (
    <PageFrame>
      <PageHeader
        title="Glacial Lake Risk Overview"
        description="Prepared model outputs for high-altitude glacial lakes across Himachal Pradesh."
        meta={<span aria-live="polite">
            {lastChecked
              ? `Backend checked at ${lastChecked.toLocaleTimeString()} · auto-refreshes every minute while this tab is open`
              : 'Connecting to the backend…'}
          </span>}
        actions={<>
          <DemoBanner message="Backend API not configured — no model data is loaded." liveMessage="Prepared pipeline outputs only; this is not a live monitoring feed." />
          <Button
            onClick={() => void refreshDashboard()}
            disabled={refreshing}
            variant="secondary"
            aria-label="Refresh dashboard data"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : undefined} />
            {refreshing ? 'Updating…' : 'Refresh'}
          </Button>
        </>}
      />

      {freshness && (
        <details style={{ marginBottom: 16, color: 'var(--text-muted)', fontSize: 11 }}>
          <summary style={{ cursor: 'pointer' }}>
            Prepared file freshness · {freshness.files.filter(file => file.available).length}/{freshness.files.length} files available
          </summary>
          <p style={{ margin: '8px 0' }}>
            File modification time is not the satellite acquisition time. The dashboard checks for changed files every minute.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
            {freshness.files.map(file => (
              <span key={file.file}>
                {file.name}: {file.available && file.lastModified ? formatDateTime(file.lastModified) : 'not available'}
              </span>
            ))}
          </div>
        </details>
      )}
      {loadError && (
        <div role="alert" style={{ marginBottom: 16, color: '#ef4444', fontSize: 13 }}>
          {lastChecked
            ? `Refresh failed; showing data from ${lastChecked.toLocaleTimeString()}. ${loadError}`
            : `Dashboard data is unavailable. ${loadError}`}
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
            <StatCard icon={<Layers size={20} />} value={stats?.totalLakes ?? 0} label="Lakes in Dataset" description={stats?.monitoringRegion ?? 'Prepared outputs'} />
            <StatCard icon={<ShieldAlert size={20} />} value={stats?.highRiskLakes ?? 0} label="High Risk Lakes" description="Prepared risk classifications" accent="#f97316" />
            <StatCard icon={<AlertTriangle size={20} />} value={stats?.mediumRiskLakes ?? 0} label="Medium Risk" description="Prepared risk classifications" accent="#f59e0b" />
            <StatCard icon={<TrendingUp size={20} />} value={stats?.criticalAlerts ?? 0} label="Critical Alerts" description="Currently active risk alerts" accent="#ef4444" />
            <StatCard icon={<Satellite size={20} />} value={formatDate(stats?.latestDataDate ?? '')} label="Latest Prepared Data" description="Record date, not acquisition status" smallValue />
          </>
        )}
      </div>

      {/* ── Map + Active Alerts ───────────────────────── */}
      <div className="dashboard-map-alerts" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 24 }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Risk distribution */}
        <SectionCard title="Risk Distribution" description="Prepared lake counts by relative risk level">
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
        </SectionCard>

        {/* Alerts over time */}
        <SectionCard title="Area Increases by Year" description="Counts of lakes whose area rose >12 / 25 / 40% between composites">
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
        </SectionCard>

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
                      {lake.areaChangePct > 0 ? '+' : ''}{lake.areaChangePct.toFixed(1)}%
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
    </PageFrame>
  );
};

export default Dashboard;
