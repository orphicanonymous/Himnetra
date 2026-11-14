import { IS_LIVE } from '../../services/api';
import React from 'react';

export const DemoBanner: React.FC<{ message?: string; liveMessage?: string }> = ({
  message = 'DEMO MODE — Values shown are prototype/mock data. Live satellite & backend services not yet connected.',
  liveMessage,
}) => {
  // With the backend connected the banner is hidden, unless the page gives a note that still applies.
  if (IS_LIVE && !liveMessage) return null;
  return (
    <div className="demo-banner flex items-center gap-2">
      <span style={{ fontWeight: 700, letterSpacing: '0.08em' }}>{IS_LIVE ? 'ℹ NOTE' : '⬡ DEMO'}</span>
      <span>{IS_LIVE ? liveMessage : message}</span>
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string; height?: number | string; width?: number | string }> = ({
  className = '',
  height = 16,
  width = '100%',
}) => (
  <div
    className={`skeleton ${className}`}
    style={{ height, width }}
  />
);

interface StatusDotProps {
  status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
  label?: string;
}
export const StatusDot: React.FC<StatusDotProps> = ({ status, label }) => {
  const color = status === 'OPERATIONAL' ? '#22c55e' : status === 'DEGRADED' ? '#f59e0b' : '#ef4444';
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="animate-pulse-dot"
        style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }}
      />
      {label && <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{label}</span>}
    </span>
  );
};

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}
export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const bg = type === 'success' ? 'rgba(34,197,94,0.15)' : type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(6,182,212,0.15)';
  const border = type === 'success' ? 'rgba(34,197,94,0.4)' : type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(6,182,212,0.4)';
  const color = type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#06b6d4';
  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        background: bg, border: `1px solid ${border}`, borderRadius: 10,
        padding: '12px 20px', color, display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)', minWidth: 280, maxWidth: 420,
      }}
    >
      <span style={{ flex: 1, fontSize: 13 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color, cursor: 'pointer', padding: 0, fontSize: 16 }}>✕</button>
    </div>
  );
};

export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; description?: string }> = ({
  icon,
  title,
  description,
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {icon && <div style={{ color: 'var(--text-muted)', marginBottom: 12 }}>{icon}</div>}
    <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: 15, marginBottom: 6 }}>{title}</p>
    {description && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{description}</p>}
  </div>
);
