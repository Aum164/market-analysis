import { useState } from 'react'
import { Plus, Trash2, ChevronRight } from 'lucide-react'

interface Condition {
  indicator: string
  operator: string
  value: string
  id: number
}

interface Strategy {
  name: string
  conditions: Condition[]
  action: string
}

const INDICATORS = ['RSI(14)', 'EMA(20)', 'SMA(50)', 'MACD', 'VWAP', 'Price', 'Volume', 'ATR(14)', 'Supertrend']
const OPERATORS = ['>', '<', '>=', '<=', '==', 'crosses above', 'crosses below']
const ACTIONS = ['BUY', 'SELL', 'BUY_CALL', 'BUY_PUT', 'SQUARE_OFF']

let nextId = 1

export default function StrategyPage() {
  const [mode, setMode] = useState<'visual' | 'code'>('visual')
  const [strategy, setStrategy] = useState<Strategy>({
    name: 'My Strategy',
    conditions: [
      { indicator: 'RSI(14)', operator: '<', value: '30', id: nextId++ },
      { indicator: 'Price', operator: '>', value: 'VWAP', id: nextId++ },
    ],
    action: 'BUY'
  })
  const [codeText, setCodeText] = useState(`class MyStrategy:
    def on_bar(self, data):
        rsi = data.indicator('RSI', 14)
        vwap = data.indicator('VWAP')

        if rsi < 30 and data.close > vwap:
            self.buy(qty=50, sl=data.close * 0.995)

        if rsi > 70:
            self.sell_all()
`)

  const addCondition = () => {
    setStrategy(s => ({
      ...s,
      conditions: [...s.conditions, { indicator: 'RSI(14)', operator: '<', value: '50', id: nextId++ }]
    }))
  }

  const removeCondition = (id: number) => {
    setStrategy(s => ({ ...s, conditions: s.conditions.filter(c => c.id !== id) }))
  }

  const updateCondition = (id: number, field: keyof Condition, value: string) => {
    setStrategy(s => ({
      ...s,
      conditions: s.conditions.map(c => c.id === id ? { ...c, [field]: value } : c)
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Strategy Builder</h1>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['visual', 'code'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                mode === m ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {m === 'visual' ? 'Visual Builder' : 'Python Code'}
            </button>
          ))}
        </div>
      </div>

      {mode === 'visual' ? (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Strategy Name</label>
            <input
              value={strategy.name}
              onChange={e => setStrategy(s => ({ ...s, name: e.target.value }))}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white w-full max-w-xs"
            />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">Entry Conditions</h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">ALL conditions must be true</span>
            </div>
            <div className="space-y-3">
              {strategy.conditions.map((cond, idx) => (
                <div key={cond.id} className="flex items-center gap-2 flex-wrap">
                  {idx > 0 && <span className="text-xs font-bold text-blue-600 dark:text-blue-400 w-8">AND</span>}
                  {idx === 0 && <span className="text-xs font-bold text-gray-500 dark:text-gray-400 w-8">IF</span>}
                  <select
                    value={cond.indicator}
                    onChange={e => updateCondition(cond.id, 'indicator', e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-white"
                  >
                    {INDICATORS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                  <select
                    value={cond.operator}
                    onChange={e => updateCondition(cond.id, 'operator', e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-white"
                  >
                    {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <input
                    value={cond.value}
                    onChange={e => updateCondition(cond.id, 'value', e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-white w-24"
                  />
                  <button onClick={() => removeCondition(cond.id)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addCondition}
              className="mt-3 flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <Plus size={14} /> Add Condition
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Action</h2>
            <div className="flex gap-2 flex-wrap">
              {ACTIONS.map(a => (
                <button
                  key={a}
                  onClick={() => setStrategy(s => ({ ...s, action: a }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    strategy.action === a
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <ChevronRight size={14} className="text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Strategy Preview</span>
            </div>
            <code className="text-xs text-blue-700 dark:text-blue-300 font-mono">
              IF {strategy.conditions.map((c, i) => `${i > 0 ? 'AND ' : ''}${c.indicator} ${c.operator} ${c.value}`).join(' ')} then {strategy.action}
            </code>
          </div>

          <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
            Save & Run Backtest
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3 font-mono">strategy.py</h2>
            <textarea
              value={codeText}
              onChange={e => setCodeText(e.target.value)}
              className="w-full h-72 bg-gray-950 text-green-400 font-mono text-sm p-4 rounded-lg border border-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              spellCheck={false}
            />
          </div>
          <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
            Validate & Save Strategy
          </button>
        </div>
      )}
    </div>
  )
}
