import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Constructor from './pages/Constructor'
import './App.css'

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'constructor' | 'auth'>('auth')
  const [selectedProject, setSelectedProject] = useState<any>(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
      if (session) {
        setCurrentPage('dashboard')
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>CodeCraft is loading...</p>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="app">
      {currentPage === 'dashboard' && (
        <Dashboard
          onSelectProject={(project) => {
            setSelectedProject(project)
            setCurrentPage('constructor')
          }}
          onLogout={() => {
            supabase.auth.signOut()
            setCurrentPage('auth')
          }}
        />
      )}
      {currentPage === 'constructor' && selectedProject && (
        <Constructor
          project={selectedProject}
          onBack={() => setCurrentPage('dashboard')}
        />
      )}
    </div>
  )
}
