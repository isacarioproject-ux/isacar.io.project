import { useRef, useState } from 'react'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import type { WhiteboardItem } from '@/types/whiteboard'
import { cn } from '@/lib/utils'

interface MindMapNodeProps {
  node: WhiteboardItem
  onUpdate: (id: string, updates: Partial<WhiteboardItem>) => void
  onDelete: (id: string) => void
  onAddChild: () => void
  onToggleCollapse: () => void
  viewportRef: React.RefObject<{ zoom: number; pan: { x: number; y: number } }>
  isEditable?: boolean
}

export function MindMapNode({
  node,
  onUpdate,
  onDelete,
  onAddChild,
  onToggleCollapse,
  viewportRef,
  isEditable = true
}: MindMapNodeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const nodeRef = useRef<HTMLDivElement | null>(null)

  const scale = viewportRef.current?.zoom || 1
  
  console.log(`🎨 RENDER MindMapNode Level ${node.level}:`, node.content)

  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    e.stopPropagation()
    onUpdate(node.id, {
      position: { x: data.x / scale, y: data.y / scale }
    })
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isEditable) {
      setIsEditing(true)
    }
  }

  const handleContentChange = (newContent: string) => {
    onUpdate(node.id, { content: newContent })
    setIsEditing(false)
  }

  const level = node.level || 0
  const hasChildren = (node.childIds?.length || 0) > 0
  const isCollapsed = node.collapsed || false

  return (
    <Draggable
      position={{ x: node.position.x * scale, y: node.position.y * scale }}
      onStop={handleDragStop}
      onDrag={(e) => e.stopPropagation()}
      scale={scale}
      disabled={!isEditable}
      nodeRef={nodeRef}
    >
      <div
        ref={nodeRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={handleDoubleClick}
        className="absolute cursor-move"
        style={{
          width: node.width || 200,
          minHeight: node.height || 100,
          transformOrigin: 'top left',
          zIndex: 10
        }}
      >
        {/* Card do node */}
        <div
          className={cn(
            "w-full h-full rounded-lg shadow-lg p-4 flex flex-col transition-all duration-200",
            isHovered && "shadow-xl scale-105"
          )}
          style={{
            backgroundColor: node.metadata?.backgroundColor || '#8b5cf6',
            borderWidth: '3px',
            borderStyle: 'solid',
            borderColor: node.metadata?.borderColor || '#7c3aed'
          }}
        >
          {/* Header com botões */}
          <div className="flex items-center justify-between mb-2">
            {/* Botão collapse (se tem filhos) */}
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleCollapse()
                }}
                className="p-1 rounded hover:bg-white/20 transition-colors"
                style={{ pointerEvents: 'auto' }}
                aria-label={isCollapsed ? 'Expandir' : 'Colapsar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" style={{ color: node.metadata?.textColor || '#ffffff' }} />
                ) : (
                  <ChevronDown className="h-4 w-4" style={{ color: node.metadata?.textColor || '#ffffff' }} />
                )}
              </button>
            )}

            {/* Badge de nível */}
            <div
              className="text-xs px-2 py-1 rounded-full bg-black/20 ml-auto"
              style={{ color: node.metadata?.textColor || '#ffffff' }}
            >
              Level {level}
            </div>
          </div>

          {/* Conteúdo editável */}
          {isEditing ? (
            <textarea
              autoFocus
              defaultValue={node.content}
              onBlur={(e) => handleContentChange(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation()
                if (e.key === 'Escape') {
                  setIsEditing(false)
                }
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleContentChange(e.currentTarget.value)
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-transparent outline-none resize-none text-center font-semibold"
              style={{
                color: node.metadata?.textColor || '#ffffff',
                fontSize: level === 0 ? '18px' : '14px',
                pointerEvents: 'auto'
              }}
            />
          ) : (
            <div
              className="flex-1 text-center font-semibold break-words"
              style={{
                color: node.metadata?.textColor || '#ffffff',
                fontSize: level === 0 ? '18px' : '14px'
              }}
            >
              {node.content || 'Sem título'}
            </div>
          )}

          {/* Botão adicionar filho */}
          {isHovered && isEditable && !isCollapsed && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAddChild()
              }}
              className="mt-2 w-full py-2 rounded bg-white/20 hover:bg-white/30 
                         transition-colors flex items-center justify-center gap-2"
              style={{ 
                pointerEvents: 'auto',
                color: node.metadata?.textColor || '#ffffff'
              }}
              aria-label="Adicionar filho"
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs font-medium">Add Child</span>
            </button>
          )}
        </div>

        {/* Botão delete */}
        {isHovered && isEditable && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(node.id)
            }}
            className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 
                       rounded-full text-white shadow-lg transition-all z-50
                       hover:scale-110"
            style={{ pointerEvents: 'auto' }}
            aria-label="Deletar node"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </Draggable>
  )
}
