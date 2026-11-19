import React, { useEffect, useState } from 'react';
import {
  FileText, Download, Plus, Loader, CheckCircle, Clock,
} from 'lucide-react';
import { fetchReports, generateReport, reportDownloadUrl, IS_LIVE } from '../services/api';
import type { Report } from '../types';
import { DemoBanner, PageHeader } from '../components/ui';
import { formatDateTime } from '../utils';
import { showToast } from '../components/layout/AppLayout';

const REPORT_TYPES: { type: Report['type']; label: string; desc: string; icon: string }[] = [
  { type: 'RISK_ASSESSMENT', label: 'GLOF Risk Assessment', desc: 'AI risk scores, contributing factors, and recommendations', icon: '⚠' },
  { type: 'LAKE_CHANGE', label: 'Lake Change Report', desc: 'Satellite-derived area changes and historical trend analysis', icon: '🛰' },
  { type: 'FLOOD_SIMULATION', label: 'Flood Simulation Report', desc: 'Breach scenario, flood extent, and downstream impact estimates', icon: '🌊' },
  { type: 'MONTHLY', label: 'Monthly Monitoring Report', desc: 'Comprehensive monthly summary for all monitored lakes', icon: '📅' },
];

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<Report['type'] | null>(null);

  useEffect(() => {
    fetchReports()
      .then(setReports)
      .catch(() => showToast('Could not load reports from the server.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async (type: Report['type']) => {
    setGenerating(type);
    try {
      const report = await generateReport(type);
      setReports(prev => [report, ...prev]);
      showToast(`${REPORT_TYPES.find(r => r.type === type)?.label} generated.`, 'success');
    } catch {
      showToast('Report generation failed.', 'error');
    } finally {
      setGenerating(null);
    }
  };

  const handleDownload = (report: Report) => {
    if (!IS_LIVE) return;
    window.open(reportDownloadUrl(report.id), '_blank');
  };

  const statusColor = (s: Report['status']) => {
    switch (s) {
      case 'READY':      return '#22c55e';
      case 'GENERATING': return '#f59e0b';
      case 'FAILED':     return '#ef4444';
    }
  };

  const StatusIcon = ({ s }: { s: Report['status'] }) => {
    switch (s) {
      case 'READY':      return <CheckCircle size={13} style={{ color: '#22c55e' }} />;
      case 'GENERATING': return <Loader size={13} style={{ color: '#f59e0b' }} className="animate-spin" />;
      case 'FAILED':     return <Clock size={13} style={{ color: '#ef4444' }} />;
    }
  };

  return (
    <div style={{ padding: 24, minHeight: '100%' }}>
      <PageHeader
        title="Administrative Reports"
        description="Generate, view, and download monitoring reports for GLOF risk assessment and lake analysis."
        icon={<FileText size={18} />}
        actions={<DemoBanner message="Backend API not configured — reports are unavailable." liveMessage="Reports are created by the backend from prepared dataset outputs." />}
      />

      {/* Generate Report cards */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>Generate New Report</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {REPORT_TYPES.map(({ type, label, desc, icon }) => (
            <div
              key={type}
              className="himnetra-card"
              style={{ padding: '18px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(6,182,212,0.4)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.transform = '';
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <span style={{ fontSize: 22 }}>{icon}</span>
                <button
                  onClick={() => handleGenerate(type)}
                  disabled={generating === type || !IS_LIVE}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 12px', borderRadius: 7,
                    background: 'rgba(6,182,212,0.1)',
                    border: '1px solid rgba(6,182,212,0.3)',
                    color: 'var(--cyan)', fontSize: 12, cursor: 'pointer',
                    fontFamily: 'Inter,sans-serif',
                    opacity: generating === type || !IS_LIVE ? 0.7 : 1,
                  }}
                >
                  {generating === type
                    ? <><Loader size={12} className="animate-spin" /> Generating…</>
                    : <><Plus size={12} /> Generate</>
                  }
                </button>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Existing Reports */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>Previous Reports</div>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading reports…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reports.map(report => (
              <div
                key={report.id}
                className="himnetra-card"
                style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
              >
                <div style={{ fontSize: 20 }}>
                  {REPORT_TYPES.find(r => r.type === report.type)?.icon ?? '📄'}
                </div>

                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{report.title}</div>
                  <div className="flex items-center gap-4" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    <span>{formatDateTime(report.generatedAt)}</span>
                    {report.lakeName && <span>⛰ {report.lakeName}</span>}
                    {report.fileSize && <span>{report.fileSize}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5" style={{ fontSize: 12, color: statusColor(report.status) }}>
                    <StatusIcon s={report.status} />
                    {report.status === 'GENERATING' ? 'Generating…' : report.status.charAt(0) + report.status.slice(1).toLowerCase()}
                  </div>

                  <button
                    onClick={() => handleDownload(report)}
                    disabled={report.status !== 'READY' || !IS_LIVE}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '7px 14px', borderRadius: 7,
                      background: report.status === 'READY' ? 'rgba(6,182,212,0.1)' : 'var(--bg-elevated)',
                      border: `1px solid ${report.status === 'READY' ? 'rgba(6,182,212,0.3)' : 'var(--border)'}`,
                      color: report.status === 'READY' ? 'var(--cyan)' : 'var(--text-muted)',
                      fontSize: 12, cursor: report.status === 'READY' ? 'pointer' : 'not-allowed',
                      fontFamily: 'Inter,sans-serif',
                    }}
                  >
                    <Download size={12} /> Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
