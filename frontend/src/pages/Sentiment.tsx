import SentimentPanel from '../components/sentiment/SentimentPanel'

export default function Sentiment() {
  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">AI Market Signals</h1>
      <SentimentPanel />
    </div>
  )
}
