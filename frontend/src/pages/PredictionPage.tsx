import { useQuery } from '@tanstack/react-query'
import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'
import { getPredict } from '../api'
import { useAppStore } from '../store'

const SYMBOLS = ['NIFTY50', 'SENSEX', 'BANKNIFTY', 'RELIANCE', 'TCS']

const DISCLAIMER = `IMPORTANT DISCLAIMER: This AI signal is a probabilistic research tool for informational purposes only — NOT investment advice. Signals are generated from simulated/historical data patterns. Past performance does NOT guarantee future results. The user is solely responsible for all trading decisions and must comply with SEBI regulations and their broker's terms. This platform does not make any "guaranteed return" claims. Trading in equities and derivatives involves substantial risk of loss.`

interface PredictData {
  direction: string
  confidence: number
  rationale: string
  features: Record<string, unknown>
  timestamp: string
}

export default function PredictionPage() {
  const { selectedSymbol, setSymbol } = useAppStore()

  const { data, isLoading, refetch } = useQuery<PredictData>({
    queryKey: ['predict', selectedSymbol],
    queryFn: () => getPredict(selectedSymbol),
    refetchInterval: 60000,
  })

  const directionColor = data?.direction === 'UP'
    ? 'text-green-500' : data?.direction === 'DOWN'
    ? 'text-red-500' : 'text-yellow-500'

  const directionBg = data?.direction === 'UP'
    ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
    : data?.direction === 'DOWN'
    ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
    : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'

  return (
    <div className="space-y-6">
      <div className="bg-red-50 dark:bg-red-950 border-2 border-red-300 dark:border-red-700 rounded-xl p-4">
        <div className="flex gap-2">
          <AlertTriangle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-red-800 dark:text-red-200 leading-relaxed">{DISCLAIMER}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="text-blue-600" size={22} />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Market Signals</h1>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedSymbol}
            onChange={e => setSymbol(e.target.value)}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white"
          >
            {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center text-gray-500 dark:text-gray-400">
          Generating AI signal...
        </div>
      ) : data ? (
        <>
          <div className={`rounded-xl border-2 p-6 ${directionBg}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{selectedSymbol} — Short-term outlook</div>
                <div className={`text-5xl font-black flex items-center gap-3 ${directionColor}`}>
                  {data.direction === 'UP' ? <TrendingUp size={40} /> : data.direction === 'DOWN' ? <TrendingDown size={40} /> : <Minus size={40} />}
                  {data.direction}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Confidence</div>
                <div className="text-4xl font-black text-gray-900 dark:text-white">{Math.round(data.confidence * 100)}%</div>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{data.rationale}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Key Driving Features</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(data.features).map(([key, val]) => (
                <div key={key} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-1">{key.replace(/_/g, ' ')}</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{String(val)}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 italic">Last updated: {new Date(data.timestamp).toLocaleString('en-IN')}</p>
        </>
      ) : null}
    </div>
  )
}
