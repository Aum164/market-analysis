import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Shield, AlertTriangle } from 'lucide-react'
import { getPositions, placeOrder } from '../api'

const BROKERS = [
  { id: 'zerodha', name: 'Zerodha Kite', cost: 'Rs.2000/mo' },
  { id: 'upstox', name: 'Upstox', cost: 'Free tier' },
  { id: 'angel', name: 'Angel One SmartAPI', cost: 'Free' },
  { id: 'fyers', name: 'Fyers API', cost: 'Free' },
]

const DISCLAIMER = `SEBI ALGO TRADING COMPLIANCE (Mandatory since April 1, 2026): All automated orders must use OAuth + 2FA authentication. Orders must originate from a whitelisted static IP. Every order must carry the broker-issued Algo-ID. For personal use only — selling this service to third parties requires a Research Analyst license. The user is solely responsible for SEBI compliance. This platform operates in PAPER TRADING mode by default.`

interface Position {
  symbol: string
  type: string
  qty: number
  avg_price: number
  ltp: number
  pnl: number
}

interface PositionsData {
  positions: Position[]
  total_pnl: number
}

export default function BrokerPage() {
  const [mode, setMode] = useState<'paper' | 'live'>('paper')
  const [autoTrading, setAutoTrading] = useState(false)
  const [maxLoss, setMaxLoss] = useState(5000)
  const [orderForm, setOrderForm] = useState({ symbol: 'NIFTY50', qty: 50, order_type: 'MARKET', side: 'BUY' })

  const { data: positions } = useQuery<PositionsData>({
    queryKey: ['positions'],
    queryFn: getPositions,
    refetchInterval: 5000,
  })

  const orderMutation = useMutation({
    mutationFn: placeOrder,
  })

  return (
    <div className="space-y-6">
      <div className="bg-red-50 dark:bg-red-950 border-2 border-red-300 dark:border-red-700 rounded-xl p-4">
        <div className="flex gap-2">
          <AlertTriangle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-red-800 dark:text-red-200 leading-relaxed">{DISCLAIMER}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="text-blue-600" size={22} />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Broker Integration</h1>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['paper', 'live'] as const).map(m => (
            <button
              key={m}
              onClick={() => {
                if (m === 'live') {
                  alert('Live trading requires a connected broker API and SEBI compliance verification.')
                } else {
                  setMode(m)
                }
              }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                mode === m ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {m === 'paper' ? 'Paper' : 'Live'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Broker APIs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BROKERS.map(b => (
            <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{b.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{b.cost}</div>
              </div>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Risk Controls</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Auto-Trading</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Enable automated order placement from strategies</div>
            </div>
            <button
              onClick={() => setAutoTrading(!autoTrading)}
              className={`w-12 h-6 rounded-full transition-colors relative ${autoTrading ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${autoTrading ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white block mb-1">
              Daily Max Loss Kill Switch: Rs.{maxLoss.toLocaleString('en-IN')}
            </label>
            <input
              type="range"
              min={1000}
              max={50000}
              step={500}
              value={maxLoss}
              onChange={e => setMaxLoss(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Rs.1,000</span><span>Rs.50,000</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Order ({mode === 'paper' ? 'Paper' : 'LIVE'})</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Symbol</label>
            <input
              type="text"
              value={orderForm.symbol}
              onChange={e => setOrderForm(p => ({ ...p, symbol: e.target.value }))}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Qty</label>
            <input
              type="number"
              value={orderForm.qty}
              onChange={e => setOrderForm(p => ({ ...p, qty: Number(e.target.value) }))}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Side</label>
            <select
              value={orderForm.side}
              onChange={e => setOrderForm(p => ({ ...p, side: e.target.value }))}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white w-full"
            >
              <option>BUY</option><option>SELL</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Type</label>
            <select
              value={orderForm.order_type}
              onChange={e => setOrderForm(p => ({ ...p, order_type: e.target.value }))}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white w-full"
            >
              <option>MARKET</option><option>LIMIT</option><option>SL</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => orderMutation.mutate({ ...orderForm, mode })}
          className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${
            orderForm.side === 'BUY' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {orderForm.side} {orderForm.qty} {orderForm.symbol}
        </button>
        {orderMutation.data && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              Order {(orderMutation.data as { order_id: string; message: string }).order_id} — {(orderMutation.data as { order_id: string; message: string }).message}
            </p>
          </div>
        )}
      </div>

      {positions && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Open Positions</h2>
            <span className={`text-sm font-bold ${positions.total_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              P&L: Rs.{positions.total_pnl.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left pb-2">Symbol</th>
                  <th className="text-right pb-2">Qty</th>
                  <th className="text-right pb-2">Avg</th>
                  <th className="text-right pb-2">LTP</th>
                  <th className="text-right pb-2">P&L</th>
                </tr>
              </thead>
              <tbody>
                {positions.positions.map((p) => (
                  <tr key={p.symbol} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 font-medium text-gray-900 dark:text-white">{p.symbol}</td>
                    <td className="text-right text-gray-700 dark:text-gray-300">{p.qty}</td>
                    <td className="text-right text-gray-700 dark:text-gray-300">Rs.{p.avg_price}</td>
                    <td className="text-right text-gray-700 dark:text-gray-300">Rs.{p.ltp}</td>
                    <td className={`text-right font-medium ${p.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>Rs.{p.pnl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
