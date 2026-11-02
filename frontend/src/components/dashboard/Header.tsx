import { Sun, Moon, Bell, Settings } from 'lucide-react'
import { useAppStore } from '../../store'

const SYMBOLS = ['NIFTY50', 'SENSEX', 'BANKNIFTY', 'RELIANCE', 'TCS', 'HDFCBANK', 'INFY']

export default function Header() {
  const { theme, toggleTheme, selectedSymbol, setSymbol } = useAppStore()
  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b flex items-center px-4 gap-4 shrink-0">
      <select
        value={selectedSymbol}
        onChange={e => setSymbol(e.target.value)}
        className="bg-gray-100 dark:bg-gray-800 text-sm rounded px-2 py-1 border-0 outline-none text-gray-900 dark:text-gray-100"
      >
        {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <div className="flex-1" />
      <button onClick={toggleTheme} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
        <Bell size={18} />
      </button>
      <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
        <Settings size={18} />
      </button>
    </header>
  )
}
