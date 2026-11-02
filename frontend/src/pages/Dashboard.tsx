import MarketOverview from '../components/dashboard/MarketOverview'
import TradingChart from '../components/charts/TradingChart'
import SentimentPanel from '../components/sentiment/SentimentPanel'
import { useAppStore } from '../store'

export default function Dashboard() {
  const { selectedSymbol } = useAppStore()
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Market Dashboard — {selectedSymbol}</h1>
        <span className="text-xs text-gray-400">Live data • NSE</span>
      </div>
      <MarketOverview />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-lg border p-4 h-96">
          <TradingChart />
        </div>
        <div className="space-y-4">
          <SentimentPanel />
        </div>
      </div>
    </div>
  )
}
