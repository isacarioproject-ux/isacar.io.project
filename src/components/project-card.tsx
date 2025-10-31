import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreVertical, Calendar, Users, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Project } from '@/types/database'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { fadeInUp, cardHover } from '@/lib/animations'

const statusColors = {
  planning: 'bg-blue-500',
  in_progress: 'bg-purple-500',
  completed: 'bg-green-500',
  on_hold: 'bg-orange-500',
}

const statusLabels = {
  planning: 'Planejamento',
  in_progress: 'Em Progresso',
  completed: 'Concluído',
  on_hold: 'Pausado',
}

interface ProjectCardProps {
  project: any
  onEdit: () => void
  onDelete: () => void
}

export const ProjectCard = ({ project, onEdit, onDelete }: ProjectCardProps) => {
  return (
    <motion.div
      {...fadeInUp}
      whileHover="hover"
      whileTap="tap"
      variants={cardHover}
    >
      <Card className="group relative hover:shadow-lg transition-all hover-lift">
      <div
        className={cn(
          'absolute left-0 top-0 h-full w-1 rounded-l-lg',
          statusColors[project.status as keyof typeof statusColors]
        )}
      />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1">{project.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {project.description && (
          <CardDescription className="line-clamp-2">
            {project.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-1.5" />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{project.team_size || 0} membros</span>
          </div>
          {project.due_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {new Date(project.due_date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                })}
              </span>
            </div>
          )}
        </div>
        <Badge variant="secondary" className="text-xs">
          {statusLabels[project.status as keyof typeof statusLabels] || project.status}
        </Badge>
      </CardContent>
    </Card>
    </motion.div>
  )
}
