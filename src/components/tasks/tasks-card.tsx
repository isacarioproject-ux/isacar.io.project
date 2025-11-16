import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ResizableCard } from '@/components/ui/resizable-card';
import { useTasksCard } from '@/hooks/tasks/use-tasks-card';
import { TasksGroupView } from '@/components/tasks/tasks-group-view';
import { TasksListView } from '@/components/tasks/tasks-list-view';
import { TasksDelegatedView } from '@/components/tasks/tasks-delegated-view';
import { TaskModal } from '@/components/tasks/task-modal';
import { TaskTemplateSelector } from '@/components/tasks/task-template-selector';
import { QuickAddTaskDialog } from '@/components/tasks/quick-add-task-dialog';
import { TasksExpandedView } from '@/components/tasks/tasks-expanded-view';
import { TasksCardSkeleton, TasksListSkeleton } from '@/components/tasks/tasks-card-skeleton';
import { MoreVertical, Plus, X, CheckSquare, Settings, Maximize2, GripVertical, Sparkles, Bell } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { TaskGroups, Task, TaskTemplate } from '@/types/tasks';
import { createTask, getCurrentUserId } from '@/lib/tasks/tasks-storage';
import { toast } from 'sonner';
import { useI18n } from '@/hooks/use-i18n';

interface TasksCardProps {
  className?: string;
  dragHandleProps?: any;
}

export function TasksCard({ className, dragHandleProps }: TasksCardProps) {
  const { t } = useI18n();
  const {
    tasks,
    activeTab,
    setActiveTab,
    loading,
    refetch,
    toggleGroup,
    isGroupExpanded,
  } = useTasksCard();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [isExpandedViewOpen, setIsExpandedViewOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddInitialTab, setQuickAddInitialTab] = useState<'tarefa' | 'lembrete'>('tarefa');
  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);

  // Calcular total de tarefas para animação
  const totalTasks = Object.values(tasks).flat().length;
  const hasPendingTasks = totalTasks > 0;

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTaskId(null);
  };

  const handleCreateTask = () => {
    setIsTemplateSelectorOpen(true);
  };

  const handleTemplateSelect = async (template: TaskTemplate) => {
    const userId = await getCurrentUserId();
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: template.task.title || 'Nova Tarefa',
      description: template.task.description || '',
      status: template.task.status || 'todo',
      priority: template.task.priority || 'medium',
      due_date: null,
      start_date: null,
      created_at: new Date().toISOString(),
      completed_at: null,
      assignee_ids: [userId],
      created_by: userId,
      tag_ids: [],
      project_id: null,
      list_id: null,
      parent_task_id: null,
      custom_fields: template.task.custom_fields || [],
      location: 'Lista pessoal',
      workspace: 'Pessoal',
    };

    await createTask(newTask);

    // Criar sub-tarefas se houver
    if (template.task.subtasks) {
      for (const [index, subtaskData] of template.task.subtasks.entries()) {
        const subtask: Task = {
          id: `task-${Date.now()}-subtask-${index}`,
          title: subtaskData.title || 'Sub-tarefa',
          description: '',
          status: subtaskData.status || 'todo',
          priority: subtaskData.priority || 'medium',
          due_date: null,
          start_date: null,
          created_at: new Date().toISOString(),
          completed_at: null,
          assignee_ids: [userId],
          created_by: userId,
          tag_ids: [],
          project_id: null,
          list_id: null,
          parent_task_id: newTask.id,
          custom_fields: [],
          location: 'Lista pessoal',
          workspace: 'Pessoal',
        };
        await createTask(subtask);
      }
    }

    toast.success('Tarefa criada com sucesso!');
    refetch();
    handleTaskClick(newTask.id);
  };

  const handleQuickAddTask = async (taskData: any) => {
    try {
      const userId = await getCurrentUserId();
      
      // Converter prioridade do dialog para o formato do banco
      let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
      if (taskData.priority === 'urgente') priority = 'urgent';
      else if (taskData.priority === 'alta') priority = 'high';
      else if (taskData.priority === 'normal') priority = 'medium';
      else if (taskData.priority === 'baixa') priority = 'low';
      
      const newTask: any = {
        title: taskData.title,
        description: taskData.description || '',
        status: 'todo' as const,
        priority,
        due_date: taskData.selectedDateTag ? taskData.selectedDateTag.toISOString() : null,
        start_date: null,
        completed_at: null,
        assignee_ids: [userId],
        created_by: userId,
        tag_ids: taskData.tags || [],
        project_id: null,
        list_id: taskData.list || 'lista-pessoal',
        parent_task_id: null,
        custom_fields: [],
      };
      
      const createdTask = await createTask(newTask);
      toast.success('Tarefa criada com sucesso!');
      refetch();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa: ' + (error as Error).message);
    }
  };

  const handleQuickAddReminder = async (reminderData: any) => {
    // O ReminderTab já cria o lembrete no Supabase com todas as funcionalidades avançadas
    // Este handler apenas atualiza a UI
    refetch();
  };

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + M - Nova tarefa
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        handleCreateTask();
      }
      
      // ESC - Fechar modal
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  return (
    <>
    <ResizableCard
      minWidth={320}
      minHeight={400}
      maxWidth={1400}
      maxHeight={900}
      defaultWidth={500}
      defaultHeight={500}
      storageKey="tasks-card"
      className="group"
    >
    <Card className="flex flex-col w-full h-full bg-card overflow-hidden">
        {/* Header Inline - Estilo Finance */}
        <CardHeader className="p-0">
          <div className="flex items-center justify-between gap-2 px-0.5 py-0.5">
            {/* Drag Handle + Input Editável */}
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {/* Drag Handle - 6 pontinhos - visível no hover */}
              <div 
                {...dragHandleProps}
                className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-muted/70 rounded transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 relative z-10"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              </div>
              
              {/* Ícone Animado + Input + Badge Contador */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* Ícone com pulse quando há tarefas */}
                <motion.div
                  animate={{
                    scale: hasPendingTasks ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  <CheckSquare className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                </motion.div>
                
                <Input
                  defaultValue="Meu trabalho"
                  className="text-sm font-semibold bg-transparent border-none focus:border-border focus:ring-1 focus:ring-ring h-7 px-2 w-full max-w-[120px] sm:max-w-[140px] truncate"
                />
                
                {/* Badge contador animado */}
                {totalTasks > 0 && (
                  <motion.div
                    key={totalTasks}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <Badge variant="secondary" className="text-xs h-5 px-1.5">
                      {totalTasks}
                    </Badge>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Botões com Micro-interações - Sempre visíveis em mobile */}
            <TooltipProvider>
            <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              {/* Botão Adicionar com Popover */}
              <Popover open={isAddPopoverOpen} onOpenChange={setIsAddPopoverOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                        >
                          <motion.div
                            whileHover={{ rotate: 90 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Plus className="size-3.5" />
                          </motion.div>
                        </Button>
                      </motion.div>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('tasks.card.addTask')}</p>
                  </TooltipContent>
                </Tooltip>
                <PopoverContent className="w-52 p-1" align="end">
                  <button
                    onClick={() => {
                      setQuickAddInitialTab('tarefa');
                      setIsQuickAddOpen(true);
                      setIsAddPopoverOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded hover:bg-muted transition-colors"
                  >
                    <CheckSquare className="size-4" />
                    <span>{t('tasks.group.addTask')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuickAddInitialTab('lembrete');
                      setIsQuickAddOpen(true);
                      setIsAddPopoverOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded hover:bg-muted transition-colors"
                  >
                    <Bell className="size-4" />
                    <span>{t('tasks.group.addReminder')}</span>
                  </button>
                </PopoverContent>
              </Popover>

              {/* Botão Templates */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setIsTemplateSelectorOpen(true)}
                    >
                      <Sparkles className="size-3.5" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Templates</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Botão Expandir */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setIsExpandedViewOpen(true)}
                    >
                      <Maximize2 className="size-3.5" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('tasks.card.expand')}</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Menu */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="size-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>{t('tasks.card.settings')}</DropdownMenuItem>
                  <DropdownMenuItem>{t('common.filter')}</DropdownMenuItem>
                  <DropdownMenuItem>{t('common.export')}</DropdownMenuItem>
                </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('tasks.card.moreOptions')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            </TooltipProvider>
          </div>
        </CardHeader>

        {/* Conteúdo */}
        <CardContent className="flex-1 overflow-y-auto p-0 min-h-0">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="h-full flex flex-col"
          >
            {/* Tabs logo abaixo do header */}
            <div className="px-2 pt-2 pb-1 border-b dark:border-gray-800">
              <TabsList className="bg-transparent h-7 w-full justify-start gap-1">
                <TabsTrigger value="pendente" className="text-xs px-3 h-6">
                  {t('tasks.card.pending')}
                </TabsTrigger>
                <TabsTrigger value="feito" className="text-xs px-3 h-6">
                  {t('tasks.card.done')}
                </TabsTrigger>
                <TabsTrigger value="delegado" className="text-xs px-3 h-6">
                  {t('tasks.card.delegated')}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Conteúdo das Abas com Transições */}
            <div className="flex-1 overflow-auto relative">
              {loading ? (
                // Skeleton profissional baseado na aba ativa
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'pendente' ? (
                    <TasksCardSkeleton />
                  ) : (
                    <TasksListSkeleton count={4} />
                  )}
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  {activeTab === 'pendente' && (
                    <motion.div
                      key="pendente"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="h-full"
                    >
                      <TabsContent value="pendente" className="m-0 h-full">
                        <TasksGroupView
                          groups={tasks as TaskGroups}
                          onTaskClick={handleTaskClick}
                          onUpdate={refetch}
                          isGroupExpanded={isGroupExpanded}
                          toggleGroup={toggleGroup}
                        />
                      </TabsContent>
                    </motion.div>
                  )}

                  {activeTab === 'feito' && (
                    <motion.div
                      key="feito"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="h-full"
                    >
                      <TabsContent value="feito" className="m-0 h-full">
                        <TasksListView
                          tasks={tasks as Task[]}
                          onTaskClick={handleTaskClick}
                          onUpdate={refetch}
                        />
                      </TabsContent>
                    </motion.div>
                  )}

                  {activeTab === 'delegado' && (
                    <motion.div
                      key="delegado"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="h-full"
                    >
                      <TabsContent value="delegado" className="m-0 h-full">
                        <TasksDelegatedView
                          tasks={Object.values(tasks).flat()}
                          onTaskClick={handleTaskClick}
                          onUpdate={refetch}
                        />
                      </TabsContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </ResizableCard>

      {/* Task Modal */}
      <TaskModal
        taskId={selectedTaskId}
        open={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={refetch}
      />

      {/* Template Selector */}
      <TaskTemplateSelector
        open={isTemplateSelectorOpen}
        onClose={() => setIsTemplateSelectorOpen(false)}
        onSelect={handleTemplateSelect}
      />

      {/* Expanded View */}
      <TasksExpandedView
        open={isExpandedViewOpen}
        onClose={() => setIsExpandedViewOpen(false)}
        tasks={Object.values(tasks).flat()}
        onTaskClick={handleTaskClick}
        onDeleteTask={(taskId) => {
          // TODO: Implementar delete
          refetch();
        }}
        onToggleComplete={(taskId) => {
          // TODO: Implementar toggle
          refetch();
        }}
      />

      {/* Quick Add Dialog */}
      <QuickAddTaskDialog
        open={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onCreateTask={handleQuickAddTask}
        onCreateReminder={handleQuickAddReminder}
        initialTab={quickAddInitialTab}
      />
    </>
  );
}