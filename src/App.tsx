
import { Routes, Route } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from './contexts/ThemeContext'
import { AppProvider } from './contexts/AppContext'
import { MarketingPage } from './pages/MarketingPage'
import { AppPage } from './pages/AppPage'

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<MarketingPage />} />
          <Route path="/app/*" element={
            <AppProvider>
              <AppPage />
            </AppProvider>
          } />
        </Routes>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
