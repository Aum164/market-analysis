import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAppStore } from '../../store'

const INTERVALS = ['1m', '5m', '15m', '1h', '1D', '1W']

export default function TradingChart() {
  const chartRef = useRef<HTMLDivElement>(null)
  const { selectedSymbol, selectedInterval, setInterval, theme } = useAppStore()
  const [chartApi, setChartApi] = useState<ReturnType<typeof createChart> | null>(null)

  const now = Math.floor(Date.now() / 1000)
  const from = now - 86400 * 30

  const { data: ohlcv } = useQuery({
    queryKey: ['ohlc', selectedSymbol, selectedInterval],
    queryFn: () => api.ohlc(selectedSymbol, selectedInterval, from, now),
    refetchInterval: 10000
  })

  useEffect(() => {
    if (!chartRef.current) return
    const isDark = theme === 'dark'
    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#111827' : '#ffffff' },
        textColor: isDark ? '#9ca3af' : '#374151',
      },
      grid: {
        vertLines: { color: isDark ? '#1f2937' : '#f3f4f6' },
        horzLines: { color: isDark ? '#1f2937' : '#f3f4f6' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: isDark ? '#374151' : '#e5e7eb' },
      timeScale: { borderColor: isDark ? '#374151' : '#e5e7eb', timeVisible: true },
      width: chartRef.current.clientWidth,
      height: chartRef.current.clientHeight,
    })
    setChartApi(chart)
    const handleResize = () => chart.applyOptions({ width: chartRef.current!.clientWidth })
    window.addEventListener('resize', handleResize)
    return () => { window.removeEventListener('resize', handleResize); chart.remove() }
  }, [theme])

  useEffect(() => {
    if (!chartApi || !ohlcv) return
    const candle = chartApi.addCandlestickSeries({
      upColor: '#22c55e', downColor: '#ef4444',
      borderUpColor: '#22c55e', borderDownColor: '#ef4444',
      wickUpColor: '#22c55e', wickDownColor: '#ef4444',
    })
    candle.setData(ohlcv.map(d => ({ time: d.time as never, open: d.open, high: d.high, low: d.low, close: d.close })))
    const vol = chartApi.addHistogramSeries({ color: '#3b82f6', priceFormat: { type: 'volume' }, priceScaleId: 'vol' })
    chartApi.priceScale('vol').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })
    vol.setData(ohlcv.map(d => ({ time: d.time as never, value: d.volume, color: d.close >= d.open ? '#22c55e40' : '#ef444440' })))
    chartApi.timeScale().fitContent()
  }, [chartApi, ohlcv])

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 mb-2">
        {INTERVALS.map(i => (
          <button
            key={i}
            onClick={() => setInterval(i)}
            className={`px-2 py-0.5 text-xs rounded ${selectedInterval === i ? 'bg-brand text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >{i}</button>
        ))}
      </div>
      <div ref={chartRef} className="flex-1" />
    </div>
  )
}
