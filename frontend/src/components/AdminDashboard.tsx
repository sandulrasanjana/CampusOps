import React, { useMemo } from 'react'
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  BarChart2,
  ArrowRight,
  User as UserIcon
} from 'lucide-react'
import type { IncidentItem } from './ReportIncidentPage'
import type { ViewType } from '../App'
import { isSlaWarningOrBreach } from '../utils/slaUtils'

interface AdminDashboardProps {
  userName: string
  incidents: IncidentItem[]
  onNavigate: (view: ViewType | 'login', ticketId?: string) => void
  onOpenProfile?: () => void
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  userName,
  incidents,
  onNavigate,
  onOpenProfile
}) => {
  const openCount = useMemo(
    () => incidents.filter((i) => i.status === 'Open' || i.status === 'Reported').length,
    [incidents]
  )
  const progressCount = useMemo(
    () => incidents.filter((i) => i.status === 'In Progress' || i.status === 'Assigned').length,
    [incidents]
  )
  const resolvedCount = useMemo(
    () => incidents.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length,
    [incidents]
  )
  const criticalCount = useMemo(
    () => incidents.filter((i) => isSlaWarningOrBreach(i)).length,
    [incidents]
  )

  // Category breakdown dynamically derived from live incidents
  const categoryAnalytics = useMemo(() => {
    const counts: Record<string, number> = {}
    incidents.forEach((item) => {
      const cat = item.category || 'Uncategorized'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return Object.entries(counts).map(([name, volume]) => ({
      name,
      volume,
      percentage: incidents.length > 0 ? Math.round((volume / incidents.length) * 100) : 0
    }))
  }, [incidents])

  return (
    <div className="dash-body">
      {/* Greeting Banner */}
      <div className="greeting-section">
        <div className="greeting-text">
          <h1>Admin Command Center & Governance</h1>
          <p>Global System Operations Status for Administrator {userName}.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onOpenProfile && (
            <button
              type="button"
              className="secondary-btn"
              style={{ width: 'auto', padding: '6px 14px', fontSize: '13px' }}
              onClick={onOpenProfile}
              title="View Administrator Profile & Account Details"
            >
              <UserIcon size={16} />
              <span>Admin Profile</span>
            </button>
          )}

          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#34D399',
              fontWeight: 600,
              background: 'rgba(16, 185, 129, 0.12)',
              padding: '6px 14px',
              borderRadius: '9999px',
              border: '1px solid rgba(16, 185, 129, 0.25)'
            }}
          >
            <ShieldCheck size={16} /> Live DB Connection Active
          </span>
        </div>
      </div>

      {/* Admin Real-Time Dynamic Metrics Grid */}
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
          <div className="metric-icon-box open" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#F87171' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-number">{openCount}</span>
            <span className="metric-title">Open / Reported</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box progress">
            <Clock size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-number">{progressCount}</span>
            <span className="metric-title">In Progress</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box resolved">
            <CheckCircle2 size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-number">{resolvedCount}</span>
            <span className="metric-title">Resolved</span>
          </div>
        </div>
      </div>

      {/* Dynamic Grid: Incidents by Category & Queue Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        {/* Dynamic Category Volume Breakdown */}
        <div className="incidents-card">
          <div className="incidents-header">
            <div className="incidents-title-group">
              <div className="incidents-title-icon" style={{ color: '#38BDF8' }}>
                <BarChart2 size={18} />
              </div>
              <h2 className="incidents-title">Incidents by Category Breakdown</h2>
            </div>
          </div>

          <div className="table-container">
            <table className="incidents-table">
              <thead>
                <tr>
                  <th>CATEGORY QUEUE</th>
                  <th>VOLUME</th>
                  <th>SHARE</th>
                </tr>
              </thead>
              <tbody>
                {categoryAnalytics.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No tickets recorded in database.
                    </td>
                  </tr>
                ) : (
                  categoryAnalytics.map((cat, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{cat.name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{cat.volume} tickets</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#38BDF8' }}>
                        {cat.percentage}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Live Status Summary */}
        <div className="incidents-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="incidents-header">
              <div className="incidents-title-group">
                <div className="incidents-title-icon">
                  <BarChart2 size={18} />
                </div>
                <h2 className="incidents-title">Live Status Summary</h2>
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
            <span>VIEW DETAILED TELEMETRY</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
