import { useState, useRef } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { X, Maximize2 } from 'lucide-react';
import type { WhiteboardItem } from '@/types/whiteboard';

interface WhiteboardShapeBaseProps {
  item: WhiteboardItem;
  onUpdate: (id: string, updates: Partial<WhiteboardItem>) => void;
  onDelete: (id: string) => void;
  viewportRef?: React.RefObject<{ zoom: number; pan: { x: number; y: number } }>;
  isEditable?: boolean;
  children: React.ReactNode; // O SVG da forma específica
  showTextInput?: boolean; // Se mostra input de texto
}

export function WhiteboardShapeBase({
  item,
  onUpdate,
  onDelete,
  viewportRef,
  isEditable = true,
  children,
  showTextInput = false
}: WhiteboardShapeBaseProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // ✅ ADICIONAR: Refs para resize (igual ao Box)
  const resizingRef = useRef(false);
  const startRef = useRef<{x:number;y:number;width:number;height:number}>();
  const nodeRef = useRef<HTMLDivElement | null>(null);

  // ✅ Usar mesma lógica do Box
  const viewport = viewportRef?.current || { zoom: 1 };
  const scale = viewport.zoom;

  // ✅ Handler de drag (igual ao box)
  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    e.stopPropagation();
    
    // Converter posição corretamente considerando scale
    const newX = data.x / scale;
    const newY = data.y / scale;
    
    onUpdate(item.id, { 
      position: { x: newX, y: newY }
    });
  };

  // ✅ ADICIONAR: Funcionalidade de resize (copiada do Box)
  const onResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    resizingRef.current = true;
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: item.width || 150,
      height: item.height || 150,
    };
    window.addEventListener('pointermove', onResizing);
    window.addEventListener('pointerup', onResizeEnd, { once: true });
    window.addEventListener('pointercancel', onResizeEnd, { once: true });
  };

  const onResizing = (e: PointerEvent) => {
    if (!resizingRef.current || !startRef.current) return;
    e.preventDefault();
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    const nextWidth = Math.max(40, startRef.current.width + dx);
    const nextHeight = Math.max(30, startRef.current.height + dy);
    onUpdate(item.id, { width: nextWidth, height: nextHeight });
  };

  const onResizeEnd = () => {
    resizingRef.current = false;
    window.removeEventListener('pointermove', onResizing);
  };

  // ✅ Duplo clique para editar texto (se aplicável)
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showTextInput) {
      setIsEditing(true);
    }
  };

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
          className="drag-handle relative"
          style={{ width: item.width || 150, height: item.height || 150 }}
          onDoubleClick={handleDoubleClick}
        >
          {/* A forma SVG */}
          <div className="relative w-full h-full">
            {children}
          </div>

          {/* Input de texto (opcional) */}
          {showTextInput && (
            <div
              className="absolute inset-0 flex items-center justify-center p-2"
              style={{ pointerEvents: isEditing ? 'auto' : 'none' }}
            >
              {isEditing ? (
                <input
                  autoFocus
                  type="text"
                  defaultValue={item.content || ''}
                  onBlur={(e) => {
                    onUpdate(item.id, { content: e.target.value });
                    setIsEditing(false);
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') {
                      onUpdate(item.id, { content: e.currentTarget.value });
                      setIsEditing(false);
                    }
                    if (e.key === 'Escape') {
                      setIsEditing(false);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-transparent text-center outline-none text-sm font-medium"
                  style={{
                    color: item.shapeColor || '#ffffff',
                    pointerEvents: 'auto'
                  }}
                />
              ) : (
                item.content && (
                  <div
                    className="text-center text-sm font-medium"
                    style={{ color: item.shapeColor || '#ffffff' }}
                  >
                    {item.content}
                  </div>
                )
              )}
            </div>
          )}

          {/* ✅ CORREÇÃO 3: Botão delete aparece no hover */}
          {isHovered && isEditable && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // ✅ CRÍTICO!
                onDelete(item.id); // Chama função de delete
              }}
              className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 
                         rounded-full text-white shadow-lg transition-all z-50
                         hover:scale-110"
              style={{ pointerEvents: 'auto' }} // ✅ CRÍTICO!
              aria-label="Deletar forma"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* ✅ CORREÇÃO: Resize handle - DENTRO do container da forma (igual ao Box) */}
          {isEditable && (
            <div
              onPointerDown={onResizeStart}
              className="absolute -bottom-2 -right-2 h-6 w-6 md:h-7 md:w-7 rounded-full bg-primary/90 hover:bg-primary text-white shadow-md cursor-se-resize opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center"
            >
              <Maximize2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
            </div>
          )}
        </div>
      </div>
    </Draggable>
  );
}
