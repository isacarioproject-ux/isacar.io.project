import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'
import { Button } from '@/components/ui/button'
import { X, Maximize2 } from 'lucide-react'
import type { WhiteboardItem } from '@/types/whiteboard'
import { useRef, useState } from 'react'

interface Props {
  item: WhiteboardItem
  onUpdate: (id: string, updates: Partial<WhiteboardItem>) => void
  onDelete: (id: string) => void
  viewportRef?: React.RefObject<{ zoom: number; pan: { x: number; y: number } }>
  isEditable?: boolean
}

export const WhiteboardBox = ({ item, onUpdate, onDelete, viewportRef, isEditable = true }: Props) => {
  const resizingRef = useRef(false)
  const startRef = useRef<{x:number;y:number;width:number;height:number}>()
  const nodeRef = useRef<HTMLDivElement | null>(null)
  const [isHovered, setIsHovered] = useState(false) // ✅ CORREÇÃO 3: Estado de hover

  // ✅ CORREÇÃO: Handler de drag correto considerando scale
  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    e.stopPropagation()
    
    // Converter posição corretamente considerando scale
    const viewport = viewportRef?.current || { zoom: 1 }
    const newX = data.x / viewport.zoom
    const newY = data.y / viewport.zoom
    
    onUpdate(item.id, { 
      position: { x: newX, y: newY }
    })
  }

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

  // ✅ CORREÇÃO: Calcular posição e scale corretos
  const viewport = viewportRef?.current || { zoom: 1 }
  const scale = viewport.zoom

  return (
    <Draggable
      position={{ 
        x: item.position.x * scale, 
        y: item.position.y * scale 
      }}
      onStop={handleDragStop}
      onDrag={(e) => e.stopPropagation()} // ✅ Importante!
      scale={scale} // ✅ Passa scale para Draggable
      disabled={!isEditable} // ✅ Só arrasta se editável
      handle=".drag-handle"
      nodeRef={nodeRef}
    >
      <div 
        ref={nodeRef} 
        className="absolute cursor-move group"
        style={{
          transform: `translate(${item.position.x}px, ${item.position.y}px)`,
          transformOrigin: '0 0'
        }}
        onMouseEnter={() => setIsHovered(true)} // ✅ CORREÇÃO 3: Detectar hover
        onMouseLeave={() => setIsHovered(false)} // ✅ CORREÇÃO 3: Detectar saída do hover
      >
        <div 
          className="drag-handle border-2 border-dashed border-primary/50 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all duration-200 relative"
          style={{ width: item.width || 200, height: item.height || 150 }}
        >
          {/* ✅ CORREÇÃO 3: Botão delete aparece no hover */}
          {isHovered && (
            <button
              onClick={(e) => {
                e.stopPropagation() // ✅ CRÍTICO!
                onDelete(item.id) // Chama função de delete
              }}
              className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 
                         rounded-full text-white shadow-lg transition-all z-50
                         hover:scale-110"
              style={{ pointerEvents: 'auto' }} // ✅ CRÍTICO!
              aria-label="Deletar retângulo"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

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
