import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useI18n } from '@/hooks/use-i18n'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  PanelRightClose,
  Type,
  List,
  CheckSquare,
  Table as TableIcon,
  Heading1,
  Heading2,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import { PageElement } from './page-elements'

interface PageEditorSidebarProps {
  docId: string
  onClose: () => void
  onAddElement: (element: PageElement) => void
}

export const PageEditorSidebar = ({ docId, onClose, onAddElement }: PageEditorSidebarProps) => {
  const { t } = useI18n()
  const addElement = (type: PageElement['type']) => {
    const newElement: PageElement = {
      id: nanoid(),
      type,
      content: type === 'checklist' ? [{ text: 'Nova tarefa', checked: false }] :
               type === 'list' ? ['Item 1', 'Item 2'] :
               type === 'table' ? { 
                 headers: ['Coluna 1', 'Coluna 2'], 
                 rows: [['Dado 1', 'Dado 2'], ['Dado 3', 'Dado 4']] 
               } :
               type === 'h1' ? 'Título 1' :
               type === 'h2' ? 'Título 2' :
               'Digite aqui...',
    }
    
    // Adicionar diretamente ao viewer via função global
    // @ts-ignore
    if (window.__addPageElement) {
      // @ts-ignore
      window.__addPageElement(newElement)
      
      toast.success('✓ Elemento adicionado', {
        duration: 1500,
      })
    }
  }

  return (
    <TooltipProvider>
    <div className="w-[240px] sm:w-[320px] md:w-[400px] border-l border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="p-2 sm:p-3 md:p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-semibold">{t('pages.elements.title')}</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 sm:h-7 sm:w-7"
              onClick={onClose}
            >
              <PanelRightClose className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('pages.elements.closeSidebar')}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Categorias de Elementos */}
      <ScrollArea className="flex-1">
        <div className="p-2 sm:p-3 md:p-4 space-y-3 sm:space-y-4 md:space-y-6">
          {/* Seção: Texto */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">
              {t('pages.elements.text')}
            </p>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto py-2 sm:py-3 flex flex-col items-start justify-start text-left"
                    onClick={() => addElement('h1')}
                  >
                    <Heading1 className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
                    <span className="text-[10px] sm:text-xs font-medium">{t('pages.elements.heading1')}</span>
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground hidden sm:inline">{t('pages.elements.heading1Desc')}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{t('pages.elements.addHeading1')}</p></TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto py-2 sm:py-3 flex flex-col items-start justify-start text-left"
                    onClick={() => addElement('h2')}
                  >
                    <Heading2 className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
                    <span className="text-[10px] sm:text-xs font-medium">{t('pages.elements.heading2')}</span>
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground hidden sm:inline">{t('pages.elements.heading2Desc')}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{t('pages.elements.addHeading2')}</p></TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto py-2 sm:py-3 flex flex-col items-start justify-start col-span-2 text-left"
                    onClick={() => addElement('text')}
                  >
                    <Type className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
                    <span className="text-[10px] sm:text-xs font-medium">{t('pages.elements.paragraph')}</span>
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground hidden sm:inline">{t('pages.elements.paragraphDesc')}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{t('pages.elements.addParagraph')}</p></TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Seção: Listas */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">
              {t('pages.elements.lists')}
            </p>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto py-2 sm:py-3 flex flex-col items-start justify-start text-left"
                    onClick={() => addElement('list')}
                  >
                    <List className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
                    <span className="text-[10px] sm:text-xs font-medium">{t('pages.elements.list')}</span>
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground hidden sm:inline">{t('pages.elements.listDesc')}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{t('pages.elements.addList')}</p></TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto py-2 sm:py-3 flex flex-col items-start justify-start text-left"
                    onClick={() => addElement('checklist')}
                  >
                    <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
                    <span className="text-[10px] sm:text-xs font-medium">{t('pages.elements.checklist')}</span>
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground hidden sm:inline">{t('pages.elements.checklistDesc')}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{t('pages.elements.addChecklist')}</p></TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Seção: Avançado */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">
              {t('pages.elements.advanced')}
            </p>
            <div className="space-y-1.5 sm:space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-auto py-2 sm:py-3 flex items-start justify-start text-left"
                    onClick={() => addElement('table')}
                  >
                    <TableIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 mt-0.5" />
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] sm:text-xs font-medium">{t('pages.elements.table')}</span>
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground hidden sm:inline">
                        {t('pages.elements.tableDesc')}
                      </span>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{t('pages.elements.addTable')}</p></TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer com dica */}
      <div className="p-2 sm:p-3 md:p-4 border-t border-border bg-muted/30">
        <div className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
          <FileText className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
          <p className="hidden sm:block">
            {t('pages.elements.hint')}
          </p>
          <p className="sm:hidden">
            {t('pages.elements.hintMobile')}
          </p>
        </div>
      </div>
    </div>
    </TooltipProvider>
  )
}
