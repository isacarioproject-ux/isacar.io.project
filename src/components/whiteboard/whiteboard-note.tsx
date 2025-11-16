import { useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { Trash2, Palette } from 'lucide-react';
import type { WhiteboardItem } from '@/types/whiteboard';

// ✅ Cores disponíveis para post-it
const POST_IT_COLORS = {
  yellow: '#fef08a',
  pink: '#fce7f3', 
  blue: '#dbeafe',
  green: '#dcfce7',
  orange: '#fed7aa',
  purple: '#e9d5ff'
};

interface WhiteboardNoteProps {
  item: WhiteboardItem;
  onUpdate: (id: string, updates: Partial<WhiteboardItem>) => void;
  onDelete: (id: string) => void;
  viewportRef?: React.RefObject<{ zoom: number; pan: { x: number; y: number } }>;
  isEditable?: boolean;
}

export function WhiteboardNote({
  item,
  onUpdate,
  onDelete,
  viewportRef,
  isEditable = true
}: WhiteboardNoteProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const scale = viewportRef?.current?.zoom || 1;

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
      disabled={!isEditable}
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        className="absolute cursor-move"
        style={{
          width: item.width || 200,
          minHeight: item.height || 200,
          transformOrigin: 'top left'
        }}
      >
        {/* ✅ Post-it visual - Simples e limpo */}
        <div
          className="w-full h-full p-4 shadow-md relative"
          style={{
            backgroundColor: item.color || '#fef08a',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >

          {/* ✅ Texto editável */}
          {isEditing ? (
            <textarea
              autoFocus
              defaultValue={item.content || ''}
              onBlur={(e) => {
                onUpdate(item.id, { content: e.target.value });
                setIsEditing(false);
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Escape') {
                  setIsEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-full bg-transparent outline-none resize-none text-sm"
              style={{
                color: '#374151',
                fontFamily: "'Segoe UI', system-ui, sans-serif",
                pointerEvents: 'auto',
                lineHeight: '1.5'
              }}
              placeholder="Escreva aqui..."
            />
          ) : (
            <div 
              className="text-sm whitespace-pre-wrap cursor-pointer h-full flex items-start"
              style={{ 
                color: '#374151',
                lineHeight: '1.5'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              {item.content || 'Clique para escrever...'}
            </div>
          )}
        </div>

        {/* ✅ Botões de ação */}
        {isHovered && isEditable && (
          <div className="absolute -top-2 -right-2 flex gap-1">
            {/* Seletor de cor */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorPicker(!showColorPicker);
                }}
                className="p-1.5 bg-blue-500 hover:bg-blue-600 
                           rounded-full text-white shadow-lg transition-all z-50
                           hover:scale-110"
                style={{ pointerEvents: 'auto' }}
              >
                <Palette className="h-3.5 w-3.5" />
              </button>
              
              {/* Paleta de cores */}
              {showColorPicker && (
                <div className="absolute top-10 right-0 bg-white rounded-lg shadow-xl border p-2 z-50">
                  <div className="grid grid-cols-3 gap-1">
                    {Object.entries(POST_IT_COLORS).map(([colorName, colorValue]) => (
                      <button
                        key={colorName}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdate(item.id, { color: colorValue as any });
                          setShowColorPicker(false);
                        }}
                        className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500 transition-all"
                        style={{ 
                          backgroundColor: colorValue,
                          pointerEvents: 'auto'
                        }}
                        title={colorName}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Botão delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="p-1.5 bg-red-500 hover:bg-red-600 
                         rounded-full text-white shadow-lg transition-all z-50
                         hover:scale-110"
              style={{ pointerEvents: 'auto' }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </Draggable>
  );
}
