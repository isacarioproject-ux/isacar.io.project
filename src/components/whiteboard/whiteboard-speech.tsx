import Draggable from 'react-draggable'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { WhiteboardItem } from '@/types/whiteboard'
import { cn } from '@/lib/utils'
import { useMemo, useRef } from 'react'

const shapeColors = {
  blue: 'stroke-blue-500 fill-blue-500/20',
  green: 'stroke-green-500 fill-green-500/20',
  purple: 'stroke-purple-500 fill-purple-500/20',
  pink: 'stroke-pink-500 fill-pink-500/20',
  orange: 'stroke-orange-500 fill-orange-500/20',
  red: 'stroke-red-500 fill-red-500/20',
  yellow: 'stroke-yellow-500 fill-yellow-500/20',
  cyan: 'stroke-cyan-500 fill-cyan-500/20',
  gray: 'stroke-gray-500 fill-gray-500/20',
} as const

type ShapeColorKey = keyof typeof shapeColors

interface Props {
  item: WhiteboardItem
  onUpdate: (id: string, updates: Partial<WhiteboardItem>) => void
  onDelete: (id: string) => void
}

export const WhiteboardSpeech = ({ item, onUpdate, onDelete }: Props) => {
  const width = item.width || 200
  const height = item.height || 140

  const resizingRef = useRef(false)
  const startRef = useRef<{ x: number; y: number; width: number; height: number }>()
  const nodeRef = useRef<HTMLDivElement | null>(null)

  const pathD = useMemo(() => {
    const bubbleW = width * 0.8
    const bubbleH = height * 0.75
    const tailWidth = width * 0.25
    const tailHeight = height * 0.25
    const radius = Math.min(bubbleW, bubbleH) * 0.18

    return `M ${radius} 0 H ${bubbleW - radius} Q ${bubbleW} 0 ${bubbleW} ${radius} V ${bubbleH - radius} Q ${bubbleW} ${bubbleH} ${bubbleW - radius} ${bubbleH} H ${bubbleW * 0.6} L ${bubbleW + tailWidth * 0.1} ${bubbleH + tailHeight} L ${bubbleW * 0.45} ${bubbleH} H ${radius} Q 0 ${bubbleH} 0 ${bubbleH - radius} V ${radius} Q 0 0 ${radius} 0 Z`
  }, [width, height])

  const onResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    resizingRef.current = true
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      width,
      height,
    }
    window.addEventListener('mousemove', onResizing)
    window.addEventListener('mouseup', onResizeEnd, { once: true })
  }

  const onResizing = (e: MouseEvent) => {
    if (!resizingRef.current || !startRef.current) return
    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y
    const nextWidth = Math.max(150, startRef.current.width + dx)
    const nextHeight = Math.max(100, startRef.current.height + dy)
    onUpdate(item.id, { width: nextWidth, height: nextHeight })
  }

  const onResizeEnd = () => {
    resizingRef.current = false
    window.removeEventListener('mousemove', onResizing)
  }

  return (
    <Draggable
      position={item.position}
      onStop={(e, data) => onUpdate(item.id, { position: { x: data.x, y: data.y } })}
      handle=".drag-handle"
      nodeRef={nodeRef}
    >
      <div ref={nodeRef} className="absolute cursor-move" style={{ width, height }}>
        <svg
          className="drag-handle"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          <path
            d={pathD}
            className={cn('transition-all hover:scale-105', shapeColors[(item.shapeColor as ShapeColorKey) || 'cyan'])}
            strokeWidth={2}
          />
        </svg>

        <Button
          size="icon"
          variant="ghost"
          className="absolute -top-2 -right-2 h-5 w-5 bg-background hover:bg-destructive/10 hover:text-destructive shadow-sm"
          onClick={() => onDelete(item.id)}
        >
          <X className="h-3 w-3" />
        </Button>

        <div
          onMouseDown={onResizeStart}
          className="absolute -bottom-1 -right-1 h-3 w-3 bg-primary rounded-sm cursor-se-resize shadow ring-2 ring-background"
          title="Redimensionar"
        />
      </div>
    </Draggable>
  )
}
