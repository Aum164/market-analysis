import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({ baseURL: BASE })

export const getQuote = (symbol: string) => api.get(`/market/quote/${symbol}`).then(r => r.data)
export const getOHLC = (symbol: string, interval = '5m', periods = 200) =>
  api.get(`/market/ohlc/${symbol}`, { params: { interval, periods } }).then(r => r.data)
export const getIndicator = (symbol: string, type: string, period = 14) =>
  api.get(`/market/indicator/${symbol}`, { params: { type, period } }).then(r => r.data)
export const getPredict = (symbol: string) => api.get(`/predict/${symbol}`).then(r => r.data)
export const getPositions = () => api.get('/broker/positions').then(r => r.data)
export const getSymbols = () => api.get('/market/symbols').then(r => r.data)
export const runBacktest = (body: object) => api.post('/backtest/run', body).then(r => r.data)
export const placeOrder = (body: object) => api.post('/broker/order', body).then(r => r.data)
