import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts'
import { useQuery } from '@tanstack/react-query'
import { getOHLC, getIndicator } from '../api'
import { useAppStore } from '../store'

const SYMBOLS = ['NIFTY50', 'SENSEX', 'BANKNIFTY', 'RELIANCE', 'TCS', 'INFY']
const INTERVALS = ['1m', '5m', '15m', '1h', '1D', '1W']

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export default function ChartPage() {
  const chartRef = useRef<HTMLDivElement>(null)
  const { theme, selectedSymbol, setSymbol } = useAppStore()
  const [interval, setIntervalVal] = useState('5m')

  const { data: ohlcData } = useQuery({
    queryKey: ['ohlc', selectedSymbol, interval],
    queryFn: () => getOHLC(selectedSymbol, interval, 300),
    refetchInterval: 10000,
  })

  const { data: rsiData } = useQuery({
    queryKey: ['rsi', selectedSymbol],
    queryFn: () => getIndicator(selectedSymbol, 'rsi', 14),
    refetchInterval: 15000,
  })

  const { data: macdData } = useQuery({
    queryKey: ['macd', selectedSymbol],
    queryFn: () => getIndicator(selectedSymbol, 'macd', 12),
    refetchInterval: 15000,
  })

  useEffect(() => {
    if (!chartRef.current) return

    const isDark = theme === 'dark'
    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#0f172a' : '#ffffff' },
        textColor: isDark ? '#94a3b8' : '#374151',
      },
      grid: {
        vertLines: { color: isDark ? '#1e293b' : '#f3f4f6' },
        horzLines: { color: isDark ? '#1e293b' : '#f3f4f6' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: isDark ? '#334155' : '#e5e7eb' },
      timeScale: { borderColor: isDark ? '#334155' : '#e5e7eb', timeVisible: true },
      width: chartRef.current.clientWidth,
      height: 420,
    })

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    const volumeSeries = chart.addHistogramSeries({
      color: '#3b82f6',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } })

    if (ohlcData?.candles) {
      candleSeries.setData(ohlcData.candles)
      volumeSeries.setData(ohlcData.candles.map((c: Candle) => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? '#22c55e44' : '#ef444444',
      })))
      chart.timeScale().fitContent()
    }

    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth })
    })
    resizeObserver.observe(chartRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
    }
  }, [ohlcData, theme])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Advanced Charts</h1>
        <div className="flex gap-2 flex-wrap">
          <select
            value={selectedSymbol}
            onChange={e => setSymbol(e.target.value)}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white"
          >
            {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {INTERVALS.map(iv => (
              <button
                key={iv}
                onClick={() => setIntervalVal(iv)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  interval === iv ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {iv}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div ref={chartRef} className="w-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {rsiData && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">RSI (14)</div>
            <div className={`text-2xl font-bold ${rsiData.value > 70 ? 'text-red-500' : rsiData.value < 30 ? 'text-green-500' : 'text-gray-900 dark:text-white'}`}>
              {rsiData.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {rsiData.value > 70 ? 'Overbought' : rsiData.value < 30 ? 'Oversold' : 'Neutral'}
            </div>
          </div>
        )}
        {macdData && (
          <>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">MACD</div>
              <div className={`text-2xl font-bold ${macdData.macd > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {macdData.macd}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Signal: {macdData.signal}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">MACD Histogram</div>
              <div className={`text-2xl font-bold ${macdData.histogram > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {macdData.histogram}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{macdData.histogram > 0 ? 'Bullish' : 'Bearish'}</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
