import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell, Search, User, MapPin, Wifi, ChevronDown, X, ExternalLink,
} from 'lucide-react';
import type { Notification } from '../../types';
import { timeAgo } from '../../utils';
import { StatusDot } from '../ui';

interface HeaderProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ notifications, onMarkRead }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const notifsRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const typeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ALERT':  return '⚠';
      case 'DATA':   return '🛰';
      case 'REPORT': return '📄';
      case 'SYSTEM': return '⚙';
    }
  };

  return (
    <header style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexShrink: 0,
    }}>
      {/* Location */}
      <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
        <MapPin size={14} style={{ color: 'var(--cyan)' }} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Himachal Pradesh, India</span>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2" style={{
        background: 'rgba(34,197,94,0.08)',
        border: '1px solid rgba(34,197,94,0.2)',
        borderRadius: 6,
        padding: '4px 10px',
      }}>
        <StatusDot status="OPERATIONAL" />
        <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 500 }}>Monitoring Active</span>
      </div>

      {/* Last update */}
      <div className="hidden md:flex items-center gap-1.5" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
        <Wifi size={13} style={{ color: 'var(--cyan-dim)' }} />
        Last updated: <span style={{ color: 'var(--text-secondary)' }}>2 hours ago</span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Search */}
      <div style={{ position: 'relative' }}>
        {showSearch ? (
          <div className="animate-fade-in flex items-center gap-2" style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '6px 12px',
            width: 260,
          }}>
            <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && query.trim()) {
                  navigate(`/lakes?q=${encodeURIComponent(query.trim())}`);
                  setQuery('');
                  setShowSearch(false);
                }
                if (e.key === 'Escape') { setShowSearch(false); setQuery(''); }
              }}
              placeholder="Search lakes, districts…"
              style={{
                background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 13, flex: 1,
              }}
            />
            <button onClick={() => { setShowSearch(false); setQuery(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '6px 12px', color: 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
            }}
          >
            <Search size={14} />
            <span className="hidden md:inline">Search…</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      <div ref={notifsRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setShowNotifs(v => !v)}
          style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '6px 10px', color: 'var(--text-secondary)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative',
          }}
        >
          <Bell size={16} />
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4, width: 17, height: 17,
              background: 'var(--risk-critical)', borderRadius: '50%',
              fontSize: 10, fontWeight: 700, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--bg-surface)',
            }}>
              {unread}
            </span>
          )}
        </button>

        {showNotifs && (
          <div className="animate-fade-in" style={{
            position: 'absolute', right: 0, top: '110%',
            width: 340, background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', borderRadius: 10,
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 200,
          }}>
            <div style={{
              padding: '12px 16px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>Notifications</span>
              {unread > 0 && (
                <span style={{ fontSize: 11, color: 'var(--cyan)', background: 'rgba(6,182,212,0.12)', padding: '2px 8px', borderRadius: 99 }}>
                  {unread} unread
                </span>
              )}
            </div>
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => onMarkRead(n.id)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    background: n.read ? 'transparent' : 'rgba(6,182,212,0.04)',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(6,182,212,0.04)')}
                >
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{typeIcon(n.type)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{n.title}</span>
                      {!n.read && (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', flexShrink: 0, display: 'inline-block' }} />
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '3px 0 4px', lineHeight: 1.4 }}>{n.message}</p>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(n.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)' }}>
              <Link
                to="/alerts"
                onClick={() => setShowNotifs(false)}
                style={{ fontSize: 12, color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
              >
                View all alerts <ExternalLink size={11} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* User */}
      <button style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '6px 12px', color: 'var(--text-secondary)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--cyan-dim), var(--cyan))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <User size={13} style={{ color: '#fff' }} />
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-primary)' }} className="hidden md:inline">Analyst</span>
        <ChevronDown size={13} />
      </button>
    </header>
  );
};
