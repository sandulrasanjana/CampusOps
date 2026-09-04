import React, { useState } from 'react'
import {
  PlusCircle,
  UploadCloud,
  FileText,
  X,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react'

export interface IncidentItem {
  id: string
  title: string
  category: 'IT Support' | 'Facilities' | 'Security' | 'Network & Wi-Fi' | 'Lab Hardware'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Reported' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed' | 'Open'
  location: string
  description: string
  date: string
  reporterName?: string
  assignedTechnician?: {
    name: string
    role: string
    avatar?: string
  } | null
  slaTimer?: string
  attachments?: { name: string; size: string }[]
  comments?: {
    id: string
    author: string
    avatar?: string
    role: string
    text: string
    timestamp: string
  }[]
}

interface ReportIncidentPageProps {
  onAddIncident: (newIncident: IncidentItem) => void
  onNavigate: (view: 'dashboard' | 'incidents' | 'incident-details' | 'report-incident' | 'profile', ticketId?: string) => void
}

export const ReportIncidentPage: React.FC<ReportIncidentPageProps> = ({
  onAddIncident,
  onNavigate
}) => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<IncidentItem['category']>('IT Support')
  const [location, setLocation] = useState('')
  const [priority, setPriority] = useState<IncidentItem['priority']>('Medium')
  const [description, setDescription] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string }[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleFileChange = (files: FileList | null) => {
    if (!files) return
    const newFiles: { name: string; size: string }[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2)
      newFiles.push({ name: file.name, size: `${sizeMb} MB` })
    }
    setAttachedFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const now = new Date()
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = monthNames[now.getMonth()]
    const day = now.getDate()
    const hours = String(now.getHours()).padStart(2, '0')
    const mins = String(now.getMinutes()).padStart(2, '0')
    const formattedDate = `${month} ${day}, ${hours}:${mins}`

    const newId = `INC-${Math.floor(1000 + Math.random() * 9000)}`

    const newIncident: IncidentItem = {
      id: newId,
      title: title.trim(),
      category,
      priority,
      status: 'Open',
      location: location.trim() || 'Main Campus',
      description: description.trim() || 'No additional description provided.',
      date: formattedDate,
      reporterName: 'Sandul',
      assignedTechnician: null,
      slaTimer: 'Est. Resolution: 4h 00m',
      attachments: attachedFiles,
      comments: [
        {
          id: 'c1',
          author: 'System Dispatch',
          role: 'System',
          text: `Ticket ${newId} logged successfully. Assigned to tier-1 queue for triage.`,
          timestamp: formattedDate
        }
      ]
    }

    onAddIncident(newIncident)
    setSubmitSuccess(true)

    setTimeout(() => {
      onNavigate('incidents')
    }, 1200)
  }

  return (
    <div className="dash-body">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => onNavigate('dashboard')}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          CAMPUSOPS / TICKET PROVISIONING
        </span>
      </div>

      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div className="incidents-title-icon">
              <PlusCircle size={22} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-inter)', fontSize: 24, fontWeight: 700, color: 'var(--text-heading)' }}>
                Report New Incident
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-body)' }}>
                Submit infrastructure or technical issues for high-velocity dispatch and resolution.
              </p>
            </div>
          </div>
        </div>

        {submitSuccess && (
          <div className="status-banner success" style={{ marginBottom: 24 }}>
            <CheckCircle2 size={18} />
            <span>Incident reported successfully! Redirecting to My Incidents list...</span>
          </div>
        )}

        {/* Form Card */}
        <div className="incidents-card" style={{ padding: 36 }}>
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
                INCIDENT TITLE *
              </label>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 14 }}
                placeholder="e.g. Wi-Fi dropping in Library 3rd Floor or Broken projector lamp"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Category & Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
                  CATEGORY *
                </label>
                <select
                  className="form-input"
                  style={{ paddingLeft: 14, cursor: 'pointer' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  <option value="IT Support">IT Support</option>
                  <option value="Facilities">Facilities</option>
                  <option value="Security">Security</option>
                  <option value="Network & Wi-Fi">Network & Wi-Fi</option>
                  <option value="Lab Hardware">Lab Hardware</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
                  LOCATION / ROOM *
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: 14 }}
                  placeholder="e.g. North Wing Room 302"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Priority Segmented Selector */}
            <div className="form-group" style={{ marginBottom: 28 }}>
              <label className="form-label" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
                PRIORITY LEVEL *
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 8,
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 4
                }}
              >
                {(['Low', 'Medium', 'High', 'Critical'] as const).map((p) => {
                  const isActive = priority === p
                  return (
                    <button
                      key={p}
                      type="button"
                      className={`filter-tab ${isActive ? 'active' : ''}`}
                      onClick={() => setPriority(p)}
                      style={{ padding: '10px 12px', textAlign: 'center' }}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Description Textarea */}
            <div className="form-group" style={{ marginBottom: 28 }}>
              <label className="form-label" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
                INCIDENT DESCRIPTION *
              </label>
              <textarea
                className="form-input"
                style={{ paddingLeft: 14, minHeight: 120, resize: 'vertical', paddingTop: 12 }}
                placeholder="Provide detailed description of the error, symptoms, or physical damage..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* File Attachment Dropzone */}
            <div className="form-group" style={{ marginBottom: 32 }}>
              <label className="form-label" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
                ATTACHMENTS & SCREENSHOTS (OPTIONAL)
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragOver(true)
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragOver(false)
                  handleFileChange(e.dataTransfer.files)
                }}
                style={{
                  border: `2px dashed ${isDragOver ? 'var(--primary-accent)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '32px 20px',
                  textAlign: 'center',
                  background: isDragOver ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-base)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('file-upload-input')?.click()}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileChange(e.target.files)}
                />
                <UploadCloud size={32} color="var(--primary-accent)" style={{ marginBottom: 10 }} />
                <p style={{ fontSize: 14, color: 'var(--text-heading)', fontWeight: 600, marginBottom: 4 }}>
                  Click to upload or drag & drop files here
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Supports PNG, JPG, PDF, or LOG files (max 10MB per file)
                </p>
              </div>

              {/* List of Attached Files */}
              {attachedFiles.length > 0 && (
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {attachedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'var(--surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FileText size={16} color="var(--primary-accent)" />
                        <span style={{ fontSize: 13, color: 'var(--text-heading)', fontWeight: 500 }}>{file.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({file.size})</span>
                      </div>
                      <button
                        type="button"
                        className="icon-btn"
                        style={{ padding: 4 }}
                        onClick={() => removeFile(idx)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => onNavigate('incidents')}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-btn"
                style={{ width: 'auto', padding: '12px 28px' }}
                disabled={submitSuccess}
              >
                Submit Incident & Route
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
