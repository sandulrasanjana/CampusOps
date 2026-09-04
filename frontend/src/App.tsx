import { useState, useEffect } from 'react'
import logoImg from './assets/logo.png'
import {
  LayoutGrid,
  AlertTriangle,
  Briefcase,
  BarChart2,
  Activity,
  Search,
  Plus,
  Bell,
  User as UserIcon,
  LogOut
} from 'lucide-react'
import { LoginPage } from './components/LoginPage'
import { StudentDashboard } from './components/StudentDashboard'
import { ReportIncidentPage, type IncidentItem } from './components/ReportIncidentPage'
import { MyIncidentsPage } from './components/MyIncidentsPage'
import { IncidentDetailsPage } from './components/IncidentDetailsPage'
import { StudentProfilePage } from './components/StudentProfilePage'
import { auth, onAuthStateChanged, signOut, type FirebaseUser } from './firebase'

export type ViewType = 'dashboard' | 'incidents' | 'incident-details' | 'report-incident' | 'profile' | 'workspace' | 'analytics' | 'status'

const INITIAL_DATASET: IncidentItem[] = [
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
    slaTimer: 'Est. Resolution: 1h 30m',
    attachments: [{ name: 'projector_error_log.txt', size: '1.2 MB' }],
    comments: [
      {
        id: 'c1',
        author: 'System Dispatch',
        role: 'System',
        text: 'Ticket created and routed to IT Hardware Support queue.',
        timestamp: 'Oct 24, 09:15'
      },
      {
        id: 'c2',
        author: 'Alex Rivera',
        role: 'Technician',
        text: 'Dispatched technician to inspect HDMI splitter cable and ballast unit in Room 302.',
        timestamp: 'Oct 24, 09:40'
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
    slaTimer: 'Est. Resolution: 2h 15m',
    attachments: [{ name: 'pipe_photo.png', size: '3.4 MB' }],
    comments: [
      {
        id: 'c1',
        author: 'System Dispatch',
        role: 'System',
        text: 'Facilities work order generated.',
        timestamp: 'Oct 23, 14:30'
      },
      {
        id: 'c2',
        author: 'Marcus Vance',
        role: 'Technician',
        text: 'Shut off isolation valve #2. Replacement gasket on order from main warehouse.',
        timestamp: 'Oct 23, 15:10'
      }
    ]
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
    slaTimer: 'Est. Resolution: 4h 00m',
    attachments: [],
    comments: [
      {
        id: 'c1',
        author: 'System Dispatch',
        role: 'System',
        text: 'Network telemetry flagged packet loss on AP-LIB-09.',
        timestamp: 'Oct 22, 11:05'
      }
    ]
  },
  {
    id: 'INC-1012',
    title: 'Broken chair in Lecture Hall B',
    category: 'Facilities',
    priority: 'Low',
    status: 'Resolved',
    location: 'Main Auditorium - Lecture Hall B',
    description: 'Seat #42 backrest hinge sheared off. Replaced with ergonomic spare.',
    date: 'Oct 18, 16:20',
    reporterName: 'Sandul',
    assignedTechnician: {
      name: 'David Chen',
      role: 'Furniture & Campus Crew'
    },
    slaTimer: 'Resolved on Oct 19, 10:15',
    attachments: [],
    comments: [
      {
        id: 'c1',
        author: 'David Chen',
        role: 'Technician',
        text: 'Seat hinge replaced and safety bolt tightened. Ticket closed.',
        timestamp: 'Oct 19, 10:15'
      }
    ]
  }
]

function App() {
  const [currentView, setCurrentView] = useState<ViewType | 'login'>('dashboard')
  const [selectedTicketId, setSelectedTicketId] = useState<string | undefined>('INC-1042')
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
        if (currentView === 'login') {
          setCurrentView('dashboard')
        }
      }
    })
    return () => unsubscribe()
  }, [currentView])

  const handleNavigate = (view: ViewType | 'login', ticketId?: string) => {
    if (ticketId) {
      setSelectedTicketId(ticketId)
    }
    setCurrentView(view)
  }

  const handleAddIncident = (newIncident: IncidentItem) => {
    setIncidents((prev) => [newIncident, ...prev])
  }

  const handleAddComment = (ticketId: string, commentText: string) => {
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
            role: 'Student',
            text: commentText,
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
        onLoginSuccess={(userName) => {
          setUser(userName || 'Sandul')
          setCurrentView('dashboard')
        }}
      />
    )
  }

  return (
    <div className="dash-layout">
      {/* Persistent Left Sidebar Navigation */}
      <aside className="dash-sidebar">
        <div className="sidebar-logo" onClick={() => handleNavigate('dashboard')} style={{ cursor: 'pointer' }}>
          <img src={logoImg} alt="CampusOps" className="sidebar-logo-img" />
          <span className="sidebar-brand-name">
            Campus<span className="brand-highlight">Ops</span>
          </span>
        </div>

        <nav className="sidebar-nav">
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
            <span>INCIDENTS</span>
          </button>

          <button
            type="button"
            className={`nav-item ${currentView === 'workspace' ? 'active' : ''}`}
            onClick={() => handleNavigate('incidents')}
          >
            <Briefcase size={18} />
            <span>WORKSPACE</span>
          </button>

          <button
            type="button"
            className={`nav-item ${currentView === 'analytics' ? 'active' : ''}`}
            onClick={() => handleNavigate('dashboard')}
          >
            <BarChart2 size={18} />
            <span>ANALYTICS</span>
          </button>

          <button
            type="button"
            className={`nav-item ${currentView === 'status' ? 'active' : ''}`}
            onClick={() => handleNavigate('dashboard')}
          >
            <Activity size={18} />
            <span>STATUS</span>
          </button>
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
              placeholder="Search commands or assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="ghost-btn"
              onClick={() => handleNavigate('report-incident')}
            >
              <Plus size={14} />
              <span>+ REPORT INCIDENT</span>
            </button>

            <button type="button" className="icon-btn" title="Notifications">
              <Bell size={18} />
              <span className="notification-badge"></span>
            </button>

            <button
              type="button"
              className="user-avatar-btn"
              onClick={() => handleNavigate('profile')}
              title={`${user} Profile Settings`}
            >
              <UserIcon size={18} />
            </button>
          </div>
        </header>

        {/* Dynamic Page View Body */}
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
      </main>
    </div>
  )
}

export default App
