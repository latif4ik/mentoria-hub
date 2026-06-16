import HeroSection from '../components/HeroSection'
import OpportunitiesSection from '../components/OpportunitiesSection'
import CoursesSection from '../components/CoursesSection'
import DashboardSection from '../components/DashboardSection'

export default function LandingPage({ onGetStarted }) {
  return (
    <main>
      <HeroSection onGetStarted={onGetStarted} />
      <OpportunitiesSection />
      <CoursesSection />
      <DashboardSection />
    </main>
  )
}
