import { useState, useEffect, useRef, useCallback } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageToolbar } from './page-toolbar'
import { DocsNavigationSidebar } from './docs-navigation-sidebar'
import {
  H1Element,
  H2Element,
  TextElement,
  ListElement,
  ChecklistElement,
  TableElement,
  PageElement,
} from './page-elements'
import { supabase } from '@/lib/supabase'
import { FileText, Plus, Check, Menu, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { CommentsSidebar } from './comments-sidebar'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useI18n } from '@/hooks/use-i18n'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

interface PageViewerProps {
  docId: string
  projectId?: string
  onOpenSidebar: () => void
  onBack: () => void
  onAddElement?: (element: PageElement) => void
  onDataChange?: (title: string, elements: PageElement[]) => void
  onNavigate?: (docId: string) => void
}

export const PageViewer = ({ docId, projectId, onOpenSidebar, onBack, onAddElement, onDataChange, onNavigate }: PageViewerProps) => {
  const { t } = useI18n()
  const [title, setTitle] = useState('')
  const [elements, setElements] = useState<PageElement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isWiki, setIsWiki] = useState(false)
  const [iconEmoji, setIconEmoji] = useState<string | null>(null)
  const [showNavSidebar, setShowNavSidebar] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentCount, setCommentCount] = useState(0)
  const [coverImg, setCoverImg] = useState<string | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const lastSavedRef = useRef<string>('')

  // Configurar sensores do DnD - SEM activationConstraint
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Fetch inicial
  useEffect(() => {
    fetchDoc()
  }, [docId])

  // Notificar mudanças de dados ao componente pai (para ExportMenu)
  useEffect(() => {
    if (onDataChange && !loading) {
      onDataChange(title, elements)
    }
  }, [title, elements, loading, onDataChange])

  // Atalho ESC para voltar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onBack])

  const fetchDoc = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('name, description, is_wiki, icon, cover_image')
        .eq('id', docId)
        .single()

      if (!error && data) {
        setTitle(data.name || 'Sem título')
        setIsWiki(data.is_wiki || false)
        setIconEmoji(data.icon || null)
        setCoverImg(data.cover_image || null)
        try {
          const parsed = JSON.parse(data.description || '[]')
          const elementsArray = Array.isArray(parsed) ? parsed : []
          setElements(elementsArray)
          lastSavedRef.current = JSON.stringify({ name: data.name, elements: elementsArray })
        } catch {
          setElements([])
          lastSavedRef.current = JSON.stringify({ name: data.name, elements: [] })
        }
      }
    } catch (err) {
      console.error('Error fetching doc:', err)
    } finally {
      setLoading(false)
    }
  }

  // Debounced save
  const saveDoc = useCallback(async (newTitle: string, newElements: PageElement[]) => {
    const currentState = JSON.stringify({ name: newTitle, elements: newElements })
    
    // Não salvar se não mudou nada
    if (currentState === lastSavedRef.current) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          name: newTitle,
          description: JSON.stringify(newElements),
        })
        .eq('id', docId)

      if (!error) {
        lastSavedRef.current = currentState
      }
    } catch (err) {
      console.error('Error saving doc:', err)
      toast.error('Erro ao salvar', {
        description: 'Tente novamente',
      })
    } finally {
      setSaving(false)
    }
  }, [docId])

  // Auto-save com debounce de 3 segundos
  useEffect(() => {
    if (loading) return

    // Limpar timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Criar novo timeout
    saveTimeoutRef.current = setTimeout(() => {
      saveDoc(title, elements)
    }, 3000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [title, elements, loading, saveDoc])

  const handleAddElement = useCallback((element: PageElement) => {
    setElements(prev => [...prev, element])
  }, [])

  // Expor função globalmente para o sidebar chamar
  useEffect(() => {
    // @ts-ignore
    window.__addPageElement = handleAddElement
    
    return () => {
      // @ts-ignore
      delete window.__addPageElement
    }
  }, [handleAddElement])

  // Atalhos de teclado
  useKeyboardShortcuts({
    save: () => saveDoc(title, elements),
    comments: () => setShowComments(!showComments),
    sidebar: () => onOpenSidebar(),
    close: () => onBack(),
  })

  // Buscar contador de comentários não lidos
  useEffect(() => {
    if (docId) {
      supabase
        .from('document_comments')
        .select('id', { count: 'exact', head: true })
        .eq('document_id', docId)
        .eq('is_resolved', false)
        .then(({ count }) => setCommentCount(count || 0))
    }
  }, [docId])

  const updateElement = (id: string, content: any) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, content } : el
    ))
  }

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id))
  }

  // Handler do drag start
  const handleDragStart = (event: any) => {
    console.log('🟢 Drag Start:', { activeId: event.active.id })
  }

  // Handler do drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    console.log('🔵 Drag End:', { activeId: active.id, overId: over?.id })

    if (over && active.id !== over.id) {
      setElements((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        console.log('🔵 Moving:', { oldIndex, newIndex, from: items[oldIndex]?.type, to: items[newIndex]?.type })

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const renderElement = (element: PageElement) => {
    const props = {
      id: element.id, // ✅ Passar ID para o sortable
      content: element.content,
      onChange: (content: any) => updateElement(element.id, content),
      onDelete: () => deleteElement(element.id),
    }

    switch (element.type) {
      case 'h1': return <H1Element key={element.id} {...props} />
      case 'h2': return <H2Element key={element.id} {...props} />
      case 'text': return <TextElement key={element.id} {...props} />
      case 'list': return <ListElement key={element.id} {...props} />
      case 'checklist': return <ChecklistElement key={element.id} {...props} />
      case 'table': return <TableElement key={element.id} {...props} />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <TooltipProvider>
    <div className="relative flex h-full">
      {/* Botão flutuante Menu - SÓ APARECE QUANDO SIDEBAR FECHADA */}
      {!showNavSidebar && (
        <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            className="absolute left-2 top-2 sm:left-4 sm:top-4 z-40 h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow-lg"
            onClick={() => setShowNavSidebar(true)}
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{t('pages.openNavigation')}</p>
        </TooltipContent>
      </Tooltip>
    )}

    {/* Botão flutuante Comentários */}
    {!showComments && (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            className="absolute left-2 top-14 sm:left-4 sm:top-20 z-40 h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow-lg relative"
            onClick={() => setShowComments(true)}
          >
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
            {commentCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {commentCount}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{t('pages.comments.title')}</p>
          <span className="text-xs text-muted-foreground">{t('pages.shortcuts.comments')}</span>
        </TooltipContent>
      </Tooltip>
    )}

    {/* Sidebar de navegação (condicional) */}
    {showNavSidebar && (
      <div className="w-[200px] sm:w-[280px] border-r border-border flex-shrink-0 h-full">
        <DocsNavigationSidebar
          open={showNavSidebar}
          onOpenChange={setShowNavSidebar}
          currentDocId={docId}
          onNavigate={(id) => {
            if (onNavigate) {
              onNavigate(id) // ✅ Chama função do parent para trocar doc
              setShowNavSidebar(false) // ✅ Fecha sidebar após navegar
            }
          }}
          onCreatePage={async () => {
            // Criar nova página
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: newDoc, error } = await supabase
              .from('documents')
              .insert({
                user_id: user.id,
                project_id: projectId || null,
                parent_id: null, // Página raiz
                name: 'Sem título',
                file_type: 'page',
                file_size: 0,
                category: 'Other',
                file_url: '',
                description: '[]',
              })
              .select()
              .single()

            if (!error && newDoc) {
              // Navegar para nova página
              onBack()
              setTimeout(() => {
                window.location.hash = newDoc.id
              }, 100)
              toast.success('Nova página criada')
            }
          }}
            projectId={projectId}
          />
        </div>
      )}

      {/* Conteúdo principal */}
      <ScrollArea className="flex-1">
        <div className="w-full px-2 py-2 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:max-w-4xl lg:mx-auto">
        {/* Capa PRIMEIRO (se existir) - FORA das margens */}
        {coverImg && (
          <div className="relative -mx-2 sm:-mx-6 md:-mx-8 -mt-2 sm:-mt-6 md:-mt-8 mb-8 sm:mb-16 h-20 sm:h-40 md:h-48 overflow-visible group">
            <img 
              src={coverImg} 
              alt="Capa" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                size="sm"
                variant="secondary"
                className="text-xs sm:text-sm"
                onClick={async () => {
                  await supabase
                    .from('documents')
                    .update({ cover_image: null })
                    .eq('id', docId)
                  setCoverImg(null)
                  toast.success('Capa removida')
                }}
              >
                Remover capa
              </Button>
            </div>

            {/* Ícone emoji SOBREPOSTO na borda da capa */}
            {iconEmoji && (
              <div className="absolute bottom-0 left-2 sm:left-6 md:left-8 translate-y-1/2 text-3xl sm:text-7xl md:text-8xl leading-none">
                {iconEmoji}
              </div>
            )}
          </div>
        )}

        {/* Ícone emoji GRANDE (se NÃO tiver capa) */}
        {!coverImg && iconEmoji && (
          <div className="text-3xl sm:text-7xl md:text-8xl mb-2 sm:mb-4 leading-none">
            {iconEmoji}
          </div>
        )}

        {/* Indicador de salvamento melhorado */}
        <div className="flex items-center justify-end mb-2 sm:mb-4">
          {saving ? (
            <span className="text-[10px] sm:text-xs flex items-center gap-1.5 bg-yellow-500/10 px-2 py-1 rounded-full animate-in fade-in duration-200">
              <div className="h-2 w-2 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-yellow-600 dark:text-yellow-500 font-medium">Salvando...</span>
            </span>
          ) : (
            <span className="text-[10px] sm:text-xs flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-full animate-in fade-in duration-200">
              <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500" />
              <span className="text-green-600 dark:text-green-500 font-medium">Salvo</span>
            </span>
          )}
        </div>

        {/* Toolbar */}
        <PageToolbar
          docId={docId}
          isWiki={isWiki}
          icon={iconEmoji}
          coverImage={coverImg}
          onUpdate={(updates) => {
            if ('is_wiki' in updates) setIsWiki(updates.is_wiki)
            if ('icon' in updates) setIconEmoji(updates.icon)
            if ('cover_image' in updates) setCoverImg(updates.cover_image)
          }}
          onDelete={() => {
            if (confirm(t('pages.confirmDelete'))) {
              supabase.from('documents').delete().eq('id', docId).then(() => {
                toast.success(t('pages.pageDeleted'))
                onBack()
              })
            }
          }}
        />

        {/* Título editável */}
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('pages.untitled')}
          className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold border-none px-0 mb-2 sm:mb-4 md:mb-6 lg:mb-8 focus-visible:ring-0 bg-transparent"
        />

        {/* Elementos da página com DnD */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={elements.map(el => el.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1 sm:space-y-2">
              {elements.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Página vazia
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenSidebar}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('pages.addFirstElement')}
                  </Button>
                </div>
              ) : (
                <>
                  {elements.map(renderElement)}
                  
                  {/* Botão adicionar no final */}
                  <div className="pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-center text-xs sm:text-sm text-muted-foreground hover:text-foreground border-2 border-dashed border-transparent hover:border-border py-6 sm:py-8"
                      onClick={onOpenSidebar}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t('pages.addElement')}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </ScrollArea>

      {/* Sidebar de Comentários */}
      <CommentsSidebar
        docId={docId}
        open={showComments}
        onClose={() => setShowComments(false)}
      />
    </div>
    </TooltipProvider>
  )
}
