import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Link2,
  CheckSquare,
  Smile,
  ImagePlus,
  Settings,
  Trash2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useI18n } from '@/hooks/use-i18n'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface PageToolbarProps {
  docId: string
  isWiki: boolean
  icon: string | null
  coverImage: string | null
  onUpdate: (updates: any) => void
  onDelete: () => void
}

// Emojis populares para picker simples
const EMOJI_LIST = [
  '📄', '📝', '📋', '📊', '📈', '📉', '🗂️', '📁', '📂', '🗃️',
  '💡', '⭐', '🎯', '🔥', '✅', '❌', '⚠️', '🚀', '🎨', '🎭',
  '💼', '📱', '💻', '🖥️', '⌚', '📷', '🎥', '🎬', '🎮', '🎲',
]

export const PageToolbar = ({ 
  docId, 
  isWiki, 
  icon, 
  coverImage, 
  onUpdate,
  onDelete 
}: PageToolbarProps) => {
  const { t } = useI18n()
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showCoverPopover, setShowCoverPopover] = useState(false)
  const [uploading, setUploading] = useState(false)

  const toggleWiki = async () => {
    const newValue = !isWiki
    onUpdate({ is_wiki: newValue })
    
    await supabase
      .from('documents')
      .update({ is_wiki: newValue })
      .eq('id', docId)
    
    toast.success(newValue ? '✓ Marcado como Wiki' : 'Desmarcado', { duration: 2000 })
  }

  const setIcon = async (emoji: string) => {
    onUpdate({ icon: emoji })
    
    await supabase
      .from('documents')
      .update({ icon: emoji })
      .eq('id', docId)
    
    setShowEmojiPicker(false)
    toast.success('✓ Ícone atualizado', { duration: 2000 })
  }

  const removeIcon = async () => {
    onUpdate({ icon: null })
    
    await supabase
      .from('documents')
      .update({ icon: null })
      .eq('id', docId)
    
    setShowEmojiPicker(false)
    toast.success('Ícone removido', { duration: 2000 })
  }

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem')
      return
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB')
      return
    }

    setUploading(true)

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${docId}-${Date.now()}.${fileExt}`
      const filePath = `covers/${fileName}`

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      // Deletar capa antiga se existir
      if (coverImage) {
        const oldPath = coverImage.split('/').slice(-2).join('/')
        await supabase.storage.from('documents').remove([oldPath])
      }

      // Atualizar banco de dados
      onUpdate({ cover_image: publicUrl })
      
      await supabase
        .from('documents')
        .update({ cover_image: publicUrl })
        .eq('id', docId)

      setShowCoverPopover(false)
      toast.success('✓ Capa adicionada', { duration: 2000 })
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error)
      toast.error('Erro ao fazer upload da capa')
    } finally {
      setUploading(false)
    }
  }

  const removeCover = async () => {
    if (!coverImage) return

    try {
      // Deletar do storage
      const filePath = coverImage.split('/').slice(-2).join('/')
      await supabase.storage.from('documents').remove([filePath])

      // Atualizar banco de dados
      onUpdate({ cover_image: null })
      
      await supabase
        .from('documents')
        .update({ cover_image: null })
        .eq('id', docId)

      toast.success('Capa removida', { duration: 2000 })
    } catch (error) {
      console.error('Erro ao remover capa:', error)
      toast.error('Erro ao remover capa')
    }
  }

  return (
    <TooltipProvider>
    <div className="mb-2 sm:mb-4">
      {/* Toolbar estilo ClickUp - FLAT buttons */}
      <div className="flex items-center gap-0.5 text-[10px] sm:text-xs text-muted-foreground overflow-x-auto">
        {/* Vincular tarefa */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 sm:h-7 px-1.5 sm:px-2.5 hover:bg-muted/50 flex-shrink-0"
            >
              <Link2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
              <span className="hidden sm:inline">Vincular tarefa ou documento</span>
              <span className="sm:hidden">Vincular</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('pages.toolbar.linkTask')}</p>
          </TooltipContent>
        </Tooltip>

        {/* Toggle Wiki com checkbox visual */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 hover:bg-muted/50 rounded cursor-pointer flex-shrink-0" onClick={toggleWiki}>
              <CheckSquare className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${isWiki ? 'text-blue-500' : ''}`} />
              <span className={isWiki ? 'text-blue-500 font-medium' : ''}>
                Wiki
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('pages.toolbar.wiki')}</p>
          </TooltipContent>
        </Tooltip>

        {/* Adicionar Ícone */}
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 sm:h-7 px-1.5 sm:px-2.5 hover:bg-muted/50 flex-shrink-0"
                >
                  {icon ? (
                    <>
                      <span className="text-sm sm:text-base mr-1">{icon}</span>
                      {t('pages.toolbar.icon')}
                    </>
                  ) : (
                    <>
                      <Smile className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                      <span className="hidden sm:inline">{t('pages.toolbar.addIcon')}</span>
                      <span className="sm:hidden">{t('pages.toolbar.icon')}</span>
                    </>
                  )}
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('pages.toolbar.addIcon')}</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-72 p-3" align="start">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">{t('pages.toolbar.chooseIcon')}</Label>
              <div className="grid grid-cols-10 gap-1">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setIcon(emoji)}
                    className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded text-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {icon && (
                <>
                  <div className="border-t pt-2 mt-2" />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={removeIcon}
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    {t('pages.toolbar.removeIcon')}
                  </Button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Adicionar Capa */}
        <Popover open={showCoverPopover} onOpenChange={setShowCoverPopover}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 sm:h-7 px-1.5 sm:px-2.5 hover:bg-muted/50 flex-shrink-0"
                  disabled={uploading}
                >
                  <ImagePlus className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                  <span className="hidden sm:inline">{uploading ? t('pages.toolbar.uploading') : t('pages.toolbar.addCover')}</span>
                  <span className="sm:hidden">{t('pages.toolbar.cover')}</span>
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('pages.toolbar.addCover')}</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-semibold">{t('pages.toolbar.chooseImage')}</Label>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {t('pages.toolbar.maxSize')}
                </p>
              </div>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                  id="cover-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="cover-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="text-primary font-medium">Clique para fazer upload</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      ou arraste e solte aqui
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Configurações */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 sm:h-7 px-1.5 sm:px-2.5 hover:bg-muted/50 flex-shrink-0"
                >
                  <Settings className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                  <span className="hidden sm:inline">Configurações</span>
                  <span className="sm:hidden">Config</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('pages.toolbar.settings')}</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              {t('pages.toolbar.properties')}
            </DropdownMenuItem>
            <DropdownMenuItem>
              {t('pages.toolbar.history')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('pages.toolbar.deletePage')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    </TooltipProvider>
  )
}
