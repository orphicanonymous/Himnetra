import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle, Eye, MapPin, ArrowUpRight, UserPlus, Send } from 'lucide-react';
import {
  acknowledgeAlert,
  fetchAlerts,
  fetchLakes,
  IS_LIVE,
  notifyNearbySubscribers,
  registerSubscriber,
} from '../services/api';
import type { Alert, Lake, RiskLevel } from '../types';
import { RiskBadge } from '../components/ui/RiskBadge';
import { DemoBanner, PageHeader, StatCard } from '../components/ui';
import { formatDateTime, timeAgo, getRiskColor } from '../utils';
import { showToast } from '../components/layout/AppLayout';

type Filter = 'ALL' | RiskLevel | 'RESOLVED';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lakes, setLakes] = useState<Lake[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [loading, setLoading] = useState(true);
  const [subscriber, setSubscriber] = useState({ name: '', email: '', phone: '' });
  const [subscriberLocation, setSubscriberLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [locationMode, setLocationMode] = useState<'device' | 'manual'>('device');
  const [manualCoordinates, setManualCoordinates] = useState({ lat: '', lng: '' });
  const [locationBusy, setLocationBusy] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [subscriberBusy, setSubscriberBusy] = useState(false);
  const [dispatchLakeId, setDispatchLakeId] = useState('');
  const [radiusKm, setRadiusKm] = useState(30);
  const [dispatchBusy, setDispatchBusy] = useState(false);
  const [dispatchSummary, setDispatchSummary] = useState('');

  const manualLat = Number(manualCoordinates.lat);
  const manualLng = Number(manualCoordinates.lng);
  const manualLocationValid =
    manualCoordinates.lat.trim() !== '' &&
    manualCoordinates.lng.trim() !== '' &&
    Number.isFinite(manualLat) &&
    Number.isFinite(manualLng) &&
    manualLat >= -90 &&
    manualLat <= 90 &&
    manualLng >= -180 &&
    manualLng <= 180;
  const registrationLocation = locationMode === 'device'
    ? subscriberLocation
    : manualLocationValid ? { lat: manualLat, lng: manualLng } : null;

  useEffect(() => {
    fetchAlerts()
      .then(setAlerts)
      .catch(() => showToast('Could not load alerts from the server.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchLakes()
      .then(items => {
        setLakes(items);
        setDispatchLakeId(items[0]?.id ?? '');
      })
      .catch(() => showToast('Could not load lakes for community alerts.', 'error'));
  }, []);

  const requestSubscriberLocation = () => {
    setSubscriberLocation(null);
    setLocationError('');

    if (!window.isSecureContext) {
      const message = 'Location access requires HTTPS or localhost.';
      setLocationError(message);
      showToast(message, 'error');
      return;
    }

    if (!navigator.geolocation) {
      const message = 'This browser does not support location access.';
      setLocationError(message);
      showToast(message, 'error');
      return;
    }

    setLocationBusy(true);
    try {
      navigator.geolocation.getCurrentPosition(
        position => {
          setSubscriberLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          setLocationBusy(false);
        },
        error => {
          const message = error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied. Allow access in your browser site settings, then try again.'
            : error.code === error.POSITION_UNAVAILABLE
              ? 'Your device could not determine your location. Check its location settings and try again.'
              : error.code === error.TIMEOUT
                ? 'The location request timed out. Try again.'
                : 'Unable to determine your location. Check your device settings and try again.';
          setLocationError(message);
          setLocationBusy(false);
          showToast(message, 'error');
        },
        { enableHighAccuracy: false, maximumAge: 60_000, timeout: 15_000 },
      );
    } catch (error) {
      const message = error instanceof Error
        ? `Could not request location: ${error.message}`
        : 'Could not request location. Check your browser settings and try again.';
      setLocationError(message);
      setLocationBusy(false);
      showToast(message, 'error');
    }
  };

  const registerCommunityMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subscriber.email.trim() && !subscriber.phone.trim()) {
      showToast('Enter an email address or phone number.', 'error');
      return;
    }
    if (!registrationLocation) {
      showToast(locationMode === 'device'
        ? 'Allow location access before registering this contact.'
        : 'Enter valid latitude and longitude coordinates before registering.',
      'error');
      return;
    }

    setSubscriberBusy(true);
    try {
      await registerSubscriber({
        name: subscriber.name.trim(),
        ...(subscriber.email.trim() ? { email: subscriber.email.trim() } : {}),
        ...(subscriber.phone.trim() ? { phone: subscriber.phone.trim() } : {}),
        lat: registrationLocation.lat,
        lng: registrationLocation.lng,
      });
      setSubscriber({ name: '', email: '', phone: '' });
      setSubscriberLocation(null);
      setManualCoordinates({ lat: '', lng: '' });
      setLocationMode('device');
      showToast('Community contact registered on the backend.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not register this contact.', 'error');
    } finally {
      setSubscriberBusy(false);
    }
  };

  const dispatchCommunityAlert = async () => {
    const lake = lakes.find(item => item.id === dispatchLakeId);
    if (!lake) return;
    const confirmed = window.confirm(
      `Send a HIMNETRA risk notice to subscribers within ${radiusKm} km of ${lake.name}? Configured email/SMS services may deliver real messages.`
    );
    if (!confirmed) return;

    setDispatchBusy(true);
    setDispatchSummary('');
    try {
      const delivery = await notifyNearbySubscribers(lake.id, radiusKm);
      const outcomes = delivery.results.flatMap(result => [result.email, result.sms]).filter(Boolean);
      const sent = outcomes.filter(result => result === 'sent').length;
      const dryRun = outcomes.filter(result => result?.startsWith('dry-run')).length;
      const failed = outcomes.filter(result => result?.startsWith('failed')).length;
      const failureDetails = [...new Set(outcomes.filter(result => result?.startsWith('failed')))];
      const summary = delivery.recipients === 0
        ? `No subscribers found within ${radiusKm} km of ${lake.name}.`
        : `${delivery.recipients} subscriber(s) matched; ${sent} message(s) sent, ${dryRun} dry-run, ${failed} failed.${failureDetails.length ? ` Details: ${failureDetails.join('; ')}.` : ''}`;
      setDispatchSummary(summary);
      showToast(summary, failed ? 'error' : 'info');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not dispatch the alert.', 'error');
    } finally {
      setDispatchBusy(false);
    }
  };

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
      <PageHeader
        title="Early Warning & Alerts"
        description="AI-detected anomalies and risk escalations for monitored glacial lakes."
        icon={<Bell size={18} />}
        actions={<DemoBanner message="Backend API not configured — no alert records are loaded." liveMessage="Alerts are rule-based from prepared lake and time-series outputs; they are not generated from a live feed. Verify on the ground before acting." />}
      />

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Active Alerts', val: counts.active, color: 'var(--cyan)' },
          { label: 'Critical', val: counts.critical, color: '#ef4444' },
          { label: 'High Risk', val: counts.high, color: '#f97316' },
          { label: 'Resolved', val: counts.resolved, color: '#22c55e' },
        ].map(({ label, val, color }) => (
          <StatCard key={label} value={val} label={label} accent={color} compact />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
        <section className="himnetra-card" style={{ padding: 18 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
            <UserPlus size={16} style={{ color: 'var(--cyan)' }} />
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Community Subscription</h2>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14 }}>
            Register a contact and location for manually dispatched notices within a lake radius.
          </p>
          {!IS_LIVE && (
            <p style={{ fontSize: 11, color: '#f59e0b', marginBottom: 12 }}>
              Connect the FastAPI backend to save contacts or deliver alerts.
            </p>
          )}
          <form onSubmit={registerCommunityMember} style={{ display: 'grid', gap: 9 }}>
            <input
              aria-label="Subscriber name"
              placeholder="Name"
              required
              maxLength={100}
              value={subscriber.name}
              onChange={event => setSubscriber(prev => ({ ...prev, name: event.target.value }))}
              style={inputStyle}
            />
            <input
              aria-label="Email address"
              type="email"
              placeholder="Email (optional)"
              value={subscriber.email}
              onChange={event => setSubscriber(prev => ({ ...prev, email: event.target.value }))}
              style={inputStyle}
            />
            <input
              aria-label="Phone number"
              type="tel"
              placeholder="Phone (optional, include country code)"
              value={subscriber.phone}
              onChange={event => setSubscriber(prev => ({ ...prev, phone: event.target.value }))}
              style={inputStyle}
            />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Choose your device location or enter coordinates for a location near a monitored lake.
            </p>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-secondary)' }}>
              <input
                type="radio"
                name="subscriber-location-mode"
                checked={locationMode === 'device'}
                onChange={() => {
                  setLocationMode('device');
                  setLocationError('');
                }}
              />
              Use current device location
            </label>
            {locationMode === 'device' && (
              <>
                <button
                  type="button"
                  onClick={requestSubscriberLocation}
                  disabled={locationBusy || subscriberBusy}
                  style={actionButtonStyle(locationBusy || subscriberBusy)}
                >
                  <MapPin size={13} /> {locationBusy ? 'Getting location…' : subscriberLocation ? 'Refresh location' : 'Request device location'}
                </button>
                {subscriberLocation && (
                  <p role="status" style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
                    Location captured (estimated accuracy: {Math.round(subscriberLocation.accuracy)} m). It is sent when you register.
                  </p>
                )}
              </>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-secondary)' }}>
              <input
                type="radio"
                name="subscriber-location-mode"
                checked={locationMode === 'manual'}
                onChange={() => {
                  setLocationMode('manual');
                  setLocationError('');
                }}
              />
              Enter a location manually
            </label>
            {locationMode === 'manual' && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  aria-label="Latitude"
                  type="number"
                  min={-90}
                  max={90}
                  step="any"
                  placeholder="Latitude (-90 to 90)"
                  required
                  value={manualCoordinates.lat}
                  onChange={event => setManualCoordinates(prev => ({ ...prev, lat: event.target.value }))}
                  style={inputStyle}
                />
                <input
                  aria-label="Longitude"
                  type="number"
                  min={-180}
                  max={180}
                  step="any"
                  placeholder="Longitude (-180 to 180)"
                  required
                  value={manualCoordinates.lng}
                  onChange={event => setManualCoordinates(prev => ({ ...prev, lng: event.target.value }))}
                  style={inputStyle}
                />
              </div>
            )}
            {locationMode === 'manual' && (manualCoordinates.lat || manualCoordinates.lng) && !manualLocationValid && (
              <p role="alert" style={{ fontSize: 11, color: '#ef4444', margin: 0 }}>
                Enter a valid latitude (-90 to 90) and longitude (-180 to 180).
              </p>
            )}
            {locationError && <p role="alert" style={{ fontSize: 11, color: '#ef4444', margin: 0 }}>{locationError}</p>}
            <button
              type="submit"
              disabled={!IS_LIVE || subscriberBusy || !registrationLocation}
              style={actionButtonStyle(!IS_LIVE || subscriberBusy || !registrationLocation)}
            >
              <UserPlus size={13} /> {subscriberBusy ? 'Saving…' : 'Register contact'}
            </button>
          </form>
        </section>

        <section className="himnetra-card" style={{ padding: 18 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
            <Send size={16} style={{ color: '#f97316' }} />
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Manual Geofenced Alert</h2>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14 }}>
            This does not auto-trigger from risk changes. It uses the configured SMTP/Twilio services, if present.
          </p>
          <div style={{ display: 'grid', gap: 9 }}>
            <select
              aria-label="Lake for community alert"
              value={dispatchLakeId}
              onChange={event => setDispatchLakeId(event.target.value)}
              style={inputStyle}
              disabled={!lakes.length}
            >
              {lakes.map(lake => <option key={lake.id} value={lake.id}>{lake.name} ({lake.riskLevel})</option>)}
            </select>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              Radius: {radiusKm} km
              <input
                type="range"
                min={1}
                max={100}
                value={radiusKm}
                onChange={event => setRadiusKm(Number(event.target.value))}
                style={{ width: '100%', accentColor: '#f97316' }}
                aria-label="Notification radius in kilometers"
              />
            </label>
            <button
              type="button"
              onClick={dispatchCommunityAlert}
              disabled={!IS_LIVE || !dispatchLakeId || dispatchBusy}
              style={actionButtonStyle(!IS_LIVE || !dispatchLakeId || dispatchBusy)}
            >
              <Send size={13} /> {dispatchBusy ? 'Dispatching…' : 'Review and send notice'}
            </button>
            {dispatchSummary && <p role="status" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{dispatchSummary}</p>}
          </div>
        </section>
      </div>

      <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 20 }}>
        Prototype privacy notice: subscriber contact details and browser-provided coordinates are stored in the backend JSON state file.
        This backend has no authentication; only use test contacts on a trusted local deployment, not a public server.
      </p>

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

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 7,
  padding: '9px 10px',
  color: 'var(--text-primary)',
  fontSize: 12,
  fontFamily: 'Inter,sans-serif',
  outline: 'none',
};

const actionButtonStyle = (disabled: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '9px 12px',
  borderRadius: 7,
  border: '1px solid var(--border)',
  background: disabled ? 'var(--bg-elevated)' : 'rgba(6,182,212,0.12)',
  color: disabled ? 'var(--text-muted)' : 'var(--cyan)',
  fontSize: 12,
  fontWeight: 600,
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'Inter,sans-serif',
});
