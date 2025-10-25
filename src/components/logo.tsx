import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
}

const sizeClasses = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-6xl',
}

const iconSizes = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
}

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  if (!showText) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white',
          iconSizes[size],
          className
        )}
      >
        <span className={cn('font-bold', size === 'sm' ? 'text-xs' : 'text-sm')}>IS</span>
      </div>
    )
  }

  return (
    <h1
      className={cn(
        'font-bold gradient-logo',
        sizeClasses[size],
        className
      )}
    >
      ISACAR
    </h1>
  )
}
