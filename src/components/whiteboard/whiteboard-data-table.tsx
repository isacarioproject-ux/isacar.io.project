import { memo } from 'react'
import { motion } from 'framer-motion'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Heart, Loader2, MoreVertical, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Whiteboard, WhiteboardStatus } from '@/types/whiteboard'

export interface CollaboratorProfileSummary {
  id: string
  name?: string | null
  avatarUrl?: string | null
}

export interface TeamSummary {
  id: string
  name?: string | null
}

interface WhiteboardDataTableProps {
  whiteboards: Whiteboard[]
  isLoading?: boolean
  onRowClick?: (board: Whiteboard) => void
  onFavorite?: (board: Whiteboard) => void
  onDelete?: (board: Whiteboard) => void
  collaboratorProfiles?: Record<string, CollaboratorProfileSummary>
  teamMap?: Record<string, TeamSummary>
}

const statusVariant: Record<WhiteboardStatus, string> = {
  active: 'bg-emerald-500/90 hover:bg-emerald-500 text-white',
  draft: 'bg-slate-500/90 hover:bg-slate-500 text-white',
  archived: 'bg-amber-500/90 hover:bg-amber-500 text-white',
}

const formatDate = (date?: string | null) => {
  if (!date) return '—'
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date))
  } catch {
    return '—'
  }
}

const getInitials = (name?: string | null) => {
  if (!name) return '??'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export const WhiteboardDataTable = memo(({
  whiteboards,
  isLoading = false,
  onRowClick,
  onFavorite,
  onDelete,
  collaboratorProfiles,
  teamMap,
}: WhiteboardDataTableProps) => {
  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.25 },
    }),
  }

  const renderCollaborators = (board: Whiteboard) => {
    const collaboratorIds = board.collaborators?.length ? board.collaborators : [board.user_id]
    return (
      <div className="flex -space-x-2">
        {collaboratorIds.slice(0, 4).map((id, index) => {
          const info = collaboratorProfiles?.[id]
          return (
            <Avatar key={`${id}-${index}`} className="h-7 w-7 border-2 border-background">
              {info?.avatarUrl ? (
                <AvatarImage src={info.avatarUrl} alt={info.name ?? 'Colaborador'} />
              ) : null}
              <AvatarFallback className="text-xs">
                {getInitials(info?.name)}
              </AvatarFallback>
            </Avatar>
          )
        })}
        {collaboratorIds.length > 4 ? (
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs text-muted-foreground">
            +{collaboratorIds.length - 4}
          </div>
        ) : null}
      </div>
    )
  }

  const renderRows = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando whiteboards...
            </div>
          </TableCell>
        </TableRow>
      )
    }

    if (!whiteboards.length) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
            Nenhum whiteboard encontrado.
          </TableCell>
        </TableRow>
      )
    }

    return whiteboards.map((board, index) => (
      <motion.tr
        key={board.id}
        custom={index}
        initial="hidden"
        animate="visible"
        variants={rowVariants}
        onClick={() => onRowClick?.(board)}
        className="cursor-pointer border-b border-border transition-colors hover:bg-muted/50"
      >
        <TableCell className="text-sm font-medium text-foreground">
          {board.name || 'Sem título'}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {board.team_id ? teamMap?.[board.team_id]?.name ?? 'Equipe privada' : 'Pessoal'}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {formatDate(board.created_at)}
        </TableCell>
        <TableCell>{renderCollaborators(board)}</TableCell>
        <TableCell>
          <Badge className={cn('text-xs', statusVariant[board.status])}>
            {board.status === 'active' && 'Ativo'}
            {board.status === 'draft' && 'Rascunho'}
            {board.status === 'archived' && 'Arquivado'}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={(event) => event.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation()
                  onFavorite?.(board)
                }}
                className="flex items-center gap-2 text-sm"
              >
                <Heart className={cn('h-4 w-4', board.is_favorite && 'fill-red-500 text-red-500')} />
                {board.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation()
                  onDelete?.(board)
                }}
                className="flex items-center gap-2 text-sm text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </motion.tr>
    ))
  }

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%] text-xs uppercase tracking-wide text-muted-foreground">Nome</TableHead>
              <TableHead className="w-[20%] text-xs uppercase tracking-wide text-muted-foreground">Equipe</TableHead>
              <TableHead className="w-[15%] text-xs uppercase tracking-wide text-muted-foreground">Criado em</TableHead>
              <TableHead className="w-[20%] text-xs uppercase tracking-wide text-muted-foreground">Colaboradores</TableHead>
              <TableHead className="w-[10%] text-xs uppercase tracking-wide text-muted-foreground">Status</TableHead>
              <TableHead className="w-[5%] text-xs uppercase tracking-wide text-muted-foreground text-right">Favorito</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderRows()}</TableBody>
        </Table>
      </div>
    </div>
  )
})

WhiteboardDataTable.displayName = 'WhiteboardDataTable'
