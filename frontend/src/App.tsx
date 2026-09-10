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

const INITIAL_DATASET: IncidentItem[] = [
  {
    id: 'INC-8492',
    title: 'Main DB Connection Timeout in US-East',
    category: 'IT Support',
    priority: 'Critical',
    status: 'Open',
    location: 'US-East-1 Data Center',
    description: 'Database connection pool max capacity reached causing downstream microservice connection timeout spikes.',
    date: 'Oct 24, 10:05',
    reporterName: 'Sandul',
    assignedTechnician: {
      name: 'Alex Rivera',
      role: 'Sr. Infrastructure Engineer'
    },
    slaTimer: '0h 15m remaining',
    diagnosisProgress: 20,
    attachments: [{ name: 'db_latency_telemetry.log', size: '2.4 MB' }],
    comments: [
      {
        id: 'c1',
        author: 'System Dispatch',
        role: 'System',
        text: 'Automated telemetry flagged high DB pool waiting queue > 95%.',
        timestamp: 'Oct 24, 10:05'
      }
    ]
  },
  {
    id: 'INC-8490',
    title: 'API Gateway Latency Spikes Detected',
    category: 'Network & Wi-Fi',
    priority: 'High',
    status: 'Open',
    location: 'Global Edge Network',
    description: 'Ingress Envoy proxy reporting 450ms P99 latency overhead across EU/US pop clusters.',
    date: 'Oct 24, 09:50',
    reporterName: 'Sandul',
    assignedTechnician: {
      name: 'Alex Rivera',
      role: 'Sr. Infrastructure Engineer'
    },
    slaTimer: '1h 42m remaining',
    diagnosisProgress: 10,
    attachments: [],
    comments: []
  },
  {
    id: 'INC-8488',
    title: 'User Authentication failing for SSO users',
    category: 'IT Support',
    priority: 'Medium',
    status: 'In Progress',
    location: 'Auth Service v2',
    description: 'OIDC token validation failing intermittently on OAuth callback redirect endpoint.',
    date: 'Oct 24, 08:30',
    reporterName: 'Alex',
    assignedTechnician: {
      name: 'Marcus Vance',
      role: 'Identity & Auth Specialist'
    },
    slaTimer: '3h 10m remaining',
    diagnosisProgress: 65,
    attachments: [{ name: 'oidc_trace.json', size: '512 KB' }],
    comments: [
      {
        id: 'c1',
        author: 'Marcus Vance',
        role: 'Technician',
        text: 'Examining public key rotation cache on auth realm gateway.',
        timestamp: 'Oct 24, 09:12'
      }
    ]
  },
  {
    id: 'INC-8475',
    title: 'Redis Cache Eviction Spikes',
    category: 'IT Support',
    priority: 'Low',
    status: 'Resolved',
    location: 'Caching Layer Cluster',
    description: 'LRU memory threshold bumped to 16GB. Cache hit ratio restored to 99.4%.',
    date: 'Oct 23, 18:00',
    reporterName: 'System',
    assignedTechnician: {
      name: 'Alex Rivera',
      role: 'Sr. Infrastructure Engineer'
    },
    slaTimer: 'Closed 2h ago',
    diagnosisProgress: 100,
    attachments: [],
    comments: [
      {
        id: 'c1',
        author: 'Alex Rivera',
        role: 'Technician',
        text: 'Cluster node memory scaled. Resolved.',
        timestamp: 'Oct 24, 07:30'
      }
    ]
  },
  {
    id: 'INC-1042',
    title: 'Projector malfunction in Room 302',
    category: 'IT Support',
    priority: 'High',
    status: 'Open',
    location: 'Science Building - Room 302',
    description: 'The overhead digital projector experiences severe HDMI signal flickering and auto-shuts down every 10 minutes during lectures.',
    date: 'Oct 24, 09:15',
    reporterName: 'Sandul',
    assignedTechnician: {
      name: 'Alex Rivera',
      role: 'Sr. AV & Hardware Specialist'
    },
    slaTimer: '1h 30m',
    diagnosisProgress: 15,
    attachments: [{ name: 'projector_error_log.txt', size: '1.2 MB' }],
    comments: [
      {
        id: 'c1',
        author: 'System Dispatch',
        role: 'System',
        text: 'Ticket created and routed to IT Hardware Support queue.',
        timestamp: 'Oct 24, 09:15'
      }
    ]
  },
  {
    id: 'INC-1038',
    title: 'Leaking pipe in North Wing Restroom',
    category: 'Facilities',
    priority: 'Medium',
    status: 'In Progress',
    location: 'North Wing 2nd Floor Restroom',
    description: 'Persistent water leakage near sink #3 causing floor slipperiness and potential water damage to lower floor tile.',
    date: 'Oct 23, 14:30',
    reporterName: 'Sandul',
    assignedTechnician: {
      name: 'Marcus Vance',
      role: 'Facilities Plumbing Lead'
    },
    slaTimer: '2h 15m',
    diagnosisProgress: 50,
    attachments: [{ name: 'pipe_photo.png', size: '3.4 MB' }],
    comments: []
  },
  {
    id: 'INC-1035',
    title: 'Wi-Fi connectivity dropping in Library',
    category: 'Network & Wi-Fi',
    priority: 'Medium',
    status: 'Open',
    location: 'Central Library 3rd Floor Quiet Zone',
    description: 'Wireless Access Point AP-LIB-09 drops client authentication tokens every 15 minutes, requiring manual reconnect.',
    date: 'Oct 22, 11:05',
    reporterName: 'Sandul',
    assignedTechnician: null,
    slaTimer: '4h 00m',
    diagnosisProgress: 0,
    attachments: [],
    comments: []
  }
]

function App() {
  const [currentView, setCurrentView] = useState<ViewType | 'login'>('login')
  const [selectedTicketId, setSelectedTicketId] = useState<string | undefined>('INC-8492')
  const [userRole, setUserRole] = useState<'Student' | 'Technician' | 'Admin'>('Student')
  const [user, setUser] = useState('Sandul')
  const [, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Incident state
  const [incidents, setIncidents] = useState<IncidentItem[]>(INITIAL_DATASET)

  useEffect(() => {
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
    }
    setCurrentView(view)
  }

  const handleLoginSuccess = (userName: string, profile: 'Student' | 'Technician' | 'Admin') => {
    setUser(userName || 'User')
    setUserRole(profile)
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
  }

  const handleUpdateStatus = (ticketId: string, newStatus: IncidentItem['status']) => {
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
  }

  const handleClaimTicket = (ticketId: string) => {
    setIncidents((prev) =>
      prev.map((item) => {
        if (item.id === ticketId) {
          return {
            ...item,
            assignedTechnician: {
              name: user || 'Alex Rivera',
              role: 'Sr. Infrastructure Specialist'
            }
          }
        }
        return item
      })
    )
  }

  const handleAddComment = (ticketId: string, commentText: string, isInternal?: boolean) => {
    const now = new Date()
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = monthNames[now.getMonth()]
    const day = now.getDate()
    const hours = String(now.getHours()).padStart(2, '0')
    const mins = String(now.getMinutes()).padStart(2, '0')
    const timestamp = `${month} ${day}, ${hours}:${mins}`

    setIncidents((prev) =>
      prev.map((item) => {
        if (item.id === ticketId) {
          const newComment = {
            id: `c_${Date.now()}`,
            author: user,
            role: isInternal ? 'Technician Internal' : userRole,
            text: isInternal ? `[INTERNAL NOTE]: ${commentText}` : commentText,
            timestamp
          }
          return {
            ...item,
            comments: [...(item.comments || []), newComment]
          }
        }
        return item
      })
    )
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

        {/* Dynamic Page View Body - Rendered strictly per Portal */}
        {userRole === 'Student' && (
          <>
            {currentView === 'dashboard' && (
              <StudentDashboard
                userName={user}
                incidents={incidents}
                onNavigate={handleNavigate}
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
              <AdminAnalyticsPage />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
