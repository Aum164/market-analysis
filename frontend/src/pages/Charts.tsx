import TradingChart from '../components/charts/TradingChart'
import IndicatorPanel from '../components/charts/IndicatorPanel'
import { useAppStore } from '../store'

export default function Charts() {
  const { selectedSymbol } = useAppStore()
  return (
    <div className="space-y-4 h-full">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Charts — {selectedSymbol}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100%-4rem)]">
        <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-lg border p-4">
          <TradingChart />
        </div>
        <div>
          <IndicatorPanel />
        </div>
      </div>
    </div>
  )
}
