import React, { useState } from 'react'
import { X, PlusCircle } from 'lucide-react'

export interface IncidentItem {
  id: string
  title: string
  category: 'IT Support' | 'Facilities' | 'Security'
  priority: 'High' | 'Medium' | 'Low'
  status: 'Open' | 'In Progress' | 'Resolved'
  date: string
}

interface ReportIncidentModalProps {
  isOpen: boolean
  onClose: () => void
  onAddIncident: (newIncident: IncidentItem) => void
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  isOpen,
  onClose,
  onAddIncident
}) => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<'IT Support' | 'Facilities' | 'Security'>('IT Support')
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')

  if (!isOpen) return null

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
      title: title.trim() + (location ? ` (${location.trim()})` : ''),
      category,
      priority,
      status: 'Open',
      date: formattedDate
    }

    onAddIncident(newIncident)
    onClose()
    setTitle('')
    setLocation('')
    setDescription('')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="metric-icon-box open" style={{ width: 36, height: 36 }}>
              <PlusCircle size={20} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-geist)', fontSize: 20, color: '#fff', fontWeight: 700 }}>
              Report New Incident
            </h3>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>Incident Title</label>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 14 }}
              placeholder="e.g. Projector power fault or Broken chair"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-group">
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>Category</label>
              <select
                className="form-input"
                style={{ paddingLeft: 14, cursor: 'pointer' }}
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
              >
                <option value="IT Support">IT Support</option>
                <option value="Facilities">Facilities</option>
                <option value="Security">Security</option>
              </select>
            </div>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>Priority Level</label>
              <select
                className="form-input"
                style={{ paddingLeft: 14, cursor: 'pointer' }}
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>Location / Room (Optional)</label>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 14 }}
              placeholder="e.g. Room 302, North Wing"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>Description</label>
            <textarea
              className="form-input"
              style={{ paddingLeft: 14, minHeight: 80, resize: 'vertical', paddingTop: 10 }}
              placeholder="Provide context regarding the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-btn"
              style={{ width: 'auto' }}
            >
              Submit Incident Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
