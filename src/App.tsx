
import { Routes, Route } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { App as MainApp } from './pages/App'
import { MarketingPage } from './pages/MarketingPage'

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<MarketingPage />} />
        <Route path="/app/*" element={<MainApp />} />
      </Routes>
    </TooltipProvider>
  )
}

export default App
