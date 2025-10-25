import { useState, FormEvent } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileUpload } from '@/components/file-upload'
import { useFileUpload } from '@/hooks/use-file-upload'
import { documentSchema, type DocumentFormData } from '@/lib/validations/document'
import { Plus, Loader2 } from 'lucide-react'
import type { Document, DocumentCategory } from '@/types/database'

interface DocumentDialogProps {
  document?: Document | null
  onSave: (data: DocumentFormData) => Promise<void>
  trigger?: React.ReactNode
  projects?: Array<{ id: string; name: string }>
}

const categoryOptions: { value: DocumentCategory; label: string }[] = [
  { value: 'PDF', label: 'PDF' },
  { value: 'Word', label: 'Word (DOC/DOCX)' },
  { value: 'Excel', label: 'Excel (XLS/XLSX)' },
  { value: 'PowerPoint', label: 'PowerPoint (PPT/PPTX)' },
  { value: 'Image', label: 'Imagem' },
  { value: 'Other', label: 'Outro' },
]

export function DocumentDialog({ document, onSave, trigger, projects = [] }: DocumentDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { uploading, progress, uploadFile } = useFileUpload()
  
  const [formData, setFormData] = useState<DocumentFormData>({
    name: document?.name || '',
    description: document?.description || '',
    project_id: document?.project_id || null,
    category: document?.category || 'Other',
    tags: document?.tags || [],
    file_url: document?.file_url || null,
    file_type: document?.file_type || null,
    file_size: document?.file_size || null,
  })

  const [tagInput, setTagInput] = useState('')

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file)
    if (file) {
      // Detectar categoria baseada no tipo de arquivo
      let category: DocumentCategory = 'Other'
      if (file.type.includes('pdf')) category = 'PDF'
      else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) category = 'Word'
      else if (file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) category = 'Excel'
      else if (file.type.includes('powerpoint') || file.name.endsWith('.pptx') || file.name.endsWith('.ppt')) category = 'PowerPoint'
      else if (file.type.startsWith('image/')) category = 'Image'

      setFormData(prev => ({
        ...prev,
        name: prev.name || file.name,
        category,
        file_type: file.type,
        file_size: file.size,
      }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      let fileUrl = formData.file_url
      
      // Se tem arquivo selecionado, fazer upload primeiro
      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile)
        if (!fileUrl) {
          throw new Error('Erro ao fazer upload do arquivo')
        }
      }
      
      // Validar com Zod
      const validated = documentSchema.parse({
        ...formData,
        file_url: fileUrl,
      })
      
      // Salvar documento
      await onSave(validated)
      
      // Fechar modal e resetar form
      setOpen(false)
      if (!document) {
        setFormData({
          name: '',
          description: '',
          project_id: null,
          category: 'Other',
          tags: [],
          file_url: null,
          file_type: null,
          file_size: null,
        })
        setTagInput('')
      }
    } catch (err: any) {
      if (err.errors) {
        // Erros de validação Zod
        const fieldErrors: Record<string, string> = {}
        err.errors.forEach((error: any) => {
          const field = error.path[0]
          fieldErrors[field] = error.message
        })
        setErrors(fieldErrors)
      } else {
        console.error('Erro ao salvar documento:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Documento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{document ? 'Editar Documento' : 'Novo Documento'}</DialogTitle>
          <DialogDescription>
            {document
              ? 'Atualize as informações do documento'
              : 'Adicione um novo documento à sua biblioteca'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-3 py-2">
            {/* Nome */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                Nome do Documento <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Relatório Anual 2024"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Descrição */}
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o documento"
              />
            </div>

            {/* Categoria e Projeto */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: string) => setFormData({ ...formData, category: value as DocumentCategory })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="project">Vincular a Projeto</Label>
                <Select
                  value={formData.project_id || 'none'}
                  onValueChange={(value: string) => 
                    setFormData({ ...formData, project_id: value === 'none' ? null : value })
                  }
                >
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  placeholder="Digite e pressione Enter"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => {
                    e.preventDefault()
                    handleAddTag()
                  }}
                  className="shrink-0"
                >
                  Adicionar
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 border border-indigo-500/20"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-indigo-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* File Upload */}
            <div className="grid gap-2">
              <Label>Upload de Arquivo</Label>
              <FileUpload
                onFileSelect={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.svg"
                maxSize={10 * 1024 * 1024}
                currentFile={selectedFile}
              />
              {uploading && progress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Fazendo upload...</span>
                    <span>{progress.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-500">
                {selectedFile ? `Arquivo selecionado: ${selectedFile.name}` : 'Tipos aceitos: PDF, Word, Excel, PowerPoint, Imagens'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading || uploading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fazendo upload...
                </>
              ) : loading ? (
                'Salvando...'
              ) : document ? (
                'Atualizar'
              ) : (
                'Criar Documento'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
