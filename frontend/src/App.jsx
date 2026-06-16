import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import OpportunitiesSection from './components/OpportunitiesSection'
import CoursesSection from './components/CoursesSection'
import DashboardSection from './components/DashboardSection'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import Onboarding from './components/Onboarding'

export default function App() {
  const [session, setSession]           = useState(null)
  const [showAuth, setShowAuth]         = useState(false)
  const [profile, setProfile]           = useState(null)
  const [profileLoaded, setProfileLoaded] = useState(false)

  // Auth session listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
      if (!session) { setProfile(null); setProfileLoaded(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Fetch profile whenever session changes
  useEffect(() => {
    if (!session) return
    setProfileLoaded(false)
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => { setProfile(data); setProfileLoaded(true) })
  }, [session])

  // Show onboarding when logged in but grade not yet set
  const needsOnboarding = session && profileLoaded && (!profile || profile.grade === null)

  return (
    <div className="bg-surface min-h-screen text-on-surface">
      <Navbar
        session={session}
        onLoginClick={() => setShowAuth(true)}
        onSignOut={() => supabase.auth.signOut()}
      />
      <main>
        <HeroSection onGetStarted={() => setShowAuth(true)} />
        <OpportunitiesSection />
        <CoursesSection />
        <DashboardSection />
      </main>
      <Footer />

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {needsOnboarding && (
        <Onboarding
          userId={session.user.id}
          onComplete={(answers) => setProfile(prev => ({ ...prev, ...answers }))}
        />
      )}
    </div>
  )
}
