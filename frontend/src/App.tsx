import { useState, useEffect } from 'react'
import { LoginPage } from './components/LoginPage'
import { StudentDashboard } from './components/StudentDashboard'
import { auth, onAuthStateChanged, signOut, type FirebaseUser } from './firebase'

function App() {
  const [currentView, setCurrentView] = useState<'login' | 'dashboard'>('dashboard')
  const [user, setUser] = useState('Sandul')
  const [, setFirebaseUser] = useState<FirebaseUser | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setFirebaseUser(authUser)
        const nameFromEmail = authUser.email ? authUser.email.split('@')[0] : 'Sandul'
        setUser(nameFromEmail)
        setCurrentView('dashboard')
      }
    })
    return () => unsubscribe()
  }, [])

  const handleLoginSuccess = (userName: string) => {
    setUser(userName || 'Sandul')
    setCurrentView('dashboard')
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

  if (currentView === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return <StudentDashboard userName={user} onLogout={handleLogout} />
}

export default App
