import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { fmt, fmtPct, colorForChange } from '../../lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

const SYMBOLS = ['NIFTY50', 'SENSEX', 'BANKNIFTY']

function QuoteTile({ symbol }: { symbol: string }) {
  const { data, isLoading } = useQuery({ queryKey: ['quote', symbol], queryFn: () => api.quote(symbol), refetchInterval: 3000 })
  if (isLoading) return <div className="bg-white dark:bg-gray-900 rounded-lg p-4 animate-pulse h-24" />
  if (!data) return null
  const up = data.change_pct >= 0
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{symbol}</p>
          <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">{fmt(data.ltp)}</p>
        </div>
        {up ? <TrendingUp className="text-up" size={22} /> : <TrendingDown className="text-down" size={22} />}
      </div>
      <p className={`text-sm mt-1 font-medium ${colorForChange(data.change_pct)}`}>
        {fmtPct(data.change_pct)} ({fmt(data.change)})
      </p>
    </div>
  )
}

export default function MarketOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {SYMBOLS.map(s => <QuoteTile key={s} symbol={s} />)}
    </div>
  )
}
