import Draggable from 'react-draggable'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { WhiteboardItem } from '@/types/whiteboard'
import { useRef } from 'react'

interface Props {
  item: WhiteboardItem
  onUpdate: (id: string, updates: Partial<WhiteboardItem>) => void
  onDelete: (id: string) => void
}

export const WhiteboardBox = ({ item, onUpdate, onDelete }: Props) => {
  const resizingRef = useRef(false)
  const startRef = useRef<{x:number;y:number;width:number;height:number}>()
  const nodeRef = useRef<HTMLDivElement | null>(null)

  const onResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.preventDefault()
    resizingRef.current = true
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: item.width || 200,
      height: item.height || 150,
    }
    window.addEventListener('pointermove', onResizing)
    window.addEventListener('pointerup', onResizeEnd, { once: true })
    window.addEventListener('pointercancel', onResizeEnd, { once: true })
  }

  const onResizing = (e: PointerEvent) => {
    if (!resizingRef.current || !startRef.current) return
    e.preventDefault()
    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y
    const nextWidth = Math.max(40, startRef.current.width + dx)
    const nextHeight = Math.max(30, startRef.current.height + dy)
    onUpdate(item.id, { width: nextWidth, height: nextHeight })
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
      <div ref={nodeRef} className="absolute cursor-move">
        <div 
          className="drag-handle border-2 border-dashed border-primary/50 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors relative"
          style={{ width: item.width || 200, height: item.height || 150 }}
        >
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute top-1 right-1 h-5 w-5 hover:bg-destructive/10 hover:text-destructive" 
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
