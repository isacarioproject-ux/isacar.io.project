import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Download,
  Edit,
  Trash,
  FilePlus,
  ExternalLink,
  Link2,
  FileText,
  File,
  FileImage,
  FileSpreadsheet,
} from 'lucide-react'
import { Copy } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useI18n } from '@/hooks/use-i18n'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface DocumentWithChildren {
  id: string
  name: string
  file_type: string
  file_size: number
  created_at: string
  file_url: string
  parent_id: string | null
  icon: string | null
  children?: DocumentWithChildren[]
  level?: number
}

interface DocumentRowProps {
  doc: DocumentWithChildren
  onSelectDoc: (id: string) => void
  onRefetch: () => void
  onCreateSubpage: (parentId: string) => void
}

const getFileIcon = (fileType: string, icon?: string | null) => {
  if (icon) return <span className="text-base">{icon}</span>
  if (fileType === 'page') return <FileText className="h-4 w-4 text-blue-500" />
  if (fileType?.includes('image')) return <FileImage className="h-4 w-4 text-purple-500" />
  if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) 
    return <FileSpreadsheet className="h-4 w-4 text-green-500" />
  if (fileType?.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />
  return <File className="h-4 w-4 text-muted-foreground" />
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export const DocumentRow = ({ doc, onSelectDoc, onRefetch, onCreateSubpage }: DocumentRowProps) => {
  const { t } = useI18n()
  const [collapsed, setCollapsed] = useState(false)
  const hasChildren = doc.children && doc.children.length > 0
  const level = doc.level || 0

  const handleDelete = async () => {
    if (!confirm(`${t('pages.confirmDeleteDoc')} "${doc.name}"?${hasChildren ? ' ' + t('pages.deleteSubpages') : ''}`)) return

    try {
      const { error } = await supabase.from('documents').delete().eq('id', doc.id)
      if (error) throw error
      toast.success('Documento excluído')
      onRefetch()
    } catch (err: any) {
      toast.error('Erro ao excluir', { description: err.message })
    }
  }

  return (
    <>
      {/* Linha do documento */}
      <TableRow
        className="cursor-pointer hover:bg-muted/50 transition-colors rounded-xl border-none"
        onClick={() => {
          if (doc.file_type === 'page') {
            onSelectDoc(doc.id)
          } else {
            window.open(doc.file_url, '_blank')
          }
        }}
      >
        {/* Ícone + Nome com indentação */}
        <TableCell className="font-medium border-none" colSpan={2}>
          <div className="flex items-center gap-1" style={{ paddingLeft: `${level * 20}px` }}>
            {/* Botão expand/collapse */}
            {hasChildren && (
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={(e) => {
                  e.stopPropagation()
                  setCollapsed(!collapsed)
                }}
              >
                {collapsed ? (
                  <ChevronRight className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            )}
            
            {/* Espaço se não tem filhos */}
            {!hasChildren && <div className="w-5" />}

            {/* Ícone do arquivo */}
            <div className="flex-shrink-0">
              {getFileIcon(doc.file_type, doc.icon)}
            </div>

            {/* Nome */}
            <span className="text-sm">{doc.name}</span>
          </div>
        </TableCell>

        {/* Ações */}
        <TableCell className="border-none">
          <TooltipProvider>
          <div className="flex items-center justify-end gap-1">
            {/* Botão Nova Subpágina (só para pages) */}
            {doc.file_type === 'page' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation()
                      onCreateSubpage(doc.id)
                    }}
                  >
                    <FilePlus className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Nova subpágina</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Copiar link (só para pages) */}
            {doc.file_type === 'page' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Copiar link da página
                      const pageUrl = `${window.location.origin}${window.location.pathname}#${doc.id}`
                      navigator.clipboard.writeText(pageUrl)
                      toast.success('Link copiado')
                    }}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copiar link</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Abrir/Copiar link (para arquivos) */}
            {doc.file_url && doc.file_type !== 'page' && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(doc.file_url, '_blank')
                  }}
                  title="Abrir em nova aba"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigator.clipboard.writeText(doc.file_url)
                    toast.success('Link copiado')
                  }}
                  title="Copiar link"
                >
                  <Link2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}

            {/* Menu dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Download (só para arquivos) */}
                {doc.file_url && doc.file_type !== 'page' && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      const link = document.createElement('a')
                      link.href = doc.file_url
                      link.download = doc.name
                      link.click()
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Baixar
                  </DropdownMenuItem>
                )}

                {/* Duplicar (só para pages) */}
                {doc.file_type === 'page' && (
                  <DropdownMenuItem
                    onClick={async (e) => {
                      e.stopPropagation()
                      
                      // Buscar documento completo
                      const { data: fullDoc } = await supabase
                        .from('documents')
                        .select('*')
                        .eq('id', doc.id)
                        .single()
                      
                      if (fullDoc) {
                        // Duplicar com novos IDs
                        let elements = []
                        try {
                          const { nanoid } = await import('nanoid')
                          elements = JSON.parse(fullDoc.description || '[]').map((el: any) => ({
                            ...el,
                            id: nanoid(),
                          }))
                        } catch {}

                        const { data: { user } } = await supabase.auth.getUser()
                        
                        const { error } = await supabase
                          .from('documents')
                          .insert({
                            user_id: user?.id,
                            project_id: fullDoc.project_id,
                            parent_id: fullDoc.parent_id,
                            name: `${fullDoc.name} (cópia)`,
                            file_type: 'page',
                            file_size: 0,
                            category: fullDoc.category,
                            file_url: '',
                            description: JSON.stringify(elements),
                            icon: fullDoc.icon,
                            cover_image: fullDoc.cover_image,
                            is_wiki: fullDoc.is_wiki,
                          })
                        
                        if (!error) {
                          toast.success('✓ Página duplicada')
                          onRefetch()
                        } else {
                          toast.error('Erro ao duplicar')
                        }
                      }
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicar
                  </DropdownMenuItem>
                )}

                {/* Renomear */}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    const newName = prompt('Novo nome:', doc.name)
                    if (newName && newName.trim()) {
                      supabase
                        .from('documents')
                        .update({ name: newName.trim() })
                        .eq('id', doc.id)
                        .then(() => {
                          toast.success('Renomeado')
                          onRefetch()
                        })
                    }
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Renomear
                </DropdownMenuItem>

                {/* Deletar */}
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  {t('pages.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          </TooltipProvider>
        </TableCell>
      </TableRow>

      {/* Renderizar filhos (recursivo) */}
      {hasChildren && !collapsed && doc.children!.map((child) => (
        <DocumentRow
          key={child.id}
          doc={child}
          onSelectDoc={onSelectDoc}
          onRefetch={onRefetch}
          onCreateSubpage={onCreateSubpage}
        />
      ))}
    </>
  )
}
