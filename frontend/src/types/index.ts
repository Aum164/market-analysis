export interface Quote {
  symbol: string
  ltp: number
  open: number
  high: number
  low: number
  close: number
  change: number
  change_pct: number
  volume: number
  timestamp: string
}

export interface OHLCV {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Indicator {
  type: string
  values: Array<{ time: number; value: number }>
}

export interface SentimentResult {
  symbol: string
  direction: 'up' | 'down' | 'sideways'
  confidence: number
  rationale: string
  features: Record<string, number | string>
  timestamp: string
}

export interface Strategy {
  id: string
  name: string
  type: 'visual' | 'code'
  rules: unknown
  created_at: string
}

export interface BacktestResult {
  strategy_id: string
  symbol: string
  metrics: {
    total_return: number
    cagr: number
    sharpe: number
    max_drawdown: number
    win_rate: number
    num_trades: number
  }
  equity_curve: Array<{ time: string; value: number }>
}

export interface Order {
  id: string
  symbol: string
  side: 'BUY' | 'SELL'
  quantity: number
  price: number
  status: 'PENDING' | 'OPEN' | 'COMPLETE' | 'REJECTED'
  timestamp: string
}

export type Theme = 'light' | 'dark'
