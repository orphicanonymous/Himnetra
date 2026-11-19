import React from 'react';
import {
  Activity,
  Bell,
  CheckCircle,
  Clock3,
  Database,
  Radio,
  Satellite,
  ShieldAlert,
  Waves,
} from 'lucide-react';
import { DemoBanner, PageHeader, SectionCard } from '../components/ui';

const sensorPlan = [
  {
    icon: Waves,
    title: 'Lake level and water pressure',
    detail: 'Install suitable water-level or pressure sensors at selected lakes; measure lake-level changes at a defined interval.',
  },
  {
    icon: Activity,
    title: 'Rainfall and weather',
    detail: 'Use local rain gauges and weather observations to capture short-duration events that coarse regional datasets may miss.',
  },
  {
    icon: Radio,
    title: 'Seismic and slope movement',
    detail: 'Evaluate seismometers or ground-movement sensors at relevant sites, with expert review to separate useful signals from noise.',
  },
  {
    icon: Satellite,
    title: 'Satellite observations',
    detail: 'Automate scheduled imagery discovery and processing to complement, not replace, continuous in-situ measurements.',
  },
];

const systemPlan = [
  {
    number: '01',
    title: 'Field equipment and power',
    detail: 'Select rugged, cold-weather-rated equipment; assess solar/battery power, calibration, safe mounting, maintenance access, and redundancy.',
  },
  {
    number: '02',
    title: 'Reliable telemetry',
    detail: 'Survey actual coverage first. Choose a suitable link such as LoRaWAN to a gateway, cellular where available, or satellite backhaul where terrestrial service is absent.',
  },
  {
    number: '03',
    title: 'Live ingestion and storage',
    detail: 'Add authenticated device ingestion (for example MQTT), timestamped time-series storage, data-quality checks, device-health monitoring, and an API for the dashboard.',
  },
  {
    number: '04',
    title: 'Validated alerts and response',
    detail: 'Define thresholds with domain and disaster-management experts; test sensor faults, outages, escalation, acknowledgement, audit history, and delivery before any operational use.',
  },
];

const roadmap = [
  'Pilot a small number of stations at an accessible site; establish a manual baseline and verify sensor readings.',
  'Measure data availability, latency, accuracy, maintenance needs, and communications outages through multiple weather conditions.',
  'Integrate verified sensor streams with prepared satellite and lake records; display source, timestamp, quality, and stale-data status.',
  'Run alerts in shadow mode and compare them with expert-reviewed observations before enabling any wider notification workflow.',
];

export const FutureScope: React.FC = () => (
  <div className="page-frame">
    <PageHeader
      title="Future Scope: Toward Real-Time Monitoring"
      description="A practical roadmap for moving from prepared snapshots to a continuously updated, validated monitoring service."
      icon={<Radio size={18} />}
      actions={
        <DemoBanner
          message="Future work only — this system does not currently receive live sensor or satellite data."
          liveMessage="Future work only — this system does not currently receive live sensor or satellite data."
        />
      }
    />

    <section
      role="note"
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        padding: 16,
        marginBottom: 22,
        borderRadius: 10,
        background: 'rgba(249,115,22,0.08)',
        border: '1px solid rgba(249,115,22,0.3)',
      }}
    >
      <ShieldAlert size={19} style={{ color: '#f97316', flexShrink: 0, marginTop: 1 }} />
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--text-primary)' }}>Important distinction:</strong> adding IoT sensors alone does not make the project real time. Sensors, reliable communications, a live data-ingestion service, storage, validated rules, monitoring, and a tested response process must work together. The current prototype uses prepared files and is not an emergency-warning service.
      </p>
    </section>

    <SectionCard
      title="What live monitoring would need to observe"
      description="A site-specific sensor plan should be selected with glaciology, hydrology, communications, and local safety specialists."
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14 }}>
        {sensorPlan.map(({ icon: Icon, title, detail }) => (
          <article key={title} className="himnetra-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
              <Icon size={17} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
              <h3 style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)' }}>{title}</h3>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{detail}</p>
          </article>
        ))}
      </div>
    </SectionCard>

    <SectionCard
      title="End-to-end system required"
      description="Every stage is a dependency; a sensor reading is only useful if it reaches the system reliably and can be interpreted safely."
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(235px, 1fr))', gap: 14 }}>
        {systemPlan.map(step => (
          <article key={step.number} className="himnetra-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--cyan)', fontWeight: 700, marginBottom: 7 }}>
              STAGE {step.number}
            </div>
            <h3 style={{ margin: '0 0 7px', fontSize: 13, color: 'var(--text-primary)' }}>{step.title}</h3>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.detail}</p>
          </article>
        ))}
      </div>
    </SectionCard>

    <SectionCard
      title="Recommended implementation sequence"
      description="Start with a measured pilot and prove data quality before expanding coverage or making alert claims."
    >
      <ol style={{ display: 'grid', gap: 12, margin: 0, padding: 0, listStyle: 'none' }}>
        {roadmap.map((step, index) => (
          <li key={step} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
            <span style={{
              display: 'grid', placeItems: 'center', width: 23, height: 23, flexShrink: 0,
              borderRadius: '50%', color: 'var(--cyan)', background: 'rgba(6,182,212,0.1)',
              fontSize: 11, fontWeight: 700,
            }}>{index + 1}</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step}</span>
          </li>
        ))}
      </ol>
    </SectionCard>

    <SectionCard title="Additional work before a dependable warning service">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {[
          {
            icon: Database,
            title: 'Data and model validation',
            detail: 'Reproducible model weights, independent evaluation, sensor calibration, uncertainty reporting, and scientifically reviewed risk thresholds.',
          },
          {
            icon: Bell,
            title: 'Notification reliability',
            detail: 'Consent and contact verification, delivery receipts, retries with limits, duplicate suppression, escalation paths, and an operator audit trail.',
          },
          {
            icon: ShieldAlert,
            title: 'Security and operations',
            detail: 'Authentication and role-based access, secret management, encrypted transport, backups, uptime monitoring, incident response, and ownership.',
          },
          {
            icon: Clock3,
            title: 'Latency and service targets',
            detail: 'Define and measure acceptable sensor-to-dashboard delay, outage handling, stale-data indicators, and recovery objectives.',
          },
        ].map(({ icon: Icon, title, detail }) => (
          <article key={title} className="himnetra-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
              <Icon size={17} style={{ color: '#f97316', flexShrink: 0 }} />
              <h3 style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)' }}>{title}</h3>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{detail}</p>
          </article>
        ))}
      </div>
    </SectionCard>

    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '4px 2px 18px', color: 'var(--text-muted)' }}>
      <CheckCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
      <p style={{ margin: 0, fontSize: 11, lineHeight: 1.6 }}>
        These are proposed future capabilities, not implemented project features. Sensor types, deployment sites, sampling intervals, alert thresholds, and communications must be determined through field studies and expert review.
      </p>
    </div>
  </div>
);

export default FutureScope;
