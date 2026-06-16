import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import OpportunitiesSection from './components/OpportunitiesSection'
import CoursesSection from './components/CoursesSection'
import DashboardSection from './components/DashboardSection'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="bg-surface min-h-screen text-on-surface">
      <Navbar />
      <main>
        <HeroSection />
        <OpportunitiesSection />
        <CoursesSection />
        <DashboardSection />
      </main>
      <Footer />
    </div>
  )
}
