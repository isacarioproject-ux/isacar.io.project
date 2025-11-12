import { updateTask, deleteTask, getUsers } from '@/lib/tasks/tasks-storage';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Task, User } from '@/types/tasks';
import { TaskRowActionsPopover } from '@/components/tasks/task-row-actions-popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '@/contexts/workspace-context';
import { useI18n } from '@/hooks/use-i18n';

export interface TaskRowProps {
  task: Task;
  onTaskClick: (taskId: string) => void;
  onUpdate: () => void;
  simplified?: boolean;
}

export function TaskRow({ task, onTaskClick, onUpdate, simplified = false }: TaskRowProps) {
  const { t } = useI18n();
  const { currentWorkspace } = useWorkspace();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getUsers().then(setUsers).catch(console.error);
  }, []);

  const assignees = users.filter(u => task.assignee_ids.includes(u.id));
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = task.due_date && task.due_date < today && task.status !== 'done';

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    const updates: Partial<Task> = {
      status: newStatus,
      completed_at: newStatus === 'done' ? new Date().toISOString() : null,
    };
    
    updateTask(task.id, updates);
    toast.success(newStatus === 'done' ? 'Tarefa concluída!' : 'Tarefa reaberta');
    onUpdate();
  };

  const priorityIcons: Record<string, string> = {
    urgent: '🔴',
    high: '🏳️',
    medium: '🟡',
    low: '🟢',
  };

  const priorityLabels: Record<string, string> = {
    urgent: 'Urgente',
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa',
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  return (
    <div
      className="group flex items-center gap-1.5 py-1 px-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md cursor-pointer transition-colors w-full"
      onClick={() => onTaskClick(task.id)}
    >
      {/* Checkbox Status */}
      <div 
        onClick={(e) => {
          e.stopPropagation();
          handleStatusToggle(e);
        }}
      >
        <Checkbox 
          checked={task.status === 'done'} 
          onCheckedChange={(checked) => {
            const newStatus: 'done' | 'todo' = checked ? 'done' : 'todo';
            const updates: Partial<Task> = {
              status: newStatus,
              completed_at: newStatus === 'done' ? new Date().toISOString() : null,
            };
            updateTask(task.id, updates);
            toast.success(newStatus === 'done' ? 'Tarefa concluída!' : 'Tarefa reaberta');
            onUpdate();
          }}
        />
      </div>

      {/* Título */}
      <div className="flex-1 min-w-0">
        <div
          className={`text-xs truncate ${
            task.status === 'done' ? 'line-through text-gray-400 dark:text-gray-500' : 'dark:text-gray-100'
          }`}
        >
          {task.title}
        </div>

        {/* Badges/Localização - Ocultar em cards pequenos */}
        {!simplified && (
          <div className="hidden 2xl:flex items-center gap-0.5 mt-0.5">
            {task.location && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Badge variant="secondary" className="text-[9px] h-3.5 px-1 py-0 cursor-default">
                        {task.location}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{task.location}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {task.workspace && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-[9px] text-gray-500 dark:text-gray-400 truncate max-w-[60px] cursor-default">{task.workspace}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{task.workspace}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </div>

      {/* Responsáveis - Mostrar apenas 1 avatar */}
      {!simplified && assignees.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="hidden lg:flex items-center gap-0.5 cursor-default">
                <Avatar className="size-3.5">
                  <AvatarFallback className="text-[7px]">{assignees[0].avatar || assignees[0].name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                {assignees.length > 1 && (
                  <span className="text-[9px] text-gray-500">+{assignees.length - 1}</span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {assignees.map(assignee => (
                  <p key={assignee.id}>{assignee.name}</p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Data de Vencimento - Compacta */}
      {!simplified && task.due_date && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`hidden lg:flex items-center gap-0.5 text-[10px] cursor-default ${
                  isOverdue ? 'text-red-500 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Calendar className="size-2.5" />
                <span className="whitespace-nowrap">{formatDate(task.due_date)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Data de vencimento: {new Date(task.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              {isOverdue && <p className="text-red-500 font-semibold mt-1">⚠️ Atrasada</p>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Prioridade - Menor */}
      {!simplified && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="hidden xl:flex items-center text-[11px] leading-none cursor-default">
                {priorityIcons[task.priority]}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Prioridade: {priorityLabels[task.priority]}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Ações - Ícone único de Settings com Popover Moderno - Sempre visível em mobile */}
      <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center flex-shrink-0">
        <TaskRowActionsPopover task={task} onUpdate={onUpdate} />
      </div>
    </div>
  );
}
