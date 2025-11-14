import Draggable from 'react-draggable'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { WhiteboardItem } from '@/types/whiteboard'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/use-i18n'
import { motion } from 'framer-motion'

const colors = {
  yellow: 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700',
  pink: 'bg-pink-100 border-pink-300 dark:bg-pink-900/20 dark:border-pink-700',
  blue: 'bg-blue-100 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700',
  green: 'bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-700',
}

interface Props {
  item: WhiteboardItem
  onUpdate: (id: string, updates: Partial<WhiteboardItem>) => void
  onDelete: (id: string) => void
}

export const WhiteboardNote = ({ item, onUpdate, onDelete }: Props) => {
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
          "absolute w-48 p-3 border-2 rounded-lg shadow-md transition-all duration-200 cursor-move group",
          colors[item.color || 'yellow']
        )}
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
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

        {/* Área de arrastar melhorada */}
        <div className="drag-handle pt-4 pb-1">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => onUpdate(item.id, { content: text })}
            placeholder={t('whiteboard.item.note')}
            className="min-h-[80px] text-xs bg-transparent border-none p-0 resize-none focus-visible:ring-0 placeholder:text-black/40 dark:placeholder:text-white/40"
          />
        </div>
      </motion.div>
    </Draggable>
  )
}
