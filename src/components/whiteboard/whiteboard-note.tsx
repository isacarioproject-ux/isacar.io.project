import Draggable from 'react-draggable'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { WhiteboardItem } from '@/types/whiteboard'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/use-i18n'

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
      <div ref={nodeRef} className={cn(
        "absolute w-48 p-3 border-2 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-move",
        colors[item.color || 'yellow']
      )}>
        <Button 
          size="icon" 
          variant="ghost" 
          className="absolute top-1 right-1 h-5 w-5 hover:bg-destructive/10 hover:text-destructive" 
          onClick={() => onDelete(item.id)}
        >
          <X className="h-3 w-3" />
        </Button>
        <div className="drag-handle pt-6">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => onUpdate(item.id, { content: text })}
            placeholder={t('whiteboard.item.note')}
            className="min-h-[80px] text-xs bg-transparent border-none p-0 resize-none focus-visible:ring-0"
          />
        </div>
      </div>
    </Draggable>
  )
}
