import React from 'react'
import {
  BarChart2,
  Clock,
  ShieldCheck,
  Download,
  Zap,
  Activity
} from 'lucide-react'

export const AdminAnalyticsPage: React.FC = () => {
  const categoryAnalytics = [
    { name: 'IT Support', volume: 48, mttr: '1h 15m', slaCompliance: 98.2, trend: '+4%' },
    { name: 'Facilities & Plumbing', volume: 32, mttr: '2h 40m', slaCompliance: 95.4, trend: '-2%' },
    { name: 'Network & Wi-Fi', volume: 64, mttr: '0h 45m', slaCompliance: 99.4, trend: '+8%' },
    { name: 'Security & Access', volume: 18, mttr: '0h 30m', slaCompliance: 99.8, trend: '0%' },
    { name: 'Lab Hardware & AV', volume: 29, mttr: '1h 50m', slaCompliance: 96.5, trend: '+1%' }
  ]

  return (
    <div className="dash-body">
      {/* Header */}
      <div className="greeting-section">
        <div className="greeting-text">
          <h1>System Telemetry & Analytics</h1>
          <p>Campus Mean Time to Resolution (MTTR), category volume, and SLA compliance metrics.</p>
        </div>

        <button
          type="button"
          className="secondary-btn"
          onClick={() => alert('Exporting monthly SLA compliance PDF audit report...')}
        >
          <Download size={16} />
          <span>EXPORT AUDIT REPORT</span>
        </button>
      </div>

      {/* High-Level Performance Grid */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="metric-card">
          <div className="metric-icon-box progress">
            <Clock size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-number">1h 18m</span>
            <span className="metric-title">Campus Global MTTR</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box resolved">
            <ShieldCheck size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-number">98.2%</span>
            <span className="metric-title">SLA Compliance Target</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box open">
            <Zap size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-number">191</span>
            <span className="metric-title">Monthly Total Tickets</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818CF8' }}>
            <Activity size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-number">99.98%</span>
            <span className="metric-title">Network AP Telemetry</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="incidents-card" style={{ marginBottom: '28px' }}>
        <div className="incidents-header">
          <div className="incidents-title-group">
            <div className="incidents-title-icon" style={{ color: '#38BDF8' }}>
              <BarChart2 size={18} />
            </div>
            <h2 className="incidents-title">Category Operational Performance Breakdown</h2>
          </div>
        </div>

        <div className="table-container">
          <table className="incidents-table">
            <thead>
              <tr>
                <th>CATEGORY QUEUE</th>
                <th>MONTHLY VOLUME</th>
                <th>MEAN TIME TO RESOLUTION (MTTR)</th>
                <th>SLA COMPLIANCE RATE</th>
                <th>VOLUME TREND</th>
              </tr>
            </thead>
            <tbody>
              {categoryAnalytics.map((cat, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{cat.name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{cat.volume} tickets</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{cat.mttr}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="progress-bar-track" style={{ width: '120px' }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${cat.slaCompliance}%`,
                            background: cat.slaCompliance > 97 ? '#10B981' : '#F59E0B'
                          }}
                        ></div>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: '#34D399' }}>
                        {cat.slaCompliance}%
                      </span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: cat.trend.startsWith('+') ? '#F87171' : '#34D399', fontWeight: 600 }}>
                    {cat.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Telemetry Peak Hours Bar Visualizer */}
      <div className="incidents-card">
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '16px' }}>
          Peak Campus Ticket Incident Reporting Times (24h Distribution)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', alignItems: 'end', height: '140px', padding: '16px', background: 'var(--bg-base)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '100%', height: '30px', background: '#3B82F6', borderRadius: '4px' }}></div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>08:00</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '100%', height: '90px', background: '#EF4444', borderRadius: '4px' }}></div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>10:00 (Peak)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '100%', height: '70px', background: '#F59E0B', borderRadius: '4px' }}></div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>12:00</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '100%', height: '80px', background: '#3B82F6', borderRadius: '4px' }}></div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>14:00</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '100%', height: '40px', background: '#3B82F6', borderRadius: '4px' }}></div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>16:00</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '100%', height: '20px', background: '#10B981', borderRadius: '4px' }}></div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>18:00</span>
          </div>
        </div>
      </div>
    </div>
  )
}
