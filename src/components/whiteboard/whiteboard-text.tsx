import Draggable from 'react-draggable'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { WhiteboardItem } from '@/types/whiteboard'
import { useCallback, useEffect, useRef, useState, type FocusEvent as ReactFocusEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { motion } from 'framer-motion'

interface Props {
  item: WhiteboardItem
  onUpdate: (id: string, updates: Partial<WhiteboardItem>) => void
  onDelete: (id: string) => void
  onFocus?: (item: WhiteboardItem) => void
  onBlur?: (event?: ReactFocusEvent<HTMLInputElement>) => void
  isActive?: boolean
  overrideFontFamily?: string
  overrideFontWeight?: number
  overrideFontSize?: number
}

export const WhiteboardText = ({
  item,
  onUpdate,
  onDelete,
  onFocus,
  onBlur,
  isActive = false,
  overrideFontFamily,
  overrideFontWeight,
  overrideFontSize,
}: Props) => {
  const { t } = useI18n()
  const [text, setText] = useState(item.content || '')
  const nodeRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setText(item.content || '')
  }, [item.content])

  const fontFamily = isActive && overrideFontFamily ? overrideFontFamily : item.fontFamily || 'Inter, system-ui, sans-serif'
  const fontWeight = isActive && overrideFontWeight ? overrideFontWeight : item.fontWeight || 500
  const fontSize = isActive && overrideFontSize ? overrideFontSize : item.fontSize || 14

  useEffect(() => {
    if (!isEditing) {
      setText(item.content || '')
    }
  }, [item.content, isEditing])

  const handleSelect = useCallback(() => {
    onFocus?.(item)
  }, [item, onFocus])

  const startEditing = useCallback(() => {
    setIsEditing(true)
    onFocus?.(item)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }, [item, onFocus])

  const stopEditing = useCallback((shouldPersist = true, event?: ReactFocusEvent<HTMLInputElement>) => {
    const menubarTarget = event?.relatedTarget instanceof HTMLElement
      ? event.relatedTarget.closest('[data-text-menubar="true"]')
      : null

    if (shouldPersist) {
      onUpdate(item.id, { content: text, fontFamily, fontWeight, fontSize })
    } else {
      setText(item.content || '')
    }
    if (menubarTarget) {
      onBlur?.(event)
      return
    }
    setIsEditing(false)
    onBlur?.(event)
  }, [fontFamily, fontSize, fontWeight, item, onBlur, onUpdate, text])

  const handleKeyDown = useCallback((event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      stopEditing(true)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      stopEditing(false)
    }
  }, [stopEditing])

  return (
    <Draggable
      position={item.position}
      onStart={(e) => {
        // Prevenir ativação do menubar durante drag
        e.stopPropagation()
      }}
      onDrag={(e) => {
        // Manter foco durante drag sem ativar menubar
        e.stopPropagation()
      }}
      onStop={(e, data) => {
        e.stopPropagation()
        onUpdate(item.id, { position: { x: data.x, y: data.y } })
      }}
      handle=".drag-handle"
      cancel=".whiteboard-text-interactive"
      nodeRef={nodeRef}
    >
      <div ref={nodeRef} className="absolute flex items-center gap-2 group">
        <div className="flex-1 relative">
          {/* Área de drag (borda esquerda) quando não está editando */}
          {!isEditing && (
            <div 
              className="drag-handle absolute -left-2 top-0 bottom-0 w-3 rounded-l border border-transparent hover:border-primary/30 hover:bg-primary/10 cursor-move opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 md:opacity-0 transition-all duration-200"
              onClick={handleSelect}
            />
          )}
          {isEditing ? (
            <Input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={(event) => stopEditing(true, event)}
              onKeyDown={handleKeyDown}
              placeholder={t('whiteboard.item.text')}
              className="whiteboard-text-interactive h-10 w-60 bg-transparent border border-dashed border-primary/40"
              style={{ fontFamily, fontWeight, fontSize }}
            />
          ) : (
            <button
              type="button"
              className="whiteboard-text-interactive w-60 min-h-[40px] rounded border border-transparent px-2 text-left transition hover:border-border/60 focus-visible:border-primary/40 focus-visible:outline-none relative z-10"
              style={{ fontFamily, fontWeight, fontSize }}
              onClick={startEditing}
            >
              {text.trim().length > 0 ? text : <span className="text-muted-foreground">{t('whiteboard.item.text')}</span>}
            </button>
          )}
        </div>
        <motion.div
          className="flex-shrink-0"
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-6 w-6 rounded-full bg-destructive/90 hover:bg-destructive text-white shadow-md opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 md:opacity-0 transition-all duration-200" 
            onClick={() => onDelete(item.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </motion.div>
      </div>
    </Draggable>
  )
}
