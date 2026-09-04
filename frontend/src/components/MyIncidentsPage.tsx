import React, { useState, useMemo } from 'react'
import {
  Search,
  Plus,
  ChevronRight
} from 'lucide-react'
import { type IncidentItem } from './ReportIncidentPage'

interface MyIncidentsPageProps {
  incidents: IncidentItem[]
  onNavigate: (view: 'dashboard' | 'incidents' | 'incident-details' | 'report-incident' | 'profile', ticketId?: string) => void
}

type FilterTabType = 'All' | 'Facilities' | 'IT Support' | 'Security' | 'Open' | 'In Progress' | 'Resolved'

export const MyIncidentsPage: React.FC<MyIncidentsPageProps> = ({
  incidents,
  onNavigate
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTabType>('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter logic
  const filteredIncidents = useMemo(() => {
    return incidents.filter((item) => {
      // Filter tab logic
      let matchesTab = true
      if (activeFilter === 'Facilities' || activeFilter === 'IT Support' || activeFilter === 'Security') {
        matchesTab = item.category === activeFilter
      } else if (activeFilter === 'Open' || activeFilter === 'In Progress' || activeFilter === 'Resolved') {
        matchesTab = item.status === activeFilter
      }

      // Search logic (ID, title, location)
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        q === '' ||
        item.id.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)

      return matchesTab && matchesSearch
    })
  }, [incidents, activeFilter, searchQuery])

  return (
    <div className="dash-body">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-inter)', fontSize: 24, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 4 }}>
            My Reported Incidents
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-body)' }}>
            Track and monitor the real-time status of all your campus service tickets.
          </p>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={() => onNavigate('report-incident')}
          style={{ width: 'auto' }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Report New Incident</span>
        </button>
      </div>

      {/* Main Table Card Container */}
      <div className="incidents-card">
        {/* Controls Bar: Search & Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          {/* Filter Pills */}
          <div className="filter-tabs" style={{ flexWrap: 'wrap' }}>
            {(['All', 'Facilities', 'IT Support', 'Security', 'Open', 'In Progress', 'Resolved'] as const).map((tab) => (
              <button
                key={tab}
                className={`filter-tab ${activeFilter === tab ? 'active' : ''}`}
                onClick={() => setActiveFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="search-box" style={{ width: 280 }}>
            <Search className="search-icon" size={15} />
            <input
              type="text"
              className="search-input"
              placeholder="Search ID, title, room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: 13, padding: '8px 12px 8px 36px' }}
            />
          </div>
        </div>

        {/* Incidents Data Table */}
        <div className="table-container">
          <table className="incidents-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>TITLE & LOCATION</th>
                <th>CATEGORY</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
                <th>DATE REPORTED</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    No tickets found matching current filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onNavigate('incident-details', item.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="col-id">{item.id}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="col-title">{item.title}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          📍 {item.location}
                        </span>
                      </div>
                    </td>
                    <td className="col-category">{item.category}</td>
                    <td>
                      <span
                        className={`badge-priority ${
                          item.priority === 'Critical' || item.priority === 'High'
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
                          item.status === 'Open' || item.status === 'Reported'
                            ? 'open'
                            : item.status === 'In Progress' || item.status === 'Assigned'
                            ? 'in-progress'
                            : 'resolved'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="col-date">{item.date}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                      <ChevronRight size={18} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
