import { useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DocumentDialog } from '@/components/document-dialog'
import { useDocuments } from '@/hooks/use-documents'
import { useProjects } from '@/hooks/use-projects'
import { FileText, Search, Download, Share2, MoreVertical, Pencil, Trash2, AlertCircle } from 'lucide-react'
import type { Document, DocumentCategory } from '@/types/database'
import type { DocumentFormData } from '@/lib/validations/document'

const categoryColors: Record<DocumentCategory, string> = {
  PDF: 'bg-red-500/10 text-red-400 border-red-500/20',
  Word: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PowerPoint: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Excel: 'bg-green-500/10 text-green-400 border-green-500/20',
  Image: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Other: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
}

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return '-'
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)} MB`
}

export default function DocumentsPage() {
  const { documents, loading, error, createDocument, updateDocument, deleteDocument } = useDocuments()
  const { projects } = useProjects()
  const [searchQuery, setSearchQuery] = useState('')

  // Filtrar documentos por busca
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents
    
    const query = searchQuery.toLowerCase()
    return documents.filter((doc) =>
      doc.name.toLowerCase().includes(query) ||
      doc.description?.toLowerCase().includes(query) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(query))
    )
  }, [documents, searchQuery])

  // Calcular stats
  const stats = useMemo(() => {
    const total = documents.length
    const totalSize = documents.reduce((acc, doc) => acc + (doc.file_size || 0), 0)
    const shared = documents.filter((doc) => doc.is_shared).length
    
    // Documentos desta semana
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const thisWeek = documents.filter(
      (doc) => new Date(doc.created_at) >= oneWeekAgo
    ).length
    
    return { total, totalSize, shared, thisWeek }
  }, [documents])

  const handleCreateDocument = async (data: DocumentFormData) => {
    await createDocument(data)
  }

  const handleUpdateDocument = (documentId: string) => async (data: DocumentFormData) => {
    await updateDocument(documentId, data)
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      await deleteDocument(documentId)
    }
  }

  // Formatar projetos para select
  const projectOptions = projects.map((p) => ({ id: p.id, name: p.name }))

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Documentos</h1>
            <p className="mt-2 text-slate-400">
              Todos os seus documentos organizados e acessíveis
            </p>
          </div>
          <DocumentDialog onSave={handleCreateDocument} projects={projectOptions} />
        </header>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar documentos..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-50">{stats.total}</div>
              <p className="text-xs text-slate-500">Documentos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Armazenamento</CardTitle>
              <FileText className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-50">
                {formatFileSize(stats.totalSize)}
              </div>
              <p className="text-xs text-slate-500">Total usado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
              <FileText className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-50">{stats.thisWeek}</div>
              <p className="text-xs text-slate-500">Novos uploads</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compartilhados</CardTitle>
              <Share2 className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-50">{stats.shared}</div>
              <p className="text-xs text-slate-500">Com a equipe</p>
            </CardContent>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-sm text-red-400">{error.message}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-slate-400">Carregando documentos...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredDocuments.length === 0 && !searchQuery && (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-50 mb-2">Nenhum documento ainda</h3>
              <p className="text-sm text-slate-400 mb-2 text-center max-w-sm">
                Comece adicionando seu primeiro documento à biblioteca
              </p>
              <p className="text-xs text-slate-500 mb-6 text-center max-w-md">
                Faça upload de PDFs, documentos Word, planilhas Excel, apresentações e imagens
              </p>
              <DocumentDialog onSave={handleCreateDocument} projects={projectOptions} />
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {!loading && filteredDocuments.length === 0 && searchQuery && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-50 mb-2">Nenhum resultado encontrado</h3>
              <p className="text-sm text-slate-400">
                Tente buscar com outros termos
              </p>
            </CardContent>
          </Card>
        )}

        {/* Documents List */}
        {!loading && filteredDocuments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Documentos Recentes</CardTitle>
              <CardDescription>
                {searchQuery ? `${filteredDocuments.length} resultado(s) encontrado(s)` : 'Seus arquivos mais recentes'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:border-indigo-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`rounded-lg p-2 border ${categoryColors[doc.category]}`}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-50 truncate">{doc.name}</p>
                          {doc.is_shared && (
                            <Share2 className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${categoryColors[doc.category]}`}>
                            {doc.category}
                          </span>
                          {doc.file_size && (
                            <>
                              <span>•</span>
                              <span>{formatFileSize(doc.file_size)}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400"
                              >
                                {tag}
                              </span>
                            ))}
                            {doc.tags.length > 3 && (
                              <span className="text-xs text-slate-500">
                                +{doc.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {doc.file_url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(doc.file_url!, '_blank')}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <DocumentDialog
                        document={doc}
                        onSave={handleUpdateDocument(doc.id)}
                        projects={projectOptions}
                        trigger={
                          <Button variant="ghost" size="icon" title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-400 hover:text-red-300"
                        title="Deletar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
