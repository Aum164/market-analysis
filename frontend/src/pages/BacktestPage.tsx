import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createChart, ColorType } from 'lightweight-charts'
import { runBacktest } from '../api'

const SYMBOLS = ['NIFTY50', 'SENSEX', 'BANKNIFTY', 'RELIANCE', 'TCS']

interface BacktestParams {
  symbol: string
  capital: number
  start_date: string
  end_date: string
}

export default function BacktestPage() {
  const [params, setParams] = useState<BacktestParams>({
    symbol: 'NIFTY50',
    capital: 100000,
    start_date: '2023-01-01',
    end_date: '2024-01-01',
  })
  const [triggered, setTriggered] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['backtest', params, triggered],
    queryFn: () => runBacktest(params),
    enabled: triggered,
  })

  useEffect(() => {
    if (!chartRef.current || !data?.equity_curve) return
    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: { vertLines: { color: '#1e293b' }, horzLines: { color: '#1e293b' } },
      width: chartRef.current.clientWidth,
      height: 280,
    })
    const series = chart.addAreaSeries({ lineColor: '#3b82f6', topColor: '#3b82f644', bottomColor: '#3b82f600' })
    series.setData(data.equity_curve)
    chart.timeScale().fitContent()
    return () => chart.remove()
  }, [data])

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Strategy Backtesting</h1>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Backtest Parameters</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Symbol</label>
            <select
              value={params.symbol}
              onChange={e => setParams(p => ({ ...p, symbol: e.target.value }))}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white w-full"
            >
              {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Capital (Rs.)</label>
            <input
              type="number"
              value={params.capital}
              onChange={e => setParams(p => ({ ...p, capital: Number(e.target.value) }))}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Start Date</label>
            <input
              type="date"
              value={params.start_date}
              onChange={e => setParams(p => ({ ...p, start_date: e.target.value }))}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">End Date</label>
            <input
              type="date"
              value={params.end_date}
              onChange={e => setParams(p => ({ ...p, end_date: e.target.value }))}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white w-full"
            />
          </div>
        </div>
        <button
          onClick={() => setTriggered(true)}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Running...' : 'Run Backtest'}
        </button>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Total Return', value: `${data.metrics.total_return_pct}%`, positive: data.metrics.total_return_pct > 0 },
              { label: 'CAGR', value: `${data.metrics.cagr_pct}%`, positive: data.metrics.cagr_pct > 0 },
              { label: 'Sharpe Ratio', value: data.metrics.sharpe_ratio, positive: data.metrics.sharpe_ratio > 1 },
              { label: 'Max Drawdown', value: `-${data.metrics.max_drawdown_pct}%`, positive: false },
              { label: 'Win Rate', value: `${data.metrics.win_rate_pct}%`, positive: data.metrics.win_rate_pct > 50 },
              { label: 'Total Trades', value: data.metrics.total_trades, positive: true },
              { label: 'Avg Win', value: `${data.metrics.avg_win_pct}%`, positive: true },
              { label: 'Avg Loss', value: `-${data.metrics.avg_loss_pct}%`, positive: false },
              { label: 'Profit Factor', value: data.metrics.profit_factor, positive: data.metrics.profit_factor > 1 },
            ].map((m: { label: string; value: string | number; positive: boolean }) => (
              <div key={m.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{m.label}</div>
                <div className={`text-lg font-bold ${m.positive ? 'text-green-500' : 'text-red-500'}`}>{m.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Equity Curve</h2>
            <div ref={chartRef} className="w-full" />
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
            <p className="text-xs text-amber-800 dark:text-amber-200">{data.disclaimer}</p>
          </div>
        </>
      )}
    </div>
  )
}
