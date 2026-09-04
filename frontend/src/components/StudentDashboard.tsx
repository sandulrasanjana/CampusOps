import React, { useState, useMemo } from 'react'
import logoImg from '../assets/logo.png'
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
  LogOut,
  List,
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { ReportIncidentModal, type IncidentItem } from './ReportIncidentModal'

interface StudentDashboardProps {
  userName?: string
  onLogout?: () => void
}

const INITIAL_INCIDENTS: IncidentItem[] = [
  {
    id: 'INC-1042',
    title: 'Projector malfunction in Room 302',
    category: 'IT Support',
    priority: 'High',
    status: 'Open',
    date: 'Oct 24, 09:15'
  },
  {
    id: 'INC-1038',
    title: 'Leaking pipe in North Wing Restroom',
    category: 'Facilities',
    priority: 'Medium',
    status: 'In Progress',
    date: 'Oct 23, 14:30'
  },
  {
    id: 'INC-1035',
    title: 'Wi-Fi connectivity dropping in Library',
    category: 'IT Support',
    priority: 'Medium',
    status: 'Open',
    date: 'Oct 22, 11:05'
  },
  {
    id: 'INC-1012',
    title: 'Broken chair in Lecture Hall B',
    category: 'Facilities',
    priority: 'Low',
    status: 'Resolved',
    date: 'Oct 18, 16:20'
  }
]

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  userName = 'Sandul',
  onLogout
}) => {
  const [incidents, setIncidents] = useState<IncidentItem[]>(INITIAL_INCIDENTS)
  const [activeNav, setActiveNav] = useState('DASHBOARD')
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Facilities' | 'IT Support' | 'Security'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  // Dynamic status counters
  const openCount = useMemo(() => incidents.filter((i) => i.status === 'Open').length, [incidents])
  const inProgressCount = useMemo(() => incidents.filter((i) => i.status === 'In Progress').length, [incidents])
  const resolvedCount = useMemo(() => incidents.filter((i) => i.status === 'Resolved').length + 6, [incidents]) // +6 base resolved for demo metrics

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((item) => {
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [incidents, categoryFilter, searchQuery])

  const handleAddIncident = (newIncident: IncidentItem) => {
    setIncidents((prev) => [newIncident, ...prev])
  }

  return (
    <div className="dash-layout">
      {/* Sidebar Navigation */}
      <aside className="dash-sidebar">
        <div className="sidebar-logo">
          <img src={logoImg} alt="CampusOps" className="sidebar-logo-img" />
          <span className="sidebar-brand-name">
            Campus<span style={{ color: '#0084ff' }}>Ops</span>
          </span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeNav === 'DASHBOARD' ? 'active' : ''}`}
            onClick={() => setActiveNav('DASHBOARD')}
          >
            <LayoutGrid size={18} />
            <span>DASHBOARD</span>
          </button>

          <button
            className={`nav-item ${activeNav === 'INCIDENTS' ? 'active' : ''}`}
            onClick={() => setActiveNav('INCIDENTS')}
          >
            <AlertTriangle size={18} />
            <span>INCIDENTS</span>
          </button>

          <button
            className={`nav-item ${activeNav === 'WORKSPACE' ? 'active' : ''}`}
            onClick={() => setActiveNav('WORKSPACE')}
          >
            <Briefcase size={18} />
            <span>WORKSPACE</span>
          </button>

          <button
            className={`nav-item ${activeNav === 'ANALYTICS' ? 'active' : ''}`}
            onClick={() => setActiveNav('ANALYTICS')}
          >
            <BarChart2 size={18} />
            <span>ANALYTICS</span>
          </button>

          <button
            className={`nav-item ${activeNav === 'STATUS' ? 'active' : ''}`}
            onClick={() => setActiveNav('STATUS')}
          >
            <Activity size={18} />
            <span>STATUS</span>
          </button>
        </nav>

        {onLogout && (
          <div className="sidebar-footer">
            <button className="nav-item" onClick={onLogout} title="Return to Login">
              <LogOut size={18} />
              <span>SIGN OUT</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Container */}
      <main className="dash-main">
        {/* Top Header Bar */}
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
              className="ghost-btn"
              onClick={() => setIsReportModalOpen(true)}
            >
              <Plus size={14} />
              <span>+ REPORT INCIDENT</span>
            </button>

            <button className="icon-btn" title="Notifications">
              <Bell size={18} />
              <span className="notification-badge"></span>
            </button>

            <button className="user-avatar-btn" onClick={onLogout} title={`${userName} (Click to logout)`}>
              <UserIcon size={18} />
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="dash-body">
          {/* Greeting Section */}
          <section className="greeting-section">
            <div className="greeting-text">
              <h1>Welcome back, {userName} 👋</h1>
              <p>Here is an overview of your reported incidents and their current status.</p>
            </div>

            <button
              className="primary-btn"
              onClick={() => setIsReportModalOpen(true)}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Report New Incident</span>
            </button>
          </section>

          {/* Metric Stat Cards */}
          <section className="metrics-grid">
            {/* Card 1: Open Tickets */}
            <div className="metric-card">
              <div className="metric-icon-box open">
                <AlertCircle size={22} />
              </div>
              <div className="metric-details">
                <span className="metric-number">{openCount}</span>
                <span className="metric-title">Open Tickets</span>
              </div>
            </div>

            {/* Card 2: In Progress */}
            <div className="metric-card">
              <div className="metric-icon-box progress">
                <Clock size={22} />
              </div>
              <div className="metric-details">
                <span className="metric-number">{inProgressCount}</span>
                <span className="metric-title">In Progress</span>
              </div>
            </div>

            {/* Card 3: Resolved */}
            <div className="metric-card">
              <div className="metric-icon-box resolved">
                <CheckCircle2 size={22} />
              </div>
              <div className="metric-details">
                <span className="metric-number">{resolvedCount}</span>
                <span className="metric-title">Resolved</span>
              </div>
            </div>
          </section>

          {/* Incidents Table Card */}
          <section className="incidents-card">
            <div className="incidents-header">
              <div className="incidents-title-group">
                <div className="incidents-title-icon">
                  <List size={18} />
                </div>
                <h2 className="incidents-title">My Reported Incidents</h2>
              </div>

              {/* Category Filter Tabs */}
              <div className="filter-tabs">
                {(['All', 'Facilities', 'IT Support', 'Security'] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`filter-tab ${categoryFilter === tab ? 'active' : ''}`}
                    onClick={() => setCategoryFilter(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Incident Table */}
            <div className="table-container">
              <table className="incidents-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>TITLE</th>
                    <th>CATEGORY</th>
                    <th>PRIORITY</th>
                    <th>STATUS</th>
                    <th>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--outline)' }}>
                        No incidents found matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredIncidents.map((item) => (
                      <tr key={item.id}>
                        <td className="col-id">{item.id}</td>
                        <td className="col-title">{item.title}</td>
                        <td className="col-category">{item.category}</td>
                        <td>
                          <span
                            className={`badge-priority ${
                              item.priority === 'High'
                                ? 'high'
                                : item.priority === 'Medium'
                                ? 'medium'
                                : 'low'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge-status ${
                              item.status === 'Open'
                                ? 'open'
                                : item.status === 'In Progress'
                                ? 'in-progress'
                                : 'resolved'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="col-date">{item.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <button
                className="view-all-btn"
                onClick={() => setCategoryFilter('All')}
              >
                View All Incidents
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Interactive Report Incident Modal */}
      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onAddIncident={handleAddIncident}
      />
    </div>
  )
}
