import { useRef, useState } from 'react'
import Draggable from 'react-draggable'
import { Button } from '@/components/ui/button'
import { X, Loader2, Maximize2 } from 'lucide-react'
import { WhiteboardItem } from '@/types/whiteboard'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useI18n } from '@/hooks/use-i18n'

interface Props {
  item: WhiteboardItem
  onUpdate: (id: string, updates: Partial<WhiteboardItem>) => void
  onDelete: (id: string) => void
}

export const WhiteboardImage = ({ item, onUpdate, onDelete }: Props) => {
  const { t } = useI18n()
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
      <motion.div 
        ref={nodeRef}
        className="absolute cursor-move group"
        style={{ width, height }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <motion.div 
          className={cn(
            "drag-handle w-full h-full rounded-lg relative transition-all duration-200",
            !imageLoaded && "border border-dashed border-muted-foreground/30"
          )}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
          }}
          whileTap={{ scale: 0.98 }}
        >
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center text-xs text-muted-foreground">
                <p>{t('whiteboard.imageError')}</p>
                <p className="text-[10px] mt-1">{t('whiteboard.imageErrorSub')}</p>
              </div>
            </div>
          )}
          
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt="Whiteboard"
              className={cn(
                "w-full h-full object-contain rounded-lg transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
        </motion.div>
        
        {/* Botão X - Invisível por padrão, aparece no hover/touch */}
        <motion.div
          className="absolute -top-2 -right-2 z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-6 w-6 rounded-full bg-destructive/90 hover:bg-destructive text-white shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200" 
            onClick={() => onDelete(item.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </motion.div>

        {/* Resize handle - Invisível por padrão, aparece no hover/touch */}
        <motion.div
          onPointerDown={onResizeStart}
          className="absolute -bottom-2 -right-2 z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="h-7 w-7 rounded-full bg-primary/90 hover:bg-primary text-white shadow-md cursor-se-resize opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
            <Maximize2 className="h-3 w-3" />
          </div>
        </motion.div>
      </motion.div>
    </Draggable>
  )
}
