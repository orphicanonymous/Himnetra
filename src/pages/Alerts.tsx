import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle, Eye, MapPin, ArrowUpRight } from 'lucide-react';
import { fetchAlerts, acknowledgeAlert } from '../services/api';
import type { Alert, RiskLevel } from '../types';
import { RiskBadge } from '../components/ui/RiskBadge';
import { DemoBanner } from '../components/ui';
import { formatDateTime, timeAgo, getRiskColor } from '../utils';
import { showToast } from '../components/layout/AppLayout';

type Filter = 'ALL' | RiskLevel | 'RESOLVED';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts()
      .then(setAlerts)
      .catch(() => showToast('Could not load alerts from the server.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const acknowledge = async (id: string) => {
    try {
      await acknowledgeAlert(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true, status: 'ACKNOWLEDGED' as Alert['status'] } : a));
      showToast('Alert acknowledged.', 'success');
    } catch {
      showToast('Could not save acknowledgement on the server.', 'error');
    }
  };

  const filtered = alerts.filter(a => {
    if (filter === 'ALL') return true;
    if (filter === 'RESOLVED') return a.status === 'RESOLVED' || a.status === 'ACKNOWLEDGED';
    return a.riskLevel === filter && a.status !== 'RESOLVED' && a.status !== 'ACKNOWLEDGED';
  });

  const counts = {
    active: alerts.filter(a => a.status === 'ACTIVE').length,
    critical: alerts.filter(a => a.riskLevel === 'CRITICAL' && a.status === 'ACTIVE').length,
    high: alerts.filter(a => a.riskLevel === 'HIGH' && a.status !== 'RESOLVED').length,
    resolved: alerts.filter(a => a.status === 'RESOLVED' || a.status === 'ACKNOWLEDGED').length,
  };

  return (
    <div style={{ padding: 24, minHeight: '100%' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Bell size={18} style={{ color: 'var(--cyan)' }} />
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Early Warning & Alerts</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            AI-detected anomalies and risk escalations for monitored glacial lakes.
          </p>
        </div>
        <DemoBanner message="Demo Alerts — Prototype notifications, not real-time detections." liveMessage="Alerts are computed from the latest lake data (risk level, area change). Verify on the ground before acting." />
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Active Alerts', val: counts.active, color: 'var(--cyan)' },
          { label: 'Critical', val: counts.critical, color: '#ef4444' },
          { label: 'High Risk', val: counts.high, color: '#f97316' },
          { label: 'Resolved', val: counts.resolved, color: '#22c55e' },
        ].map(({ label, val, color }) => (
          <div key={label} className="himnetra-card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1, marginBottom: 6 }}>{val}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 20,
        borderBottom: '1px solid var(--border)', paddingBottom: 0, overflowX: 'auto',
      }}>
        {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'RESOLVED'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 18px', border: 'none', cursor: 'pointer',
              background: 'transparent', fontSize: 13, fontWeight: 500,
              color: filter === f ? 'var(--cyan)' : 'var(--text-secondary)',
              borderBottom: `2px solid ${filter === f ? 'var(--cyan)' : 'transparent'}`,
              marginBottom: -1, whiteSpace: 'nowrap',
              fontFamily: 'Inter,sans-serif', transition: 'all 0.15s',
            }}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            {f !== 'RESOLVED' && f !== 'ALL' && (
              <span style={{
                marginLeft: 8, fontSize: 10, padding: '1px 7px', borderRadius: 99,
                background: 'var(--bg-elevated)', color: 'var(--text-muted)',
              }}>
                {f === 'CRITICAL' ? counts.critical : f === 'HIGH' ? counts.high : alerts.filter(a => a.riskLevel === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alert feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} style={{ height: 120, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }} />
          ))
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontSize: 14 }}>
            No alerts in this category.
          </div>
        ) : (
          filtered.map(alert => (
            <AlertCard key={alert.id} alert={alert} onAcknowledge={acknowledge} />
          ))
        )}
      </div>
    </div>
  );
};

// ── Alert Card ──────────────────────────────────────────────
const AlertCard: React.FC<{ alert: Alert; onAcknowledge: (id: string) => void }> = ({ alert, onAcknowledge }) => {
  const color = getRiskColor(alert.riskLevel);
  const isResolved = alert.status === 'RESOLVED' || alert.status === 'ACKNOWLEDGED';

  const typeLabel: Record<Alert['type'], string> = {
    GLOF_RISK: 'GLOF Risk Alert',
    RAPID_EXPANSION: 'Rapid Expansion',
    ANOMALY: 'Boundary Anomaly',
    SIMULATION: 'Simulation Complete',
    DATA_UPDATE: 'Data Update',
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${isResolved ? 'var(--border)' : `${color}30`}`,
        borderLeft: `3px solid ${isResolved ? 'var(--border)' : color}`,
        borderRadius: 12, padding: '16px 20px',
        opacity: isResolved ? 0.65 : 1,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16 }}>
        <div>
          {/* Top row */}
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <RiskBadge level={alert.riskLevel} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{alert.title}</span>
            {isResolved && (
              <span style={{ fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={12} /> {alert.status === 'ACKNOWLEDGED' ? 'Acknowledged' : 'Resolved'}
              </span>
            )}
            {!isResolved && alert.status === 'ACTIVE' && (
              <span style={{
                fontSize: 10, fontWeight: 600, color, letterSpacing: '0.08em',
                background: `${color}12`, border: `1px solid ${color}30`,
                padding: '2px 8px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span className="animate-pulse-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block' }} />
                ACTIVE
              </span>
            )}
            {alert.status === 'MONITORING' && (
              <span style={{ fontSize: 10, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', padding: '2px 8px', borderRadius: 99 }}>
                MONITORING
              </span>
            )}
          </div>

          {/* Type + Lake */}
          <div className="flex items-center gap-4 mb-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: 12 }}>{typeLabel[alert.type]}</span>
            {alert.lakeName && (
              <>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span className="flex items-center gap-1" style={{ fontSize: 12 }}>
                  <MapPin size={11} style={{ color: 'var(--cyan)' }} />
                  {alert.lakeName}
                </span>
              </>
            )}
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10, maxWidth: 620 }}>
            {alert.description}
          </p>

          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Detected: {formatDateTime(alert.detectedAt)}
            {alert.updatedAt !== alert.detectedAt && (
              <span style={{ marginLeft: 12 }}>Updated: {timeAgo(alert.updatedAt)}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 130 }}>
          {alert.lakeId && (
            <>
              <Link
                to={`/lakes/${alert.lakeId}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 14px', borderRadius: 7,
                  background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)',
                  color: 'var(--cyan)', textDecoration: 'none', fontSize: 12, fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                <Eye size={12} /> View Lake
              </Link>
              <Link
                to={`/flood?lake=${alert.lakeId}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 14px', borderRadius: 7,
                  background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)',
                  color: '#f97316', textDecoration: 'none', fontSize: 12, fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                <ArrowUpRight size={12} /> Flood Map
              </Link>
            </>
          )}
          {!isResolved && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              style={{
                padding: '7px 14px', borderRadius: 7, cursor: 'pointer',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500,
                fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', gap: 5,
                whiteSpace: 'nowrap',
              }}
            >
              <CheckCircle size={12} /> Acknowledge
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
