import { useRef, useState } from 'react'
import Draggable from 'react-draggable'
import { Button } from '@/components/ui/button'
import { X, Loader2 } from 'lucide-react'
import { WhiteboardItem } from '@/types/whiteboard'
import { cn } from '@/lib/utils'

interface Props {
  item: WhiteboardItem
  onUpdate: (id: string, updates: Partial<WhiteboardItem>) => void
  onDelete: (id: string) => void
}

export const WhiteboardImage = ({ item, onUpdate, onDelete }: Props) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const width = item.width || 200
  const height = item.height || 200
  const nodeRef = useRef<HTMLDivElement | null>(null)
  const resizingRef = useRef(false)
  const startRef = useRef<{ x: number; y: number; width: number; height: number }>()

  const onResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.preventDefault()
    resizingRef.current = true
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      width,
      height,
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
    const nextWidth = Math.max(100, startRef.current.width + dx)
    const nextHeight = Math.max(100, startRef.current.height + dy)
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
      <div 
        ref={nodeRef}
        className="absolute cursor-move group"
        style={{ width, height }}
      >
        <div 
          className={cn(
            "drag-handle w-full h-full rounded-lg relative transition-all",
            "hover:shadow-lg",
            !imageLoaded && "border border-dashed border-muted-foreground/30"
          )}
        >
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center text-xs text-muted-foreground">
                <p>Erro ao carregar</p>
                <p className="text-[10px] mt-1">imagem</p>
              </div>
            </div>
          )}
          
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt="Whiteboard"
              className={cn(
                "w-full h-full object-contain rounded-lg transition-opacity",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
        </div>
        
        <Button 
          size="icon" 
          variant="ghost" 
          className="absolute -top-2 -right-2 h-6 w-6 sm:h-5 sm:w-5 bg-background hover:bg-destructive/10 hover:text-destructive shadow-sm sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-auto" 
          onClick={() => onDelete(item.id)}
        >
          <X className="h-4 w-4 sm:h-3 sm:w-3" />
        </Button>

        {/* Resize handle - visível sempre no mobile, hover no desktop */}
        <div
          onPointerDown={onResizeStart}
          className="absolute -bottom-2 -right-2 h-6 w-6 sm:h-4 sm:w-4 bg-primary rounded-full cursor-se-resize shadow-lg ring-2 ring-background sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center touch-auto"
          title="Redimensionar"
        >
          <div className="h-1.5 w-1.5 bg-background rounded-full" />
        </div>
      </div>
    </Draggable>
  )
}
