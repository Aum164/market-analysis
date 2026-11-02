const BASE = '/api'

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const r = await fetch(`${BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export const api = {
  quote: (symbol: string) => req<import('../types').Quote>(`/market/quote/${symbol}`),
  ohlc: (symbol: string, interval: string, from: number, to: number) =>
    req<import('../types').OHLCV[]>(`/market/ohlc/${symbol}?interval=${interval}&from=${from}&to=${to}`),
  indicator: (symbol: string, type: string, period: number) =>
    req<import('../types').Indicator>(`/market/indicator/${symbol}?type=${type}&period=${period}`),
  predict: (symbol: string) => req<import('../types').SentimentResult>(`/predict/${symbol}`),
  strategies: () => req<import('../types').Strategy[]>('/strategy/'),
  createStrategy: (data: unknown) => req<import('../types').Strategy>('/strategy/', { method: 'POST', body: JSON.stringify(data) }),
  runBacktest: (data: unknown) => req<import('../types').BacktestResult>('/backtest/run', { method: 'POST', body: JSON.stringify(data) }),
  orders: () => req<import('../types').Order[]>('/broker/orders'),
  placeOrder: (data: unknown) => req<import('../types').Order>('/broker/order', { method: 'POST', body: JSON.stringify(data) }),
}
