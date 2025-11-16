import { useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { Trash2, Check } from 'lucide-react';
import type { WhiteboardItem } from '@/types/whiteboard';

interface WhiteboardCheckboxProps {
  item: WhiteboardItem;
  onUpdate: (id: string, updates: Partial<WhiteboardItem>) => void;
  onDelete: (id: string) => void;
  viewportRef?: React.RefObject<{ zoom: number; pan: { x: number; y: number } }>;
  isEditable?: boolean;
}

export function WhiteboardCheckbox({
  item,
  onUpdate,
  onDelete,
  viewportRef,
  isEditable = true
}: WhiteboardCheckboxProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const checked = item.checked || false;

  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    e.stopPropagation();
    const scale = viewportRef?.current?.zoom || 1;
    onUpdate(item.id, { 
      position: { x: data.x / scale, y: data.y / scale }
    });
  };

  const toggleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(item.id, { 
      checked: !checked 
    });
  };

  const scale = viewportRef?.current?.zoom || 1;

  return (
    <Draggable
      position={{ x: item.position.x * scale, y: item.position.y * scale }}
      onStop={handleDragStop}
      onDrag={(e) => e.stopPropagation()}
      scale={scale}
      disabled={!isEditable}
      handle=".drag-handle" // ✅ CORREÇÃO: Especificar handle para não interferir com input
      cancel="input, button" // ✅ CORREÇÃO: Cancelar drag em inputs e botões
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="absolute"
        style={{
          width: item.width || 200,
          transformOrigin: 'top left'
        }}
      >
        <div className="flex items-start gap-2 p-2 bg-background/90 backdrop-blur-sm 
                        rounded-lg border border-border shadow-sm">
          
          {/* ✅ CORREÇÃO: Área de drag específica - mais visível */}
          <div className="drag-handle absolute left-0 top-0 bottom-0 w-6 cursor-move hover:bg-primary/20 bg-primary/5 border-r border-primary/20 transition-colors" 
               style={{ pointerEvents: 'auto', zIndex: 1 }} 
               title="Arrastar para mover" />
          
          <div className="relative z-10 flex items-start gap-2 w-full">
          {/* Checkbox */}
          <button
            onClick={toggleCheck}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all
                       ${checked 
                         ? 'bg-blue-500 border-blue-500' 
                         : 'bg-background border-border hover:border-blue-400'
                       }`}
            style={{ pointerEvents: 'auto' }}
          >
            {checked && <Check className="w-4 h-4 text-white" />}
          </button>

          {/* Texto editável */}
          {isEditing ? (
            <input
              autoFocus
              type="text"
              defaultValue={item.content || 'Nova tarefa'}
              onBlur={(e) => {
                onUpdate(item.id, { content: e.target.value });
                setIsEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onUpdate(item.id, { content: e.currentTarget.value });
                  setIsEditing(false);
                }
                if (e.key === 'Escape') {
                  setIsEditing(false);
                }
              }}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              onDoubleClick={() => setIsEditing(true)}
              className={`flex-1 text-sm cursor-text ${
                checked ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}
            >
              {item.content || 'Nova tarefa'}
            </div>
          )}

          {/* Delete button */}
          {isHovered && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="p-1 bg-red-500 hover:bg-red-600 rounded text-white 
                         transition-all hover:scale-110"
              style={{ pointerEvents: 'auto' }}
              aria-label="Deletar checkbox"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
          </div> {/* ✅ CORREÇÃO: Fechando div do conteúdo */}
        </div>
      </div>
    </Draggable>
  );
}
