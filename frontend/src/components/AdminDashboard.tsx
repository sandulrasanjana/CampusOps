import React from 'react'
import {
  ShieldCheck,
  Users,
  Activity,
  AlertTriangle,
  TrendingUp,
  Cpu,
  ArrowRight
} from 'lucide-react'
import type { IncidentItem } from './ReportIncidentPage'
import type { ViewType } from '../App'

interface AdminDashboardProps {
  userName: string
  incidents: IncidentItem[]
  onNavigate: (view: ViewType | 'login', ticketId?: string) => void
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  userName,
  incidents,
  onNavigate
}) => {
  const openCount = incidents.filter((i) => i.status === 'Open').length
  const progressCount = incidents.filter((i) => i.status === 'In Progress').length
  const resolvedCount = incidents.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length
  const criticalCount = incidents.filter((i) => i.priority === 'High' || i.priority === 'Critical').length

  const staffMembers = [
    { name: 'Alex Rivera', role: 'Sr. Infrastructure Lead', active: 3, resolved: 28, slaRate: '98.5%', status: 'Active On-Duty' },
    { name: 'Marcus Vance', role: 'Facilities Plumbing Lead', active: 2, resolved: 34, slaRate: '96.2%', status: 'Active On-Duty' },
    { name: 'David Chen', role: 'Hardware Specialist', active: 1, resolved: 19, slaRate: '99.1%', status: 'On Break' }
  ]

  return (
    <div className="dash-body">
      {/* Greeting Banner */}
      <div className="greeting-section">
        <div className="greeting-text">
          <h1>Admin Command Center & Governance</h1>
          <p>Global System Operations Status for Administrator {userName}.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#34D399', fontWeight: 600, background: 'rgba(16, 185, 129, 0.12)', padding: '6px 14px', borderRadius: '9999px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <ShieldCheck size={16} /> System Health: 99.98%
          </span>
        </div>
      </div>

      {/* Admin High-Level Metrics */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="metric-card">
          <div className="metric-icon-box open">
            <AlertTriangle size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-number">{incidents.length}</span>
            <span className="metric-title">Total Logged Tickets</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box progress">
            <Users size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-number">3</span>
            <span className="metric-title">Staff On-Duty</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box resolved">
            <TrendingUp size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-number">97.8%</span>
            <span className="metric-title">SLA Compliance Rate</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#C084FC' }}>
            <Cpu size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-number">12ms</span>
            <span className="metric-title">Avg API Telemetry</span>
          </div>
        </div>
      </div>

      {/* Infrastructure Health Status Grid */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '16px' }}>
          Campus Infrastructure Subsystem Health
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', padding: '18px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-heading)' }}>US-East Data Center</span>
              <span style={{ fontSize: '11px', color: '#F87171', fontWeight: 700 }}>DEGRADED</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Connection Pool Saturation (INC-8492)</div>
          </div>

          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', padding: '18px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-heading)' }}>Wi-Fi & Mesh Network</span>
              <span style={{ fontSize: '11px', color: '#34D399', fontWeight: 700 }}>OPERATIONAL</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>99.9% Uptime across 48 APs</div>
          </div>

          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', padding: '18px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-heading)' }}>Auth & SSO Gateway</span>
              <span style={{ fontSize: '11px', color: '#FBBF24', fontWeight: 700 }}>MONITORING</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>OIDC Token Latency (INC-8488)</div>
          </div>

          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', padding: '18px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-heading)' }}>AV & Lecture Hardware</span>
              <span style={{ fontSize: '11px', color: '#34D399', fontWeight: 700 }}>OPERATIONAL</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>96% Lecture Hall Hardware Ready</div>
          </div>
        </div>
      </div>

      {/* Grid Split: Staff Allocation & Critical Tickets Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        {/* Technician Staff Directory & Workload */}
        <div className="incidents-card">
          <div className="incidents-header">
            <div className="incidents-title-group">
              <div className="incidents-title-icon" style={{ color: '#C084FC' }}>
                <Users size={18} />
              </div>
              <h2 className="incidents-title">Technician Staff Workload</h2>
            </div>

            <button
              type="button"
              className="view-all-btn"
              onClick={() => onNavigate('admin-staff')}
            >
              MANAGE STAFF →
            </button>
          </div>

          <div className="table-container">
            <table className="incidents-table">
              <thead>
                <tr>
                  <th>NAME & ROLE</th>
                  <th>STATUS</th>
                  <th>ACTIVE TICKETS</th>
                  <th>RESOLVED</th>
                  <th>SLA EFFICIENCY</th>
                </tr>
              </thead>
              <tbody>
                {staffMembers.map((staff, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{staff.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{staff.role}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          background: staff.status.includes('Active') ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                          color: staff.status.includes('Active') ? '#34D399' : '#FBBF24',
                          border: staff.status.includes('Active') ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)'
                        }}
                      >
                        {staff.status}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{staff.active} active</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{staff.resolved}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#34D399', fontWeight: 600 }}>{staff.slaRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global SLA Summary & Quick Stats */}
        <div className="incidents-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="incidents-header">
              <div className="incidents-title-group">
                <div className="incidents-title-icon">
                  <Activity size={18} />
                </div>
                <h2 className="incidents-title">Live Queue Status</h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', background: 'var(--bg-base)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-body)' }}>Open / Unresolved</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#F87171' }}>{openCount}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', background: 'var(--bg-base)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-body)' }}>In Active Investigation</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#FBBF24' }}>{progressCount}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', background: 'var(--bg-base)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-body)' }}>Closed / Resolved</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34D399' }}>{resolvedCount}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', background: 'var(--bg-base)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-body)' }}>Critical Priority Alerts</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#EF4444' }}>{criticalCount}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="ghost-btn"
            style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}
            onClick={() => onNavigate('admin-analytics')}
          >
            <span>VIEW TELEMETRY & ANALYTICS</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
