import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  collapsed?: boolean
}

export function Logo({ className, collapsed = false }: LogoProps) {
  if (collapsed) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <span className="text-lg font-bold text-primary">I</span>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center transition-all', className)}>
      <span className="text-lg font-semibold tracking-tight">ISACAR</span>
    </div>
  )
}
