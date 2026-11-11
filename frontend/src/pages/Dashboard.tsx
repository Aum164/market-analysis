import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { getQuote } from '../api'
import { useAppStore } from '../store'

const WATCHLIST = ['NIFTY50', 'SENSEX', 'BANKNIFTY', 'RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICIBANK']

interface QuoteData {
  name: string
  ltp: number
  high: number
  low: number
  change_pct: number
}

function QuoteCard({ symbol }: { symbol: string }) {
  const { data, isLoading } = useQuery<QuoteData>({
    queryKey: ['quote', symbol],
    queryFn: () => getQuote(symbol),
    refetchInterval: 3000,
  })

  if (isLoading) return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32" />
    </div>
  )

  if (!data) return null

  const isUp = data.change_pct > 0
  const isDown = data.change_pct < 0

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
      <div className="flex justify-between items-start mb-1">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{symbol}</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">{data.name}</div>
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${isUp ? 'text-green-500' : isDown ? 'text-red-500' : 'text-gray-500'}`}>
          {isUp ? <TrendingUp size={14} /> : isDown ? <TrendingDown size={14} /> : <Minus size={14} />}
          {isUp ? '+' : ''}{data.change_pct}%
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
        Rs.{data.ltp.toLocaleString('en-IN')}
      </div>
      <div className="flex gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
        <span>H: Rs.{data.high.toLocaleString('en-IN')}</span>
        <span>L: Rs.{data.low.toLocaleString('en-IN')}</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { setSymbol } = useAppStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Market Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Live quotes — demo mode (delayed/simulated)</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {WATCHLIST.map(sym => (
          <div key={sym} onClick={() => setSymbol(sym)} className="cursor-pointer">
            <QuoteCard symbol={sym} />
          </div>
        ))}
      </div>

      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
          Demo Mode: All prices shown are simulated for demonstration. Connect a live broker API (Zerodha Kite Connect, Upstox, Angel One) for real-time data.
        </p>
      </div>
    </div>
  )
}
