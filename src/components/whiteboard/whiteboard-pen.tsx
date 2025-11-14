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

  // calcular bbox com padding adequado
  const xs = points.map(p => p.x)
  const ys = points.map(p => p.y)
  const minX = Math.min(0, ...xs)
  const minY = Math.min(0, ...ys)
  const maxX = Math.max(0, ...xs)
  const maxY = Math.max(0, ...ys)
  const padding = 15
  const width = Math.max(40, maxX - minX + padding * 2)
  const height = Math.max(40, maxY - minY + padding * 2)

  const path = points.map(p => `${p.x - minX + padding},${p.y - minY + padding}`).join(' ')

  // Se não há pontos suficientes, não renderiza
  if (points.length < 2) return null

  return (
    <Draggable
      position={item.position}
      onStop={(e, data) => onUpdate(item.id, { position: { x: data.x, y: data.y } })}
      handle=".drag-handle"
      nodeRef={nodeRef}
    >
      <div ref={nodeRef} className="absolute group" style={{ width, height }}>
        <svg
          className="drag-handle cursor-move hover:bg-primary/5 rounded transition-colors"
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
              x={2}
              y={2}
              width={width - 4}
              height={height - 4}
              className="stroke-primary/60"
              strokeDasharray="4 4"
              fill="transparent"
              strokeWidth={1}
              rx={4}
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
        
        {/* Botão X posicionado corretamente no canto superior direito */}
        <div className="absolute -top-2 -right-2 z-10">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-6 w-6 rounded-full bg-destructive/90 hover:bg-destructive text-white shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 md:h-7 md:w-7" 
            onClick={(e) => {
              e.stopPropagation()
              onDelete(item.id)
            }}
            aria-label="Excluir desenho"
          >
            <X className="h-3 w-3 md:h-3.5 md:w-3.5" />
          </Button>
        </div>
      </div>
    </Draggable>
  )
}
