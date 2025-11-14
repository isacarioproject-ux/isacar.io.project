import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/use-i18n'

interface Collaborator {
  id: string
  email: string
  name?: string
  avatar?: string
  online?: boolean
}

interface CollaboratorsAvatarsProps {
  collaborators: Collaborator[]
  maxVisible?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10'
}

export function CollaboratorsAvatars({ 
  collaborators, 
  maxVisible = 3,
  size = 'md',
  className 
}: CollaboratorsAvatarsProps) {
  const { t } = useI18n();
  const visibleCollaborators = collaborators.slice(0, maxVisible)
  const remainingCount = Math.max(0, collaborators.length - maxVisible)

  return (
    <TooltipProvider>
      <div className={cn("flex items-center -space-x-2", className)}>
        {visibleCollaborators.map((collab) => (
          <Tooltip key={collab.id}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar className={cn(
                  sizeClasses[size],
                  "border-2 border-background ring-2 ring-background transition-transform hover:scale-110 hover:z-10"
                )}>
                  <AvatarImage src={collab.avatar} alt={collab.name || collab.email} />
                  <AvatarFallback className="text-xs">
                    {(collab.name || collab.email).substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                {collab.online && (
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 border border-background" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p className="font-medium">{collab.name || collab.email}</p>
              {collab.online && (
                <p className="text-green-500">● {t('common.online')}</p>
              )}
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Remaining count */}
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className={cn(
                sizeClasses[size],
                "border-2 border-background bg-muted cursor-pointer"
              )}>
                <AvatarFallback className="text-xs font-medium">
                  +{remainingCount}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p>{remainingCount} {t('whiteboard.moreCollaborators')}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
