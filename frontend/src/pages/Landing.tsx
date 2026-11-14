import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mountain, Satellite, Brain, Waves, Bell, ArrowRight,
  ShieldAlert, Activity, Layers, ChevronRight,
  MapPin, Database, Cpu, GitMerge,
} from 'lucide-react';

const TECH_STACK = [
  { name: 'Sentinel-1', sub: 'C-SAR Imagery' },
  { name: 'Sentinel-2', sub: 'Multispectral' },
  { name: 'SRTM DEM', sub: 'Elevation Model' },
  { name: 'U-Net', sub: 'AI Segmentation' },
  { name: 'Random Forest', sub: 'Risk Scoring' },
  { name: 'WebGIS', sub: 'Leaflet + React' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: Satellite, title: 'Satellite Data', desc: 'Sentinel-1 SAR and Sentinel-2 MSI imagery acquired over Himachal Pradesh glacial zones.' },
  { step: '02', icon: Layers, title: 'Lake Detection', desc: 'NDWI and deep-learning U-Net model segments glacial lake boundaries from multi-band imagery.' },
  { step: '03', icon: Activity, title: 'Change Analysis', desc: 'Multi-temporal analysis tracks lake area expansion, boundary changes, and seasonal anomalies.' },
  { step: '04', icon: Brain, title: 'AI Risk Assessment', desc: 'Ensemble ML model (Random Forest) computes risk scores incorporating terrain, growth rate, and hydrology.' },
  { step: '05', icon: Waves, title: 'Flood & Early Warning', desc: 'DEM-based flood propagation simulation estimates downstream impact; alerts dispatched to administrators.' },
];

const FEATURES = [
  { icon: Satellite, title: 'Satellite Monitoring', desc: 'Continuous monitoring using ESA Sentinel-1 (SAR) and Sentinel-2 (MSI) imagery with 5–12 day revisit cycles.' },
  { icon: Brain, title: 'AI Lake Detection', desc: 'U-Net convolutional neural network segments lake boundaries achieving high-accuracy delineation (IoU > 85%).' },
  { icon: Activity, title: 'Risk Intelligence', desc: 'Multi-factor AI risk model incorporating lake growth rate, terrain exposure, precipitation anomaly, and historical trends.' },
  { icon: Waves, title: 'Flood Simulation', desc: 'DEM-based hydrodynamic simulation estimates flood propagation extent and time-to-impact for breach scenarios.' },
  { icon: Bell, title: 'Early Warning', desc: 'Automated alert system flags anomalies, rapid expansions, and critical risk levels for administrative response.' },
  { icon: MapPin, title: 'WebGIS Dashboard', desc: 'Interactive GIS platform with satellite imagery, risk overlays, flood maps, and lake-level analytics.' },
];

export const Landing: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>

      {/* ── NAVBAR ───────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6,12,24,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 5%', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #0e7490, #06b6d4)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6,182,212,0.25)',
          }}>
            <Mountain size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '0.1em', color: '#e2e8f0' }}>
              HIM<span style={{ color: 'var(--cyan)' }}>NETRA</span>
            </span>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.07em', marginTop: -2 }}>
              AI GLOF MONITORING
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          <a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Features</a>
          <a href="#how-it-works" style={{ color: 'inherit', textDecoration: 'none' }}>Methodology</a>
          <a href="#technology" style={{ color: 'inherit', textDecoration: 'none' }}>Technology</a>
        </div>

        <Link
          to="/dashboard"
          style={{
            background: 'var(--cyan)', color: '#fff',
            padding: '8px 18px', borderRadius: 8,
            textDecoration: 'none', fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 0 20px rgba(6,182,212,0.3)',
          }}
        >
          Open Dashboard <ArrowRight size={14} />
        </Link>
      </nav>

      {/* ── HERO ─────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '80px 5% 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '50%', height: '100%',
          background: 'radial-gradient(ellipse 80% 80% at 80% 50%, rgba(6,182,212,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, width: '40%', height: '60%',
          background: 'radial-gradient(ellipse 60% 60% at 0% 100%, rgba(14,116,144,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Hero grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          {/* Left: Text */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)',
              borderRadius: 99, padding: '6px 14px', marginBottom: 24,
            }}>
              <ShieldAlert size={13} style={{ color: 'var(--cyan)' }} />
              <span style={{ fontSize: 12, color: 'var(--cyan)', letterSpacing: '0.06em', fontWeight: 500 }}>
                Major Project — B.Tech CSE (AI & ML) · 2026
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(36px, 5vw, 58px)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: 20,
              color: '#e2e8f0',
            }}>
              HIM<span style={{ color: 'var(--cyan)' }}>NETRA</span>
            </h1>

            <p style={{
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              fontWeight: 400,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: 16,
              maxWidth: 520,
            }}>
              AI-Powered Glacial Lake Monitoring<br />& Early Warning System
            </p>

            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 36, maxWidth: 480 }}>
              Satellite intelligence for a safer Himalaya. Monitoring high-altitude glacial lakes across Himachal Pradesh using Sentinel imagery, deep learning segmentation, and AI-based GLOF risk analysis.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                style={{
                  background: 'var(--cyan)', color: '#fff',
                  padding: '12px 24px', borderRadius: 9,
                  textDecoration: 'none', fontSize: 14, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 4px 24px rgba(6,182,212,0.35)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(6,182,212,0.45)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = '';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(6,182,212,0.35)';
                }}
              >
                Open Monitoring Dashboard <ArrowRight size={15} />
              </Link>
              <a
                href="#how-it-works"
                style={{
                  background: 'transparent', color: 'var(--text-secondary)',
                  padding: '12px 24px', borderRadius: 9,
                  textDecoration: 'none', fontSize: 14, fontWeight: 500,
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                Explore Methodology <ChevronRight size={15} />
              </a>
            </div>

            {/* Stats row */}
            <div className="flex gap-8 mt-10">
              {[
                { n: '67+', label: 'Lakes Monitored' },
                { n: '12+', label: 'Districts Covered' },
                { n: 'AI-Driven', label: 'Risk Scoring' },
              ].map(({ n, label }) => (
                <div key={label}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--cyan)' }}>{n}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* ── WHY HIMNETRA ─────────────────────────── */}
      <section id="features" style={{ padding: '80px 5%', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SectionHeader
            tag="WHY HIMNETRA"
            title="Comprehensive GLOF Intelligence"
            subtitle="A multi-modal disaster monitoring platform combining satellite remote sensing, deep learning, and hydrodynamic modelling."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 20, marginTop: 48 }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="himnetra-card"
                style={{ padding: '24px', transition: 'all 0.2s' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(6,182,212,0.35)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.transform = '';
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                }}>
                  <Icon size={20} style={{ color: 'var(--cyan)' }} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────── */}
      <section id="how-it-works" style={{ padding: '80px 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionHeader
            tag="METHODOLOGY"
            title="How HIMNETRA Works"
            subtitle="A five-stage processing pipeline from raw satellite data to actionable early warning."
          />
          <div style={{ marginTop: 56, position: 'relative' }}>
            {/* Connector line */}
            <div style={{
              position: 'absolute', top: 40, left: '10%', right: '10%', height: 2,
              background: 'linear-gradient(90deg, rgba(6,182,212,0.05), rgba(6,182,212,0.4), rgba(6,182,212,0.05))',
              zIndex: 0,
            }} className="hidden md:block" />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 24, position: 'relative', zIndex: 1 }}>
              {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }, idx) => (
                <div key={step} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'var(--bg-elevated)',
                    border: `2px solid ${idx === HOW_IT_WORKS.length - 1 ? 'rgba(249,115,22,0.6)' : 'rgba(6,182,212,0.4)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: `0 0 20px ${idx === HOW_IT_WORKS.length - 1 ? 'rgba(249,115,22,0.15)' : 'rgba(6,182,212,0.12)'}`,
                  }}>
                    <Icon size={26} style={{ color: idx === HOW_IT_WORKS.length - 1 ? '#f97316' : 'var(--cyan)' }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--cyan)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 6 }}>{step}</div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>{title}</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TECHNOLOGY ──────────────────────────── */}
      <section id="technology" style={{ padding: '80px 5%', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <SectionHeader
            tag="TECHNOLOGY"
            title="Built on Open Geospatial Standards"
            subtitle="HIMNETRA integrates established satellite, AI, and GIS technologies for a reproducible, open-science approach to GLOF monitoring."
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 48, justifyContent: 'center' }}>
            {TECH_STACK.map(({ name, sub }) => (
              <div key={name} style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 10, padding: '14px 24px',
                textAlign: 'center', minWidth: 130,
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(6,182,212,0.4)';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(6,182,212,0.06)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Impact banner */}
          <div style={{
            marginTop: 60, padding: '36px 40px',
            background: 'linear-gradient(135deg, rgba(6,182,212,0.06), rgba(14,116,144,0.08))',
            border: '1px solid rgba(6,182,212,0.2)',
            borderRadius: 14, textAlign: 'center',
          }}>
            <Cpu size={32} style={{ color: 'var(--cyan)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
              Technology for Safer Himalayan Communities
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 28px' }}>
              HIMNETRA is a research prototype demonstrating how open satellite data, modern AI architectures, and WebGIS can be integrated to support GLOF disaster preparedness in Himachal Pradesh.
            </p>
            <Link
              to="/dashboard"
              style={{
                background: 'var(--cyan)', color: '#fff',
                padding: '11px 28px', borderRadius: 8,
                textDecoration: 'none', fontSize: 14, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              Explore the Dashboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '40px 5%',
        background: 'var(--bg-surface)',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 32 }}>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div style={{
                  width: 32, height: 32, background: 'linear-gradient(135deg, #0e7490, #06b6d4)',
                  borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Mountain size={17} color="#fff" strokeWidth={2.5} />
                </div>
                <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '0.1em' }}>
                  HIM<span style={{ color: 'var(--cyan)' }}>NETRA</span>
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 320 }}>
                AI-Based Glacial Lake Outburst Flood (GLOF) Detection & Early Warning System.
                Satellite intelligence for a safer Himalaya.
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 6 }}>
                Department of Computer Science & Engineering
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Artificial Intelligence & Machine Learning
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.5 }}>
                Jawaharlal Nehru Government Engineering College
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Sundernagar, Himachal Pradesh
              </p>
              <div style={{
                display: 'inline-block',
                background: 'rgba(6,182,212,0.08)',
                border: '1px solid rgba(6,182,212,0.2)',
                borderRadius: 6, padding: '4px 12px',
                fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.06em',
              }}>
                Academic Project — 2026
              </div>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid var(--border)', paddingTop: 20,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: 11, color: 'var(--text-muted)',
          }}>
            <span>© 2026 HIMNETRA — Academic Research Prototype</span>
            <div className="flex items-center gap-2">
              <Database size={12} />
              <span>Demo Mode — Live backend not connected</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ─── Hero Visual ─────────────────────────────────────────────
const HeroVisual: React.FC = () => (
  <div style={{ position: 'relative', width: '100%', maxWidth: 480 }}>
    {/* Main card */}
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 16, padding: 20,
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    }}>
      {/* Map placeholder */}
      <div style={{
        height: 220, borderRadius: 10,
        background: 'linear-gradient(135deg, #0a1a2e 0%, #0d2040 40%, #0a1628 100%)',
        border: '1px solid var(--border)', position: 'relative', overflow: 'hidden',
        marginBottom: 16,
      }}>
        {/* Simulated terrain */}
        <svg width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="none">
          <defs>
            <linearGradient id="terrain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a3a5c" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0a1628" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {/* Mountain silhouette */}
          <path d="M0,180 L60,100 L120,140 L180,60 L240,110 L300,80 L360,120 L400,90 L400,220 L0,220Z" fill="url(#terrain)" />
          <path d="M0,200 L80,150 L140,170 L200,120 L260,140 L320,115 L380,135 L400,110 L400,220 L0,220Z" fill="rgba(10,22,40,0.8)" />
          {/* Lake */}
          <ellipse cx="220" cy="155" rx="28" ry="14" fill="rgba(6,182,212,0.55)" />
          <ellipse cx="220" cy="155" rx="28" ry="14" fill="none" stroke="rgba(6,182,212,0.9)" strokeWidth="1.5" strokeDasharray="4 3" />
          {/* Grid lines */}
          {[0,40,80,120,160,200,240,280,320,360,400].map(x => (
            <line key={x} x1={x} y1={0} x2={x} y2={220} stroke="rgba(6,182,212,0.04)" strokeWidth={1} />
          ))}
          {[0,44,88,132,176,220].map(y => (
            <line key={y} x1={0} y1={y} x2={400} y2={y} stroke="rgba(6,182,212,0.04)" strokeWidth={1} />
          ))}
          {/* Markers */}
          <circle cx="220" cy="155" r="5" fill="#ef4444" opacity="0.9" />
          <circle cx="220" cy="155" r="11" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
          <circle cx="160" cy="138" r="4" fill="#f97316" opacity="0.8" />
          <circle cx="280" cy="148" r="3.5" fill="#f59e0b" opacity="0.7" />
          <circle cx="120" cy="165" r="3" fill="#22c55e" opacity="0.8" />
        </svg>
        {/* Overlay labels */}
        <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 10, color: 'var(--cyan)', letterSpacing: '0.08em', fontWeight: 600 }}>HIMACHAL PRADESH — GIS VIEW</div>
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#22c55e' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} className="animate-pulse-dot" />
          LIVE
        </div>
      </div>

      {/* Alert cards */}
      {[
        { lake: 'Gepang Gath', risk: 'CRITICAL', color: '#ef4444', delta: '+7.4%' },
        { lake: 'Samudra Tapu', risk: 'HIGH', color: '#f97316', delta: '+12.1%' },
      ].map(({ lake, risk, color, delta }) => (
        <div key={lake} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '8px 12px',
          background: `${color}10`, border: `1px solid ${color}25`,
          borderRadius: 8, marginBottom: 8,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} className="animate-pulse-dot" />
          <span style={{ fontSize: 12, color: '#cbd5e1', flex: 1 }}>{lake}</span>
          <span style={{ fontSize: 11, color, fontWeight: 600 }}>{risk}</span>
          <span style={{ fontSize: 11, color: '#f97316', fontWeight: 500 }}>{delta}</span>
        </div>
      ))}

      {/* Bottom stats */}
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        {[{ label: 'Monitored', val: '67' }, { label: 'High Risk', val: '8' }, { label: 'Alerts', val: '2' }].map(({ label, val }) => (
          <div key={label} style={{
            flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 7, padding: '8px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--cyan)' }}>{val}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Floating badge */}
    <div style={{
      position: 'absolute', top: -18, right: -18,
      background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)',
      borderRadius: 99, padding: '6px 14px',
      fontSize: 11, color: '#ef4444', fontWeight: 600, letterSpacing: '0.06em',
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} className="animate-pulse-dot" />
      CRITICAL ALERT ACTIVE
    </div>
  </div>
);

// ─── Section Header ──────────────────────────────────────────
const SectionHeader: React.FC<{ tag: string; title: string; subtitle: string }> = ({ tag, title, subtitle }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
      borderRadius: 99, padding: '5px 14px', marginBottom: 16,
    }}>
      <GitMerge size={11} style={{ color: 'var(--cyan)' }} />
      <span style={{ fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.1em', fontWeight: 600 }}>{tag}</span>
    </div>
    <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>{title}</h2>
    <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 580, margin: '0 auto' }}>{subtitle}</p>
  </div>
);

export default Landing;
