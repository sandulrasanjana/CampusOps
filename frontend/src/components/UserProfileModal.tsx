import React, { useEffect } from 'react'
import {
  X,
  Mail,
  Shield,
  Wrench,
  GraduationCap,
  Calendar,
  Clock,
  LogOut,
  Building,
  CheckCircle2,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react'
import { logOut, type FirebaseUser } from '../firebase'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userRole: 'Student' | 'Technician' | 'Admin'
  userName?: string
  firebaseUser?: FirebaseUser | null
  onLogout?: () => void
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userRole,
  userName = 'Campus User',
  firebaseUser = null,
  onLogout
}) => {
  // Listen for Escape key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const displayName = firebaseUser?.displayName || userName || 'Campus User'
  const email = firebaseUser?.email || `${displayName.toLowerCase().replace(/\s+/g, '')}@campusops.edu`
  const avatarUrl = firebaseUser?.photoURL
  const initial = displayName.charAt(0).toUpperCase() || 'U'

  // Department & Role Configs
  const getRoleConfig = () => {
    switch (userRole) {
      case 'Admin':
        return {
          label: 'ADMINISTRATOR',
          icon: <Shield size={14} />,
          badgeBg: 'rgba(168, 85, 247, 0.15)',
          badgeColor: '#C084FC',
          badgeBorder: '1px solid rgba(168, 85, 247, 0.3)',
          gradient: 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)',
          department: 'Central Operations Governance & System Administration',
          idPrefix: 'ADM-901'
        }
      case 'Technician':
        return {
          label: 'TECHNICIAN SPECIALIST',
          icon: <Wrench size={14} />,
          badgeBg: 'rgba(99, 102, 241, 0.15)',
          badgeColor: '#818CF8',
          badgeBorder: '1px solid rgba(99, 102, 241, 0.3)',
          gradient: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
          department: 'Campus Facility Operations & Infrastructure Support',
          idPrefix: 'TECH-104'
        }
      default:
        return {
          label: 'STUDENT',
          icon: <GraduationCap size={14} />,
          badgeBg: 'rgba(59, 130, 246, 0.15)',
          badgeColor: '#60A5FA',
          badgeBorder: '1px solid rgba(59, 130, 246, 0.3)',
          gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
          department: 'Department of Computer Science & Software Engineering',
          idPrefix: 'STU-892'
        }
    }
  }

  const roleConfig = getRoleConfig()

  // Format account timestamps
  const createdDate = firebaseUser?.metadata?.creationTime
    ? new Date(firebaseUser.metadata.creationTime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Oct 2024'

  const lastSignIn = firebaseUser?.metadata?.lastSignInTime
    ? new Date(firebaseUser.metadata.lastSignInTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Active Session'

  const handleSignOutClick = async () => {
    try {
      await logOut()
    } catch (e) {
      console.warn('Sign out warning:', e)
    }
    onClose()
    if (onLogout) {
      onLogout()
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="user-profile-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface-elevated, #18181B)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '480px',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          color: 'var(--text-heading, #F4F4F5)'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted, #A1A1AA)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Close Modal (Esc)"
        >
          <X size={16} />
        </button>

        {/* Modal Header & Avatar Banner */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: roleConfig.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '34px',
              fontWeight: 700,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              border: '3px solid rgba(255, 255, 255, 0.15)',
              overflow: 'hidden',
              marginBottom: '14px'
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initial
            )}
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-heading, #F4F4F5)', marginBottom: '6px' }}>
            {displayName}
          </h2>

          {/* Role Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono, monospace)',
              background: roleConfig.badgeBg,
              color: roleConfig.badgeColor,
              border: roleConfig.badgeBorder
            }}
          >
            {roleConfig.icon}
            <span>{roleConfig.label}</span>
          </div>
        </div>

        {/* Info Grid Card */}
        <div
          style={{
            background: 'var(--bg-base, #09090B)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Mail size={16} style={{ color: roleConfig.badgeColor, flexShrink: 0 }} />
            <div style={{ overflow: 'hidden' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted, #A1A1AA)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Account Email
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-heading, #F4F4F5)', fontWeight: 600, wordBreak: 'break-all' }}>
                {email}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Building size={16} style={{ color: roleConfig.badgeColor, flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted, #A1A1AA)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Department / Unit
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-heading, #F4F4F5)', fontWeight: 500 }}>
                {roleConfig.department}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={15} style={{ color: 'var(--text-muted, #A1A1AA)' }} />
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted, #A1A1AA)', display: 'block' }}>MEMBER SINCE</span>
                <span style={{ fontSize: '12px', color: 'var(--text-heading, #F4F4F5)', fontWeight: 600, fontFamily: 'var(--font-mono, monospace)' }}>
                  {createdDate}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={15} style={{ color: '#34D399' }} />
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted, #A1A1AA)', display: 'block' }}>LAST ACTIVE</span>
                <span style={{ fontSize: '12px', color: '#34D399', fontWeight: 600, fontFamily: 'var(--font-mono, monospace)' }}>
                  {lastSignIn}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Authentication Notice */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '12px',
            color: 'var(--text-muted, #A1A1AA)',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            marginBottom: '24px'
          }}
        >
          <ShieldCheck size={16} style={{ color: '#34D399', flexShrink: 0 }} />
          <span>Session secured via Firebase SSO & 256-bit SSL connection</span>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className="ghost-btn"
            style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="submit-btn"
            style={{
              flex: 1.2,
              justifyContent: 'center',
              padding: '10px',
              background: '#EF4444',
              color: '#ffffff',
              borderColor: '#DC2626'
            }}
            onClick={handleSignOutClick}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
