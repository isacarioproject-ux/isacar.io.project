import Draggable from 'react-draggable'
import { Button } from '@/components/ui/button'
import { X, Maximize2 } from 'lucide-react'
import { WhiteboardItem } from '@/types/whiteboard'
import { cn } from '@/lib/utils'
import { useRef } from 'react'

const shapeColors = {
  blue: 'border-blue-500 bg-blue-500/20',
  green: 'border-green-500 bg-green-500/20',
  purple: 'border-purple-500 bg-purple-500/20',
  pink: 'border-pink-500 bg-pink-500/20',
  orange: 'border-orange-500 bg-orange-500/20',
  red: 'border-red-500 bg-red-500/20',
  yellow: 'border-yellow-500 bg-yellow-500/20',
  cyan: 'border-cyan-500 bg-cyan-500/20',
  gray: 'border-gray-500 bg-gray-500/20',
}

interface Props {
  item: WhiteboardItem
  onUpdate: (id: string, updates: Partial<WhiteboardItem>) => void
  onDelete: (id: string) => void
}

export const WhiteboardCircle = ({ item, onUpdate, onDelete }: Props) => {
  const radius = item.radius || 50

  const resizingRef = useRef(false)
  const startRef = useRef<{x:number;y:number;r:number}>()
  const nodeRef = useRef<HTMLDivElement | null>(null)

  const onResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.preventDefault()
    resizingRef.current = true
    startRef.current = { x: e.clientX, y: e.clientY, r: radius }
    window.addEventListener('pointermove', onResizing)
    window.addEventListener('pointerup', onResizeEnd, { once: true })
    window.addEventListener('pointercancel', onResizeEnd, { once: true })
  }

  const onResizing = (e: PointerEvent) => {
    if (!resizingRef.current || !startRef.current) return
    e.preventDefault()
    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y
    const delta = Math.max(dx, dy)
    const nextR = Math.max(10, startRef.current.r + delta)
    onUpdate(item.id, { radius: nextR })
  }

  const onResizeEnd = () => {
    resizingRef.current = false
    window.removeEventListener('pointermove', onResizing)
  }

  return (
    <Draggable
      position={item.position}
      onStop={(e, data) => onUpdate(item.id, { position: { x: data.x, y: data.y } })}
      handle=".drag-handle"
      nodeRef={nodeRef}
    >
      <div ref={nodeRef} className="absolute cursor-move group">
        <div 
          className={cn(
            "drag-handle border-2 rounded-full transition-all duration-200 relative",
            shapeColors[item.shapeColor || 'blue']
          )}
          style={{ width: radius * 2, height: radius * 2 }}
        >
          {/* Botão X - superior esquerdo */}
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute -top-2 -left-2 h-6 w-6 md:h-7 md:w-7 rounded-full bg-destructive/90 hover:bg-destructive text-white shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200" 
            onClick={(e) => {
              e.stopPropagation()
              onDelete(item.id)
            }}
          >
            <X className="h-3 w-3 md:h-3.5 md:w-3.5" />
          </Button>

          {/* Resize handle - inferior direito */}
          <div
            onPointerDown={onResizeStart}
            className="absolute -bottom-2 -right-2 h-6 w-6 md:h-7 md:w-7 rounded-full bg-primary/90 hover:bg-primary text-white shadow-md cursor-se-resize opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center"
          >
            <Maximize2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
          </div>
        </div>
      </div>
    </Draggable>
  )
}
