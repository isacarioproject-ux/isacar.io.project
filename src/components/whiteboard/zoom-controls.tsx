import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useI18n } from '@/hooks/use-i18n'

interface Props {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
}

export const ZoomControls = ({ zoom, onZoomIn, onZoomOut, onZoomReset }: Props) => {
  const { t } = useI18n();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-16 md:bottom-2 left-2 z-40 scale-[0.7] origin-bottom-left"
    >
      <div className="flex flex-col gap-1 bg-background/80 backdrop-blur-sm border rounded-md shadow-md p-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={onZoomIn}
          className="h-5 w-5 p-0 hover:bg-muted/60"
          title={t('whiteboard.zoomIn')}
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
        
        <Button
          size="icon"
          variant="ghost"
          onClick={onZoomOut}
          className="h-5 w-5 p-0 hover:bg-muted/60"
          title={t('whiteboard.zoomOut')}
        >
          <ZoomOut className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  )
}
