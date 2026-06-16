import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import Onboarding from './components/Onboarding'
import LandingPage from './pages/LandingPage'
import OpportunitiesPage from './pages/OpportunitiesPage'

export default function App() {
  const [session, setSession]             = useState(null)
  const [showAuth, setShowAuth]           = useState(false)
  const [profile, setProfile]             = useState(null)
  const [profileLoaded, setProfileLoaded] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
      if (!session) { setProfile(null); setProfileLoaded(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    setProfileLoaded(false)
    supabase.from('profiles').select('*').eq('id', session.user.id).single()
      .then(({ data }) => { setProfile(data); setProfileLoaded(true) })
  }, [session])

  const openAuth = () => setShowAuth(true)
  const needsOnboarding = session && profileLoaded && (!profile || profile.grade === null)

  return (
    <BrowserRouter>
      <div className="bg-surface min-h-screen text-on-surface flex flex-col">
        <Navbar
          session={session}
          onLoginClick={openAuth}
          onSignOut={() => supabase.auth.signOut()}
        />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage onGetStarted={openAuth} />} />
            <Route path="/opportunities" element={
              <OpportunitiesPage session={session} onLoginRequired={openAuth} />
            } />
          </Routes>
        </div>

        <Footer />

        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

        {needsOnboarding && (
          <Onboarding
            userId={session.user.id}
            onComplete={(answers) => setProfile(prev => ({ ...prev, ...answers }))}
          />
        )}
      </div>
    </BrowserRouter>
  )
}
