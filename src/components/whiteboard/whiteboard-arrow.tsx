import { useRef, useState } from 'react'
import Draggable from 'react-draggable'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { WhiteboardItem } from '@/types/whiteboard'
import { cn } from '@/lib/utils'

const shapeColors = {
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
}

export const WhiteboardArrow = ({ item, onUpdate, onDelete }: Props) => {
  const [isDragging, setIsDragging] = useState(false)
  const nodeRef = useRef<HTMLDivElement | null>(null)
  
  // Pontos padrão: start e end
  const startPoint = item.points?.[0] || { x: 0, y: 0 }
  const endPoint = item.points?.[1] || { x: 150, y: 0 }
  
  const width = Math.abs(endPoint.x - startPoint.x) + 20
  const height = Math.abs(endPoint.y - startPoint.y) + 20
  
  // Calcular ângulo para a ponta da seta
  const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x) * (180 / Math.PI)

  const strokeWidth = item.strokeWidth ?? 2
  const colorClass = shapeColors[item.shapeColor || 'orange']
  const arrowStyle = item.arrowStyle || 'triangle'

  return (
    <Draggable
      position={item.position}
      onStart={() => setIsDragging(true)}
      onStop={(e, data) => {
        setIsDragging(false)
        onUpdate(item.id, { position: { x: data.x, y: data.y } })
      }}
      handle=".drag-handle"
      nodeRef={nodeRef}
    >
      <div ref={nodeRef} className="absolute" style={{ width, height }}>
        <svg 
          className="drag-handle cursor-move" 
          width={width} 
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          {/* Linha da seta */}
          <line
            x1={10}
            y1={10}
            x2={width - 10}
            y2={height - 10}
            className={cn("transition-all", colorClass)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Ponta da seta baseada em arrowStyle */}
          {arrowStyle === 'triangle' && (
            <polygon
              points={`${width - 10},${height - 10} ${width - 10 - 10},${height - 10 - 5} ${width - 10 - 10},${height - 10 + 5}`}
              className={cn('transition-all', colorClass)}
              fill="currentColor"
              transform={`rotate(${angle} ${width - 10} ${height - 10})`}
            />
          )}
          {arrowStyle === 'bar' && (
            <line
              x1={width - 10}
              y1={height - 10 - 8}
              x2={width - 10}
              y2={height - 10 + 8}
              className={cn('transition-all', colorClass)}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              transform={`rotate(${angle} ${width - 10} ${height - 10})`}
            />
          )}
          {arrowStyle === 'diamond' && (
            <polygon
              points={`${width - 10},${height - 10} ${width - 10 - 8},${height - 10 - 8} ${width - 10 - 16},${height - 10} ${width - 10 - 8},${height - 10 + 8}`}
              className={cn('transition-all', colorClass)}
              fill="currentColor"
              transform={`rotate(${angle} ${width - 10} ${height - 10})`}
            />
          )}
          {arrowStyle === 'line' && null}
        </svg>
        
        {!isDragging && (
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute -top-2 -right-2 h-5 w-5 bg-background hover:bg-destructive/10 hover:text-destructive shadow-sm z-10" 
            onClick={() => onDelete(item.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Draggable>
  )
}
