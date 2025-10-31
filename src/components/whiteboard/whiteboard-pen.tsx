import Draggable from 'react-draggable'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { WhiteboardItem } from '@/types/whiteboard'
import { cn } from '@/lib/utils'
import { useRef } from 'react'

const strokeColors = {
  blue: 'stroke-blue-500',
  green: 'stroke-green-500',
  purple: 'stroke-purple-500',
  pink: 'stroke-pink-500',
  orange: 'stroke-orange-500',
  red: 'stroke-red-500',
  yellow: 'stroke-yellow-500',
  cyan: 'stroke-cyan-500',
  gray: 'stroke-gray-500',
}

interface Props {
  item: WhiteboardItem
  onUpdate: (id: string, updates: Partial<WhiteboardItem>) => void
  onDelete: (id: string) => void
  onSelect?: (id: string) => void
  isSelected?: boolean
}

export const WhiteboardPen = ({ item, onUpdate, onDelete, onSelect, isSelected }: Props) => {
  const points = item.points || []
  const strokeWidth = item.strokeWidth ?? 2
  const nodeRef = useRef<HTMLDivElement | null>(null)

  // calcular bbox simples
  const xs = points.map(p => p.x)
  const ys = points.map(p => p.y)
  const minX = Math.min(0, ...xs)
  const minY = Math.min(0, ...ys)
  const maxX = Math.max(0, ...xs)
  const maxY = Math.max(0, ...ys)
  const width = Math.max(20, maxX - minX + 20)
  const height = Math.max(20, maxY - minY + 20)

  const path = points.map(p => `${p.x - minX + 10},${p.y - minY + 10}`).join(' ')

  return (
    <Draggable
      position={item.position}
      onStop={(e, data) => onUpdate(item.id, { position: { x: data.x, y: data.y } })}
      handle=".drag-handle"
      nodeRef={nodeRef}
    >
      <div ref={nodeRef} className="absolute" style={{ width, height }}>
        <svg
          className="drag-handle cursor-move"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          onClick={(e) => {
            e.stopPropagation()
            onSelect?.(item.id)
          }}
        >
          {isSelected && (
            <rect
              x={0}
              y={0}
              width={width}
              height={height}
              className="stroke-primary/60"
              strokeDasharray="4 4"
              fill="transparent"
              strokeWidth={1}
            />
          )}
          <polyline
            points={path}
            className={cn('fill-none transition-all', strokeColors[item.shapeColor || 'blue'])}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <Button 
          size="icon" 
          variant="ghost" 
          className="absolute -top-2 -right-2 h-5 w-5 bg-background hover:bg-destructive/10 hover:text-destructive shadow-sm" 
          onClick={() => onDelete(item.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </Draggable>
  )
}
