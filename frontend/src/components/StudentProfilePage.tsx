import React from 'react'
import {
  Mail,
  ShieldCheck,
  Award,
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
  Key
} from 'lucide-react'
import { type IncidentItem } from './ReportIncidentPage'

interface StudentProfilePageProps {
  userName?: string
  incidents: IncidentItem[]
  onLogout: () => void
  onNavigate: (view: 'dashboard' | 'incidents' | 'incident-details' | 'report-incident' | 'profile', ticketId?: string) => void
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({
  userName = 'Sandul',
  incidents,
  onLogout,
  onNavigate
}) => {
  const totalCount = incidents.length
  const activeCount = incidents.filter((i) => i.status === 'Open' || i.status === 'In Progress').length
  const resolvedCount = incidents.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length + 6

  return (
    <div className="dash-body">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-inter)', fontSize: 24, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 4 }}>
          Student Profile & Workspace Settings
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-body)' }}>
          Manage your account identity, security tokens, and view incident activity history.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Main Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Profile Summary Card */}
          <div className="incidents-card" style={{ padding: 32, display: 'flex', alignItems: 'flex-start', gap: 24 }}>
            {/* Avatar */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: 32,
                fontWeight: 700,
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {userName[0] || 'S'}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-heading)' }}>{userName}</h2>
                <span className="badge-status resolved">
                  Active Session
                </span>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-body)', marginBottom: 16 }}>
                Undergraduate Student — Department of Computer Science & Software Engineering
              </p>

              {/* Grid Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Mail size={16} color="var(--primary-accent)" />
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>STUDENT EMAIL</span>
                    <span style={{ fontSize: 13, color: 'var(--text-heading)', fontWeight: 600 }}>
                      {userName.toLowerCase()}@campusops.edu
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Award size={16} color="var(--primary-accent)" />
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>STUDENT ID</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-heading)', fontWeight: 600 }}>
                      STU-89241
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShieldCheck size={16} color="var(--status-resolved-text)" />
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>AUTH PROVIDER</span>
                    <span style={{ fontSize: 13, color: 'var(--text-heading)', fontWeight: 600 }}>
                      Firebase & Google SSO
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Key size={16} color="var(--primary-accent)" />
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>ENCRYPTION</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-heading)', fontWeight: 600 }}>
                      256-bit TLS Handshake
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Overview Cards */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 16 }}>
              Incident Activity Overview
            </h3>

            <div className="metrics-grid">
              <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('incidents')}>
                <div className="metric-icon-box open">
                  <AlertCircle size={22} />
                </div>
                <div className="metric-details">
                  <span className="metric-number">{totalCount}</span>
                  <span className="metric-title">Total Reported</span>
                </div>
              </div>

              <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('incidents')}>
                <div className="metric-icon-box progress">
                  <Clock size={22} />
                </div>
                <div className="metric-details">
                  <span className="metric-number">{activeCount}</span>
                  <span className="metric-title">Active In-Progress</span>
                </div>
              </div>

              <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('incidents')}>
                <div className="metric-icon-box resolved">
                  <CheckCircle2 size={22} />
                </div>
                <div className="metric-details">
                  <span className="metric-number">{resolvedCount}</span>
                  <span className="metric-title">Resolved</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="incidents-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 14 }}>
              Account Actions
            </h3>

            <button
              type="button"
              className="ghost-btn"
              style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
              onClick={() => onNavigate('report-incident')}
            >
              + Report New Incident
            </button>

            <button
              type="button"
              className="ghost-btn"
              style={{ width: '100%', justifyContent: 'center', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#F87171' }}
              onClick={onLogout}
            >
              <LogOut size={16} />
              <span>Sign Out of CampusOps</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
