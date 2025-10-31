import React from 'react'
import { cn } from '@/lib/utils'

interface QuantumPulseLoaderProps {
  className?: string
  label?: string
}

export function QuantumPulseLoader({ className, label }: QuantumPulseLoaderProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
        <div className="absolute inset-2 animate-pulse rounded-full bg-primary/50" />
        <div className="absolute inset-4 rounded-full bg-primary" />
      </div>
      {label ? (
        <p className="text-sm text-muted-foreground">{label}</p>
      ) : null}
    </div>
  )
}

export default QuantumPulseLoader
