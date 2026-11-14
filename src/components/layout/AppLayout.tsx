import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toast } from '../ui';
import type { Notification } from '../../types';
import { MOCK_NOTIFICATIONS } from '../../services/mockData';
import { fetchNotifications } from '../../services/api';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    fetchNotifications()
      .then(setNotifications)
      .catch(() => showToast('Could not load notifications from the server.', 'error'));
  }, []);

  // Expose toast globally via window for child pages
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__himnetraToast = (msg: string, type?: 'success' | 'error' | 'info') => {
      setToast({ message: msg, type: type ?? 'info' });
      setTimeout(() => setToast(null), 4000);
    };
    return () => {
      delete (window as unknown as Record<string, unknown>).__himnetraToast;
    };
  }, []);

  const handleMarkRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Header notifications={notifications} onMarkRead={handleMarkRead} />

        <main style={{
          flex: 1,
          overflowY: 'auto',
          background: 'var(--bg-base)',
          padding: 0,
        }}>
          <Outlet />
        </main>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// Helper for child pages to show toast
export function showToast(message: string, type?: 'success' | 'error' | 'info') {
  const fn = (window as unknown as Record<string, unknown>).__himnetraToast as ((m: string, t?: string) => void) | undefined;
  fn?.(message, type);
}
