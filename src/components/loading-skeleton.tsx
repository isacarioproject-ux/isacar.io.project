import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const CardSkeleton = () => (
  <Card className="w-full h-[500px] min-h-[360px] flex flex-col">
    <CardHeader className="pb-3 px-4 py-3 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-7 w-7 rounded" />
          <Skeleton className="h-7 w-7 rounded" />
          <Skeleton className="h-7 w-7 rounded" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="flex-1 p-4 space-y-3">
      {/* Linha de tabs/filtros */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
      
      {/* Conteúdo principal */}
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </CardContent>
  </Card>
)

export const StatsSkeleton = () => (
  <Card>
    <CardHeader className="pb-2">
      <Skeleton className="h-3 w-24" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20 mt-1" />
    </CardContent>
  </Card>
)

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-3">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className="h-10 flex-1" />
        ))}
      </div>
    ))}
  </div>
)
