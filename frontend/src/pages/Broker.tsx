import BrokerPanel from '../components/broker/BrokerPanel'

export default function Broker() {
  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Broker & Orders</h1>
      <BrokerPanel />
    </div>
  )
}
