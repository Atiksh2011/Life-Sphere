import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationProvider } from '@/contexts/NotificationContext'

// Layout Components
import Layout from '@/components/Layout/Layout'
import MobileBottomNav from '@/components/Layout/MobileBottomNav'
import Sidebar from '@/components/Layout/Sidebar'

// Pages
import Welcome from '@/pages/Welcome'
import Onboarding from '@/pages/Onboarding'
import Dashboard from '@/pages/Dashboard'
import WaterTracker from '@/pages/WaterTracker'
import MedicationManager from '@/pages/MedicationManager'
import ScreenTimeTracker from '@/pages/ScreenTimeTracker'
import MealPlanner from '@/pages/MealPlanner'
import LifeLoop from '@/pages/LifeLoop'
import TaskForge from '@/pages/TaskForge'
import EduPlan from '@/pages/EduPlan'
import BudgetBuddy from '@/pages/BudgetBuddy'
import Settings from '@/pages/Settings'
import Profile from '@/pages/Profile'
import LoadingScreen from '@/components/Common/LoadingScreen'
import OfflineIndicator from '@/components/Common/OfflineIndicator'

// Services
import { initializeApp } from '@/services/initService'

function App() {
  const { user, loading, initialized } = useAuth()
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Initialize app
  useEffect(() => {
    initializeApp()
  }, [])

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Show loading screen while initializing
  if (loading || !initialized) {
    return <LoadingScreen />
  }

  return (
    <ThemeProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <OfflineIndicator isOnline={isOnline} />
          
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/onboarding" element={<Onboarding />} />
              
              {/* Protected Routes */}
              <Route path="/" element={user ? <Layout /> : <Navigate to="/welcome" />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="water" element={<WaterTracker />} />
                <Route path="medication" element={<MedicationManager />} />
                <Route path="screentime" element={<ScreenTimeTracker />} />
                <Route path="meals" element={<MealPlanner />} />
                <Route path="lifeloop" element={<LifeLoop />} />
                <Route path="tasks" element={<TaskForge />} />
                <Route path="education" element={<EduPlan />} />
                <Route path="budget" element={<BudgetBuddy />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              
              {/* 404 Redirect */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>

          {/* Mobile Bottom Navigation */}
          {user && <MobileBottomNav />}
        </div>
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App
