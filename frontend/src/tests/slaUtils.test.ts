import { describe, it, expect } from 'vitest'
import { isTerminalStatus, calculateSLABreach } from '../utils/slaUtils'

describe('slaUtils', () => {
  describe('isTerminalStatus', () => {
    it('returns true for terminal status "closed"', () => {
      expect(isTerminalStatus('closed')).toBe(true)
      expect(isTerminalStatus('CLOSED')).toBe(true)
    })

    it('returns true for terminal status "resolved"', () => {
      expect(isTerminalStatus('resolved')).toBe(true)
      expect(isTerminalStatus('Resolved')).toBe(true)
    })

    it('returns false for non-terminal statuses like "open" or "in_progress"', () => {
      expect(isTerminalStatus('open')).toBe(false)
      expect(isTerminalStatus('in_progress')).toBe(false)
      expect(isTerminalStatus(null)).toBe(false)
      expect(isTerminalStatus(undefined)).toBe(false)
    })
  })

  describe('calculateSLABreach', () => {
    it('returns isBreached: true when current time is past SLA deadline', () => {
      const createdAt = new Date('2026-10-08T08:00:00Z')
      const slaHours = 2
      const now = new Date('2026-10-08T11:00:00Z') // 3 hours later > 2 hours SLA

      const result = calculateSLABreach(createdAt, slaHours, now)
      expect(result.isBreached).toBe(true)
      expect(result.remainingMs).toBeLessThan(0)
    })

    it('returns isBreached: false when current time is before SLA deadline', () => {
      const createdAt = new Date('2026-10-08T08:00:00Z')
      const slaHours = 4
      const now = new Date('2026-10-08T09:00:00Z') // 1 hour later < 4 hours SLA

      const result = calculateSLABreach(createdAt, slaHours, now)
      expect(result.isBreached).toBe(false)
      expect(result.remainingMs).toBeGreaterThan(0)
    })
  })
})
