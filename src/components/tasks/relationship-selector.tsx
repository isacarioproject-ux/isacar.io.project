import { useState, useEffect } from 'react';
import { Link2, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { getTasks } from '@/lib/tasks/tasks-storage';
import { Task } from '@/types/tasks';

interface RelationshipSelectorProps {
  taskId: string;
  onAdd: (taskId: string, type: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const relationTypes = [
  { value: 'blocks', label: 'Bloqueia' },
  { value: 'blocked_by', label: 'Bloqueado por' },
  { value: 'relates_to', label: 'Relacionado a' },
  { value: 'duplicates', label: 'Duplica' },
  { value: 'parent_of', label: 'Pai de' },
  { value: 'child_of', label: 'Filho de' },
];

export function RelationshipSelector({ taskId, onAdd, open, onOpenChange }: RelationshipSelectorProps) {
  const [selectedType, setSelectedType] = useState('relates_to');
  const [searchQuery, setSearchQuery] = useState('');
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  useEffect(() => {
    getTasks().then(tasks => {
      const filtered = tasks.filter(t => t.id !== taskId);
      setAllTasks(filtered);
      setFilteredTasks(filtered);
    });
  }, [taskId]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allTasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks(allTasks);
    }
  }, [searchQuery, allTasks]);

  const handleAdd = (selectedTaskId: string) => {
    onAdd(selectedTaskId, selectedType);
    setSearchQuery('');
    onOpenChange?.(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium">
          + Adicionar relacionamento
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
          <div className="space-y-2">
          {/* Tipo de relacionamento - Compacto */}
          <div className="flex flex-wrap gap-1">
            {relationTypes.slice(0, 3).map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                    selectedType === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {type.label}
                </button>
              ))}
          </div>

          {/* Buscar tarefa - Compacto */}
            <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-gray-400" />
              <Input
              placeholder="Buscar tarefa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-8 text-sm"
              />
            </div>
            
          {/* Lista de tarefas - Compacta */}
          <div className="max-h-40 overflow-y-auto space-y-0.5">
              {filteredTasks.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-2">
                Nenhuma tarefa
                </p>
              ) : (
              filteredTasks.slice(0, 5).map(task => (
                  <button
                    key={task.id}
                    onClick={() => handleAdd(task.id)}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-xs transition-colors truncate"
                  title={task.title}
                  >
                  {task.title}
                  </button>
                ))
              )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
