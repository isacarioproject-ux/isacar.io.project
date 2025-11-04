import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { 
  Download, 
  FileText, 
  FileCode, 
  Copy, 
  Printer,
  BarChart3,
} from 'lucide-react'
import { toast } from 'sonner'
import { useI18n } from '@/hooks/use-i18n'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  exportToPDF,
  exportToMarkdown,
  exportToHTML,
  exportToText,
  downloadFile,
  copyToClipboard,
  getDocumentStats,
} from '@/lib/export-utils'

interface ExportMenuProps {
  title: string
  elements: any[]
}

export const ExportMenu = ({ title, elements }: ExportMenuProps) => {
  const { t } = useI18n()
  const [showStats, setShowStats] = useState(false)
  const [exporting, setExporting] = useState(false)

  const stats = getDocumentStats(elements)

  const handleExport = async (format: 'pdf' | 'markdown' | 'html' | 'text') => {
    if (elements.length === 0) {
      toast.error(t('pages.export.emptyPage'), {
        description: t('pages.export.addContent'),
      })
      return
    }

    setExporting(true)
    try {
      switch (format) {
        case 'pdf':
          await exportToPDF({ title, content: elements, format })
          toast.success(t('pages.export.pdfExported'))
          break
        
        case 'markdown':
          const md = exportToMarkdown({ title, content: elements, format })
          downloadFile(md, `${title}.md`, 'text/markdown')
          toast.success(t('pages.export.markdownExported'))
          break
        
        case 'html':
          const html = exportToHTML({ title, content: elements, format })
          downloadFile(html, `${title}.html`, 'text/html')
          toast.success(t('pages.export.htmlExported'))
          break
        
        case 'text':
          const text = exportToText({ title, content: elements, format })
          downloadFile(text, `${title}.txt`, 'text/plain')
          toast.success(t('pages.export.textExported'))
          break
      }
    } catch (err) {
      toast.error(t('pages.export.errorExport'), {
        description: t('pages.export.tryAgain'),
      })
    } finally {
      setExporting(false)
    }
  }

  const handleCopyMarkdown = async () => {
    const md = exportToMarkdown({ title, content: elements, format: 'markdown' })
    const success = await copyToClipboard(md)
    
    if (success) {
      toast.success(t('pages.export.copied'))
    } else {
      toast.error(t('pages.export.errorCopy'))
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9"
                disabled={exporting}
              >
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('pages.export.title')}</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
            {t('pages.export.export')}
          </DropdownMenuLabel>
          
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <FileText className="mr-2 h-4 w-4 text-red-500" />
            {t('pages.export.pdf')}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleExport('markdown')}>
            <FileCode className="mr-2 h-4 w-4 text-blue-500" />
            {t('pages.export.markdown')}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleExport('html')}>
            <FileCode className="mr-2 h-4 w-4 text-orange-500" />
            {t('pages.export.html')}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleExport('text')}>
            <FileText className="mr-2 h-4 w-4 text-gray-500" />
            {t('pages.export.text')}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleCopyMarkdown}>
            <Copy className="mr-2 h-4 w-4" />
            {t('pages.export.copyMarkdown')}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            {t('pages.export.print')}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowStats(true)}>
            <BarChart3 className="mr-2 h-4 w-4" />
            {t('pages.export.stats')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de Estatísticas */}
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('pages.export.docStats')}</DialogTitle>
            <DialogDescription>
              {title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium">{t('pages.export.words')}</span>
              <span className="text-2xl font-bold">{stats.wordCount.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium">{t('pages.export.characters')}</span>
              <span className="text-2xl font-bold">{stats.charCount.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium">{t('pages.export.elements')}</span>
              <span className="text-2xl font-bold">{stats.elementCount}</span>
            </div>

            <div className="pt-2 text-xs text-muted-foreground">
              <p>{t('pages.export.readTime').replace('{time}', Math.ceil(stats.wordCount / 200).toString())}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </TooltipProvider>
    </>
  )
}
