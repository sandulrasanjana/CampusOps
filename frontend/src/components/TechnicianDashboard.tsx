import React from 'react'
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Activity,
  Zap,
  ArrowRight,
  ShieldAlert,
  Server,
  UserCheck
} from 'lucide-react'
import type { IncidentItem } from './ReportIncidentPage'
import type { ViewType } from '../App'

interface TechnicianDashboardProps {
  userName: string
  incidents: IncidentItem[]
  onNavigate: (view: ViewType | 'login', ticketId?: string) => void
  onUpdateStatus: (ticketId: string, newStatus: IncidentItem['status']) => void
}

export const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({
  userName,
  incidents,
  onNavigate,
  onUpdateStatus
}) => {
  const openCount = incidents.filter((i) => i.status === 'Open').length
  const progressCount = incidents.filter((i) => i.status === 'In Progress').length
  const resolvedCount = incidents.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length
  const criticalTickets = incidents.filter((i) => i.priority === 'High' || i.priority === 'Critical')
  const unassignedTickets = incidents.filter((i) => !i.assignedTechnician)

  return (
    <div className="dash-body">
      {/* Greeting Header */}
      <div className="greeting-section">
        <div className="greeting-text">
          <h1>Technician Operations Command</h1>
          <p>Welcome back, {userName}. 1 SLA warning requires immediate intervention.</p>
        </div>

        <button
          type="button"
          className="primary-btn"
          style={{ width: 'auto', padding: '10px 20px' }}
          onClick={() => onNavigate('tech-workspace')}
        >
          <Zap size={16} />
          <span>OPEN KANBAN WORKSPACE</span>
        </button>
      </div>

      {/* Critical SLA Warning Banner */}
      {criticalTickets.length > 0 && (
        <div
          className="status-banner error"
          style={{
            marginBottom: '28px',
            padding: '16px 20px',
            borderRadius: 'var(--radius-xl)',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <ShieldAlert size={22} className="text-red-400" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#F87171' }}>
                CRITICAL SLA BREACH WARNING: {criticalTickets[0].id} - {criticalTickets[0].title}
              </div>
              <div style={{ fontSize: '13px', opacity: 0.9 }}>
                Location: {criticalTickets[0].location} | Target SLA response time: Target 30 mins
              </div>
            </div>
          </div>

          <button
            type="button"
            className="submit-btn"
            style={{
              width: 'auto',
              background: '#EF4444',
              padding: '8px 16px',
              fontSize: '13px'
            }}
            onClick={() => onNavigate('tech-incident-details', criticalTickets[0].id)}
          >
            Investigate Now
          </button>
        </div>
      )}

      {/* Operations Metric Cards */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="metric-card">
          <div className="metric-icon-box open">
            <AlertTriangle size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-number">{openCount}</span>
            <span className="metric-title">Active Queue</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box progress">
            <Clock size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-number">{progressCount}</span>
            <span className="metric-title">In Investigation</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box resolved">
            <CheckCircle2 size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-number">{resolvedCount}</span>
            <span className="metric-title">Resolved Today</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818CF8' }}>
            <Activity size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-number">1h 24m</span>
            <span className="metric-title">Avg MTTR SLA</span>
          </div>
        </div>
      </div>

      {/* Grid Split: High Priority Queue & Unassigned Triage */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        {/* High Priority Active Work Orders */}
        <div className="incidents-card">
          <div className="incidents-header">
            <div className="incidents-title-group">
              <div className="incidents-title-icon">
                <Server size={18} />
              </div>
              <h2 className="incidents-title">Priority Work Orders</h2>
            </div>

            <button
              type="button"
              className="view-all-btn"
              onClick={() => onNavigate('tech-queue')}
            >
              VIEW ALL QUEUE
            </button>
          </div>

          <div className="table-container">
            <table className="incidents-table">
              <thead>
                <tr>
                  <th>TICKET ID</th>
                  <th>TITLE</th>
                  <th>PRIORITY</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {incidents.slice(0, 4).map((item) => (
                  <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => onNavigate('tech-incident-details', item.id)}>
                    <td className="col-id">{item.id}</td>
                    <td className="col-title">{item.title}</td>
                    <td>
                      <span className={`badge-priority ${item.priority.toLowerCase()}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${item.status.toLowerCase().replace(' ', '-')}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {item.status === 'Open' ? (
                        <button
                          type="button"
                          className="ghost-btn"
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            onUpdateStatus(item.id, 'In Progress')
                          }}
                        >
                          Start
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="ghost-btn"
                          style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--primary-accent)' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            onNavigate('tech-incident-details', item.id)
                          }}
                        >
                          Inspect
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Unassigned Triage Panel */}
        <div className="incidents-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="incidents-header">
              <div className="incidents-title-group">
                <div className="incidents-title-icon" style={{ color: '#FBBF24' }}>
                  <UserCheck size={18} />
                </div>
                <h2 className="incidents-title">Unassigned Triage ({unassignedTickets.length})</h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {unassignedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  style={{
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--primary-accent)' }}>
                      {ticket.id} • {ticket.category}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-heading)', marginTop: '2px' }}>
                      {ticket.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Reported by {ticket.reporterName || 'Student'} • {ticket.location}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="card-action-btn"
                    onClick={() => onNavigate('tech-incident-details', ticket.id)}
                  >
                    Claim
                  </button>
                </div>
              ))}

              {unassignedTickets.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                  All incoming incidents assigned!
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            className="ghost-btn"
            style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}
            onClick={() => onNavigate('tech-workspace')}
          >
            <span>VIEW KANBAN BOARD</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
