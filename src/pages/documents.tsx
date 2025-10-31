import { useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DocumentCard } from '@/components/document-card'
import { StatsCard } from '@/components/stats-card'
import { StatsSkeleton, CardSkeleton } from '@/components/loading-skeleton'
import { EmptyState } from '@/components/empty-state'
import { DocumentDialog } from '@/components/document-dialog'
import { useDocuments } from '@/hooks/use-documents'
import { useProjects } from '@/hooks/use-projects'
import { FileText, Search, Share2, Upload, AlertCircle, HardDrive, Clock } from 'lucide-react'
import type { DocumentFormData } from '@/lib/validations/document'
import { useI18n } from '@/hooks/use-i18n'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return '-'
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)} MB`
}

export default function DocumentsPage() {
  const { t } = useI18n()
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
    if (window.confirm(t('documents.deleteConfirm'))) {
      await deleteDocument(documentId)
    }
  }

  // Formatar projetos para select
  const projectOptions = projects.map((p) => ({ id: p.id, name: p.name }))

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 lg:p-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">{t('nav.dashboard')}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('documents.title')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <DocumentDialog
            onSave={handleCreateDocument}
            projects={projectOptions}
            trigger={
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                {t('documents.upload')}
              </Button>
            }
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('documents.search')}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error.message}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <StatsSkeleton key={i} />
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <StatsCard title={t('documents.stats.total')} value={stats.total} description={t('documents.stats.totalDesc')} icon={FileText} />
              <StatsCard title={t('documents.stats.storage')} value={formatFileSize(stats.totalSize)} description={t('documents.stats.storageDesc')} icon={HardDrive} />
              <StatsCard title={t('documents.stats.thisWeek')} value={stats.thisWeek} description={t('documents.stats.thisWeekDesc')} icon={Clock} />
              <StatsCard title={t('documents.stats.shared')} value={stats.shared} description={t('documents.stats.sharedDesc')} icon={Share2} />
            </div>

            {/* Empty State */}
            {filteredDocuments.length === 0 && !searchQuery ? (
              <EmptyState
                icon={FileText}
                title={t('documents.empty.title')}
                description={t('documents.empty.description')}
                action={
                  <DocumentDialog
                    onSave={handleCreateDocument}
                    projects={projectOptions}
                    trigger={
                      <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Fazer Upload
                      </Button>
                    }
                  />
                }
              />
            ) : filteredDocuments.length === 0 && searchQuery ? (
              <EmptyState
                icon={Search}
                title="Nenhum resultado encontrado"
                description="Tente buscar com outros termos"
                compact
              />
            ) : (
              /* Documents Grid */
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onDownload={() => doc.file_url && window.open(doc.file_url, '_blank')}
                    onEdit={() => {}}
                    onShare={() => {}}
                    onDelete={() => handleDeleteDocument(doc.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
