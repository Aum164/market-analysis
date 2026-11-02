import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'up' | 'down' | 'sideways'
  className?: string
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
      variant === 'default' && 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      variant === 'up' && 'bg-green-100 dark:bg-green-900/30 text-up',
      variant === 'down' && 'bg-red-100 dark:bg-red-900/30 text-down',
      variant === 'sideways' && 'bg-amber-100 dark:bg-amber-900/30 text-sideways',
      className
    )}>
      {children}
    </span>
  )
}
