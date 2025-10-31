import { motion, AnimatePresence } from 'framer-motion'
import { MousePointer2 } from 'lucide-react'
import { Collaborator } from '@/hooks/use-whiteboard-presence'

interface Props {
  collaborator: Collaborator
}

export const CollaboratorCursor = ({ collaborator }: Props) => {
  if (!collaborator.cursor) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          position: 'absolute',
          left: collaborator.cursor.x,
          top: collaborator.cursor.y,
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      >
        <MousePointer2
          className="h-5 w-5 transform -rotate-90"
          style={{ color: collaborator.color }}
          fill={collaborator.color}
        />
        <div
          className="ml-3 mt-1 px-2 py-1 rounded text-xs text-white font-medium whitespace-nowrap shadow-lg"
          style={{ backgroundColor: collaborator.color }}
        >
          {collaborator.name}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
