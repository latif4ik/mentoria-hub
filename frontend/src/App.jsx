import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import AppShell from './components/AppShell'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import Onboarding from './components/Onboarding'
import LandingPage from './pages/LandingPage'
import OpportunitiesPage from './pages/OpportunitiesPage'
import CoursesPage from './pages/CoursesPage'
import CourseDetailPage from './pages/CourseDetailPage'
import LessonPlayerPage from './pages/LessonPlayerPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  const [session, setSession]             = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [showAuth, setShowAuth]           = useState(false)
  const [profile, setProfile]             = useState(null)
  const [profileLoaded, setProfileLoaded] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setSessionLoading(false)
    })
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

  async function handleSignOut() {
    await supabase.auth.signOut()
    // Explicitly clear state rather than waiting for onAuthStateChange
    setSession(null)
    setProfile(null)
    setProfileLoaded(false)
  }

  const needsOnboarding = session && profileLoaded && (!profile || profile.grade === null)

  // Prevent a flash of the public layout while restoring an existing session
  if (sessionLoading) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      {session ? (
        /* ── Authenticated app shell ─────────────────────────── */
        <AppShell session={session} profile={profile} onSignOut={handleSignOut}>
          <Routes>
            {/* Landing page → dashboard for logged-in users */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <DashboardPage session={session} onLoginRequired={openAuth} />
            } />
            <Route path="/opportunities" element={
              <OpportunitiesPage session={session} onLoginRequired={openAuth} />
            } />
            <Route path="/courses" element={
              <CoursesPage session={session} />
            } />
            <Route path="/courses/:courseId" element={
              <CourseDetailPage session={session} onLoginRequired={openAuth} />
            } />
            <Route path="/courses/:courseId/lessons/:lessonId" element={
              <LessonPlayerPage session={session} onLoginRequired={openAuth} />
            } />
            <Route path="/admin" element={
              <AdminPage session={session} profile={profile} />
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {needsOnboarding && (
            <Onboarding
              userId={session.user.id}
              onComplete={(answers) => setProfile(prev => ({ ...prev, ...answers }))}
            />
          )}
        </AppShell>
      ) : (
        /* ── Public landing page ─────────────────────────────── */
        <div className="bg-surface min-h-screen text-on-surface flex flex-col">
          <Navbar onLoginClick={openAuth} />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage onGetStarted={openAuth} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </BrowserRouter>
  )
}
