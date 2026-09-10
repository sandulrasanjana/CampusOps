import React, { useState } from 'react'
import {
  Search,
  SlidersHorizontal,
  Clock,
  UserCheck
} from 'lucide-react'
import type { IncidentItem } from './ReportIncidentPage'
import type { ViewType } from '../App'

interface TechnicianQueuePageProps {
  incidents: IncidentItem[]
  onNavigate: (view: ViewType | 'login', ticketId?: string) => void
  onUpdateStatus: (ticketId: string, newStatus: IncidentItem['status']) => void
  onClaimTicket?: (ticketId: string) => void
}

export const TechnicianQueuePage: React.FC<TechnicianQueuePageProps> = ({
  incidents,
  onNavigate,
  onUpdateStatus,
  onClaimTicket
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unassigned' | 'mine' | 'critical' | 'in-progress' | 'resolved'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredIncidents = incidents.filter((item) => {
    // Filter pill logic
    if (activeFilter === 'unassigned' && item.assignedTechnician) return false
    if (activeFilter === 'mine' && !item.assignedTechnician) return false
    if (activeFilter === 'critical' && item.priority !== 'High' && item.priority !== 'Critical') return false
    if (activeFilter === 'in-progress' && item.status !== 'In Progress') return false
    if (activeFilter === 'resolved' && item.status !== 'Resolved' && item.status !== 'Closed') return false

    // Search query logic
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchId = item.id.toLowerCase().includes(q)
      const matchTitle = item.title.toLowerCase().includes(q)
      const matchLoc = item.location.toLowerCase().includes(q)
      const matchCat = item.category.toLowerCase().includes(q)
      const matchReporter = (item.reporterName || '').toLowerCase().includes(q)
      return matchId || matchTitle || matchLoc || matchCat || matchReporter
    }

    return true
  })

  return (
    <div className="dash-body">
      {/* Header */}
      <div className="greeting-section">
        <div className="greeting-text">
          <h1>Campus Operational Incident Queue</h1>
          <p>Triage, assign, and manage all logged campus infrastructure tickets.</p>
        </div>

        <button
          type="button"
          className="secondary-btn"
          onClick={() => onNavigate('tech-workspace')}
        >
          <SlidersHorizontal size={16} />
          <span>SWITCH TO KANBAN VIEW</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="incidents-card">
        {/* Header Controls: Filters & Search */}
        <div className="incidents-header">
          <div className="filter-tabs">
            <button
              type="button"
              className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Incidents ({incidents.length})
            </button>
            <button
              type="button"
              className={`filter-tab ${activeFilter === 'unassigned' ? 'active' : ''}`}
              onClick={() => setActiveFilter('unassigned')}
            >
              Unassigned ({incidents.filter((i) => !i.assignedTechnician).length})
            </button>
            <button
              type="button"
              className={`filter-tab ${activeFilter === 'mine' ? 'active' : ''}`}
              onClick={() => setActiveFilter('mine')}
            >
              Assigned ({incidents.filter((i) => i.assignedTechnician).length})
            </button>
            <button
              type="button"
              className={`filter-tab ${activeFilter === 'critical' ? 'active' : ''}`}
              onClick={() => setActiveFilter('critical')}
            >
              Critical ({incidents.filter((i) => i.priority === 'High' || i.priority === 'Critical').length})
            </button>
            <button
              type="button"
              className={`filter-tab ${activeFilter === 'in-progress' ? 'active' : ''}`}
              onClick={() => setActiveFilter('in-progress')}
            >
              In Progress ({incidents.filter((i) => i.status === 'In Progress').length})
            </button>
            <button
              type="button"
              className={`filter-tab ${activeFilter === 'resolved' ? 'active' : ''}`}
              onClick={() => setActiveFilter('resolved')}
            >
              Resolved ({incidents.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length})
            </button>
          </div>

          <div className="search-box" style={{ width: '280px' }}>
            <Search className="search-icon" size={14} />
            <input
              type="text"
              className="search-input"
              placeholder="Search ID, title, room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="table-container">
          <table className="incidents-table">
            <thead>
              <tr>
                <th>TICKET ID</th>
                <th>SUMMARY & LOCATION</th>
                <th>CATEGORY</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
                <th>SLA INDICATOR</th>
                <th>ASSIGNED TO</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map((item) => {
                const isCritical = item.priority === 'High' || item.priority === 'Critical'
                return (
                  <tr
                    key={item.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onNavigate('tech-incident-details', item.id)}
                  >
                    <td className="col-id">{item.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {item.location}
                      </div>
                    </td>
                    <td className="col-category">{item.category}</td>
                    <td>
                      <span className={`badge-priority ${item.priority.toLowerCase()}`}>
                        • {item.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${item.status.toLowerCase().replace(' ', '-')}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className={`sla-timer-badge ${isCritical ? 'warning' : 'normal'}`}>
                        <Clock size={13} />
                        <span>{item.slaTimer || 'Est 2h'}</span>
                      </div>
                    </td>
                    <td>
                      {item.assignedTechnician ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-heading)' }}>
                          <UserCheck size={14} className="text-blue-400" />
                          <span>{item.assignedTechnician.name}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#FBBF24', fontStyle: 'italic' }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {!item.assignedTechnician && onClaimTicket && (
                          <button
                            type="button"
                            className="card-action-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              onClaimTicket(item.id)
                            }}
                          >
                            Claim
                          </button>
                        )}

                        {item.status === 'Open' && (
                          <button
                            type="button"
                            className="card-action-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              onUpdateStatus(item.id, 'In Progress')
                            }}
                          >
                            Start
                          </button>
                        )}

                        <button
                          type="button"
                          className="ghost-btn"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            onNavigate('tech-incident-details', item.id)
                          }}
                        >
                          Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredIncidents.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No incident tickets matched your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
