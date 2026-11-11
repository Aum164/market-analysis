import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { Sun, Moon, TrendingUp, BarChart2, Brain, Settings, Activity, Briefcase } from 'lucide-react'
import { useAppStore } from './store'
import Dashboard from './pages/Dashboard'
import ChartPage from './pages/ChartPage'
import PredictionPage from './pages/PredictionPage'
import StrategyPage from './pages/StrategyPage'
import BacktestPage from './pages/BacktestPage'
import BrokerPage from './pages/BrokerPage'

const navItems = [
  { to: '/', label: 'Dashboard', icon: Activity },
  { to: '/chart', label: 'Charts', icon: BarChart2 },
  { to: '/predict', label: 'AI Signals', icon: Brain },
  { to: '/strategy', label: 'Strategy', icon: TrendingUp },
  { to: '/backtest', label: 'Backtest', icon: Settings },
  { to: '/broker', label: 'Broker', icon: Briefcase },
]

export default function App() {
  const { theme, toggleTheme } = useAppStore()

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
          <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <TrendingUp size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-white">MarketAI</span>
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">BETA</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    }`
                  }
                >
                  <Icon size={15} />
                  {label}
                </NavLink>
              ))}
            </nav>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          <nav className="md:hidden flex overflow-x-auto px-4 pb-2 gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                <Icon size={12} />
                {label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chart" element={<ChartPage />} />
            <Route path="/predict" element={<PredictionPage />} />
            <Route path="/strategy" element={<StrategyPage />} />
            <Route path="/backtest" element={<BacktestPage />} />
            <Route path="/broker" element={<BrokerPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
