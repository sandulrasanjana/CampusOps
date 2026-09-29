import { useState, useEffect } from 'react'
import logoImg from './assets/logo.png'
import {
  LayoutGrid,
  AlertTriangle,
  Briefcase,
  BarChart2,
  Search,
  Plus,
  Bell,
  User as UserIcon,
  LogOut,
  Shield,
  Wrench,
  GraduationCap,
  Users
} from 'lucide-react'
import { LoginPage } from './components/LoginPage'
import { StudentDashboard } from './components/StudentDashboard'
import { ReportIncidentPage, type IncidentItem } from './components/ReportIncidentPage'
import { MyIncidentsPage } from './components/MyIncidentsPage'
import { IncidentDetailsPage } from './components/IncidentDetailsPage'
import { StudentProfilePage } from './components/StudentProfilePage'
import { TechnicianWorkspacePage } from './components/TechnicianWorkspacePage'
import { TechnicianDashboard } from './components/TechnicianDashboard'
import { TechnicianQueuePage } from './components/TechnicianQueuePage'
import { TechnicianIncidentDetailsPage } from './components/TechnicianIncidentDetailsPage'
import { AdminDashboard } from './components/AdminDashboard'
import { AdminStaffPage } from './components/AdminStaffPage'
import { AdminAnalyticsPage } from './components/AdminAnalyticsPage'
import { auth, onAuthStateChanged, signOut, type FirebaseUser } from './firebase'
import {
  getIncidents,
  updateIncidentStatus as apiUpdateIncidentStatus,
  addIncidentComment as apiAddIncidentComment,
  getIncidentById as apiGetIncidentById
} from './services/api'

export type ViewType =
  | 'dashboard'
  | 'incidents'
  | 'incident-details'
  | 'report-incident'
  | 'profile'
  | 'workspace'
  | 'analytics'
  | 'status'
  | 'tech-dashboard'
  | 'tech-workspace'
  | 'tech-queue'
  | 'tech-incident-details'
  | 'admin-dashboard'
  | 'admin-staff'
  | 'admin-analytics'

function App() {
  const [currentView, setCurrentView] = useState<ViewType | 'login'>('login')
  const [selectedTicketId, setSelectedTicketId] = useState<string | undefined>(undefined)
  const [userRole, setUserRole] = useState<'Student' | 'Technician' | 'Admin'>('Student')
  const [user, setUser] = useState('Sandul')
  const [, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Incident state loaded from API
  const [incidents, setIncidents] = useState<IncidentItem[]>([])
  const [loadingIncidents, setLoadingIncidents] = useState<boolean>(true)
  const [apiError, setApiError] = useState<string | null>(null)

  const fetchIncidentsData = async () => {
    try {
      setLoadingIncidents(true)
      setApiError(null)
      const data = await getIncidents()
      setIncidents(data)
      if (data.length > 0 && !selectedTicketId) {
        setSelectedTicketId(data[0].id)
      }
    } catch (err: any) {
      console.error('Failed to load incidents from API:', err)
      setApiError(err.message || 'Unable to connect to backend server')
    } finally {
      setLoadingIncidents(false)
    }
  }

  useEffect(() => {
    fetchIncidentsData()
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setFirebaseUser(authUser)
        const nameFromEmail = authUser.email ? authUser.email.split('@')[0] : 'Sandul'
        setUser(nameFromEmail)
      }
    })
    return () => unsubscribe()
  }, [])

  const handleNavigate = (view: ViewType | 'login', ticketId?: string) => {
    if (ticketId) {
      setSelectedTicketId(ticketId)
      // Also fetch single incident details asynchronously if available
      apiGetIncidentById(ticketId).then((detailedItem) => {
        setIncidents((prev) =>
          prev.map((item) => (item.id === ticketId ? { ...item, ...detailedItem } : item))
        )
      }).catch(() => {})
    }
    setCurrentView(view)
  }

  const handleLoginSuccess = (userName: string, profile: 'Student' | 'Technician' | 'Admin') => {
    setUser(userName || 'User')
    setUserRole(profile)
    fetchIncidentsData()
    if (profile === 'Technician') {
      setCurrentView('tech-workspace')
    } else if (profile === 'Admin') {
      setCurrentView('admin-dashboard')
    } else {
      setCurrentView('dashboard')
    }
  }

  const handleAddIncident = (newIncident: IncidentItem) => {
    setIncidents((prev) => [newIncident, ...prev])
    fetchIncidentsData()
  }

  const handleUpdateStatus = async (ticketId: string, newStatus: IncidentItem['status']) => {
    // Optimistic UI update
    setIncidents((prev) =>
      prev.map((item) => {
        if (item.id === ticketId) {
          return {
            ...item,
            status: newStatus,
            diagnosisProgress: newStatus === 'In Progress' ? 65 : newStatus === 'Resolved' ? 100 : item.diagnosisProgress
          }
        }
        return item
      })
    )

    try {
      await apiUpdateIncidentStatus(ticketId, newStatus)
      await fetchIncidentsData()
    } catch (err: any) {
      console.error('Error updating status on server:', err)
      setApiError(`Failed to update ticket status: ${err.message}`)
    }
  }

  const handleClaimTicket = async (ticketId: string) => {
    try {
      await apiUpdateIncidentStatus(ticketId, 'In Progress', 2)
      await fetchIncidentsData()
    } catch (err: any) {
      console.error('Error claiming ticket:', err)
      setApiError(`Failed to claim ticket: ${err.message}`)
    }
  }

  const handleAddComment = async (ticketId: string, commentText: string, isInternal?: boolean) => {
    try {
      const formattedText = isInternal ? `[INTERNAL NOTE]: ${commentText}` : commentText
      await apiAddIncidentComment(ticketId, formattedText)
      await fetchIncidentsData()
    } catch (err: any) {
      console.error('Error adding comment to backend:', err)
      const now = new Date()
      const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setIncidents((prev) =>
        prev.map((item) => {
          if (item.id === ticketId) {
            return {
              ...item,
              comments: [
                ...(item.comments || []),
                {
                  id: `c_${Date.now()}`,
                  author: user,
                  role: isInternal ? 'Technician Internal' : userRole,
                  text: isInternal ? `[INTERNAL NOTE]: ${commentText}` : commentText,
                  timestamp
                }
              ]
            }
          }
          return item
        })
      )
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (e) {
      console.warn('Sign out warning:', e)
    }
    setFirebaseUser(null)
    setCurrentView('login')
  }

  // Selected incident object for details view
  const selectedIncident = incidents.find((i) => i.id === selectedTicketId) || incidents[0] || null

  // If user is on Login View
  if (currentView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
      />
    )
  }

  return (
    <div className="dash-layout">
      {/* Persistent Left Sidebar Navigation */}
      <aside className="dash-sidebar">
        <div
          className="sidebar-logo"
          onClick={() => {
            if (userRole === 'Admin') handleNavigate('admin-dashboard')
            else if (userRole === 'Technician') handleNavigate('tech-workspace')
            else handleNavigate('dashboard')
          }}
          style={{ cursor: 'pointer' }}
        >
          <img src={logoImg} alt="CampusOps" className="sidebar-logo-img" />
          <span className="sidebar-brand-name">
            Campus<span className="brand-highlight">Ops</span>
          </span>
        </div>

        {/* Navigation strictly rendered per Role */}
        <nav className="sidebar-nav">
          {userRole === 'Student' && (
            <>
              <button
                type="button"
                className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavigate('dashboard')}
              >
                <LayoutGrid size={18} />
                <span>DASHBOARD</span>
              </button>

              <button
                type="button"
                className={`nav-item ${currentView === 'incidents' || currentView === 'incident-details' ? 'active' : ''}`}
                onClick={() => handleNavigate('incidents')}
              >
                <AlertTriangle size={18} />
                <span>MY INCIDENTS</span>
              </button>

              <button
                type="button"
                className={`nav-item ${currentView === 'report-incident' ? 'active' : ''}`}
                onClick={() => handleNavigate('report-incident')}
              >
                <Plus size={18} />
                <span>REPORT INCIDENT</span>
              </button>
            </>
          )}

          {userRole === 'Technician' && (
            <>
              <button
                type="button"
                className={`nav-item ${currentView === 'tech-workspace' || currentView === 'tech-incident-details' ? 'active' : ''}`}
                onClick={() => handleNavigate('tech-workspace')}
              >
                <Briefcase size={18} />
                <span>KANBAN WORKSPACE</span>
              </button>

              <button
                type="button"
                className={`nav-item ${currentView === 'tech-dashboard' ? 'active' : ''}`}
                onClick={() => handleNavigate('tech-dashboard')}
              >
                <LayoutGrid size={18} />
                <span>OPS DASHBOARD</span>
              </button>

              <button
                type="button"
                className={`nav-item ${currentView === 'tech-queue' ? 'active' : ''}`}
                onClick={() => handleNavigate('tech-queue')}
              >
                <AlertTriangle size={18} />
                <span>INCIDENT QUEUE</span>
              </button>
            </>
          )}

          {userRole === 'Admin' && (
            <>
              <button
                type="button"
                className={`nav-item ${currentView === 'admin-dashboard' ? 'active' : ''}`}
                onClick={() => handleNavigate('admin-dashboard')}
              >
                <Shield size={18} />
                <span>COMMAND CENTER</span>
              </button>

              <button
                type="button"
                className={`nav-item ${currentView === 'admin-staff' ? 'active' : ''}`}
                onClick={() => handleNavigate('admin-staff')}
              >
                <Users size={18} />
                <span>STAFF DIRECTORY</span>
              </button>

              <button
                type="button"
                className={`nav-item ${currentView === 'admin-analytics' ? 'active' : ''}`}
                onClick={() => handleNavigate('admin-analytics')}
              >
                <BarChart2 size={18} />
                <span>TELEMETRY</span>
              </button>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="nav-item" onClick={handleLogout} title="Return to Login">
            <LogOut size={18} />
            <span>SIGN OUT</span>
          </button>
        </div>
      </aside>

      {/* Persistent Main Application Window */}
      <main className="dash-main">
        {/* Persistent Top Bar Header */}
        <header className="dash-topbar">
          <div className="search-box">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="Search assets, services, tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="topbar-actions">
            {/* Read-only Role Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                background:
                  userRole === 'Admin'
                    ? 'rgba(168, 85, 247, 0.15)'
                    : userRole === 'Technician'
                    ? 'rgba(99, 102, 241, 0.15)'
                    : 'rgba(59, 130, 246, 0.15)',
                color:
                  userRole === 'Admin'
                    ? '#C084FC'
                    : userRole === 'Technician'
                    ? '#818CF8'
                    : '#60A5FA',
                border:
                  userRole === 'Admin'
                    ? '1px solid rgba(168, 85, 247, 0.3)'
                    : userRole === 'Technician'
                    ? '1px solid rgba(99, 102, 241, 0.3)'
                    : '1px solid rgba(59, 130, 246, 0.3)'
              }}
            >
              {userRole === 'Admin' && <Shield size={14} />}
              {userRole === 'Technician' && <Wrench size={14} />}
              {userRole === 'Student' && <GraduationCap size={14} />}
              <span>{userRole.toUpperCase()} PORTAL</span>
            </div>

            {userRole === 'Student' && (
              <button
                type="button"
                className="ghost-btn"
                onClick={() => handleNavigate('report-incident')}
              >
                <Plus size={14} />
                <span>+ REPORT INCIDENT</span>
              </button>
            )}

            <button type="button" className="icon-btn" title="Notifications">
              <Bell size={18} />
              <span className="notification-badge"></span>
            </button>

            <button
              type="button"
              className="user-avatar-btn"
              onClick={() => {
                if (userRole === 'Student') handleNavigate('profile')
              }}
              title={`${user} Settings`}
            >
              <UserIcon size={18} />
            </button>
          </div>
        </header>

        {apiError && (
          <div className="status-banner error" style={{ margin: '16px 32px 0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>⚠️ API Sync Warning: {apiError}</span>
            <button type="button" className="ghost-btn" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={fetchIncidentsData}>
              Retry Sync
            </button>
          </div>
        )}

        {/* Dynamic Page View Body - Rendered strictly per Portal */}
        {userRole === 'Student' && (
          <>
            {currentView === 'dashboard' && (
              <StudentDashboard
                userName={user}
                incidents={incidents}
                loading={loadingIncidents}
                error={apiError}
                onNavigate={handleNavigate}
                onRefresh={fetchIncidentsData}
              />
            )}

            {currentView === 'incidents' && (
              <MyIncidentsPage
                incidents={incidents}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'incident-details' && (
              <IncidentDetailsPage
                incident={selectedIncident}
                onNavigate={handleNavigate}
                onAddComment={handleAddComment}
              />
            )}

            {currentView === 'report-incident' && (
              <ReportIncidentPage
                onAddIncident={handleAddIncident}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'profile' && (
              <StudentProfilePage
                userName={user}
                incidents={incidents}
                onLogout={handleLogout}
                onNavigate={handleNavigate}
              />
            )}
          </>
        )}

        {userRole === 'Technician' && (
          <>
            {currentView === 'tech-workspace' && (
              <TechnicianWorkspacePage
                incidents={incidents}
                onNavigate={handleNavigate}
                onUpdateStatus={handleUpdateStatus}
              />
            )}

            {currentView === 'tech-dashboard' && (
              <TechnicianDashboard
                userName={user}
                incidents={incidents}
                onNavigate={handleNavigate}
                onUpdateStatus={handleUpdateStatus}
              />
            )}

            {currentView === 'tech-queue' && (
              <TechnicianQueuePage
                incidents={incidents}
                onNavigate={handleNavigate}
                onUpdateStatus={handleUpdateStatus}
                onClaimTicket={handleClaimTicket}
              />
            )}

            {currentView === 'tech-incident-details' && (
              <TechnicianIncidentDetailsPage
                incident={selectedIncident}
                onNavigate={handleNavigate}
                onUpdateStatus={handleUpdateStatus}
                onAddComment={handleAddComment}
              />
            )}
          </>
        )}

        {userRole === 'Admin' && (
          <>
            {currentView === 'admin-dashboard' && (
              <AdminDashboard
                userName={user}
                incidents={incidents}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'admin-staff' && (
              <AdminStaffPage />
            )}

            {currentView === 'admin-analytics' && (
              <AdminAnalyticsPage incidents={incidents} />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
