import { useState, useRef, useEffect } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { Trash2 } from 'lucide-react';
import type { WhiteboardItem } from '@/types/whiteboard';

interface WhiteboardTextProps {
  item: WhiteboardItem;
  onUpdate: (id: string, updates: Partial<WhiteboardItem>) => void;
  onDelete: (id: string) => void;
  viewportRef?: React.RefObject<{ zoom: number; pan: { x: number; y: number } }>;
  isEditable?: boolean;
}

export function WhiteboardText({
  item,
  onUpdate,
  onDelete,
  viewportRef,
  isEditable = true
}: WhiteboardTextProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scale = viewportRef?.current?.zoom || 1;

  // ✅ Simples: apenas atualiza o conteúdo enquanto digita
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(item.id, { content: e.target.value });
  };

  // ✅ Handler de drag correto
  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    e.stopPropagation();
    onUpdate(item.id, {
      position: {
        x: data.x / scale,
        y: data.y / scale
      }
    });
  };

  return (
    <Draggable
      position={{ x: item.position.x * scale, y: item.position.y * scale }}
      onStop={handleDragStop}
      onDrag={(e) => e.stopPropagation()}
      scale={scale}
      disabled={!isEditable || isEditing} // ✅ Não arrasta enquanto edita
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        className="absolute"
        style={{
          cursor: isEditing ? 'text' : 'move',
          minWidth: item.width || 100,
          transformOrigin: 'top left'
        }}
      >
        {/* ✅ Texto editável - simples, transparente e redimensionável */}
        {isEditing ? (
          <textarea
            ref={textareaRef}
            autoFocus
            value={item.content || ''}
            onChange={handleTextChange}
            onBlur={(e) => {
              const el = textareaRef.current;
              if (el) {
                onUpdate(item.id, {
                  content: e.target.value,
                  width: el.offsetWidth,
                  height: el.offsetHeight
                });
              } else {
                onUpdate(item.id, { content: e.target.value });
              }
              setIsEditing(false);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const el = textareaRef.current;
                if (el) {
                  onUpdate(item.id, {
                    content: e.currentTarget.value,
                    width: el.offsetWidth,
                    height: el.offsetHeight
                  });
                } else {
                  onUpdate(item.id, { content: e.currentTarget.value });
                }
                setIsEditing(false);
              }
              if (e.key === 'Escape') {
                setIsEditing(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-transparent outline-none resize border border-dashed border-white/40 rounded-md"
            style={{
              fontSize: `${item.fontSize || 16}px`,
              fontWeight: item.fontWeight || 'normal',
              fontFamily: item.fontFamily || 'inherit',
              color: item.color || '#ffffff',
              padding: '8px',
              width: `${item.width || 200}px`,
              height: `${item.height || 80}px`,
              pointerEvents: 'auto',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
            placeholder="Digite seu texto..."
          />
        ) : (
          <div
            className="cursor-pointer hover:bg-white/10 rounded-md p-2 transition-all border-2 border-dashed border-white/30 hover:border-white/60"
            style={{
              fontSize: `${item.fontSize || 16}px`,
              fontWeight: item.fontWeight || 'normal',
              color: item.color || '#ffffff',
              fontFamily: item.fontFamily || 'inherit',
              width: `${item.width || 200}px`,
              height: `${item.height || 80}px`,
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              overflow: 'hidden'
            }}
          >
            {item.content || '✏️ Clique para escrever'}
          </div>
        )}

        {/* ✅ Botão delete (só quando não está editando) */}
        {isHovered && isEditable && !isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 
                       rounded-full text-white shadow-lg transition-all z-50
                       hover:scale-110"
            style={{ pointerEvents: 'auto' }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </Draggable>
  );
}
