import React, { useState, useMemo } from 'react'
import {
  Plus,
  List,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react'
import { type IncidentItem } from './ReportIncidentPage'

interface StudentDashboardProps {
  userName?: string
  incidents: IncidentItem[]
  loading?: boolean
  error?: string | null
  onNavigate: (view: 'dashboard' | 'incidents' | 'incident-details' | 'report-incident' | 'profile', ticketId?: string) => void
  onRefresh?: () => void
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  userName = 'Sandul',
  incidents,
  loading = false,
  error = null,
  onNavigate,
  onRefresh
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Facilities' | 'IT Support' | 'Security'>('All')

  // Dynamic status counters derived directly from live DB incidents
  const openCount = useMemo(() => incidents.filter((i) => i.status === 'Open' || i.status === 'Reported').length, [incidents])
  const inProgressCount = useMemo(() => incidents.filter((i) => i.status === 'In Progress' || i.status === 'Assigned').length, [incidents])
  const resolvedCount = useMemo(() => incidents.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length, [incidents])

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((item) => {
      return categoryFilter === 'All' || item.category === categoryFilter
    })
  }, [incidents, categoryFilter])

  return (
    <div className="dash-body">
      {/* Greeting Section */}
      <section className="greeting-section">
        <div className="greeting-text">
          <h1>Welcome back, {userName} 👋</h1>
          <p>Here is an overview of your reported incidents and their current status.</p>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={() => onNavigate('report-incident')}
          style={{ width: 'auto' }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Report New Incident</span>
        </button>
      </section>

      {/* Metric Stat Cards */}
      <section className="metrics-grid">
        {/* Card 1: Open Tickets */}
        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('incidents')}>
          <div className="metric-icon-box open">
            <AlertCircle size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-number">{openCount}</span>
            <span className="metric-title">Open Tickets</span>
          </div>
        </div>

        {/* Card 2: In Progress */}
        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('incidents')}>
          <div className="metric-icon-box progress">
            <Clock size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-number">{inProgressCount}</span>
            <span className="metric-title">In Progress</span>
          </div>
        </div>

        {/* Card 3: Resolved */}
        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('incidents')}>
          <div className="metric-icon-box resolved">
            <CheckCircle2 size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-number">{resolvedCount}</span>
            <span className="metric-title">Resolved</span>
          </div>
        </div>
      </section>

      {/* Incidents Table Card */}
      <section className="incidents-card">
        <div className="incidents-header">
          <div className="incidents-title-group">
            <div className="incidents-title-icon">
              <List size={18} />
            </div>
            <h2 className="incidents-title">My Reported Incidents</h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="filter-tabs">
            {(['All', 'Facilities', 'IT Support', 'Security'] as const).map((tab) => (
              <button
                key={tab}
                className={`filter-tab ${categoryFilter === tab ? 'active' : ''}`}
                onClick={() => setCategoryFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Incident Table */}
        <div className="table-container">
          <table className="incidents-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>TITLE</th>
                <th>CATEGORY</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
                <th>DATE</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    Fetching live incidents from database...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#F87171' }}>
                    {error} {onRefresh && <button type="button" className="ghost-btn" style={{ marginLeft: 12 }} onClick={onRefresh}>Retry</button>}
                  </td>
                </tr>
              ) : filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No incidents found matching current category filter.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onNavigate('incident-details', item.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="col-id">{item.id}</td>
                    <td className="col-title">{item.title}</td>
                    <td className="col-category">{item.category}</td>
                    <td>
                      <span
                        className={`badge-priority ${
                          item.priority === 'Critical' || item.priority === 'High'
                            ? 'high'
                            : item.priority === 'Medium'
                            ? 'medium'
                            : 'low'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge-status ${
                          item.status === 'Open' || item.status === 'Reported'
                            ? 'open'
                            : item.status === 'In Progress' || item.status === 'Assigned'
                            ? 'in-progress'
                            : 'resolved'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="col-date">{item.date}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                      <ChevronRight size={18} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <button
            type="button"
            className="view-all-btn"
            onClick={() => onNavigate('incidents')}
          >
            View All Incidents
          </button>
        </div>
      </section>
    </div>
  )
}
