import Draggable from 'react-draggable'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { WhiteboardItem } from '@/types/whiteboard'
import { useRef, useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

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
      <div ref={nodeRef} className={cn(
        "absolute flex items-center gap-2 bg-card border border-border rounded-lg p-2 shadow-md",
        "hover:shadow-lg transition-shadow cursor-move"
      )}>
        <div className="drag-handle flex items-center gap-2 flex-1">
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
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-6 w-6 shrink-0 hover:bg-destructive/10 hover:text-destructive" 
          onClick={() => onDelete(item.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </Draggable>
  )
}
