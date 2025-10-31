import Draggable from 'react-draggable'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { WhiteboardItem } from '@/types/whiteboard'
import { cn } from '@/lib/utils'
import { useRef } from 'react'

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

export const WhiteboardLine = ({ item, onUpdate, onDelete }: Props) => {
  const width = item.width || 150
  const height = 4
  const strokeWidth = item.strokeWidth ?? 2

  const resizingRef = useRef(false)
  const startRef = useRef<{x:number;width:number}>()
  const nodeRef = useRef<HTMLDivElement | null>(null)

  const onResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    resizingRef.current = true
    startRef.current = { x: e.clientX, width }
    window.addEventListener('mousemove', onResizing)
    window.addEventListener('mouseup', onResizeEnd, { once: true })
  }

  const onResizing = (e: MouseEvent) => {
    if (!resizingRef.current || !startRef.current) return
    const dx = e.clientX - startRef.current.x
    const nextW = Math.max(20, startRef.current.width + dx)
    onUpdate(item.id, { width: nextW })
  }

  const onResizeEnd = () => {
    resizingRef.current = false
    window.removeEventListener('mousemove', onResizing)
  }

  return (
    <Draggable
      position={item.position}
      onStop={(e, data) => onUpdate(item.id, { position: { x: data.x, y: data.y } })}
      handle=".drag-handle"
      nodeRef={nodeRef}
    >
      <div ref={nodeRef} className="absolute cursor-move" style={{ width, height: 30 }}>
        <svg 
          className="drag-handle" 
          width={width} 
          height={30}
          viewBox={`0 0 ${width} 30`}
        >
          <line
            x1="0"
            y1="15"
            x2={width}
            y2="15"
            className={cn(
              "transition-all hover:stroke-[3]",
              shapeColors[item.shapeColor || 'gray']
            )}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </svg>
        <Button 
          size="icon" 
          variant="ghost" 
          className="absolute -top-1 -right-2 h-5 w-5 bg-background hover:bg-destructive/10 hover:text-destructive shadow-sm" 
          onClick={() => onDelete(item.id)}
        >
          <X className="h-3 w-3" />
        </Button>
        {/* Resize handle */}
        <div
          onMouseDown={onResizeStart}
          className="absolute -bottom-1 -right-1 h-3 w-3 bg-primary rounded-sm cursor-e-resize shadow ring-2 ring-background"
          title="Redimensionar"
        />
      </div>
    </Draggable>
  )
}
