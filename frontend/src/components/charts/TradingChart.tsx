import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, CrosshairMode, LineStyle } from 'lightweight-charts'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAppStore } from '../../store'

const INTERVALS = ['1m', '5m', '15m', '1h', '1D', '1W']

function computeSMA(data: { time: number; close: number }[], period: number) {
  const result: { time: number; value: number }[] = []
  for (let i = period - 1; i < data.length; i++) {
    const avg = data.slice(i - period + 1, i + 1).reduce((s, d) => s + d.close, 0) / period
    result.push({ time: data[i].time, value: avg })
  }
  return result
}

function computeEMA(data: { time: number; close: number }[], period: number) {
  const k = 2 / (period + 1)
  const result: { time: number; value: number }[] = []
  let ema = data.slice(0, period).reduce((s, d) => s + d.close, 0) / period
  for (let i = period; i < data.length; i++) {
    ema = data[i].close * k + ema * (1 - k)
    result.push({ time: data[i].time, value: ema })
  }
  return result
}

function computeBB(data: { time: number; close: number }[], period: number) {
  const upper: { time: number; value: number }[] = []
  const mid: { time: number; value: number }[] = []
  const lower: { time: number; value: number }[] = []
  for (let i = period - 1; i < data.length; i++) {
    const window = data.slice(i - period + 1, i + 1).map(d => d.close)
    const mean = window.reduce((s, v) => s + v, 0) / period
    const std = Math.sqrt(window.reduce((s, v) => s + (v - mean) ** 2, 0) / period)
    const t = data[i].time
    upper.push({ time: t, value: mean + 2 * std })
    mid.push({ time: t, value: mean })
    lower.push({ time: t, value: mean - 2 * std })
  }
  return { upper, mid, lower }
}

function computeRSI(data: { time: number; close: number }[], period: number) {
  const result: { time: number; value: number }[] = []
  for (let i = period; i < data.length; i++) {
    let gains = 0, losses = 0
    for (let j = i - period + 1; j <= i; j++) {
      const diff = data[j].close - data[j - 1].close
      if (diff > 0) gains += diff; else losses -= diff
    }
    const avgGain = gains / period
    const avgLoss = losses / period
    const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
    result.push({ time: data[i].time, value: rsi })
  }
  return result
}

function computeMACD(data: { time: number; close: number }[]) {
  const k12 = 2 / 13, k26 = 2 / 27, k9 = 2 / 10
  const macdLine: { time: number; value: number }[] = []
  const signalLine: { time: number; value: number }[] = []
  const histogram: { time: number; value: number; color: string }[] = []

  if (data.length < 26) return { macdLine, signalLine, histogram }

  let ema12 = data.slice(0, 12).reduce((s, d) => s + d.close, 0) / 12
  let ema26 = data.slice(0, 26).reduce((s, d) => s + d.close, 0) / 26

  for (let i = 12; i < data.length; i++) {
    ema12 = data[i].close * k12 + ema12 * (1 - k12)
    if (i >= 25) {
      ema26 = data[i].close * k26 + ema26 * (1 - k26)
      macdLine.push({ time: data[i].time, value: ema12 - ema26 })
    }
  }

  if (macdLine.length < 9) return { macdLine, signalLine, histogram }

  let sig = macdLine.slice(0, 9).reduce((s, d) => s + d.value, 0) / 9
  for (let i = 9; i < macdLine.length; i++) {
    sig = macdLine[i].value * k9 + sig * (1 - k9)
    signalLine.push({ time: macdLine[i].time, value: sig })
    const hist = macdLine[i].value - sig
    histogram.push({ time: macdLine[i].time, value: hist, color: hist >= 0 ? '#22c55e80' : '#ef444480' })
  }

  return { macdLine, signalLine, histogram }
}

export default function TradingChart() {
  const mainRef = useRef<HTMLDivElement>(null)
  const rsiRef = useRef<HTMLDivElement>(null)
  const macdRef = useRef<HTMLDivElement>(null)
  const { selectedSymbol, selectedInterval, setInterval, theme } = useAppStore()
  const [showSMA, setShowSMA] = useState(true)
  const [showEMA, setShowEMA] = useState(true)
  const [showBB, setShowBB] = useState(true)
  const [showRSI, setShowRSI] = useState(true)
  const [showMACD, setShowMACD] = useState(true)

  const now = Math.floor(Date.now() / 1000)
  const from = now - 86400 * 30

  const { data: ohlcv } = useQuery({
    queryKey: ['ohlc', selectedSymbol, selectedInterval],
    queryFn: () => api.ohlc(selectedSymbol, selectedInterval, from, now),
    refetchInterval: 10000
  })

  useEffect(() => {
    if (!mainRef.current || !ohlcv || ohlcv.length === 0) return
    const isDark = theme === 'dark'
    const bg = isDark ? '#111827' : '#ffffff'
    const text = isDark ? '#9ca3af' : '#374151'
    const grid = isDark ? '#1f2937' : '#f3f4f6'
    const border = isDark ? '#374151' : '#e5e7eb'

    const chartOpts = (height: number) => ({
      layout: { background: { type: ColorType.Solid, color: bg }, textColor: text },
      grid: { vertLines: { color: grid }, horzLines: { color: grid } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: border },
      timeScale: { borderColor: border, timeVisible: true },
      width: mainRef.current!.clientWidth,
      height,
    })

    // ── Main chart ──
    const mainChart = createChart(mainRef.current, chartOpts(320))
    const candle = mainChart.addCandlestickSeries({
      upColor: '#22c55e', downColor: '#ef4444',
      borderUpColor: '#22c55e', borderDownColor: '#ef4444',
      wickUpColor: '#22c55e', wickDownColor: '#ef4444',
    })
    candle.setData(ohlcv.map(d => ({ time: d.time as never, open: d.open, high: d.high, low: d.low, close: d.close })))

    const vol = mainChart.addHistogramSeries({ color: '#3b82f6', priceFormat: { type: 'volume' }, priceScaleId: 'vol' })
    mainChart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } })
    vol.setData(ohlcv.map(d => ({ time: d.time as never, value: d.volume, color: d.close >= d.open ? '#22c55e40' : '#ef444440' })))

    const closes = ohlcv.map(d => ({ time: d.time, close: d.close }))

    if (showSMA) {
      const smaSeries = mainChart.addLineSeries({ color: '#f59e0b', lineWidth: 1, title: 'SMA20' })
      smaSeries.setData(computeSMA(closes, 20).map(d => ({ time: d.time as never, value: d.value })))
    }

    if (showEMA) {
      const emaSeries = mainChart.addLineSeries({ color: '#8b5cf6', lineWidth: 1, title: 'EMA9' })
      emaSeries.setData(computeEMA(closes, 9).map(d => ({ time: d.time as never, value: d.value })))
    }

    if (showBB) {
      const bb = computeBB(closes, 20)
      const bbUpper = mainChart.addLineSeries({ color: '#3b82f680', lineWidth: 1, lineStyle: LineStyle.Dashed, title: 'BB↑' })
      const bbMid = mainChart.addLineSeries({ color: '#3b82f6', lineWidth: 1, lineStyle: LineStyle.Dotted, title: 'BB mid' })
      const bbLower = mainChart.addLineSeries({ color: '#3b82f680', lineWidth: 1, lineStyle: LineStyle.Dashed, title: 'BB↓' })
      bbUpper.setData(bb.upper.map(d => ({ time: d.time as never, value: d.value })))
      bbMid.setData(bb.mid.map(d => ({ time: d.time as never, value: d.value })))
      bbLower.setData(bb.lower.map(d => ({ time: d.time as never, value: d.value })))
    }

    mainChart.timeScale().fitContent()
    const onResize = () => mainChart.applyOptions({ width: mainRef.current!.clientWidth })
    window.addEventListener('resize', onResize)

    // ── RSI pane ──
    let rsiChart: ReturnType<typeof createChart> | null = null
    if (showRSI && rsiRef.current) {
      rsiChart = createChart(rsiRef.current, { ...chartOpts(110), rightPriceScale: { borderColor: border, scaleMargins: { top: 0.1, bottom: 0.1 } } })
      const rsiSeries = rsiChart.addLineSeries({ color: '#06b6d4', lineWidth: 1, title: 'RSI14' })
      const rsiData = computeRSI(closes, 14)
      rsiSeries.setData(rsiData.map(d => ({ time: d.time as never, value: d.value })))
      // Reference lines at 30 and 70
      const ob = rsiChart.addLineSeries({ color: '#ef444460', lineWidth: 1, lineStyle: LineStyle.Dashed })
      const os = rsiChart.addLineSeries({ color: '#22c55e60', lineWidth: 1, lineStyle: LineStyle.Dashed })
      const times = rsiData.map(d => d.time)
      if (times.length > 0) {
        ob.setData(times.map(t => ({ time: t as never, value: 70 })))
        os.setData(times.map(t => ({ time: t as never, value: 30 })))
      }
      rsiChart.timeScale().fitContent()
      window.addEventListener('resize', () => rsiChart?.applyOptions({ width: rsiRef.current!.clientWidth }))
    }

    // ── MACD pane ──
    let macdChart: ReturnType<typeof createChart> | null = null
    if (showMACD && macdRef.current) {
      macdChart = createChart(macdRef.current, { ...chartOpts(90), rightPriceScale: { borderColor: border } })
      const { macdLine, signalLine, histogram } = computeMACD(closes)
      if (histogram.length > 0) {
        const hist = macdChart.addHistogramSeries({ color: '#22c55e80', title: 'Hist' })
        hist.setData(histogram.map(d => ({ time: d.time as never, value: d.value, color: d.color })))
        const ml = macdChart.addLineSeries({ color: '#3b82f6', lineWidth: 1, title: 'MACD' })
        ml.setData(macdLine.map(d => ({ time: d.time as never, value: d.value })))
        const sl = macdChart.addLineSeries({ color: '#f97316', lineWidth: 1, title: 'Signal' })
        sl.setData(signalLine.map(d => ({ time: d.time as never, value: d.value })))
      }
      macdChart.timeScale().fitContent()
      window.addEventListener('resize', () => macdChart?.applyOptions({ width: macdRef.current!.clientWidth }))
    }

    return () => {
      window.removeEventListener('resize', onResize)
      mainChart.remove()
      rsiChart?.remove()
      macdChart?.remove()
    }
  }, [theme, ohlcv, showSMA, showEMA, showBB, showRSI, showMACD])

  const toggleBtn = (label: string, active: boolean, toggle: () => void, color: string) => (
    <button
      onClick={toggle}
      className={`px-2 py-0.5 text-xs rounded border ${active ? `border-transparent text-white` : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-transparent'}`}
      style={active ? { backgroundColor: color } : {}}
    >{label}</button>
  )

  return (
    <div className="flex flex-col h-full gap-1">
      <div className="flex flex-wrap gap-1 mb-1 items-center">
        <div className="flex gap-1 mr-3">
          {INTERVALS.map(i => (
            <button
              key={i}
              onClick={() => setInterval(i)}
              className={`px-2 py-0.5 text-xs rounded ${selectedInterval === i ? 'bg-brand text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >{i}</button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          {toggleBtn('SMA 20', showSMA, () => setShowSMA(v => !v), '#f59e0b')}
          {toggleBtn('EMA 9', showEMA, () => setShowEMA(v => !v), '#8b5cf6')}
          {toggleBtn('BB', showBB, () => setShowBB(v => !v), '#3b82f6')}
          {toggleBtn('RSI', showRSI, () => setShowRSI(v => !v), '#06b6d4')}
          {toggleBtn('MACD', showMACD, () => setShowMACD(v => !v), '#f97316')}
        </div>
      </div>
      <div ref={mainRef} style={{ minHeight: 320 }} />
      {showRSI && (
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 pl-1 -mb-1">RSI (14)</p>
          <div ref={rsiRef} style={{ minHeight: 110 }} />
        </div>
      )}
      {showMACD && (
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 pl-1 -mb-1">MACD (12, 26, 9)</p>
          <div ref={macdRef} style={{ minHeight: 90 }} />
        </div>
      )}
    </div>
  )
}
