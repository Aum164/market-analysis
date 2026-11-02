import StrategyBuilder from '../components/strategy/StrategyBuilder'
import Backtester from '../components/strategy/Backtester'

export default function Strategy() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Strategy Builder</h1>
        <StrategyBuilder />
      </div>
      <div>
        <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Backtester</h1>
        <Backtester />
      </div>
    </div>
  )
}
