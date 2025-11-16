import { useRef, useState } from 'react'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
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
  viewportRef?: React.RefObject<{ scale: number; x: number; y: number }>
  isEditable?: boolean
}

export const WhiteboardArrow = ({ item, onUpdate, onDelete, viewportRef, isEditable = true }: Props) => {
  const [isHovered, setIsHovered] = useState(false)
  const nodeRef = useRef<HTMLDivElement | null>(null)
  
  const scale = viewportRef?.current?.scale || 1
  
  // Suportar novo formato (metadata) e formato antigo (points)
  const startX = item.metadata?.startX ?? item.position.x
  const startY = item.metadata?.startY ?? item.position.y
  const endX = item.metadata?.endX ?? (item.points?.[1]?.x ?? item.position.x + 150)
  const endY = item.metadata?.endY ?? (item.points?.[1]?.y ?? item.position.y)
  
  const style = item.metadata?.style || 'straight'

  // Calcular bounding box
  const minX = Math.min(startX, endX)
  const minY = Math.min(startY, endY)
  const maxX = Math.max(startX, endX)
  const maxY = Math.max(startY, endY)
  const width = maxX - minX + 20
  const height = maxY - minY + 20

  // Coordenadas relativas ao bounding box
  const relStartX = startX - minX + 10
  const relStartY = startY - minY + 10
  const relEndX = endX - minX + 10
  const relEndY = endY - minY + 10

  // Calcular ângulo para a ponta da seta
  const angle = Math.atan2(endY - startY, endX - startX)
  const arrowSize = 12

  // Pontos da ponta da seta
  const arrowPoint1X = relEndX - arrowSize * Math.cos(angle - Math.PI / 6)
  const arrowPoint1Y = relEndY - arrowSize * Math.sin(angle - Math.PI / 6)
  const arrowPoint2X = relEndX - arrowSize * Math.cos(angle + Math.PI / 6)
  const arrowPoint2Y = relEndY - arrowSize * Math.sin(angle + Math.PI / 6)

  const colorClass = shapeColors[item.shapeColor || 'blue']

  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    e.stopPropagation()
    const deltaX = data.x / scale - minX
    const deltaY = data.y / scale - minY
    
    onUpdate(item.id, {
      position: { x: data.x / scale, y: data.y / scale },
      metadata: {
        ...item.metadata,
        startX: startX + deltaX,
        startY: startY + deltaY,
        endX: endX + deltaX,
        endY: endY + deltaY
      }
    })
  }

  // Renderizar baseado no estilo
  const renderArrowPath = () => {
    switch (style) {
      case 'straight':
        return (
          <>
            <line
              x1={relStartX}
              y1={relStartY}
              x2={relEndX}
              y2={relEndY}
              className={cn('transition-all', colorClass)}
              strokeWidth={2}
              style={{ vectorEffect: 'non-scaling-stroke' }}
            />
            <polygon
              points={`${relEndX},${relEndY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
              className={cn('transition-all', colorClass)}
              fill="currentColor"
            />
          </>
        )

      case 'double':
        const reverseAngle = angle + Math.PI
        const arrow2Point1X = relStartX - arrowSize * Math.cos(reverseAngle - Math.PI / 6)
        const arrow2Point1Y = relStartY - arrowSize * Math.sin(reverseAngle - Math.PI / 6)
        const arrow2Point2X = relStartX - arrowSize * Math.cos(reverseAngle + Math.PI / 6)
        const arrow2Point2Y = relStartY - arrowSize * Math.sin(reverseAngle + Math.PI / 6)
        
        return (
          <>
            <line
              x1={relStartX}
              y1={relStartY}
              x2={relEndX}
              y2={relEndY}
              className={cn('transition-all', colorClass)}
              strokeWidth={2}
              style={{ vectorEffect: 'non-scaling-stroke' }}
            />
            <polygon
              points={`${relEndX},${relEndY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
              className={cn('transition-all', colorClass)}
              fill="currentColor"
            />
            <polygon
              points={`${relStartX},${relStartY} ${arrow2Point1X},${arrow2Point1Y} ${arrow2Point2X},${arrow2Point2Y}`}
              className={cn('transition-all', colorClass)}
              fill="currentColor"
            />
          </>
        )

      case 'curved':
        const midX = (relStartX + relEndX) / 2
        const midY = (relStartY + relEndY) / 2
        const perpX = -(relEndY - relStartY) / 4
        const perpY = (relEndX - relStartX) / 4
        const ctrlX = midX + perpX
        const ctrlY = midY + perpY
        
        return (
          <>
            <path
              d={`M ${relStartX} ${relStartY} Q ${ctrlX} ${ctrlY} ${relEndX} ${relEndY}`}
              className={cn('transition-all', colorClass)}
              strokeWidth={2}
              fill="none"
              style={{ vectorEffect: 'non-scaling-stroke' }}
            />
            <polygon
              points={`${relEndX},${relEndY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
              className={cn('transition-all', colorClass)}
              fill="currentColor"
            />
          </>
        )

      case 'dashed':
        return (
          <>
            <line
              x1={relStartX}
              y1={relStartY}
              x2={relEndX}
              y2={relEndY}
              className={cn('transition-all', colorClass)}
              strokeWidth={2}
              strokeDasharray="5,5"
              style={{ vectorEffect: 'non-scaling-stroke' }}
            />
            <polygon
              points={`${relEndX},${relEndY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
              className={cn('transition-all', colorClass)}
              fill="currentColor"
            />
          </>
        )

      case 'thick':
        return (
          <>
            <line
              x1={relStartX}
              y1={relStartY}
              x2={relEndX}
              y2={relEndY}
              className={cn('transition-all', colorClass)}
              strokeWidth={4}
              style={{ vectorEffect: 'non-scaling-stroke' }}
            />
            <polygon
              points={`${relEndX},${relEndY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
              className={cn('transition-all', colorClass)}
              fill="currentColor"
            />
          </>
        )

      default:
        return null
    }
  }

  return (
    <Draggable
      position={{ x: minX * scale, y: minY * scale }}
      onStop={handleDragStop}
      onDrag={(e) => e.stopPropagation()}
      scale={scale}
      disabled={!isEditable}
      nodeRef={nodeRef}
    >
      <div
        ref={nodeRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="absolute cursor-move"
        style={{
          width: width,
          height: height,
          transformOrigin: 'top left'
        }}
      >
        <svg
          width={width}
          height={height}
          style={{ overflow: 'visible' }}
        >
          {renderArrowPath()}
        </svg>

        {/* Botão delete */}
        {isHovered && isEditable && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(item.id)
            }}
            className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 
                       rounded-full text-white shadow-lg transition-all z-50
                       hover:scale-110"
            style={{ pointerEvents: 'auto' }}
            aria-label="Deletar seta"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </Draggable>
  )
}
