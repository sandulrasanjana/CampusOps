import React, { useState, useEffect, useMemo } from 'react'
import {
  BarChart2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react'
import type { IncidentItem } from './ReportIncidentPage'
import { getIncidents } from '../services/api'

interface AdminAnalyticsPageProps {
  incidents?: IncidentItem[]
}

export const AdminAnalyticsPage: React.FC<AdminAnalyticsPageProps> = ({
  incidents: propIncidents
}) => {
  const [fetchedIncidents, setFetchedIncidents] = useState<IncidentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use props if provided, otherwise fallback to fetching from API
  useEffect(() => {
    let isMounted = true
    if (!propIncidents || propIncidents.length === 0) {
      setLoading(true)
      getIncidents()
        .then((data) => {
          if (isMounted) setFetchedIncidents(data)
        })
        .catch((err) => {
          if (isMounted) setError(err.message || 'Failed to load telemetry data')
        })
        .finally(() => {
          if (isMounted) setLoading(false)
        })
    }
    return () => {
      isMounted = false
    }
  }, [propIncidents])

  const incidents = (propIncidents && propIncidents.length > 0) ? propIncidents : fetchedIncidents

  // Real status breakdown from live incidents
  const totalTickets = incidents.length
  const openTickets = useMemo(
    () => incidents.filter((i) => i.status === 'Open' || i.status === 'Reported').length,
    [incidents]
  )
  const inProgressTickets = useMemo(
    () => incidents.filter((i) => i.status === 'In Progress' || i.status === 'Assigned').length,
    [incidents]
  )
  const resolvedTickets = useMemo(
    () => incidents.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length,
    [incidents]
  )

  // Incidents by Category breakdown calculated dynamically from the actual tickets array
  const categoryAnalytics = useMemo(() => {
    const counts: Record<string, number> = {}
    incidents.forEach((item) => {
      const cat = item.category || 'Uncategorized'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return Object.entries(counts).map(([name, volume]) => ({
      name,
      volume,
      percentage: totalTickets > 0 ? Math.round((volume / totalTickets) * 100) : 0
    }))
  }, [incidents, totalTickets])

  return (
    <div className="dash-body">
      {/* Header */}
      <div className="greeting-section">
        <div className="greeting-text">
          <h1>System Telemetry & Analytics</h1>
          <p>Real-time incident metrics and category volume breakdown derived dynamically from Supabase / database backend.</p>
        </div>
      </div>

      {error && (
        <div className="status-banner error" style={{ marginBottom: 24 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Dynamic Real Performance Metrics Grid */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="metric-card">
          <div className="metric-icon-box open">
            <AlertTriangle size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-number">
              {loading ? <Loader2 size={18} className="animate-spin" /> : totalTickets}
            </span>
            <span className="metric-title">Total Logged Tickets</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box open" style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#F87171' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-number">
              {loading ? <Loader2 size={18} className="animate-spin" /> : openTickets}
            </span>
            <span className="metric-title">Open / Reported</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box progress">
            <Clock size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-number">
              {loading ? <Loader2 size={18} className="animate-spin" /> : inProgressTickets}
            </span>
            <span className="metric-title">In Progress</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box resolved">
            <CheckCircle2 size={24} />
          </div>
          <div className="metric-details">
            <span className="metric-number">
              {loading ? <Loader2 size={18} className="animate-spin" /> : resolvedTickets}
            </span>
            <span className="metric-title">Resolved</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table - Dynamic calculations from actual tickets */}
      <div className="incidents-card" style={{ marginBottom: '28px' }}>
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
                <th>TICKET VOLUME</th>
                <th>PERCENTAGE OF TOTAL</th>
                <th>VOLUME DISTRIBUTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-muted)' }}>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Loading telemetry breakdown...</span>
                    </div>
                  </td>
                </tr>
              ) : categoryAnalytics.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No incident tickets recorded in database.
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
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="progress-bar-track" style={{ width: '160px' }}>
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${cat.percentage}%`,
                              background: 'var(--primary-accent)'
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
