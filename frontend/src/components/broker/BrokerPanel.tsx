import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAppStore } from '../../store'
import Disclaimer from '../sentiment/Disclaimer'

export default function BrokerPanel() {
  const { selectedSymbol } = useAppStore()
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY')
  const [qty, setQty] = useState('1')
  const [price, setPrice] = useState('')
  const [mode, setMode] = useState<'paper' | 'live'>('paper')
  const { data: orders } = useQuery({ queryKey: ['orders'], queryFn: api.orders, refetchInterval: 5000 })
  const mutation = useMutation({
    mutationFn: () => api.placeOrder({ symbol: selectedSymbol, side, quantity: +qty, price: +price, mode }),
  })
  return (
    <div className="space-y-4">
      <Disclaimer />
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Order Placement</h2>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded p-0.5">
            {(['paper', 'live'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-3 py-1 text-xs rounded capitalize ${mode === m ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                {m === 'paper' ? '📄 Paper' : '🔴 Live'}
              </button>
            ))}
          </div>
        </div>
        {mode === 'live' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded p-2 text-xs text-red-800 dark:text-red-200">
            ⚠️ LIVE MODE: Real orders will be placed. Ensure broker OAuth session is active and static IP is whitelisted per SEBI requirements.
          </div>
        )}
        <div className="flex gap-2">
          {(['BUY', 'SELL'] as const).map(s => (
            <button key={s} onClick={() => setSide(s)}
              className={`flex-1 py-2 text-sm font-medium rounded ${side === s ? (s === 'BUY' ? 'bg-up text-white' : 'bg-down text-white') : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
            >{s}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-gray-500 dark:text-gray-400">Symbol</label>
            <input value={selectedSymbol} readOnly className="w-full bg-gray-50 dark:bg-gray-800 border rounded px-2 py-1 text-sm text-gray-900 dark:text-gray-100" /></div>
          <div><label className="text-xs text-gray-500 dark:text-gray-400">Quantity</label>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border rounded px-2 py-1 text-sm text-gray-900 dark:text-gray-100" /></div>
          <div className="col-span-2"><label className="text-xs text-gray-500 dark:text-gray-400">Price (0 = market)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border rounded px-2 py-1 text-sm text-gray-900 dark:text-gray-100" placeholder="0" /></div>
        </div>
        <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
          className={`w-full py-2 text-sm font-medium rounded text-white ${side === 'BUY' ? 'bg-up hover:bg-green-600' : 'bg-down hover:bg-red-600'} disabled:opacity-50`}>
          {mutation.isPending ? 'Placing...' : `Place ${side} Order`}
        </button>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
        <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">Recent Orders</h3>
        {!orders?.length ? <p className="text-xs text-gray-400 text-center py-4">No orders yet</p> : (
          <div className="space-y-2">
            {orders.slice(0, 10).map(o => (
              <div key={o.id} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-800 rounded p-2">
                <span className={o.side === 'BUY' ? 'text-up font-medium' : 'text-down font-medium'}>{o.side}</span>
                <span className="text-gray-700 dark:text-gray-300">{o.symbol}</span>
                <span className="text-gray-700 dark:text-gray-300">×{o.quantity}</span>
                <span className="text-gray-700 dark:text-gray-300">₹{o.price}</span>
                <span className={`px-1.5 py-0.5 rounded text-xs ${o.status === 'COMPLETE' ? 'bg-green-100 dark:bg-green-900/30 text-up' : o.status === 'REJECTED' ? 'bg-red-100 dark:bg-red-900/30 text-down' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>{o.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
