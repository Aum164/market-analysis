import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, Brain, Zap, Building2 } from 'lucide-react'
import { cn } from '../../lib/utils'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/charts', icon: TrendingUp, label: 'Charts' },
  { to: '/sentiment', icon: Brain, label: 'AI Signals' },
  { to: '/strategy', icon: Zap, label: 'Strategy' },
  { to: '/broker', icon: Building2, label: 'Broker' },
]

export default function Sidebar() {
  return (
    <aside className="w-16 bg-gray-900 dark:bg-gray-950 flex flex-col items-center py-4 gap-1 shrink-0">
      <div className="w-8 h-8 bg-brand rounded flex items-center justify-center mb-4">
        <span className="text-white text-xs font-bold">MA</span>
      </div>
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          title={label}
          className={({ isActive }) =>
            cn('w-10 h-10 flex items-center justify-center rounded-lg transition-colors text-gray-400',
              isActive ? 'bg-brand text-white' : 'hover:bg-gray-800 hover:text-white')
          }
        >
          <Icon size={20} />
        </NavLink>
      ))}
    </aside>
  )
}
