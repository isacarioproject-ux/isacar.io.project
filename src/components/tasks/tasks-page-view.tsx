import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useTasksCard } from '@/hooks/tasks/use-tasks-card';
import { TasksGroupView } from '@/components/tasks/tasks-group-view';
import { TasksListView } from '@/components/tasks/tasks-list-view';
import { TasksDelegatedView } from '@/components/tasks/tasks-delegated-view';
import { TaskModal } from '@/components/tasks/task-modal';
import { TaskTemplateSelector } from '@/components/tasks/task-template-selector';
import { QuickAddTaskDialog } from '@/components/tasks/quick-add-task-dialog';
import { TasksSettingsDialog } from '@/components/tasks/tasks-settings-dialog';
import { TasksCardSkeleton, TasksListSkeleton, TasksHeaderSkeleton } from '@/components/tasks/tasks-card-skeleton';
import { Plus, CheckSquare, Bell, Sparkles, Settings } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { TaskGroups, Task, TaskTemplate } from '@/types/tasks';
import { createTask, getCurrentUserId } from '@/lib/tasks/tasks-storage';
import { toast } from 'sonner';
import { useI18n } from '@/hooks/use-i18n';

export function TasksPageView() {
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
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddInitialTab, setQuickAddInitialTab] = useState<'tarefa' | 'lembrete'>('tarefa');
  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('📋');
  const [workspaceName, setWorkspaceName] = useState('Meu trabalho');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Calcular total de tarefas para animação
  const totalTasks = Array.isArray(tasks) 
    ? tasks.length 
    : Object.values(tasks).flat().length;
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

  const availableIcons = ['📋', '✅', '📝', '🎯', '⚡', '🔥', '💼', '📊', '🎨', '🚀'];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full">
      {/* Header Compacto - Tudo em uma linha */}
      {loading ? (
        <TasksHeaderSkeleton />
      ) : (
      <div className="flex items-center gap-4 px-8 py-3">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="flex-shrink-0"
        >
          <TabsList className="bg-muted/50 h-9 w-auto justify-start gap-0 p-0.5 rounded-md">
            <TabsTrigger 
              value="pendente" 
              className="text-sm px-4 h-8 rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              {t('tasks.card.pending')}
            </TabsTrigger>
            <TabsTrigger 
              value="feito" 
              className="text-sm px-4 h-8 rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              {t('tasks.card.done')}
            </TabsTrigger>
            <TabsTrigger 
              value="delegado" 
              className="text-sm px-4 h-8 rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              {t('tasks.card.delegated')}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="h-6 w-px bg-border" />

        {/* Seletor de Ícone */}
        <TooltipProvider>
          <Popover open={isIconPickerOpen} onOpenChange={setIsIconPickerOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-xl">
                    {selectedIcon}
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Escolher ícone</p>
              </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-auto p-2" align="start">
              <div className="grid grid-cols-5 gap-1">
                {availableIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => {
                      setSelectedIcon(icon);
                      setIsIconPickerOpen(false);
                    }}
                    className="h-9 w-9 text-xl hover:bg-muted rounded transition-colors"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Input Nome do Workspace */}
          <Input
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="h-9 text-base font-semibold bg-transparent border-none focus-visible:ring-1 focus-visible:ring-ring px-2 w-64"
            placeholder="Nome do workspace"
          />
          
          {/* Badge contador */}
          {totalTasks > 0 && (
            <motion.div
              key={totalTasks}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <Badge variant="secondary" className="text-xs h-6 px-2">
                {totalTasks}
              </Badge>
            </motion.div>
          )}

          <div className="flex-1" />

          {/* Botões de Ação */}
          <div className="flex items-center gap-1">
            {/* Botão Adicionar com Popover */}
            <Popover open={isAddPopoverOpen} onOpenChange={setIsAddPopoverOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Plus className="size-4" />
                      </Button>
                    </motion.div>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Adicionar</p>
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
                    className="h-8 w-8"
                    onClick={() => setIsTemplateSelectorOpen(true)}
                  >
                    <Sparkles className="size-4" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Templates</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Botão Configurações */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setIsSettingsOpen(true);
                    }}
                  >
                    <Settings className="size-4" />
                    </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configurações</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      )}

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-hidden px-8 pt-4">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="h-full flex flex-col"
        >
          {/* Conteúdo das Abas com Transições */}
          <div className="flex-1 overflow-auto pb-8">
            {loading ? (
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
                  <TasksListSkeleton count={6} />
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
                        variant="table"
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
                        variant="table"
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
                        variant="table"
                      />
                    </TabsContent>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </Tabs>
      </div>

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

      {/* Quick Add Dialog */}
      <QuickAddTaskDialog
        open={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onCreateTask={handleQuickAddTask}
        onCreateReminder={handleQuickAddReminder}
        initialTab={quickAddInitialTab}
      />

      {/* Settings Dialog */}
      <TasksSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
}
