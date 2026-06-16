import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import OpportunitiesSection from './components/OpportunitiesSection'
import CoursesSection from './components/CoursesSection'
import DashboardSection from './components/DashboardSection'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'

export default function App() {
  const [session, setSession] = useState(null)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

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
    </div>
  )
}
