import React, { useState } from 'react'
import {
  Clock,
  MapPin,
  Server,
  SlidersHorizontal,
  MoreVertical,
  Plus,
  CheckCircle2
} from 'lucide-react'
import type { IncidentItem } from './ReportIncidentPage'
import type { ViewType } from '../App'

interface TechnicianWorkspacePageProps {
  incidents: IncidentItem[]
  onNavigate: (view: ViewType | 'login', ticketId?: string) => void
  onUpdateStatus: (ticketId: string, newStatus: IncidentItem['status']) => void
}

export const TechnicianWorkspacePage: React.FC<TechnicianWorkspacePageProps> = ({
  incidents,
  onNavigate,
  onUpdateStatus
}) => {
  const [activeTab, setActiveTab] = useState<'assigned' | 'unassigned' | 'critical'>('assigned')

  // Filter dataset based on activeTab
  const filteredIncidents = incidents.filter((item) => {
    if (activeTab === 'critical') {
      return item.priority === 'High' || item.priority === 'Critical'
    }
    if (activeTab === 'unassigned') {
      return !item.assignedTechnician
    }
    // Default assigned to technician / workspace view
    return true
  })

  // Separate into columns
  const assignedColumn = filteredIncidents.filter((i) => i.status === 'Open')
  const inProgressColumn = filteredIncidents.filter((i) => i.status === 'In Progress')
  const resolvedColumn = filteredIncidents.filter((i) => i.status === 'Resolved' || i.status === 'Closed')

  // Action handlers
  const handleStartInvestigation = (e: React.MouseEvent, ticketId: string) => {
    e.stopPropagation()
    onUpdateStatus(ticketId, 'In Progress')
  }

  const handleMarkResolved = (e: React.MouseEvent, ticketId: string) => {
    e.stopPropagation()
    onUpdateStatus(ticketId, 'Resolved')
  }

  return (
    <div className="dash-body">
      {/* Workspace Header with Filter Tabs */}
      <div className="workspace-header">
        <div className="workspace-title-group">
          <h1 className="workspace-title">Workspace</h1>

          <div className="workspace-nav-tabs">
            <button
              type="button"
              className={`workspace-nav-btn ${activeTab === 'assigned' ? 'active' : ''}`}
              onClick={() => setActiveTab('assigned')}
            >
              <span>ASSIGNED TO ME</span>
              <span className="tab-badge">{incidents.filter((i) => i.assignedTechnician).length}</span>
            </button>

            <button
              type="button"
              className={`workspace-nav-btn ${activeTab === 'unassigned' ? 'active' : ''}`}
              onClick={() => setActiveTab('unassigned')}
            >
              <span>UNASSIGNED QUEUE</span>
              <span className="tab-badge">{incidents.filter((i) => !i.assignedTechnician).length}</span>
            </button>

            <button
              type="button"
              className={`workspace-nav-btn critical-tab ${activeTab === 'critical' ? 'active' : ''}`}
              onClick={() => setActiveTab('critical')}
            >
              <span>CRITICAL PRIORITY</span>
              <span className="tab-badge">
                {incidents.filter((i) => i.priority === 'High' || i.priority === 'Critical').length}
              </span>
            </button>
          </div>
        </div>

        <div className="topbar-actions">
          <button type="button" className="icon-btn" title="Filter Settings">
            <SlidersHorizontal size={18} />
          </button>
          <button type="button" className="icon-btn" title="More Options">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Kanban Column Grid */}
      <div className="kanban-board">
        {/* Column 1: ASSIGNED */}
        <div className="kanban-column">
          <div className="kanban-column-header">
            <div className="column-title-group">
              <span className="column-dot assigned"></span>
              <span className="column-title">ASSIGNED</span>
              <span className="column-count">{assignedColumn.length}</span>
            </div>
            <button type="button" className="column-add-btn" title="Add Ticket">
              <Plus size={16} />
            </button>
          </div>

          <div className="kanban-cards-wrapper">
            {assignedColumn.map((item) => {
              const isCritical = item.priority === 'High' || item.priority === 'Critical'
              return (
                <div
                  key={item.id}
                  className="kanban-card"
                  onClick={() => onNavigate('tech-incident-details', item.id)}
                >
                  <div className="kanban-card-top">
                    <span className="ticket-id-tag">{item.id}</span>
                    <span className={`priority-tag-pill ${isCritical ? 'critical' : 'high'}`}>
                      • {item.priority.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="kanban-card-title">{item.title}</h3>

                  <div className="kanban-card-meta">
                    <MapPin size={14} className="text-slate-400" />
                    <span>{item.location}</span>
                  </div>

                  <div className="kanban-card-footer">
                    <div className={`sla-timer-badge ${isCritical ? 'warning' : 'normal'}`}>
                      <Clock size={13} />
                      <span>{item.slaTimer || '0h 15m'}</span>
                    </div>

                    <button
                      type="button"
                      className="card-action-btn"
                      onClick={(e) => handleStartInvestigation(e, item.id)}
                    >
                      Start Investigation
                    </button>
                  </div>
                </div>
              )
            })}

            {assignedColumn.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No assigned incidents in queue.
              </div>
            )}
          </div>
        </div>

        {/* Column 2: IN PROGRESS */}
        <div className="kanban-column">
          <div className="kanban-column-header">
            <div className="column-title-group">
              <span className="column-dot progress"></span>
              <span className="column-title">IN PROGRESS</span>
              <span className="column-count">{inProgressColumn.length}</span>
            </div>
            <button type="button" className="column-add-btn" title="Add Ticket">
              <Plus size={16} />
            </button>
          </div>

          <div className="kanban-cards-wrapper">
            {inProgressColumn.map((item) => (
              <div
                key={item.id}
                className="kanban-card"
                onClick={() => onNavigate('tech-incident-details', item.id)}
              >
                <div className="kanban-card-top">
                  <span className="ticket-id-tag">{item.id}</span>
                  <span className="priority-tag-pill medium">
                    {item.priority.toUpperCase()}
                  </span>
                </div>

                <h3 className="kanban-card-title">{item.title}</h3>

                <div className="kanban-card-meta">
                  <Server size={14} className="text-slate-400" />
                  <span>{item.category} • {item.location}</span>
                </div>

                {/* Progress Bar */}
                <div className="kanban-progress-box">
                  <div className="progress-label-row">
                    <span>Diagnosis phase</span>
                    <span>{item.diagnosisProgress || 65}%</span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${item.diagnosisProgress || 65}%` }}
                    ></div>
                  </div>
                </div>

                <div className="kanban-card-footer">
                  <div className="sla-timer-badge normal">
                    <Clock size={13} />
                    <span>{item.slaTimer || '3h 10m'}</span>
                  </div>

                  <button
                    type="button"
                    className="card-action-btn"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={(e) => handleMarkResolved(e, item.id)}
                  >
                    <CheckCircle2 size={13} />
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))}

            {inProgressColumn.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No active investigations in progress.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: RESOLVED */}
        <div className="kanban-column">
          <div className="kanban-column-header">
            <div className="column-title-group">
              <span className="column-dot resolved"></span>
              <span className="column-title">RESOLVED</span>
              <span className="column-count">{resolvedColumn.length}</span>
            </div>
            <button type="button" className="column-add-btn" title="Add Ticket">
              <Plus size={16} />
            </button>
          </div>

          <div className="kanban-cards-wrapper">
            {resolvedColumn.map((item) => (
              <div
                key={item.id}
                className="kanban-card"
                style={{ opacity: 0.85 }}
                onClick={() => onNavigate('tech-incident-details', item.id)}
              >
                <div className="kanban-card-top">
                  <span className="ticket-id-tag" style={{ textDecoration: 'line-through' }}>
                    {item.id}
                  </span>
                  <span className="priority-tag-pill low">
                    RESOLVED
                  </span>
                </div>

                <h3 className="kanban-card-title">{item.title}</h3>

                <div className="kanban-card-meta">
                  <Server size={14} className="text-slate-400" />
                  <span>{item.category}</span>
                </div>

                <div className="kanban-card-footer">
                  <div className="sla-timer-badge resolved">
                    <CheckCircle2 size={13} />
                    <span>Closed recently</span>
                  </div>
                </div>
              </div>
            ))}

            {resolvedColumn.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No resolved incidents stored.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
