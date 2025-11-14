import Draggable from 'react-draggable'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { WhiteboardItem } from '@/types/whiteboard'
import { useRef, useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Props {
  item: WhiteboardItem
  onUpdate: (id: string, updates: Partial<WhiteboardItem>) => void
  onDelete: (id: string) => void
}

export const WhiteboardCheckbox = ({ item, onUpdate, onDelete }: Props) => {
  const { t } = useI18n()
  const [text, setText] = useState(item.content || '')
  const nodeRef = useRef<HTMLDivElement | null>(null)

  return (
    <Draggable
      position={item.position}
      onStop={(e, data) => onUpdate(item.id, { position: { x: data.x, y: data.y } })}
      handle=".drag-handle"
      nodeRef={nodeRef}
    >
      <motion.div 
        ref={nodeRef} 
        className={cn(
          "absolute flex items-center gap-2 bg-card border border-border rounded-lg p-2 shadow-md group",
          "hover:shadow-lg transition-all duration-200"
        )}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        whileHover={{ 
          scale: 1.01,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
        }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Drag handle - barra lateral */}
        <div className="drag-handle h-full w-2 -ml-1 mr-1 rounded-l cursor-move hover:bg-primary/20 transition-colors" />
        
        <div className="flex items-center gap-2 flex-1">
          <Checkbox
            checked={item.checked}
            onCheckedChange={(checked) => onUpdate(item.id, { checked: !!checked })}
            className="cursor-pointer"
          />
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => onUpdate(item.id, { content: text })}
            placeholder={t('whiteboard.item.task')}
            className="h-7 w-40 text-sm border-0 bg-transparent focus-visible:ring-0"
          />
        </div>
        
        {/* Botão X - Melhor visibilidade e usabilidade */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-destructive/90 hover:bg-destructive text-white shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200" 
            onClick={(e) => {
              e.stopPropagation()
              onDelete(item.id)
            }}
            aria-label="Excluir checkbox"
          >
            <X className="h-3 w-3 md:h-3.5 md:w-3.5" />
          </Button>
        </motion.div>
      </motion.div>
    </Draggable>
  )
}
