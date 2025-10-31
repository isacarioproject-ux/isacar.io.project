import { useState, FormEvent } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { projectSchema, type ProjectFormData } from '@/lib/validations/project'
import { Plus } from 'lucide-react'
import type { Project, ProjectStatus } from '@/types/database'
import { toast } from 'sonner'
import { useI18n } from '@/hooks/use-i18n'

interface ProjectDialogProps {
  project?: Project | null
  onSave: (data: ProjectFormData) => Promise<void>
  trigger?: React.ReactNode
}

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'Planejamento', label: 'Planejamento' },
  { value: 'Em andamento', label: 'Em andamento' },
  { value: 'Concluído', label: 'Concluído' },
  { value: 'Pausado', label: 'Pausado' },
  { value: 'Cancelado', label: 'Cancelado' },
]

const colorOptions = [
  { value: 'indigo', label: 'Indigo' },
  { value: 'blue', label: 'Azul' },
  { value: 'green', label: 'Verde' },
  { value: 'amber', label: 'Âmbar' },
  { value: 'red', label: 'Vermelho' },
  { value: 'violet', label: 'Violeta' },
  { value: 'pink', label: 'Rosa' },
]

export function ProjectDialog({ project, onSave, trigger }: ProjectDialogProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<ProjectFormData>({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'Planejamento',
    progress: project?.progress || 0,
    team_size: project?.team_size || 1,
    due_date: project?.due_date || '',
    color: project?.color || 'indigo',
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      // Validar com Zod
      const validated = projectSchema.parse(formData)
      
      // Salvar projeto
      await onSave(validated)
      
      // Toast de sucesso
      toast.success(project ? t('common.updated') : t('common.created'), {
        description: project 
          ? t('projects.updated') 
          : t('projects.created')
      })
      
      // Fechar modal e resetar form
      setOpen(false)
      if (!project) {
        setFormData({
          name: '',
          description: '',
          status: 'Planejamento',
          progress: 0,
          team_size: 1,
          due_date: '',
          color: 'indigo',
        })
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
        toast.error(t('common.error'), {
          description: t('projects.validationError')
        })
      } else {
        toast.error(t('common.error'), {
          description: err.message || t('projects.saveError')
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{project ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
          <DialogDescription>
            {project
              ? 'Atualize as informações do seu projeto'
              : 'Crie um novo projeto para organizar seu trabalho'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Nome */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                Nome do Projeto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Website Institucional"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Descrição */}
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva brevemente o projeto"
              />
            </div>

            {/* Status e Progresso */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: string) => setFormData({ ...formData, status: value as ProjectStatus })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="progress">Progresso (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Equipe e Data */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="team_size">Tamanho da Equipe</Label>
                <Input
                  id="team_size"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.team_size || 1}
                  onChange={(e) => setFormData({ ...formData, team_size: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="due_date">Data de Entrega</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date || ''}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>

            {/* Cor */}
            <div className="grid gap-2">
              <Label htmlFor="color">Cor do Projeto</Label>
              <Select
                value={formData.color}
                onValueChange={(value: string) => setFormData({ ...formData, color: value })}
              >
                <SelectTrigger id="color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : project ? 'Atualizar' : 'Criar Projeto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
