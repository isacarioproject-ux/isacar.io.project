import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { TaskWithDetails } from '@/types/tasks';
import { getTaskWithDetails, getTasks, deleteTask } from '@/lib/tasks/tasks-storage';
import { TaskDetailView } from '@/components/tasks/task-detail-view';
import { TaskActivitySidebar } from '@/components/tasks/task-activity-sidebar';
import { TaskModalSkeleton } from '@/components/tasks/task-modal-skeleton';
import { ChevronLeft, ChevronRight, Share2, Sparkles, X, MoreVertical, Maximize2, Minimize2, ListChecks, Star, Link as LinkIcon, Grid3x3, List, CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useI18n } from '@/hooks/use-i18n';

interface TaskModalProps {
  taskId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function TaskModal({ taskId, open, onClose, onUpdate }: TaskModalProps) {
  const { t } = useI18n();
  const [task, setTask] = useState<TaskWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [allTaskIds, setAllTaskIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showActivitySidebar, setShowActivitySidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!taskId) return;

    // Simular loading
    setLoading(true);
    
    // Carregar tarefa de forma assíncrona
    const loadTask = async () => {
      try {
        const taskData = await getTaskWithDetails(taskId);
        if (taskData) {
          setTask(taskData);
        }
      } catch (error) {
        console.error('Erro ao carregar tarefa:', error);
        toast.error(t('tasks.modal.loadError'));
      } finally {
        setLoading(false);
      }
    };

    loadTask();

    // Carregar lista de IDs de tarefas para navegação
    getTasks().then(allTasks => {
      const ids = allTasks.map(t => t.id);
      setAllTaskIds(ids);
      setCurrentIndex(ids.indexOf(taskId));
    }).catch(console.error);
  }, [taskId]);

  const handleRefresh = async () => {
    if (!taskId) return;
    try {
      const taskData = await getTaskWithDetails(taskId);
      if (taskData) {
        setTask(taskData);
      }
      onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error(t('tasks.modal.updateError'));
    }
  };

  const handleNavigate = async (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < allTaskIds.length) {
      const newTaskId = allTaskIds[newIndex];
      try {
        const taskData = await getTaskWithDetails(newTaskId);
        if (taskData) {
          setTask(taskData);
          setCurrentIndex(newIndex);
        }
      } catch (error) {
        console.error('Erro ao navegar para tarefa:', error);
      }
    }
  };

  const handleDelete = () => {
    if (!task) return;
    if (confirm(t('tasks.modal.deleteConfirm'))) {
      deleteTask(task.id);
      toast.success(t('tasks.modal.deleteSuccess'));
      onClose();
      onUpdate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        showClose={false} 
        className={cn(
          "p-0 gap-0",
          isMaximized 
            ? "!fixed !inset-0 !w-screen !max-w-none !h-screen !top-0 !left-0 !right-0 !bottom-0 !translate-x-0 !translate-y-0 !transform-none !m-0 !rounded-none" 
            : isMobile
              ? "!fixed !inset-0 !w-screen !max-w-none !h-screen !top-0 !left-0 !right-0 !bottom-0 !translate-x-0 !translate-y-0 !transform-none !m-0 !rounded-none"
              : "!w-[57rem] !max-w-[95vw] !h-[75vh]"
        )}
      >
        {/* Mostrar Skeleton durante loading */}
        {loading || !task ? (
          <TaskModalSkeleton />
        ) : (
          <>
            {/* Header com Ícone Animado - Compacto em mobile */}
            <div className="flex items-center justify-between px-1 md:px-2 py-1.5 border-b dark:border-gray-800 bg-white dark:bg-gray-950">
              <div className="flex items-center gap-0.5 md:gap-2 flex-shrink-0">
                {/* Ícone Animado + Badge - Ocultar ícone em mobile */}
                <div className="flex items-center gap-1 md:gap-2">
                  {/* Ícone CheckSquare - Apenas Desktop */}
                  <motion.div
                    className="hidden md:block"
                    animate={{
                  scale: task.status === 'todo' ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              >
                <CheckSquare className="size-4 text-blue-600 dark:text-blue-400" />
              </motion.div>
              {/* Badge - Apenas Desktop */}
              {task.subtasks && task.subtasks.length > 0 && (
                <motion.div
                  className="hidden md:block"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <Badge variant="secondary" className="text-xs h-5 px-1.5">
                    {task.subtasks.length}
                  </Badge>
                </motion.div>
              )}
            </div>
            {/* Navegação com Micro-interações */}
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 md:h-10 md:w-10"
                      onClick={() => handleNavigate('prev')}
                      disabled={currentIndex === 0}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>{t('tasks.modal.previous')}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 md:h-10 md:w-10"
                      onClick={() => handleNavigate('next')}
                      disabled={currentIndex === allTaskIds.length - 1}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>{t('tasks.modal.next')}</TooltipContent>
              </Tooltip>
            </div>

            {/* Localização e Data - Ocultos em mobile para economizar espaço */}
          </div>

          <div className="flex items-center gap-0 md:gap-0.5 flex-shrink-0">
            {/* Favorito com Animação */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 md:h-10 md:w-10"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <motion.div
                      animate={{
                        rotate: isFavorite ? [0, -10, 10, -10, 0] : 0,
                        scale: isFavorite ? [1, 1.2, 1] : 1
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <Star className={`size-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </motion.div>
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>{t('tasks.modal.favorite')}</TooltipContent>
            </Tooltip>

            {/* Toggle Subtarefas com Animação */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant={showSubtasks ? "secondary" : "ghost"} 
                    size="icon"
                    className="h-8 w-8 md:h-10 md:w-10"
                    onClick={() => setShowSubtasks(!showSubtasks)}
                  >
                    <ListChecks className="size-4" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>{t('tasks.modal.subtasks')}</TooltipContent>
            </Tooltip>

            {/* Toggle Chat/Atividade (Mobile) */}
            {isMobile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant={showActivitySidebar ? "secondary" : "ghost"} 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowActivitySidebar(!showActivitySidebar)}
                    >
                      <Grid3x3 className="size-4" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>{t('tasks.modal.chatActivity')}</TooltipContent>
              </Tooltip>
            )}

            {/* Ações AI - Hidden on mobile */}
            {!isMobile && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="ghost" size="sm">
                  <Sparkles className="size-4 mr-2" />
                  {t('tasks.modal.askQuestion')}
                </Button>
              </motion.div>
            )}

            {/* Maximizar com Animação */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={() => setIsMaximized(!isMaximized)}>
                    {isMaximized ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>{isMaximized ? t('tasks.modal.restore') : t('tasks.modal.maximize')}</TooltipContent>
            </Tooltip>

            {/* Compartilhar com Animação */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                    <Share2 className="size-4" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>{t('tasks.modal.share')}</TooltipContent>
            </Tooltip>

            {/* Menu 3 Pontos com Animação */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="size-4" />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>{t('tasks.modal.moreOptions')}</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>{t('tasks.modal.duplicate')}</DropdownMenuItem>
                <DropdownMenuItem>{t('tasks.modal.archive')}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  {t('tasks.modal.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Fechar com Animação */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="size-4" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>{t('tasks.modal.close')}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Conteúdo - Layout de 3 Colunas */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Esquerda - Subtarefas (Colapsável) */}
          {showSubtasks && (
            <div className={cn(
              "border-r bg-gray-50 dark:bg-gray-950 flex flex-col",
              isMobile ? "absolute inset-0 z-10 w-full" : "w-64"
            )}>
              <div className="p-4 border-b dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium flex items-center gap-2 dark:text-white">
                    <ListChecks className="size-4" />
                    {t('tasks.modal.subtasks')}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="size-6"
                    onClick={() => setShowSubtasks(false)}
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm dark:text-gray-300">Nova Tarefa</span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2">
                        + {t('tasks.modal.addSubtask')}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{t('tasks.modal.addSubtask')}</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          )}

          {/* Coluna Central - Detalhes */}
          <div className="flex-1 overflow-y-auto">
            <TaskDetailView task={task} onUpdate={handleRefresh} />
          </div>

          {/* Coluna Direita - Atividade/Links */}
          {(isMobile ? showActivitySidebar : true) && (
          <div className={cn(
            "flex-shrink-0 border-l flex flex-col",
            isMobile ? "absolute inset-0 z-10 w-full bg-white dark:bg-black" : "w-80"
          )}>
            {/* Sidebar com Tabs integradas */}
            {isMobile && (
              <div className="p-2 border-b dark:border-gray-800">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-8"
                  onClick={() => setShowActivitySidebar(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}
            <TaskActivitySidebar
              taskId={task.id}
              comments={task.comments || []}
              activities={task.activities || []}
              links={task.links || []}
              onUpdate={handleRefresh}
            />
          </div>
          )}
        </div>

        <DialogDescription className="sr-only">
          Visualização detalhada da tarefa
        </DialogDescription>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}