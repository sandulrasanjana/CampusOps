import React, { useState } from 'react'
import {
  ArrowLeft,
  Clock,
  User,
  Send,
  MapPin,
  Tag,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Paperclip
} from 'lucide-react'
import { type IncidentItem } from './ReportIncidentPage'

interface IncidentDetailsPageProps {
  incident: IncidentItem | null
  onNavigate: (view: 'dashboard' | 'incidents' | 'incident-details' | 'report-incident' | 'profile', ticketId?: string) => void
  onAddComment?: (ticketId: string, commentText: string) => void
}

const LIFECYCLE_STEPS = ['Reported', 'Assigned', 'In Progress', 'Resolved', 'Closed'] as const

export const IncidentDetailsPage: React.FC<IncidentDetailsPageProps> = ({
  incident,
  onNavigate,
  onAddComment
}) => {
  const [commentText, setCommentText] = useState('')

  if (!incident) {
    return (
      <div className="dash-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <AlertCircle size={48} color="var(--status-open-text)" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, color: 'var(--text-heading)', marginBottom: 8 }}>Incident Ticket Not Found</h2>
        <p style={{ color: 'var(--text-body)', marginBottom: 24 }}>
          The requested ticket does not exist or may have been archived.
        </p>
        <button type="button" className="primary-btn" onClick={() => onNavigate('incidents')}>
          Return to My Incidents
        </button>
      </div>
    )
  }

  // Determine active step index for 5-step lifecycle
  const getStepIndex = (status: string) => {
    if (status === 'Open' || status === 'Reported') return 0
    if (status === 'Assigned') return 1
    if (status === 'In Progress') return 2
    if (status === 'Resolved') return 3
    if (status === 'Closed') return 4
    return 1 // Default
  }

  const currentStepIdx = getStepIndex(incident.status)

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    if (onAddComment) {
      onAddComment(incident.id, commentText.trim())
    }
    setCommentText('')
  }

  return (
    <div className="dash-body">
      {/* Top Header & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => onNavigate('incidents')}
        >
          <ArrowLeft size={16} />
          <span>Back to Incidents List</span>
        </button>

        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary-accent)' }}>
          {incident.id}
        </span>
      </div>

      {/* Ticket Title & Badge Banner */}
      <div className="incidents-card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="col-id" style={{ fontSize: 16 }}>{incident.id}</span>
              <span
                className={`badge-status ${
                  incident.status === 'Open' || incident.status === 'Reported'
                    ? 'open'
                    : incident.status === 'In Progress' || incident.status === 'Assigned'
                    ? 'in-progress'
                    : 'resolved'
                }`}
              >
                {incident.status}
              </span>
              <span
                className={`badge-priority ${
                  incident.priority === 'Critical' || incident.priority === 'High'
                    ? 'high'
                    : incident.priority === 'Medium'
                    ? 'medium'
                    : 'low'
                }`}
              >
                {incident.priority} Priority
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-inter)', fontSize: 24, fontWeight: 700, color: 'var(--text-heading)' }}>
              {incident.title}
            </h1>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>REPORTED DATE</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-heading)', fontWeight: 600 }}>
              {incident.date}
            </span>
          </div>
        </div>

        {/* 5-Step Lifecycle Progress Bar */}
        <div style={{ marginTop: 12, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {/* Background connecting line */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: '10%',
                right: '10%',
                height: 3,
                background: 'var(--border-subtle)',
                zIndex: 1
              }}
            />
            {/* Active connecting line */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: '10%',
                width: `${(currentStepIdx / (LIFECYCLE_STEPS.length - 1)) * 80}%`,
                height: 3,
                background: 'var(--primary-accent)',
                zIndex: 2,
                transition: 'width 0.3s ease'
              }}
            />

            {LIFECYCLE_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIdx
              const isCurrent = idx === currentStepIdx
              return (
                <div
                  key={step}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 3
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: isCompleted || isCurrent ? 'var(--primary-accent)' : 'var(--bg-base)',
                      border: `2px solid ${isCompleted || isCurrent ? 'var(--primary-accent)' : 'var(--border-subtle)'}`,
                      color: isCompleted || isCurrent ? '#ffffff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      boxShadow: isCurrent ? '0 0 12px var(--accent-glow)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>
                  <span
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? 'var(--text-heading)' : isCompleted ? 'var(--text-body)' : 'var(--text-muted)'
                    }}
                  >
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Split Layout: Main Details & Activity vs Sidebar Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Main Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Incident Overview Card */}
          <div className="incidents-card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 16 }}>
              Incident Overview
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MapPin size={18} color="var(--primary-accent)" />
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>LOCATION / ROOM</span>
                  <span style={{ fontSize: 13, color: 'var(--text-heading)', fontWeight: 600 }}>{incident.location}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Tag size={18} color="var(--primary-accent)" />
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>CATEGORY</span>
                  <span style={{ fontSize: 13, color: 'var(--text-heading)', fontWeight: 600 }}>{incident.category}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                DETAILED DESCRIPTION
              </span>
              <p style={{ fontSize: 14, color: 'var(--text-heading)', lineHeight: 1.6, background: 'var(--bg-base)', padding: 16, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                {incident.description}
              </p>
            </div>

            {/* Attachments Section */}
            {incident.attachments && incident.attachments.length > 0 && (
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                  ATTACHED FILES ({incident.attachments.length})
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {incident.attachments.map((file, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'var(--bg-base)',
                        border: '1px solid var(--border-subtle)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 13,
                        color: 'var(--text-heading)'
                      }}
                    >
                      <Paperclip size={14} color="var(--primary-accent)" />
                      <span>{file.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({file.size})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activity & Comments Timeline */}
          <div className="incidents-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <MessageSquare size={18} color="var(--primary-accent)" />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-heading)' }}>
                Activity & Comments
              </h3>
            </div>

            {/* Comments List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {(!incident.comments || incident.comments.length === 0) ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No activity logs yet.</p>
              ) : (
                incident.comments.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 16
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}>{c.author}</span>
                        <span style={{ fontSize: 11, padding: '2px 6px', background: 'var(--surface-elevated)', borderRadius: 4, color: 'var(--text-muted)' }}>
                          {c.role}
                        </span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                        {c.timestamp}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-body)', lineHeight: 1.5 }}>
                      {c.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Write an update or comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{ paddingLeft: 14 }}
              />
              <button
                type="submit"
                className="primary-btn"
                style={{ width: 'auto', padding: '10px 18px', whiteSpace: 'nowrap' }}
              >
                <Send size={14} />
                <span>Post Comment</span>
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Meta Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Assigned Technician Card */}
          <div className="incidents-card" style={{ padding: 24 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', display: 'block', marginBottom: 14 }}>
              ASSIGNED TECHNICIAN
            </span>

            {incident.assignedTechnician ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--primary-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700
                  }}
                >
                  {incident.assignedTechnician.name[0]}
                </div>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-heading)', display: 'block' }}>
                    {incident.assignedTechnician.name}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {incident.assignedTechnician.role}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <User size={18} color="var(--text-muted)" />
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                  Pending Technician Assignment
                </span>
              </div>
            )}
          </div>

          {/* Reporter Info Card */}
          <div className="incidents-card" style={{ padding: 24 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', display: 'block', marginBottom: 14 }}>
              REPORTER INFO
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--surface-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-heading)'
                }}
              >
                <User size={18} />
              </div>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', display: 'block' }}>
                  {incident.reporterName || 'Sandul'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Undergraduate - CS
                </span>
              </div>
            </div>
          </div>

          {/* SLA Target Timer Card */}
          <div className="incidents-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Clock size={18} color="var(--status-progress-text)" />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>
                SLA RESOLUTION TARGET
              </span>
            </div>

            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--status-progress-text)', display: 'block' }}>
              {incident.slaTimer || 'Est. Resolution: 3h 15m'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
