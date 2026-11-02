import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/dashboard/Sidebar'
import Header from './components/dashboard/Header'
import Dashboard from './pages/Dashboard'
import Charts from './pages/Charts'
import Sentiment from './pages/Sentiment'
import Strategy from './pages/Strategy'
import Broker from './pages/Broker'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/charts" element={<Charts />} />
              <Route path="/sentiment" element={<Sentiment />} />
              <Route path="/strategy" element={<Strategy />} />
              <Route path="/broker" element={<Broker />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
