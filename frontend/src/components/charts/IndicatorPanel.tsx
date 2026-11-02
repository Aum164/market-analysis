import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAppStore } from '../../store'
import { fmt } from '../../lib/utils'

const INDICATORS = [
  { type: 'rsi', label: 'RSI', period: 14 },
  { type: 'macd', label: 'MACD', period: 26 },
  { type: 'sma', label: 'SMA 20', period: 20 },
  { type: 'ema', label: 'EMA 9', period: 9 },
  { type: 'bb', label: 'Bollinger', period: 20 },
]

export default function IndicatorPanel() {
  const { selectedSymbol } = useAppStore()
  const [active, setActive] = useState('rsi')
  const ind = INDICATORS.find(i => i.type === active)!
  const { data } = useQuery({
    queryKey: ['indicator', selectedSymbol, active, ind.period],
    queryFn: () => api.indicator(selectedSymbol, active, ind.period, '5m'),
    refetchInterval: 15000
  })
  const latest = data?.values?.slice(-1)[0]
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
      <div className="flex gap-2 mb-3 flex-wrap">
        {INDICATORS.map(i => (
          <button key={i.type} onClick={() => setActive(i.type)}
            className={`px-2 py-0.5 text-xs rounded ${active === i.type ? 'bg-brand text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
          >{i.label}</button>
        ))}
      </div>
      {latest && (
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">{ind.label} (latest)</p>
          <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-gray-100">{fmt(latest.value)}</p>
        </div>
      )}
      {!latest && <p className="text-sm text-gray-400 text-center">Loading...</p>}
    </div>
  )
}
