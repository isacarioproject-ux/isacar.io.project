import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, UserPlus, Trash2, Crown, Loader2 } from 'lucide-react'
import { useWhiteboardCollaborators } from '@/hooks/use-whiteboard-collaborators'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface AddCollaboratorsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  whiteboardId?: string
  whiteboardName?: string
  ownerId?: string
}

export function AddCollaboratorsDialog({
  open,
  onOpenChange,
  whiteboardId,
  whiteboardName,
  ownerId
}: AddCollaboratorsDialogProps) {
  const [email, setEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const { collaborators, loading, addCollaborator, removeCollaborator, refresh } = useWhiteboardCollaborators(
    whiteboardId,
    ownerId
  )

  const handleAddCollaborator = async () => {
    if (!email.trim()) return

    setAdding(true)
    const success = await addCollaborator(email.trim())
    setAdding(false)

    if (success) {
      setEmail('')
      await refresh()
    }
  }

  const handleRemoveCollaborator = async (userId: string) => {
    const success = await removeCollaborator(userId)
    setRemovingId(null)

    if (success) {
      await refresh()
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gerenciar Colaboradores
            </DialogTitle>
            <DialogDescription>
              {whiteboardName && `Adicione ou remova colaboradores de "${whiteboardName}"`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Adicionar Colaborador */}
            <div className="space-y-2">
              <Label htmlFor="collaborator-email">Email do Colaborador</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="collaborator-email"
                    type="email"
                    placeholder="usuario@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddCollaborator()
                      }
                    }}
                    className="pl-9"
                    disabled={adding}
                  />
                </div>
                <Button
                  onClick={handleAddCollaborator}
                  disabled={!email.trim() || adding}
                  size="icon"
                  className="shrink-0"
                >
                  {adding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                O usuário deve estar cadastrado e ter aceitado o convite da equipe
              </p>
            </div>

            <Separator />

            {/* Lista de Colaboradores */}
            <div className="space-y-2">
              <Label>Colaboradores Atuais ({collaborators.length})</Label>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : collaborators.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum colaborador ainda
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {collaborators.map((collab) => (
                    <div
                      key={collab.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={collab.avatar} alt={collab.name} />
                          <AvatarFallback>
                            {getInitials(collab.name || collab.email)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {collab.name || collab.email}
                            </p>
                            {collab.role === 'owner' && (
                              <Crown className="h-3 w-3 text-yellow-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {collab.email}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={collab.role === 'owner' ? 'default' : 'secondary'}>
                            {collab.role === 'owner' ? 'Proprietário' : 'Editor'}
                          </Badge>

                          {collab.role !== 'owner' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setRemovingId(collab.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Remoção */}
      <AlertDialog open={!!removingId} onOpenChange={(open) => !open && setRemovingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Colaborador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este colaborador?
              Ele perderá acesso imediato ao whiteboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removingId && handleRemoveCollaborator(removingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
