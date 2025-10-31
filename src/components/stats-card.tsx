import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: 'up' | 'down'
  trendValue?: string
  className?: string
}

export const StatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  className,
}: StatsCardProps) => (
  <Card className={cn('relative overflow-hidden', className)}>
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
    <CardHeader className="relative flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-xs font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent className="relative">
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
      {trend && trendValue && (
        <div
          className={cn(
            'mt-2 flex items-center gap-1 text-xs font-medium',
            trend === 'up'
              ? 'text-green-600 dark:text-green-500'
              : 'text-red-600 dark:text-red-500'
          )}
        >
          {trend === 'up' ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>{trendValue}</span>
          <span className="text-muted-foreground">vs último período</span>
        </div>
      )}
    </CardContent>
  </Card>
)
