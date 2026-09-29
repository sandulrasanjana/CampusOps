import React, { useState } from 'react'
import { X, PlusCircle } from 'lucide-react'
import { createIncident } from '../services/api'

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
  onAddIncident: (newIncident: any) => void
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      setIsSubmitting(true)
      setModalError(null)

      const created = await createIncident({
        title: title.trim(),
        description: description.trim() || 'Reported via Quick Modal',
        category,
        location: location.trim() || 'Main Campus',
        priority
      })

      onAddIncident(created)
      setTitle('')
      setLocation('')
      setDescription('')
      onClose()
    } catch (err: any) {
      console.error('Modal create incident error:', err)
      setModalError(err.message || 'Failed to submit incident ticket')
    } finally {
      setIsSubmitting(false)
    }
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

        {modalError && (
          <div className="status-banner error" style={{ marginBottom: 16 }}>
            <span>{modalError}</span>
          </div>
        )}

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
                onChange={(e) => setCategory(e.target.value as 'IT Support' | 'Facilities' | 'Security')}
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
                onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
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
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-btn"
              style={{ width: 'auto' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Incident Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
