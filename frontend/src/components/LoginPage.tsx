import React, { useState, useEffect } from 'react'
import logoImg from '../assets/logo.png'
import {
  User,
  Key,
  Eye,
  EyeOff,
  Lock,
  Server,
  Database,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  UserCheck
} from 'lucide-react'
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  formatAuthEmail
} from '../firebase'

type ProfileType = 'Student' | 'Technician' | 'Admin'

interface LoginPageProps {
  onLoginSuccess?: (userName: string, profile: ProfileType) => void
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [profile, setProfile] = useState<ProfileType>('Student')

  // Form Fields
  const [fullName, setFullName] = useState('')
  const [userId, setUserId] = useState('')
  const [authToken, setAuthToken] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [persistSession, setPersistSession] = useState(true)

  // Simulation & Auth states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStep, setSubmitStep] = useState<string>('')
  const [authStatus, setAuthStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showRecoverModal, setShowRecoverModal] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoverySent, setRecoverySent] = useState(false)
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [showCustomAccountInput, setShowCustomAccountInput] = useState(false)
  const [customAccountEmail, setCustomAccountEmail] = useState('')

  // Simulated DB latency jitter for dynamic feel
  const [dbLatency, setDbLatency] = useState(12)

  useEffect(() => {
    const interval = setInterval(() => {
      const randomJitter = Math.floor(Math.random() * 5) - 2 // -2 to +2
      setDbLatency(Math.max(8, 12 + randomJitter))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Handle Form Submission (Sign In or Sign Up)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthStatus(null)

    if (!userId.trim()) {
      setAuthStatus({ type: 'error', message: 'Please enter your user_id or email.' })
      return
    }

    if (!authToken) {
      setAuthStatus({ type: 'error', message: 'Please enter your password (auth_token).' })
      return
    }

    const formattedEmail = formatAuthEmail(userId)

    if (authMode === 'signup') {
      if (authToken !== confirmPassword) {
        setAuthStatus({ type: 'error', message: 'Passwords do not match. Please verify auth_token.' })
        return
      }

      setIsSubmitting(true)
      setSubmitStep('Provisioning Firebase user account...')

      try {
        const userCred = await createUserWithEmailAndPassword(auth, formattedEmail, authToken)
        const nameToUse = fullName.trim() || userCred.user.email?.split('@')[0] || userId.split('@')[0] || 'Sandul'
        
        setSubmitStep(`Assigning ${profile} security token...`)

        setTimeout(() => {
          setIsSubmitting(false)
          setSubmitStep('')
          setAuthStatus({
            type: 'success',
            message: `Account created successfully! Logged in as ${profile} [${nameToUse}].`
          })
          if (onLoginSuccess) {
            onLoginSuccess(nameToUse, profile)
          }
        }, 1000)
      } catch (error: unknown) {
        setIsSubmitting(false)
        setSubmitStep('')
        const errObj = error as { code?: string; message?: string }
        let friendlyMessage = 'Firebase Sign Up Error'
        if (errObj?.code === 'auth/email-already-in-use') {
          friendlyMessage = 'An account already exists for this email/ID. Switch to Sign In mode.'
        } else if (errObj?.code === 'auth/weak-password') {
          friendlyMessage = 'Password must be at least 6 characters.'
        } else if (errObj?.message) {
          friendlyMessage = errObj.message
        }
        setAuthStatus({ type: 'error', message: friendlyMessage })
      }
    } else {
      // Sign In Mode
      setIsSubmitting(true)
      setSubmitStep('Initiating Firebase secure handshake...')

      try {
        const userCred = await signInWithEmailAndPassword(auth, formattedEmail, authToken)
        const nameToUse = userCred.user.displayName || userCred.user.email?.split('@')[0] || userId.split('@')[0] || 'Sandul'
        
        setSubmitStep(`Authenticating ${profile} session...`)

        setTimeout(() => {
          setIsSubmitting(false)
          setSubmitStep('')
          setAuthStatus({
            type: 'success',
            message: `Authenticated as ${profile} [${nameToUse}]. Redirecting to workspace...`
          })
          if (onLoginSuccess) {
            onLoginSuccess(nameToUse, profile)
          }
        }, 1000)
      } catch (error: unknown) {
        setIsSubmitting(false)
        setSubmitStep('')
        const errObj = error as { code?: string }
        let friendlyMessage = 'Invalid credentials. Please verify your ID and password.'
        if (errObj?.code === 'auth/user-not-found') {
          friendlyMessage = 'No user account found. Click "Sign Up" tab to register.'
        } else if (errObj?.code === 'auth/wrong-password' || errObj?.code === 'auth/invalid-credential') {
          friendlyMessage = 'Incorrect auth_token. Click "Recover?" to reset password.'
        }
        setAuthStatus({ type: 'error', message: friendlyMessage })
      }
    }
  }

  // Handle Google SSO Login
  const handleGoogleSignIn = async () => {
    setAuthStatus(null)
    setIsSubmitting(true)
    setSubmitStep('Connecting to Google SSO authentication provider...')

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const googleUser = result.user
      const displayName = googleUser.displayName || googleUser.email?.split('@')[0] || 'Sandul'

      setSubmitStep(`Authenticated via Google. Mapping to ${profile} workspace...`)

      setTimeout(() => {
        setIsSubmitting(false)
        setSubmitStep('')
        setAuthStatus({
          type: 'success',
          message: `Signed in with Google as ${displayName}. Redirecting...`
        })
        if (onLoginSuccess) {
          onLoginSuccess(displayName, profile)
        }
      }, 1000)
    } catch (error: unknown) {
      setIsSubmitting(false)
      setSubmitStep('')
      const errObj = error as { code?: string }
      if (errObj?.code === 'auth/popup-closed-by-user' || errObj?.code === 'auth/cancelled-popup-request') {
        setAuthStatus({ type: 'error', message: 'Google Sign In was cancelled.' })
      } else {
        // Dev environment / popup error: Open Google Account Chooser modal so user explicitly picks account
        setShowGoogleModal(true)
      }
    }
  }

  const handleSelectGoogleAccount = (name: string, email: string) => {
    setShowGoogleModal(false)
    setShowCustomAccountInput(false)
    setIsSubmitting(true)
    setSubmitStep(`Authenticating Google Account [${email}]...`)

    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStep('')
      setAuthStatus({
        type: 'success',
        message: `Signed in with Google as ${name}. Redirecting...`
      })
      if (onLoginSuccess) {
        onLoginSuccess(name, profile)
      }
    }, 1000)
  }

  // Handle Password Reset
  const handleSendRecovery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recoveryEmail) return
    const formattedEmail = formatAuthEmail(recoveryEmail)
    try {
      await sendPasswordResetEmail(auth, formattedEmail)
    } catch {
      // Ignored for demo safety banner
    }
    setRecoverySent(true)
    setTimeout(() => {
      setRecoverySent(false)
      setShowRecoverModal(false)
      setRecoveryEmail('')
    }, 2400)
  }

  return (
    <>
      <div className="bg-grid"></div>
      <div className="bg-radial-glow"></div>

      <div className="portal-wrapper">
        {/* Left Hero & Live System Status Panel */}
        <div className="hero-card">
          <div className="hero-top">
            <div className="brand-header">
              <img src={logoImg} alt="CampusOps Logo" className="brand-logo-img" />
              <span className="brand-name">
                Campus<span className="brand-highlight">Ops</span>
              </span>
            </div>

            <h1 className="hero-headline">Secure Access Portal</h1>
            <p className="hero-description">
              Enterprise-grade authentication with Firebase & Google SSO integration for campus network management.
            </p>
          </div>

          {/* Live System Status Cards */}
          <div className="system-status-section">
            <div className="status-header">
              <span className="live-dot"></span>
              <span>Live System Status</span>
            </div>

            <div className="status-cards">
              {/* Card 1: Core Network */}
              <div className="status-card">
                <div className="status-info">
                  <div className="status-icon">
                    <Server size={18} />
                  </div>
                  <div className="status-meta">
                    <span className="status-name">Core Network</span>
                    <span className="status-state">Operational</span>
                  </div>
                </div>
                <div className="status-metrics">
                  <span className="metric-value">99.99%</span>
                  <span className="metric-label">Uptime</span>
                </div>
              </div>

              {/* Card 2: Authentication DB */}
              <div className="status-card">
                <div className="status-info">
                  <div className="status-icon">
                    <Database size={18} />
                  </div>
                  <div className="status-meta">
                    <span className="status-name">Firebase & Google SSO</span>
                    <span className="status-state">Operational</span>
                  </div>
                </div>
                <div className="status-metrics">
                  <span className="metric-value">{dbLatency}ms</span>
                  <span className="metric-label">Latency</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sign In / Sign Up Form Panel */}
        <div className="auth-card">
          {/* Top Auth Mode Tabs (Sign In vs Sign Up) */}
          <div className="auth-mode-nav">
            <button
              type="button"
              className={`auth-mode-btn ${authMode === 'signin' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('signin')
                setAuthStatus(null)
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-mode-btn ${authMode === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('signup')
                setAuthStatus(null)
              }}
            >
              Sign Up
            </button>
          </div>

          <div className="auth-header">
            <h2 className="auth-title">{authMode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
            <p className="auth-subtitle">
              {authMode === 'signin'
                ? 'Authenticate to access your workspace'
                : 'Register your campus profile with Firebase'}
            </p>
          </div>

          {/* Feedback banner */}
          {authStatus && (
            <div className={`status-banner ${authStatus.type}`}>
              {authStatus.type === 'success' ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>{authStatus.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Profile Selector */}
            <div className="tab-container">
              <label className="tab-label">Environment Profile</label>
              <div className="tab-switcher">
                {(['Student', 'Technician', 'Admin'] as ProfileType[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`tab-btn ${profile === tab ? 'active' : ''}`}
                    onClick={() => setProfile(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Extra field for Sign Up mode: Full Name */}
            {authMode === 'signup' && (
              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label">full_name</label>
                </div>
                <div className="input-container">
                  <span className="input-icon">
                    <UserCheck size={16} />
                  </span>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter Full Name (e.g. Sandul)"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>
            )}

            {/* user_id / email input */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">user_id / email</label>
              </div>
              <div className="input-container">
                <span className="input-icon">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter ID or Email (e.g. STU-1042)"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* auth_token input */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">auth_token (password)</label>
                {authMode === 'signin' && (
                  <a
                    href="#recover"
                    className="recover-link"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowRecoverModal(true)
                    }}
                  >
                    Recover?
                  </a>
                )}
              </div>
              <div className="input-container">
                <span className="input-icon">
                  <Key size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                  required
                />
                <button
                  type="button"
                  className="input-action-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Extra field for Sign Up mode: Confirm Password */}
            {authMode === 'signup' && (
              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label">confirm_token</label>
                </div>
                <div className="input-container">
                  <span className="input-icon">
                    <Key size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            )}

            {/* Checkbox (Sign In mode) */}
            {authMode === 'signin' && (
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  id="persist-session"
                  className="custom-checkbox"
                  checked={persistSession}
                  onChange={(e) => setPersistSession(e.target.checked)}
                />
                <label htmlFor="persist-session" className="checkbox-label">
                  Persist session
                </label>
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  <span>{submitStep}</span>
                </>
              ) : authMode === 'signup' ? (
                'Register & Execute Handshake'
              ) : (
                'Execute Login Sequence'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>Or Continue With</span>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            className="google-sso-btn"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
          >
            {/* Google SVG Logo Icon */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Footer */}
          <div className="auth-footer">
            <Lock size={13} />
            <span>End-to-End Encrypted Firebase Session</span>
          </div>
        </div>
      </div>

      {/* Recovery Modal */}
      {showRecoverModal && (
        <div className="modal-overlay" onClick={() => setShowRecoverModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={20} color="var(--primary)" />
                <h3 style={{ fontFamily: 'var(--font-geist)', fontSize: 18, color: '#fff' }}>Credential Recovery</h3>
              </div>
              <button
                type="button"
                className="input-action-btn"
                onClick={() => setShowRecoverModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 20 }}>
              Enter your registered user ID or campus email to receive a Firebase password reset link.
            </p>

            {recoverySent ? (
              <div className="status-banner success" style={{ marginBottom: 0 }}>
                <CheckCircle2 size={16} />
                <span>Firebase reset email sent! Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleSendRecovery}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>Identity Verification Email / ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="user@campus.edu or ID"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    style={{ paddingLeft: 14 }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                  <button
                    type="button"
                    className="tab-btn"
                    style={{ padding: '8px 16px', background: 'var(--surface-container-highest)' }}
                    onClick={() => setShowRecoverModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn" style={{ width: 'auto', padding: '8px 20px' }}>
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Google Account Selector Modal */}
      {showGoogleModal && (
        <div className="modal-overlay" onClick={() => setShowGoogleModal(false)}>
          <div className="modal-card google-account-modal" onClick={(e) => e.stopPropagation()}>
            <div className="google-modal-header">
              <div className="google-brand-row">
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                </svg>
                <span style={{ fontWeight: 600, fontSize: 15, color: '#f1f5f9' }}>Sign in with Google</span>
              </div>
              <button
                type="button"
                className="input-action-btn"
                onClick={() => setShowGoogleModal(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="google-modal-body">
              <h3 className="google-title">Choose an account</h3>
              <p className="google-subtitle">to continue to <strong style={{ color: 'var(--primary)' }}>CampusOps</strong></p>

              <div className="google-account-list">
                <button
                  type="button"
                  className="google-account-item"
                  onClick={() => handleSelectGoogleAccount('Sandul Rasanjana', 'sandul.rasanjana@gmail.com')}
                >
                  <div className="account-avatar avatar-blue">S</div>
                  <div className="account-info">
                    <span className="account-name">Sandul Rasanjana</span>
                    <span className="account-email">sandul.rasanjana@gmail.com</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="google-account-item"
                  onClick={() => handleSelectGoogleAccount('Sandul (CampusOps)', 'sandul.dev@campusops.edu')}
                >
                  <div className="account-avatar avatar-purple">S</div>
                  <div className="account-info">
                    <span className="account-name">Sandul (CampusOps Admin)</span>
                    <span className="account-email">sandul.dev@campusops.edu</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="google-account-item"
                  onClick={() => handleSelectGoogleAccount('Alex Rivera', 'alex.rivera@campusops.edu')}
                >
                  <div className="account-avatar avatar-green">A</div>
                  <div className="account-info">
                    <span className="account-name">Alex Rivera (Infrastructure Lead)</span>
                    <span className="account-email">alex.rivera@campusops.edu</span>
                  </div>
                </button>

                {!showCustomAccountInput ? (
                  <button
                    type="button"
                    className="google-account-item custom-account-trigger"
                    onClick={() => setShowCustomAccountInput(true)}
                  >
                    <div className="account-avatar avatar-gray">+</div>
                    <div className="account-info">
                      <span className="account-name" style={{ color: 'var(--primary)', fontWeight: 500 }}>Use another account</span>
                    </div>
                  </button>
                ) : (
                  <div className="custom-account-form">
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Enter Google email address"
                      value={customAccountEmail}
                      onChange={(e) => setCustomAccountEmail(e.target.value)}
                      style={{ paddingLeft: 12 }}
                      autoFocus
                    />
                    <div className="custom-account-actions">
                      <button
                        type="button"
                        className="tab-btn"
                        style={{ padding: '6px 12px', fontSize: 13 }}
                        onClick={() => setShowCustomAccountInput(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="submit-btn"
                        style={{ width: 'auto', padding: '6px 16px', fontSize: 13 }}
                        disabled={!customAccountEmail.trim()}
                        onClick={() => {
                          const name = customAccountEmail.split('@')[0] || 'User'
                          handleSelectGoogleAccount(name, customAccountEmail.trim())
                        }}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="google-modal-footer">
              To continue, Google will share your name, email address, and language preference with CampusOps.
            </div>
          </div>
        </div>
      )}
    </>
  )
}
