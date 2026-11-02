import { cn } from '../../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
}

export default function Card({ children, className, title }: CardProps) {
  return (
    <div className={cn('bg-white dark:bg-gray-900 rounded-lg border p-4', className)}>
      {title && <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">{title}</h3>}
      {children}
    </div>
  )
}
