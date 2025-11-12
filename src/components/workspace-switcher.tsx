import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  ChevronsUpDown,
  Plus,
  Building2,
  User,
  Settings,
} from 'lucide-react'
import { useWorkspace } from '@/contexts/workspace-context'
import { WorkspaceSettingsDialog } from '@/components/workspace/workspace-settings-dialog'

export function WorkspaceSwitcher() {
  const { t } = useI18n()
  const {
    currentWorkspace,
    workspaces,
    switchWorkspace,
    createWorkspace,
  } = useWorkspace()

  const [open, setOpen] = useState(false)
  const [showNewWorkspaceDialog, setShowNewWorkspaceDialog] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return

    setCreating(true)
    try {
      const workspace = await createWorkspace(newWorkspaceName, newWorkspaceDescription)
      
      if (workspace) {
        setNewWorkspaceName('')
        setNewWorkspaceDescription('')
        setShowNewWorkspaceDialog(false)
        await switchWorkspace(workspace.id)
      }
    } finally {
      setCreating(false)
    }
  }

  const handleSwitchWorkspace = async (workspaceId: string | null) => {
    await switchWorkspace(workspaceId)
    setOpen(false)
  }

  // Workspace atual ou "Pessoal"
  const currentLabel = currentWorkspace?.name || t('workspace.personal')
  const currentInitials = currentWorkspace
    ? currentWorkspace.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'P'

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs bg-primary/10">
                  {currentInitials}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{currentLabel}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[250px] !z-[1000]" align="start">
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
            {t('workspace.label')}
          </DropdownMenuLabel>

          {/* Pessoal (sem workspace) */}
          <DropdownMenuItem
            onClick={() => handleSwitchWorkspace(null)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-1">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-muted">
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <span className="flex-1">{t('workspace.personal')}</span>
              {!currentWorkspace && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>

          {/* Lista de workspaces */}
          {workspaces.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                {t('workspace.teams')}
              </DropdownMenuLabel>
              
              {workspaces.map((workspace) => {
                const initials = workspace.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()

                return (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => handleSwitchWorkspace(workspace.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-primary/10">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{workspace.name}</span>
                          {workspace.user_role === 'owner' && (
                            <Badge variant="secondary" className="h-4 px-1 text-[9px]">
                              {t('workspace.owner')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {currentWorkspace?.id === workspace.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </DropdownMenuItem>
                )
              })}
            </>
          )}

          <DropdownMenuSeparator />

          {/* Criar novo workspace */}
          <DropdownMenuItem
            onClick={() => {
              setOpen(false)
              setShowNewWorkspaceDialog(true)
            }}
            className="cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('workspace.create')}
          </DropdownMenuItem>

          {/* Gerenciar workspace atual */}
          {currentWorkspace && (
            <DropdownMenuItem
              onClick={() => {
                setOpen(false)
                setShowSettings(true)
              }}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              {t('workspace.settings')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog Settings */}
      <WorkspaceSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />

      {/* Dialog Criar Workspace */}
      <Dialog open={showNewWorkspaceDialog} onOpenChange={setShowNewWorkspaceDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('workspace.createNew')}
            </DialogTitle>
            <DialogDescription>
              {t('workspace.createDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">
                {t('workspace.name')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="workspace-name"
                placeholder={t('workspace.namePlaceholder')}
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {t('workspace.nameHelp')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workspace-description">
                {t('workspace.description')}
              </Label>
              <Textarea
                id="workspace-description"
                placeholder={t('workspace.descriptionPlaceholder')}
                value={newWorkspaceDescription}
                onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                className="resize-none"
                rows={3}
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewWorkspaceDialog(false)
                setNewWorkspaceName('')
                setNewWorkspaceDescription('')
              }}
              disabled={creating}
            >
              {t('workspace.cancel')}
            </Button>
            <Button
              onClick={handleCreateWorkspace}
              disabled={!newWorkspaceName.trim() || creating}
            >
              {creating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  {t('workspace.creating')}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('workspace.create')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
