import React, { useState } from 'react'
import {
  ArrowLeft,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  Send,
  Lock,
  MessageSquare,
  FileText,
  UserCheck,
  ChevronRight
} from 'lucide-react'
import type { IncidentItem } from './ReportIncidentPage'
import type { ViewType } from '../App'

interface TechnicianIncidentDetailsPageProps {
  incident: IncidentItem | null
  onNavigate: (view: ViewType | 'login', ticketId?: string) => void
  onUpdateStatus: (ticketId: string, newStatus: IncidentItem['status']) => void
  onAddComment: (ticketId: string, text: string, isInternal?: boolean) => void
}

export const TechnicianIncidentDetailsPage: React.FC<TechnicianIncidentDetailsPageProps> = ({
  incident,
  onNavigate,
  onUpdateStatus,
  onAddComment
}) => {
  const [commentInput, setCommentInput] = useState('')
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [resolutionCategory, setResolutionCategory] = useState('Hardware Replacement')
  const [resolutionNotes, setResolutionNotes] = useState('')

  if (!incident) {
    return (
      <div className="dash-body" style={{ textAlign: 'center', padding: '60px' }}>
        <h2>Incident not found</h2>
        <button
          type="button"
          className="primary-btn"
          style={{ width: 'auto', margin: '20px auto' }}
          onClick={() => onNavigate('tech-workspace')}
        >
          Return to Workspace
        </button>
      </div>
    )
  }

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentInput.trim()) return
    onAddComment(incident.id, commentInput.trim(), isInternalNote)
    setCommentInput('')
  }

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateStatus(incident.id, 'Resolved')
    if (resolutionNotes.trim()) {
      onAddComment(incident.id, `[RESOLVED]: ${resolutionCategory} - ${resolutionNotes}`, true)
    }
    setShowResolveModal(false)
  }

  const isCritical = incident.priority === 'High' || incident.priority === 'Critical'

  return (
    <div className="dash-body">
      {/* Header Bar */}
      <div style={{ marginBottom: '24px' }}>
        <button
          type="button"
          className="view-all-btn"
          style={{ paddingLeft: 0, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => onNavigate('tech-workspace')}
        >
          <ArrowLeft size={16} />
          <span>BACK TO WORKSPACE KANBAN</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: 'var(--primary-accent)' }}>
                {incident.id}
              </span>
              <span className={`badge-priority ${incident.priority.toLowerCase()}`}>
                • {incident.priority} PRIORITY
              </span>
              <span className={`badge-status ${incident.status.toLowerCase().replace(' ', '-')}`}>
                {incident.status}
              </span>
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '8px' }}>
              {incident.title}
            </h1>
          </div>

          {/* Quick Status Controller Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {incident.status === 'Open' && (
              <button
                type="button"
                className="submit-btn"
                style={{ width: 'auto', padding: '10px 18px', background: '#3B82F6' }}
                onClick={() => onUpdateStatus(incident.id, 'In Progress')}
              >
                Start Investigation
              </button>
            )}

            {incident.status === 'In Progress' && (
              <button
                type="button"
                className="submit-btn"
                style={{ width: 'auto', padding: '10px 18px', background: '#10B981' }}
                onClick={() => setShowResolveModal(true)}
              >
                <CheckCircle2 size={16} />
                <span>Mark Resolved</span>
              </button>
            )}

            {incident.status === 'Resolved' && (
              <button
                type="button"
                className="ghost-btn"
                onClick={() => onUpdateStatus(incident.id, 'Closed')}
              >
                Close Ticket
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Split Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px' }}>
        {/* Left Column: Details & Notes Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Overview Card */}
          <div className="incidents-card">
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '14px' }}>
              Incident Details & Diagnostics
            </h3>

            <p style={{ fontSize: '14px', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: '20px' }}>
              {incident.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--bg-base)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>LOCATION / ASSET</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginTop: '2px' }}>{incident.location}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>CATEGORY QUEUE</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginTop: '2px' }}>{incident.category}</div>
              </div>
            </div>

            {/* Attachments */}
            {incident.attachments && incident.attachments.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
                  ATTACHED DIAGNOSTIC FILES ({incident.attachments.length})
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {incident.attachments.map((file, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '13px',
                        color: 'var(--text-heading)'
                      }}
                    >
                      <FileText size={16} className="text-blue-400" />
                      <span>{file.name} ({file.size})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activity Feed & Technician Comments */}
          <div className="incidents-card">
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '16px' }}>
              Activity Feed & Technical Log
            </h3>

            {/* Comments List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              {(incident.comments || []).map((c) => {
                const isInternal = c.role === 'Technician Internal' || c.text.includes('[INTERNAL]')
                return (
                  <div
                    key={c.id}
                    style={{
                      background: isInternal ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-base)',
                      border: isInternal ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '14px 16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-heading)' }}>
                          {c.author}
                        </span>
                        {isInternal ? (
                          <span className="internal-note-badge">
                            <Lock size={10} /> INTERNAL NOTE
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            • {c.role}
                          </span>
                        )}
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                        {c.timestamp}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: 1.5 }}>
                      {c.text}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Comment Form with Internal Note Toggle */}
            <form onSubmit={handlePostComment}>
              <div className="note-type-toggle">
                <button
                  type="button"
                  className={`note-toggle-btn ${!isInternalNote ? 'active public' : ''}`}
                  onClick={() => setIsInternalNote(false)}
                >
                  <MessageSquare size={12} style={{ marginRight: '4px' }} />
                  Public Student Reply
                </button>
                <button
                  type="button"
                  className={`note-toggle-btn ${isInternalNote ? 'active internal' : ''}`}
                  onClick={() => setIsInternalNote(true)}
                >
                  <Lock size={12} style={{ marginRight: '4px' }} />
                  Internal Tech Note
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <textarea
                  className="form-input"
                  style={{
                    paddingLeft: '14px',
                    minHeight: '90px',
                    borderColor: isInternalNote ? 'rgba(245, 158, 11, 0.4)' : undefined
                  }}
                  placeholder={
                    isInternalNote
                      ? 'Write confidential note for technicians (hidden from student)...'
                      : 'Post response to student...'
                  }
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                ></textarea>

                <button
                  type="submit"
                  className="primary-btn"
                  style={{
                    width: 'auto',
                    position: 'absolute',
                    right: '12px',
                    bottom: '12px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    background: isInternalNote ? '#F59E0B' : 'var(--primary-accent)'
                  }}
                >
                  <Send size={12} />
                  <span>Post Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: SLA Card & Assignment Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* SLA Tracker Card */}
          <div className="incidents-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Clock size={18} className={isCritical ? 'text-red-400' : 'text-blue-400'} />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-heading)' }}>
                SLA Compliance Tracker
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'var(--bg-base)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Response SLA ({'< 30m'})</span>
                  <span style={{ color: '#34D399', fontWeight: 600 }}>Met (12m)</span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: '100%', background: '#10B981' }}></div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-base)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Resolution Target SLA</span>
                  <span style={{ color: isCritical ? '#F87171' : '#FBBF24', fontWeight: 600 }}>
                    {incident.slaTimer || '1h 30m remaining'}
                  </span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{ width: '75%', background: isCritical ? '#EF4444' : '#F59E0B' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Technician Card */}
          <div className="incidents-card">
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '14px' }}>
              Assigned Specialist
            </h3>

            {incident.assignedTechnician ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}>
                  <UserCheck size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-heading)' }}>
                    {incident.assignedTechnician.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {incident.assignedTechnician.role}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)', color: '#FBBF24', fontSize: '13px', marginBottom: '16px' }}>
                Currently Unassigned in Queue
              </div>
            )}

            <button
              type="button"
              className="secondary-btn"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>Reassign Specialist</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Student Reporter Card */}
          <div className="incidents-card">
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '12px' }}>
              Student Reporter
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-accent)' }}>
                <User size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-heading)' }}>
                  {incident.reporterName || 'Sandul'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Student ID: STU-89241
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resolve Incident Modal */}
      {showResolveModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <ShieldCheck size={24} className="text-emerald-400" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)' }}>
                Resolve Incident {incident.id}
              </h2>
            </div>

            <form onSubmit={handleConfirmResolve}>
              <div className="form-group">
                <label className="form-label">RESOLUTION CATEGORY</label>
                <select
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                  value={resolutionCategory}
                  onChange={(e) => setResolutionCategory(e.target.value)}
                >
                  <option value="Hardware Replacement">Hardware Replacement</option>
                  <option value="Software Patch Applied">Software Patch Applied</option>
                  <option value="Network Configuration Reset">Network Configuration Reset</option>
                  <option value="Maintenance Cleared">Maintenance Cleared</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">ROOT CAUSE & RESOLUTION NOTES</label>
                <textarea
                  className="form-input"
                  style={{ paddingLeft: '14px', minHeight: '100px' }}
                  placeholder="Describe cause and fix applied..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="ghost-btn"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setShowResolveModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  style={{ flex: 1, background: '#10B981' }}
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
