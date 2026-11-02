import { useState } from 'react'
import { cn } from '../../lib/utils'

interface Tab { label: string; content: React.ReactNode }

interface TabsProps {
  tabs: Tab[]
  className?: string
}

export default function Tabs({ tabs, className }: TabsProps) {
  const [active, setActive] = useState(0)
  return (
    <div className={cn('', className)}>
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-4">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              active === i
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs[active]?.content}
    </div>
  )
}
