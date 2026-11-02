import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAppStore } from '../../store'
import Disclaimer from './Disclaimer'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

function DirectionIcon({ direction }: { direction: string }) {
  if (direction === 'up') return <TrendingUp className="text-up" size={32} />
  if (direction === 'down') return <TrendingDown className="text-down" size={32} />
  return <Minus className="text-sideways" size={32} />
}

export default function SentimentPanel() {
  const { selectedSymbol } = useAppStore()
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['predict', selectedSymbol],
    queryFn: () => api.predict(selectedSymbol),
    refetchInterval: 60000
  })
  return (
    <div className="space-y-4">
      <Disclaimer />
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Market Signal — {selectedSymbol}</h2>
          <button onClick={() => refetch()} className="text-xs bg-brand text-white px-3 py-1 rounded hover:bg-sky-600">Refresh</button>
        </div>
        {isLoading && <div className="animate-pulse space-y-3"><div className="h-16 bg-gray-100 dark:bg-gray-800 rounded" /><div className="h-8 bg-gray-100 dark:bg-gray-800 rounded" /></div>}
        {data && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <DirectionIcon direction={data.direction} />
              <div>
                <p className="text-2xl font-bold capitalize text-gray-900 dark:text-gray-100">{data.direction}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Confidence: {(data.confidence * 100).toFixed(1)}%</p>
              </div>
              <div className="ml-auto">
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-brand h-2 rounded-full" style={{ width: `${data.confidence * 100}%` }} />
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded p-3">{data.rationale}</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(data.features).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-800 rounded p-2">
                  <span className="text-gray-500 dark:text-gray-400 capitalize">{k.replace(/_/g, ' ')}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{typeof v === 'number' ? v.toFixed(2) : v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
