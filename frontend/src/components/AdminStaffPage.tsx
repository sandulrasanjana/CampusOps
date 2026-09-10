import React, { useState } from 'react'
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Phone
} from 'lucide-react'

interface StaffMember {
  id: string
  name: string
  role: string
  department: string
  email: string
  phone: string
  activeTickets: number
  resolvedTickets: number
  slaEfficiency: string
  status: 'Active On-Duty' | 'On Break' | 'Off-Duty'
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'TECH-101',
    name: 'Alex Rivera',
    role: 'Sr. Infrastructure Lead',
    department: 'IT Systems & Cloud',
    email: 'a.rivera@campusops.edu',
    phone: '+1 (555) 019-2834',
    activeTickets: 3,
    resolvedTickets: 142,
    slaEfficiency: '98.5%',
    status: 'Active On-Duty'
  },
  {
    id: 'TECH-102',
    name: 'Marcus Vance',
    role: 'Facilities Plumbing Lead',
    department: 'Campus Facilities',
    email: 'm.vance@campusops.edu',
    phone: '+1 (555) 019-5821',
    activeTickets: 2,
    resolvedTickets: 98,
    slaEfficiency: '96.2%',
    status: 'Active On-Duty'
  },
  {
    id: 'TECH-103',
    name: 'David Chen',
    role: 'AV & Hardware Specialist',
    department: 'Media & Hardware',
    email: 'd.chen@campusops.edu',
    phone: '+1 (555) 019-7412',
    activeTickets: 1,
    resolvedTickets: 76,
    slaEfficiency: '99.1%',
    status: 'On Break'
  },
  {
    id: 'TECH-104',
    name: 'Sarah Jenkins',
    role: 'Network Operations Engineer',
    department: 'IT Systems & Cloud',
    email: 's.jenkins@campusops.edu',
    phone: '+1 (555) 019-8933',
    activeTickets: 0,
    resolvedTickets: 115,
    slaEfficiency: '97.8%',
    status: 'Off-Duty'
  }
]

export const AdminStaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newStaffName, setNewStaffName] = useState('')
  const [newStaffRole, setNewStaffRole] = useState('Hardware Technician')
  const [newStaffDept, setNewStaffDept] = useState('IT Systems & Cloud')

  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStaffName.trim()) return
    const newMember: StaffMember = {
      id: `TECH-${100 + staffList.length + 1}`,
      name: newStaffName.trim(),
      role: newStaffRole,
      department: newStaffDept,
      email: `${newStaffName.toLowerCase().replace(' ', '.')}@campusops.edu`,
      phone: '+1 (555) 019-9900',
      activeTickets: 0,
      resolvedTickets: 0,
      slaEfficiency: '100%',
      status: 'Active On-Duty'
    }
    setStaffList([newMember, ...staffList])
    setNewStaffName('')
    setShowAddModal(false)
  }

  return (
    <div className="dash-body">
      {/* Header */}
      <div className="greeting-section">
        <div className="greeting-text">
          <h1>Staff & Technician Directory</h1>
          <p>Manage campus operational specialists, role assignments, and SLA performance.</p>
        </div>

        <button
          type="button"
          className="primary-btn"
          style={{ width: 'auto', padding: '10px 18px' }}
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus size={16} />
          <span>PROVISION NEW TECHNICIAN</span>
        </button>
      </div>

      {/* Main Staff Directory Card */}
      <div className="incidents-card">
        <div className="incidents-header">
          <div className="incidents-title-group">
            <div className="incidents-title-icon" style={{ color: '#C084FC' }}>
              <Users size={18} />
            </div>
            <h2 className="incidents-title">Active Operational Roster ({staffList.length})</h2>
          </div>

          <div className="search-box" style={{ width: '280px' }}>
            <Search className="search-icon" size={14} />
            <input
              type="text"
              className="search-input"
              placeholder="Search technician name, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Staff Table */}
        <div className="table-container">
          <table className="incidents-table">
            <thead>
              <tr>
                <th>STAFF MEMBER & ROLE</th>
                <th>DEPARTMENT</th>
                <th>CONTACT</th>
                <th>ACTIVE WORK ORDERS</th>
                <th>TOTAL RESOLVED</th>
                <th>SLA EFFICIENCY</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff) => (
                <tr key={staff.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{staff.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{staff.role} • {staff.id}</div>
                  </td>
                  <td className="col-category">{staff.department}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-body)' }}>
                        <Mail size={11} className="text-slate-400" /> {staff.email}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        <Phone size={11} className="text-slate-400" /> {staff.phone}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{staff.activeTickets} tickets</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{staff.resolvedTickets}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#34D399', fontWeight: 600 }}>{staff.slaEfficiency}</td>
                  <td>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        background: staff.status === 'Active On-Duty' ? 'rgba(16, 185, 129, 0.12)' : staff.status === 'On Break' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(100, 116, 139, 0.15)',
                        color: staff.status === 'Active On-Duty' ? '#34D399' : staff.status === 'On Break' ? '#FBBF24' : '#94A3B8',
                        border: staff.status === 'Active On-Duty' ? '1px solid rgba(16, 185, 129, 0.25)' : staff.status === 'On Break' ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(100, 116, 139, 0.25)'
                      }}
                    >
                      {staff.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="ghost-btn"
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                      onClick={() => alert(`Managing queues for ${staff.name}`)}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Staff Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <UserPlus size={22} className="text-purple-400" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)' }}>
                Provision New Technician
              </h2>
            </div>

            <form onSubmit={handleAddStaff}>
              <div className="form-group">
                <label className="form-label">FULL NAME</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                  placeholder="e.g. Jordan Miller"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">SPECIALIST ROLE</label>
                <select
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                >
                  <option value="Hardware Technician">Hardware Technician</option>
                  <option value="Network Operations Lead">Network Operations Lead</option>
                  <option value="Facilities Maintenance Lead">Facilities Maintenance Lead</option>
                  <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">CAMPUS DEPARTMENT</label>
                <select
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                  value={newStaffDept}
                  onChange={(e) => setNewStaffDept(e.target.value)}
                >
                  <option value="IT Systems & Cloud">IT Systems & Cloud</option>
                  <option value="Campus Facilities">Campus Facilities</option>
                  <option value="Media & Hardware">Media & Hardware</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="ghost-btn"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  style={{ flex: 1, background: '#8B5CF6' }}
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
