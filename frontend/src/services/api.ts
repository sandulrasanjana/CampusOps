import type { IncidentItem } from '../components/ReportIncidentPage'
import { auth } from '../firebase'

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const API_BASE_URL = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL.replace(/\/$/, '')}/api`

export interface AnalyticsSummary {
  totalIncidents: number
  openIncidents: number
  inProgressIncidents: number
  resolvedIncidents: number
  byStatus: Array<{ status: string; count: number | string; 'COUNT(*)': number | string }>
  byPriority: Array<{ priority: string; count: number | string; 'COUNT(*)': number | string }>
  byCategory: Array<{ category: string; count: number | string; 'COUNT(*)': number | string }>
}

/**
 * Normalizes status strings from backend/DB into UI-friendly formats
 */
export function normalizeStatus(status: string): IncidentItem['status'] {
  if (!status) return 'Open'
  const upper = status.trim().toUpperCase()
  if (upper === 'REPORTED' || upper === 'OPEN') return 'Open'
  if (upper === 'IN_PROGRESS' || upper === 'IN PROGRESS' || upper === 'ASSIGNED') return 'In Progress'
  if (upper === 'RESOLVED') return 'Resolved'
  if (upper === 'CLOSED') return 'Closed'
  return status as IncidentItem['status']
}

/**
 * Normalizes priority strings from backend/DB into UI-friendly formats
 */
export function normalizePriority(priority: string): IncidentItem['priority'] {
  if (!priority) return 'Medium'
  const upper = priority.trim().toUpperCase()
  if (upper === 'HIGH') return 'High'
  if (upper === 'CRITICAL') return 'Critical'
  if (upper === 'LOW') return 'Low'
  if (upper === 'MEDIUM') return 'Medium'
  return priority as IncidentItem['priority']
}

/**
 * Normalizes backend DB incident format into frontend IncidentItem model
 */
export function transformBackendIncident(raw: any): IncidentItem {
  const formattedDate = raw.created_at
    ? new Date(raw.created_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Oct 24, 10:00'

  const normalizedSt = normalizeStatus(raw.status)
  const normalizedPr = normalizePriority(raw.priority)

  const comments = Array.isArray(raw.comments)
    ? raw.comments.map((c: any) => ({
        id: String(c.id || `c_${Math.random()}`),
        author: c.author_name || 'System',
        role: c.author_role || 'User',
        text: c.comment || c.text || '',
        timestamp: c.created_at
          ? new Date(c.created_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'Just now'
      }))
    : []

  return {
    id: raw.incident_number || (typeof raw.id === 'string' && raw.id.startsWith('INC-') ? raw.id : `INC-${raw.id}`),
    title: raw.title || 'Untitled Incident',
    category: raw.category || 'IT Support',
    priority: normalizedPr,
    status: normalizedSt,
    location: raw.location || 'Main Campus',
    description: raw.description || 'No description provided.',
    date: formattedDate,
    reporterName: raw.reporter_name || 'Sandul',
    assignedTechnician: raw.assigned_technician_name
      ? {
          name: raw.assigned_technician_name,
          role: 'Technician Specialist'
        }
      : null,
    slaTimer: normalizedPr === 'High' || normalizedPr === 'Critical' ? '0h 45m remaining' : '3h 15m remaining',
    diagnosisProgress: normalizedSt === 'In Progress' ? 65 : normalizedSt === 'Resolved' || normalizedSt === 'Closed' ? 100 : 15,
    attachments: [],
    comments
  }
}

/**
 * Retrieves the current Firebase user ID token and returns standard request headers.
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  try {
    if (auth.authStateReady) {
      await auth.authStateReady()
    }
    const user = auth.currentUser
    if (user) {
      const token = await user.getIdToken(true) // Force token refresh
      console.log('Dispatching request with token:', token ? 'Token exists' : 'NO TOKEN')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    } else {
      console.log('Dispatching request with token: NO TOKEN')
    }
  } catch (error) {
    console.warn('Failed to retrieve Firebase ID token:', error)
  }

  return headers
}

/**
 * HTTP client wrapper that injects Firebase Auth Bearer token and handles 401/403 responses.
 */
async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const authHeaders = await getAuthHeaders()

  if (!authHeaders['Authorization']) {
    console.warn('No active Firebase user token found. Skipping request to:', url)
    throw new Error('Unauthenticated: User is not logged in or token unavailable.')
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...(options.headers || {})
    }
  })

  if (response.status === 401 || response.status === 403) {
    console.warn(`[Authentication Error] ${response.status} returned for ${url}. Request requires a valid Firebase Bearer token.`)
  }

  return response
}

/**
 * GET /api/incidents - Fetch list of incidents with optional filters
 */
export async function getIncidents(filters?: {
  status?: string
  category?: string
  priority?: string
}): Promise<IncidentItem[]> {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.category) params.append('category', filters.category)
  if (filters?.priority) params.append('priority', filters.priority)

  const queryString = params.toString() ? `?${params.toString()}` : ''
  const response = await authenticatedFetch(`${API_BASE_URL}/incidents${queryString}`, {
    method: 'GET'
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || errorData.message || `Failed to fetch incidents (${response.status})`)
  }

  const data = await response.json()
  return data.map(transformBackendIncident)
}

/**
 * GET /api/incidents/:id - Fetch single incident by ID or incident_number
 */
export async function getIncidentById(id: string | number): Promise<IncidentItem> {
  const response = await authenticatedFetch(`${API_BASE_URL}/incidents/${id}`, {
    method: 'GET'
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || errorData.message || `Failed to fetch incident ${id}`)
  }

  const data = await response.json()
  return transformBackendIncident(data)
}

/**
 * POST /api/incidents - Create a new incident ticket
 */
export async function createIncident(data: {
  title: string
  description: string
  category: string
  location: string
  priority?: string
  reported_by?: number
}): Promise<IncidentItem> {
  const payload = {
    title: data.title,
    description: data.description,
    category: data.category,
    location: data.location,
    priority: (data.priority || 'MEDIUM').toUpperCase(),
    reported_by: data.reported_by || 1
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/incidents`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || errorData.message || 'Failed to create incident ticket')
  }

  const createdData = await response.json()
  return transformBackendIncident(createdData)
}

/**
 * PATCH /api/incidents/:id/status - Update ticket status or assigned technician
 */
export async function updateIncidentStatus(
  id: string | number,
  status: string,
  assignedTo?: number,
  changedBy?: number
): Promise<IncidentItem> {
  let backendStatus = status
  const upper = status.trim().toUpperCase()
  if (upper === 'IN PROGRESS' || upper === 'IN_PROGRESS') backendStatus = 'IN_PROGRESS'
  else if (upper === 'OPEN' || upper === 'REPORTED') backendStatus = 'REPORTED'
  else if (upper === 'RESOLVED') backendStatus = 'RESOLVED'
  else if (upper === 'CLOSED') backendStatus = 'CLOSED'

  const payload: any = { status: backendStatus }
  if (assignedTo !== undefined) payload.assigned_to = assignedTo
  if (changedBy !== undefined) payload.changed_by = changedBy

  const response = await authenticatedFetch(`${API_BASE_URL}/incidents/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || errorData.message || `Failed to update status for incident ${id}`)
  }

  const updatedData = await response.json()
  return transformBackendIncident(updatedData)
}

/**
 * POST /api/incidents/:id/comments - Add comment to incident
 */
export async function addIncidentComment(
  id: string | number,
  comment: string,
  userId: number = 1
): Promise<any> {
  const response = await authenticatedFetch(`${API_BASE_URL}/incidents/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ comment, user_id: userId })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || errorData.message || 'Failed to post comment')
  }

  return await response.json()
}

/**
 * GET /api/analytics - Fetch high-level operational metrics
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const response = await authenticatedFetch(`${API_BASE_URL}/analytics`, {
    method: 'GET'
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || errorData.message || 'Failed to fetch analytics telemetry')
  }

  const raw = await response.json()

  let openCount = 0
  let inProgressCount = 0
  let resolvedCount = 0

  if (Array.isArray(raw.byStatus)) {
    raw.byStatus.forEach((item: any) => {
      const cnt = parseInt(item.count || item['COUNT(*)'] || '0', 10)
      const st = normalizeStatus(item.status)
      if (st === 'Open') openCount += cnt
      else if (st === 'In Progress') inProgressCount += cnt
      else if (st === 'Resolved' || st === 'Closed') resolvedCount += cnt
    })
  }

  return {
    totalIncidents: raw.totalIncidents || 0,
    openIncidents: openCount,
    inProgressIncidents: inProgressCount,
    resolvedIncidents: resolvedCount,
    byStatus: raw.byStatus || [],
    byPriority: raw.byPriority || [],
    byCategory: raw.byCategory || []
  }
}
