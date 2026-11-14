import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Layers, Brain, Waves, Bell, Satellite, FileText,
  Settings, HelpCircle, ChevronLeft, ChevronRight, Mountain,
} from 'lucide-react';
import { StatusDot } from '../ui';
import { fetchSystemStatus, IS_LIVE } from '../../services/api';
import type { SystemService } from '../../types';
import { MOCK_SYSTEM_SERVICES } from '../../services/mockData';

const NAV_ITEMS = [
  { path: '/dashboard',   label: 'Overview',         icon: LayoutDashboard },
  { path: '/lakes',       label: 'Lake Monitoring',  icon: Layers },
  { path: '/risk',        label: 'Risk Intelligence', icon: Brain },
  { path: '/flood',       label: 'Flood Simulation', icon: Waves },
  { path: '/alerts',      label: 'Alerts',           icon: Bell },
  { path: '/satellite',   label: 'Satellite Data',   icon: Satellite },
  { path: '/reports',     label: 'Reports',          icon: FileText },
];

const BOTTOM_ITEMS = [
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/help',     label: 'Help',     icon: HelpCircle },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const [services, setServices] = useState<SystemService[]>(MOCK_SYSTEM_SERVICES);
  const [statusUnavailable, setStatusUnavailable] = useState(false);
  useEffect(() => {
    fetchSystemStatus()
      .then(setServices)
      .catch(() => setStatusUnavailable(true));
  }, []);
  const allOperational = !statusUnavailable && services.every(s => s.status === 'OPERATIONAL');

  return (
    <aside style={{
      width: collapsed ? 60 : 230,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s ease',
      position: 'relative',
      flexShrink: 0,
      height: '100vh',
      overflowX: 'hidden',
      overflowY: 'auto',
    }}>

      {/* Logo */}
      <div style={{
        padding: collapsed ? '18px 0' : '18px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        justifyContent: collapsed ? 'center' : 'flex-start',
        flexShrink: 0,
      }}>
        {/* Logo Mark */}
        <div style={{
          width: 36, height: 36,
          background: 'linear-gradient(135deg, #0e7490, #06b6d4)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 12px rgba(6,182,212,0.25)',
        }}>
          <Mountain size={20} color="#fff" strokeWidth={2} />
        </div>

        {!collapsed && (
          <div className="animate-fade-in">
            <div style={{
              fontWeight: 800, fontSize: 16, letterSpacing: '0.12em',
              color: '#e2e8f0',
              fontFamily: 'Inter, sans-serif',
            }}>
              HIM<span style={{ color: 'var(--cyan)' }}>NETRA</span>
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em', marginTop: -1 }}>
              AI GLOF MONITORING
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {!collapsed && (
          <div style={{ padding: '4px 20px 8px', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: 600 }}>
            NAVIGATION
          </div>
        )}
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            title={collapsed ? label : undefined}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: collapsed ? '10px 0' : '9px 20px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              textDecoration: 'none',
              color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(6,182,212,0.08)' : 'transparent',
              borderLeft: isActive && !collapsed ? '2px solid var(--cyan)' : '2px solid transparent',
              fontSize: 13,
              fontWeight: isActive ? 500 : 400,
              transition: 'all 0.15s',
              position: 'relative',
            })}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              if (!el.style.color.includes('06b6d4')) {
                el.style.background = 'var(--bg-hover)';
                el.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              if (!el.style.color.includes('06b6d4')) {
                el.style.background = 'transparent';
                el.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <Icon size={17} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* System status */}
      {!collapsed && (
        <div style={{
          margin: '0 12px 12px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '10px 12px',
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 600 }}>
            SYSTEM STATUS
          </div>
          {services.slice(0, 3).map(svc => (
            <div key={svc.name} className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{svc.name}</span>
              <StatusDot status={svc.status} />
            </div>
          ))}
          <div style={{
            marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-subtle)',
            fontSize: 10, color: allOperational ? '#22c55e' : '#f59e0b',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
            {statusUnavailable ? 'Backend status unavailable' : allOperational ? 'All systems operational' : 'Degraded services'}
          </div>
          <div style={{ marginTop: 6, fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            {statusUnavailable ? 'Could not load live system status' : IS_LIVE ? 'LIVE BACKEND' : 'DEMO MODE — backend not connected'}
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '8px 0', flexShrink: 0 }}>
        {BOTTOM_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            title={collapsed ? label : undefined}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '9px 0' : '9px 20px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              textDecoration: 'none',
              color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
              fontSize: 13, transition: 'all 0.15s',
            })}
          >
            <Icon size={16} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute', right: -12, top: 72,
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>
    </aside>
  );
};
