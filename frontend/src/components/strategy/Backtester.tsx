import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { BacktestResult } from '../../types'
import { fmt, fmtPct } from '../../lib/utils'

export default function Backtester() {
  const [symbol, setSymbol] = useState('NIFTY50')
  const [capital, setCapital] = useState('100000')
  const [startDate, setStartDate] = useState('2023-01-01')
  const [endDate, setEndDate] = useState('2024-01-01')
  const [result, setResult] = useState<BacktestResult | null>(null)
  const mutation = useMutation({
    mutationFn: () => api.runBacktest({ symbol, capital: +capital, start_date: startDate, end_date: endDate }),
    onSuccess: (data) => setResult(data)
  })
  const metrics = result?.metrics
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Backtester</h2>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Symbol', el: <input value={symbol} onChange={e => setSymbol(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border rounded px-2 py-1 text-sm text-gray-900 dark:text-gray-100" /> },
          { label: 'Capital (₹)', el: <input type="number" value={capital} onChange={e => setCapital(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border rounded px-2 py-1 text-sm text-gray-900 dark:text-gray-100" /> },
          { label: 'From', el: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border rounded px-2 py-1 text-sm text-gray-900 dark:text-gray-100" /> },
          { label: 'To', el: <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border rounded px-2 py-1 text-sm text-gray-900 dark:text-gray-100" /> },
        ].map(({ label, el }) => (
          <div key={label}><label className="text-xs text-gray-500 dark:text-gray-400">{label}</label>{el}</div>
        ))}
      </div>
      <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
        className="bg-brand text-white text-sm px-4 py-2 rounded hover:bg-sky-600 disabled:opacity-50">
        {mutation.isPending ? 'Running...' : 'Run Backtest'}
      </button>
      {metrics && (
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            ['Total Return', fmtPct(metrics.total_return)],
            ['CAGR', fmtPct(metrics.cagr)],
            ['Sharpe', fmt(metrics.sharpe)],
            ['Max Drawdown', fmtPct(metrics.max_drawdown)],
            ['Win Rate', fmtPct(metrics.win_rate)],
            ['Trades', metrics.num_trades.toString()],
          ].map(([label, val]) => (
            <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-lg font-bold mt-1 text-gray-900 dark:text-gray-100">{val}</p>
            </div>
          ))}
        </div>
      )}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded p-2 text-xs text-amber-800 dark:text-amber-200">
        ⚠️ Past backtest performance does not guarantee future results.
      </div>
    </div>
  )
}
