import Draggable from 'react-draggable'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
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
      <div ref={nodeRef} className="absolute cursor-move" style={{ width: radius * 2, height: radius * 2 }}>
        <div 
          className={cn(
            "drag-handle rounded-full border-2 relative transition-all hover:scale-105",
            shapeColors[item.shapeColor || 'blue']
          )}
          style={{ width: radius * 2, height: radius * 2 }}
        >
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute -top-2 -right-2 h-5 w-5 bg-background hover:bg-destructive/10 hover:text-destructive shadow-sm" 
            onClick={() => onDelete(item.id)}
          >
            <X className="h-3 w-3" />
          </Button>

          {/* Resize handle */}
          <div
            onPointerDown={onResizeStart}
            className="absolute -bottom-1 -right-1 h-3 w-3 bg-primary rounded-sm cursor-se-resize shadow ring-2 ring-background"
            title="Redimensionar"
          />
        </div>
      </div>
    </Draggable>
  )
}
