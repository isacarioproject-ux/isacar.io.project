import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Check, Link2, Users, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  whiteboardId?: string
  whiteboardName?: string
}

export const ShareDialog = ({ open, onOpenChange, whiteboardId, whiteboardName }: Props) => {
  const [copied, setCopied] = useState(false)
  const [shareMode, setShareMode] = useState<'view' | 'edit'>('view')
  
  // Gerar link de compartilhamento
  const shareLink = whiteboardId 
    ? `${window.location.origin}/whiteboard/shared/${whiteboardId}?mode=${shareMode}`
    : ''

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      toast.success('Link copiado para área de transferência!')
      
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Erro ao copiar link')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Compartilhar Whiteboard
          </DialogTitle>
          <DialogDescription>
            {whiteboardName && `Compartilhe "${whiteboardName}" com outras pessoas`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Modo de compartilhamento */}
          <div className="space-y-2">
            <Label>Tipo de Acesso</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={shareMode === 'view' ? 'default' : 'outline'}
                onClick={() => setShareMode('view')}
                className="justify-start"
              >
                <Eye className="mr-2 h-4 w-4" />
                Somente Visualizar
              </Button>
              <Button
                variant={shareMode === 'edit' ? 'default' : 'outline'}
                onClick={() => setShareMode('edit')}
                className="justify-start"
              >
                <Users className="mr-2 h-4 w-4" />
                Editar Junto
              </Button>
            </div>
          </div>

          {/* Link de compartilhamento */}
          <div className="space-y-2">
            <Label htmlFor="share-link">Link de Compartilhamento</Label>
            <div className="flex gap-2">
              <Input
                id="share-link"
                value={shareLink}
                readOnly
                className="flex-1"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                size="icon"
                variant={copied ? 'default' : 'outline'}
                onClick={handleCopy}
                className="shrink-0"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Copy className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>

          {/* Informações */}
          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <span className="text-primary">ℹ️</span>
              {shareMode === 'view' 
                ? 'Pessoas com este link poderão visualizar o whiteboard em tempo real, mas não poderão editar.'
                : 'Pessoas com este link poderão editar o whiteboard junto com você em tempo real.'}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
