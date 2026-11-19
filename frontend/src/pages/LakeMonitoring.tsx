import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, SlidersHorizontal, ArrowUpRight, ChevronUp, ChevronDown,
} from 'lucide-react';
import { fetchLakes } from '../services/api';
import type { Lake, RiskLevel } from '../types';
import { RiskBadge } from '../components/ui/RiskBadge';
import { DemoBanner, PageHeader, Skeleton } from '../components/ui';
import { GlofMap } from '../components/maps/GlofMap';
import { formatDate } from '../utils';
import { showToast } from '../components/layout/AppLayout';

const DISTRICTS = ['All', 'Lahaul & Spiti', 'Kullu', 'Chamba', 'Kinnaur'];
const BASINS    = ['All', 'Chenab', 'Beas', 'Ravi', 'Sutlej'];
const RISKS: (RiskLevel | 'All')[] = ['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

type SortKey = 'name' | 'elevation' | 'currentArea' | 'areaChangePct' | 'riskScore';
type SortDir = 'asc' | 'desc';

export const LakeMonitoring: React.FC = () => {
  const [lakes, setLakes] = useState<Lake[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLake, setSelectedLake] = useState<Lake | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('riskScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    q: searchParams.get('q') ?? '',
    district: 'All',
    basin: 'All',
    risk: 'All' as RiskLevel | 'All',
  });

  useEffect(() => {
    fetchLakes()
      .then(setLakes)
      .catch(() => showToast('Could not load lakes from the server.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return lakes
      .filter(l => {
        const q = filters.q.toLowerCase();
        if (q && !l.name.toLowerCase().includes(q) && !l.id.toLowerCase().includes(q) && !l.district.toLowerCase().includes(q)) return false;
        if (filters.district !== 'All' && l.district !== filters.district) return false;
        if (filters.basin !== 'All' && l.basin !== filters.basin) return false;
        if (filters.risk !== 'All' && l.riskLevel !== filters.risk) return false;
        return true;
      })
      .sort((a, b) => {
        const v = (l: Lake) => l[sortKey] as number | string;
        const av = v(a), bv = v(b);
        if (typeof av === 'number' && typeof bv === 'number')
          return sortDir === 'asc' ? av - bv : bv - av;
        return sortDir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
  }, [lakes, filters, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    sortKey === k
      ? sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      : <ChevronDown size={12} style={{ opacity: 0.3 }} />
  );

  return (
    <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Lake Monitoring"
        description="Track glacial lake boundaries and area changes from satellite imagery."
        actions={<DemoBanner message="Backend API not configured — no lake records are loaded." liveMessage="Displays prepared lake outputs; there is no real-time satellite stream." />}
      />

      <div className="lake-monitoring-layout" style={{ display: 'grid', gridTemplateColumns: showFilters ? '220px 1fr' : '1fr', gap: 20, flex: 1, minHeight: 0 }}>
        {/* ── Filter Panel ─────────────────────────── */}
        {showFilters && (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 18,
            height: 'fit-content', position: 'sticky', top: 0,
          }}>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                <SlidersHorizontal size={14} style={{ display: 'inline', marginRight: 6 }} />
                Filters
              </span>
              <button
                onClick={() => setFilters({ q: '', district: 'All', basin: 'All', risk: 'All' })}
                style={{ fontSize: 11, color: 'var(--cyan)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Reset
              </button>
            </div>

            <FilterGroup label="Search">
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{
                  position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }} />
                <input
                  value={filters.q}
                  onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
                  placeholder="Lake name, ID…"
                  style={{
                    width: '100%', background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)', borderRadius: 7,
                    padding: '7px 9px 7px 28px', color: 'var(--text-primary)',
                    fontSize: 12, outline: 'none',
                  }}
                />
              </div>
            </FilterGroup>

            <FilterGroup label="District">
              {DISTRICTS.map(d => (
                <FilterChip key={d} label={d} active={filters.district === d} onClick={() => setFilters(f => ({ ...f, district: d }))} />
              ))}
            </FilterGroup>

            <FilterGroup label="Basin">
              {BASINS.map(b => (
                <FilterChip key={b} label={b} active={filters.basin === b} onClick={() => setFilters(f => ({ ...f, basin: b }))} />
              ))}
            </FilterGroup>

            <FilterGroup label="Risk Level">
              {RISKS.map(r => (
                <FilterChip key={r} label={r} active={filters.risk === r} onClick={() => setFilters(f => ({ ...f, risk: r }))} />
              ))}
            </FilterGroup>
          </div>
        )}

        {/* ── Main Content ──────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          {/* Search bar & filter toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(v => !v)}
              style={{
                background: showFilters ? 'rgba(6,182,212,0.1)' : 'var(--bg-elevated)',
                border: `1px solid ${showFilters ? 'rgba(6,182,212,0.4)' : 'var(--border)'}`,
                color: showFilters ? 'var(--cyan)' : 'var(--text-secondary)',
                borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
              }}
            >
              <SlidersHorizontal size={13} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Showing {filtered.length} of {lakes.length} lakes
            </span>
          </div>

          {/* Map */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, overflow: 'hidden', height: 300,
          }}>
            <GlofMap
              lakes={filtered}
              selectedLakeId={selectedLake?.id}
              onLakeClick={setSelectedLake}
              height="100%"
            />
          </div>

          {/* Table */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)' }}>
                    <ThCell label="Lake" sortKey="name" activeSortKey={sortKey} onSort={toggleSort}><SortIcon k="name" /></ThCell>
                    <ThCell label="Basin" />
                    <ThCell label="Elevation" sortKey="elevation" activeSortKey={sortKey} onSort={toggleSort}><SortIcon k="elevation" /></ThCell>
                    <ThCell label="Area (km²)" sortKey="currentArea" activeSortKey={sortKey} onSort={toggleSort}><SortIcon k="currentArea" /></ThCell>
                    <ThCell label="Change" sortKey="areaChangePct" activeSortKey={sortKey} onSort={toggleSort}><SortIcon k="areaChangePct" /></ThCell>
                    <ThCell label="Growth/yr" />
                    <ThCell label="Risk" sortKey="riskScore" activeSortKey={sortKey} onSort={toggleSort}><SortIcon k="riskScore" /></ThCell>
                    <ThCell label="Updated" />
                    <ThCell label="" />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i}><td colSpan={9} style={{ padding: '10px 16px' }}><Skeleton height={20} /></td></tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={9} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No lakes match current filters
                    </td></tr>
                  ) : (
                    filtered.map(lake => (
                      <tr
                        key={lake.id}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          background: selectedLake?.id === lake.id ? 'rgba(6,182,212,0.06)' : 'transparent',
                          cursor: 'pointer', transition: 'background 0.1s',
                        }}
                        onClick={() => setSelectedLake(lake)}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = selectedLake?.id === lake.id ? 'rgba(6,182,212,0.06)' : ''}
                      >
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{lake.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lake.id} · {lake.district}</div>
                        </td>
                        <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{lake.basin}</td>
                        <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{lake.elevation.toLocaleString()} m</td>
                        <td style={{ padding: '10px 16px', color: 'var(--text-primary)', fontWeight: 500 }}>{lake.currentArea.toFixed(2)}</td>
                        <td style={{ padding: '10px 16px', color: lake.areaChangePct > 5 ? '#f97316' : 'var(--text-secondary)', fontWeight: 500 }}>
                          +{lake.areaChangePct.toFixed(1)}%
                        </td>
                        <td style={{ padding: '10px 16px', color: lake.growthRate > 4 ? '#f59e0b' : 'var(--text-secondary)' }}>
                          {lake.growthRate.toFixed(1)}%/yr
                        </td>
                        <td style={{ padding: '10px 16px' }}><RiskBadge level={lake.riskLevel} /></td>
                        <td style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
                          {formatDate(lake.lastUpdated)}
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <Link
                            to={`/lakes/${lake.id}`}
                            onClick={e => e.stopPropagation()}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              fontSize: 12, color: 'var(--cyan)', textDecoration: 'none',
                              background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
                              padding: '4px 10px', borderRadius: 6, whiteSpace: 'nowrap',
                            }}
                          >
                            Analyse <ArrowUpRight size={11} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ThCell: React.FC<{
  label: string; children?: React.ReactNode;
  sortKey?: SortKey; activeSortKey?: SortKey; onSort?: (k: SortKey) => void;
}> = ({ label, children, sortKey: sk, activeSortKey, onSort }) => (
  <th
    onClick={sk ? () => onSort?.(sk) : undefined}
    style={{
      padding: '9px 16px', textAlign: 'left',
      color: activeSortKey === sk ? 'var(--cyan)' : 'var(--text-muted)',
      fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
      borderBottom: '1px solid var(--border)',
      cursor: sk ? 'pointer' : 'default',
      whiteSpace: 'nowrap',
      userSelect: 'none',
    }}
  >
    <span className="flex items-center gap-1">{label}{children}</span>
  </th>
);

const FilterGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 8 }}>{label.toUpperCase()}</div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{children}</div>
  </div>
);

const FilterChip: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 500, cursor: 'pointer',
      background: active ? 'rgba(6,182,212,0.15)' : 'var(--bg-elevated)',
      border: `1px solid ${active ? 'rgba(6,182,212,0.5)' : 'var(--border)'}`,
      color: active ? 'var(--cyan)' : 'var(--text-secondary)',
      transition: 'all 0.15s',
    }}
  >
    {label}
  </button>
);

export default LakeMonitoring;
