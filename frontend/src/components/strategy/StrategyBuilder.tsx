import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'

const INDICATORS_LIST = ['RSI', 'MACD', 'EMA', 'SMA', 'BB_UPPER', 'BB_LOWER', 'VWAP', 'ATR']
const CONDITIONS = ['<', '>', '<=', '>=', '==', 'crosses_above', 'crosses_below']
const ACTIONS = ['BUY', 'SELL', 'EXIT']

interface Rule { indicator: string; condition: string; value: string; action: string }

export default function StrategyBuilder() {
  const [name, setName] = useState('My Strategy')
  const [rules, setRules] = useState<Rule[]>([{ indicator: 'RSI', condition: '<', value: '30', action: 'BUY' }])
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationFn: (data: unknown) => api.createStrategy(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['strategies'] }); alert('Strategy saved!') }
  })
  const addRule = () => setRules(r => [...r, { indicator: 'RSI', condition: '<', value: '50', action: 'BUY' }])
  const removeRule = (i: number) => setRules(r => r.filter((_, j) => j !== i))
  const updateRule = (i: number, key: keyof Rule, val: string) =>
    setRules(r => r.map((rule, j) => j === i ? { ...rule, [key]: val } : rule))
  const save = () => mutation.mutate({ name, type: 'visual', rules })
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Visual Strategy Builder</h2>
      <input value={name} onChange={e => setName(e.target.value)}
        className="w-full bg-gray-50 dark:bg-gray-800 border rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100" placeholder="Strategy name" />
      <div className="space-y-2">
        {rules.map((rule, i) => (
          <div key={i} className="flex gap-2 items-center bg-gray-50 dark:bg-gray-800 rounded p-2">
            <span className="text-xs text-gray-500 w-4">{i + 1}</span>
            <span className="text-xs text-gray-400">IF</span>
            <select value={rule.indicator} onChange={e => updateRule(i, 'indicator', e.target.value)}
              className="text-xs bg-white dark:bg-gray-700 border rounded px-1 py-0.5 text-gray-900 dark:text-gray-100">
              {INDICATORS_LIST.map(v => <option key={v}>{v}</option>)}
            </select>
            <select value={rule.condition} onChange={e => updateRule(i, 'condition', e.target.value)}
              className="text-xs bg-white dark:bg-gray-700 border rounded px-1 py-0.5 text-gray-900 dark:text-gray-100">
              {CONDITIONS.map(v => <option key={v}>{v}</option>)}
            </select>
            <input value={rule.value} onChange={e => updateRule(i, 'value', e.target.value)}
              className="text-xs bg-white dark:bg-gray-700 border rounded px-1 py-0.5 w-16 text-gray-900 dark:text-gray-100" />
            <span className="text-xs text-gray-400">THEN</span>
            <select value={rule.action} onChange={e => updateRule(i, 'action', e.target.value)}
              className="text-xs bg-white dark:bg-gray-700 border rounded px-1 py-0.5 text-gray-900 dark:text-gray-100">
              {ACTIONS.map(v => <option key={v}>{v}</option>)}
            </select>
            <button onClick={() => removeRule(i)} className="text-down text-xs ml-auto">✕</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={addRule} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">+ Add Rule</button>
        <button onClick={save} disabled={mutation.isPending} className="text-xs bg-brand text-white px-3 py-1 rounded hover:bg-sky-600 disabled:opacity-50">
          {mutation.isPending ? 'Saving...' : 'Save Strategy'}
        </button>
      </div>
    </div>
  )
}
