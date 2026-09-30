import type { IncidentItem } from '../components/ReportIncidentPage'

/**
 * List of statuses that represent completion of an incident lifecycle.
 */
export const TERMINAL_STATUSES = ['closed', 'resolved', 'cancelled', 'completed']

/**
 * Checks whether an incident status indicates completion.
 * Returns true if status is 'closed', 'resolved', 'cancelled', or 'completed' (case-insensitive).
 */
export function isTerminalStatus(status?: string | null): boolean {
  if (!status) return false
  return TERMINAL_STATUSES.includes(status.toLowerCase().trim())
}

/**
 * Checks whether an incident is active (eligible for SLA evaluation).
 * Returns true only if the status is NOT terminal.
 */
export function isActiveIncident(incident: IncidentItem): boolean {
  return !isTerminalStatus(incident.status)
}

/**
 * Evaluates whether an incident is currently triggering an SLA warning or breach.
 * Strictly excludes any incident with a terminal status.
 */
export function isSlaWarningOrBreach(incident: IncidentItem): boolean {
  if (isTerminalStatus(incident.status)) {
    return false
  }
  return incident.priority === 'High' || incident.priority === 'Critical'
}

/**
 * Returns all active incidents that currently breach or threaten SLA targets.
 */
export function getActiveSlaBreaches(incidents: IncidentItem[]): IncidentItem[] {
  return (incidents || []).filter((incident) => isSlaWarningOrBreach(incident))
}
