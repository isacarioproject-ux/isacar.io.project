import { updateTask, createTask, getUsers, getTasks } from '@/lib/tasks/tasks-storage';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Task, TaskWithDetails, TaskStatus, TaskPriority, CustomField, User } from '@/types/tasks';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/ui/file-upload';
import { StatusSelector } from './status-selector';
import { PrioritySelector } from './priority-selector';
import { TimeTracker } from './time-tracker';
import { RelationshipSelector } from './relationship-selector';
import { TagSelector } from './tag-selector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar as CalendarIcon, Plus, X, Sparkles, Flag, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/hooks/use-i18n';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TaskRow } from '@/components/tasks/task-row';
import { NotionBlockEditor, Block } from '@/components/tasks/notion-block-editor';

interface TaskDetailViewProps {
  task: TaskWithDetails;
  onUpdate: () => void;
}

const getStatusLabel = (t: any, status: TaskStatus): string => {
  const labels: Record<TaskStatus, string> = {
    todo: t('tasks.status.todo'),
    in_progress: t('tasks.status.inProgress'),
    review: t('tasks.status.review'),
    done: t('tasks.status.done'),
  };
  return labels[status];
};

const getPriorityLabel = (t: any, priority: TaskPriority): string => {
  const labels: Record<TaskPriority, string> = {
    low: t('tasks.priority.low'),
    medium: t('tasks.priority.medium'),
    high: t('tasks.priority.high'),
    urgent: t('tasks.priority.urgent'),
  };
  return labels[priority];
};

export function TaskDetailView({ task, onUpdate }: TaskDetailViewProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [startDate, setStartDate] = useState<Date | undefined>(
    task.start_date ? new Date(task.start_date) : undefined
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.due_date ? new Date(task.due_date) : undefined
  );
  const [assigneeIds, setAssigneeIds] = useState<string[]>(task.assignee_ids || []);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>(task.custom_fields || []);
  
  // Converter descrição em blocks para o NotionBlockEditor
  const [descriptionBlocks, setDescriptionBlocks] = useState<Block[]>(() => {
    if (!task.description) {
      return [{ id: '1', type: 'text', content: '' }];
    }
    // Converter descrição de texto para blocks
    return task.description.split('\n').map((line, index) => ({
      id: `block-${index}`,
      type: 'text' as const,
      content: line,
    }));
  });

  const [users, setUsers] = useState<User[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(task.tag_ids || []);
  const subtasks = allTasks.filter(t => t.parent_task_id === task.id);

  useEffect(() => {
    getUsers().then(setUsers);
    getTasks().then(setAllTasks);
  }, []);

  // Sincronizar estados quando a tarefa mudar
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setPriority(task.priority);
    setStartDate(task.start_date ? new Date(task.start_date) : undefined);
    setDueDate(task.due_date ? new Date(task.due_date) : undefined);
    setAssigneeIds(task.assignee_ids || []);
    setSelectedTags(task.tag_ids || []);
    setCustomFields(task.custom_fields || []);
    
    // Atualizar description blocks
    if (!task.description) {
      setDescriptionBlocks([{ id: '1', type: 'text', content: '' }]);
    } else {
      setDescriptionBlocks(
        task.description.split('\n').map((line, index) => ({
          id: `block-${index}`,
          type: 'text' as const,
          content: line,
        }))
      );
    }
  }, [task]);

  // Auto-save with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        title !== task.title ||
        description !== task.description ||
        status !== task.status ||
        priority !== task.priority ||
        JSON.stringify(assigneeIds) !== JSON.stringify(task.assignee_ids)
      ) {
        handleSave();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, description, status, priority, assigneeIds]);

  const handleSave = async () => {
    const updates: Partial<Task> = {
      title,
      description,
      status,
      priority,
      start_date: startDate?.toISOString().split('T')[0] || null,
      due_date: dueDate?.toISOString().split('T')[0] || null,
      assignee_ids: assigneeIds,
      custom_fields: customFields,
    };

    await updateTask(task.id, updates);
    onUpdate();
    console.log('✅ Tarefa atualizada:', updates);
  };

  const handleAddSubtask = async () => {
    if (!subtaskTitle.trim()) return;

    try {
      const newSubtask: Partial<Task> = {
        title: subtaskTitle,
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: null,
        start_date: null,
        completed_at: null,
        assignee_ids: task.assignee_ids?.length > 0 ? [task.assignee_ids[0]] : [],
        creator_id: task.creator_id,
        tag_ids: [],
        project_id: task.project_id,
        list_id: task.list_id,
        parent_task_id: task.id,
        custom_fields: [],
      };

      await createTask(newSubtask);
      setSubtaskTitle('');
      
      // Atualizar lista de tarefas
      const updatedTasks = await getTasks();
      setAllTasks(updatedTasks);
      
      toast.success('Sub-tarefa criada');
      onUpdate();
    } catch (error) {
      console.error('Error creating subtask:', error);
      toast.error('Erro ao criar sub-tarefa');
    }
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    const updates: Partial<Task> = {
      status: newStatus,
      completed_at: newStatus === 'done' ? new Date().toISOString() : null,
    };
    updateTask(task.id, updates);
    toast.success('Status atualizado');
    onUpdate();
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Selecionar data';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const toggleAssignee = (userId: string) => {
    setAssigneeIds(prev => {
      const current = prev || [];
      return current.includes(userId)
        ? current.filter(id => id !== userId)
        : [...current, userId];
    });
  };

  return (
    <div className="p-6 space-y-4">
      {/* Título Grande */}
      <div>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-3xl font-semibold border-none px-0 focus-visible:ring-0 bg-transparent dark:text-white placeholder:text-gray-400"
          placeholder={t('tasks.detail.titlePlaceholder')}
        />
      </div>

      {/* Banner do Brain removido para mobile */}

      {/* Propriedades - Ordem: Status, Datas, Responsáveis, Prioridade */}
      <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-3 text-sm">
        {/* 1. Status */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-gray-500 dark:text-gray-400 min-w-[60px]">{t('tasks.detail.status')}</span>
          <StatusSelector value={status} onChange={handleStatusChange} />
        </div>

        {/* 2. Datas */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400">{t('tasks.detail.dates')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex-1 md:flex-none">
                  {startDate ? format(startDate, 'dd/MM/yy') : t('tasks.detail.startDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 max-w-[95vw]" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date: Date | undefined) => {
                    setStartDate(date);
                    handleSave();
                  }}
                />
              </PopoverContent>
            </Popover>
            <span className="text-gray-400">→</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex-1 md:flex-none">
                  {dueDate ? format(dueDate, 'dd/MM/yy') : t('tasks.detail.dueDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 max-w-[95vw]" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date: Date | undefined) => {
                    setDueDate(date);
                    handleSave();
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* 3. Responsáveis */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-gray-500 dark:text-gray-400">{t('tasks.detail.assignees')}</span>
          <div className="flex items-center gap-1">
            {users.filter(u => (assigneeIds || []).includes(u.id)).map(user => (
              <Avatar key={user.id} className="size-6 cursor-pointer hover:opacity-80" onClick={() => toggleAssignee(user.id)}>
                <AvatarFallback className="text-xs">
                  {user.avatar || user.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <button className="size-6 rounded-full border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                  <Plus className="size-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="space-y-1">
                  {users.map(user => (
                    <div
                      key={user.id}
                      onClick={() => toggleAssignee(user.id)}
                      className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-left cursor-pointer"
                    >
                      <Checkbox checked={(assigneeIds || []).includes(user.id)} />
                      <span className="text-sm">{user.name}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* 4. Prioridade */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-gray-500 dark:text-gray-400 min-w-[60px]">{t('tasks.detail.priority')}</span>
          <PrioritySelector value={priority} onChange={(p) => setPriority(p)} />
        </div>
      </div>

      {/* Descrição - NotionBlockEditor */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Descrição</span>
        </div>
        <NotionBlockEditor
          blocks={descriptionBlocks}
          onChange={(newBlocks) => {
            setDescriptionBlocks(newBlocks);
            // Converter blocks de volta para string
            const newDescription = newBlocks.map(b => b.content).join('\n');
            setDescription(newDescription);
          }}
          placeholder={t('tasks.detail.descriptionPlaceholder')}
        />
      </div>

      {/* Tempo rastreado */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500 dark:text-gray-400">Tempo rastreado...</span>
        <TimeTracker 
          taskId={task.id} 
          onTimeAdd={(minutes) => {
            toast.success(`${minutes} minutos adicionados`);
            // TODO: Salvar no banco
          }} 
        />
      </div>

      {/* Relacionamentos */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Relacionamentos</span>
        </div>
        <RelationshipSelector 
          taskId={task.id}
          onAdd={(relatedTaskId, type) => {
            toast.success(`Relacionamento "${type}" adicionado`);
            // TODO: Salvar no banco
          }}
        />
      </div>

      {/* Etiquetas */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Etiquetas</span>
        </div>
        
        {/* Tags selecionadas */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag}
                <X
                  className="size-3 cursor-pointer hover:text-red-500"
                  onClick={async () => {
                    const newTags = selectedTags.filter(t => t !== tag);
                    setSelectedTags(newTags);
                    await updateTask(task.id, { tag_ids: newTags });
                    onUpdate();
                    toast.success('Etiqueta removida');
                  }}
                />
              </Badge>
            ))}
          </div>
        )}
        
        <TagSelector 
          selectedTags={selectedTags}
          onAdd={async (tag) => {
            const newTags = [...selectedTags, tag];
            setSelectedTags(newTags);
            await updateTask(task.id, { tag_ids: newTags });
            onUpdate();
          }}
          onRemove={async (tag) => {
            const newTags = selectedTags.filter(t => t !== tag);
            setSelectedTags(newTags);
            await updateTask(task.id, { tag_ids: newTags });
            onUpdate();
          }}
        />
      </div>

      {/* Campos Personalizados */}
      {customFields.length > 0 && (
        <div className="space-y-4">
          <Label>Campos Personalizados</Label>
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            {customFields.map(field => (
              <div key={field.id} className="space-y-2">
                <Label className="text-sm">{field.name}</Label>
                {field.type === 'text' && (
                  <Input
                    value={field.value || ''}
                    onChange={(e) => {
                      const updated = customFields.map(f =>
                        f.id === field.id ? { ...f, value: e.target.value } : f
                      );
                      setCustomFields(updated);
                    }}
                  />
                )}
                {field.type === 'number' && (
                  <Input
                    type="number"
                    value={field.value || 0}
                    onChange={(e) => {
                      const updated = customFields.map(f =>
                        f.id === field.id ? { ...f, value: Number(e.target.value) } : f
                      );
                      setCustomFields(updated);
                    }}
                  />
                )}
                {field.type === 'select' && field.options && (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      const updated = customFields.map(f =>
                        f.id === field.id ? { ...f, value } : f
                      );
                      setCustomFields(updated);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tarefas */}
      <div className="space-y-3">
        <Label>Sub-tarefas</Label>
        
        {/* Lista de Sub-tarefas */}
        <div className="space-y-1">
          {subtasks.map(subtask => (
            <TaskRow
              key={subtask.id}
              task={subtask}
              onTaskClick={() => {}}
              onUpdate={onUpdate}
              simplified
            />
          ))}
        </div>

        {/* Adicionar Sub-tarefa */}
        <div className="flex gap-2">
          <Input
            placeholder={t('tasks.detail.subtaskPlaceholder')}
            value={subtaskTitle}
            onChange={(e) => setSubtaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSubtask();
              }
            }}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleAddSubtask} disabled={!subtaskTitle.trim()}>
                  <motion.div
                    whileHover={{ rotate: 90 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Plus className="size-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('tasks.detail.addSubtask')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Checklists */}
      {task.checklists && task.checklists.length > 0 && (
        <div className="space-y-3">
          {task.checklists.map(checklist => (
            <div key={checklist.id} className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Label>{checklist.title}</Label>
              <div className="space-y-2">
                {checklist.items.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Checkbox checked={item.checked} />
                    <span className={item.checked ? 'line-through text-gray-500 dark:text-gray-400' : 'dark:text-gray-100'}>
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Anexos */}
      <div className="space-y-3">
        <Label>Anexos</Label>
        <FileUpload
          onFileSelect={(files) => {
            files.forEach(file => {
              toast.success(`Arquivo "${file.name}" adicionado`);
            });
            // TODO: Implementar upload real para Supabase Storage
          }}
          maxFiles={10}
          maxSize={50}
          accept="*"
        />
      </div>
    </div>
  );
}