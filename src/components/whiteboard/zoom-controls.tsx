import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
}

export const ZoomControls = ({ zoom, onZoomIn, onZoomOut, onZoomReset }: Props) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-3 left-3 z-50 scale-[0.15] md:scale-[0.2] origin-bottom-left"
    >
      <div className="flex flex-col gap-0.5 bg-background/95 backdrop-blur-sm border rounded-md shadow-lg p-0.5">
        <Button
          size="icon"
          variant="ghost"
          onClick={onZoomIn}
          className="h-6 w-6 p-0"
          title="Aumentar Zoom (+)"
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
        
        <Button
          size="icon"
          variant="ghost"
          onClick={onZoomReset}
          className="h-6 w-6 p-0"
          title="Resetar Zoom (100%)"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
        
        <Button
          size="icon"
          variant="ghost"
          onClick={onZoomOut}
          className="h-6 w-6 p-0"
          title="Diminuir Zoom (-)"
        >
          <ZoomOut className="h-3 w-3" />
        </Button>
        
        <div className="text-center text-[10px] font-medium py-0.5 border-t">
          {Math.round(zoom * 100)}%
        </div>
      </div>
    </motion.div>
  )
}
