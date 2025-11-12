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
}

const relationTypes = [
  { value: 'blocks', label: 'Bloqueia' },
  { value: 'blocked_by', label: 'Bloqueado por' },
  { value: 'relates_to', label: 'Relacionado a' },
  { value: 'duplicates', label: 'Duplica' },
  { value: 'parent_of', label: 'Pai de' },
  { value: 'child_of', label: 'Filho de' },
];

export function RelationshipSelector({ taskId, onAdd }: RelationshipSelectorProps) {
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
    toast.success('Relacionamento adicionado');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium">
          + Adicionar relacionamento
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold dark:text-gray-200">Adicionar relacionamento</h4>
            <Link2 className="size-4 text-gray-500" />
          </div>

          {/* Tipo de relacionamento */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Tipo de relacionamento
            </label>
            <div className="grid grid-cols-2 gap-2">
              {relationTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    selectedType === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Buscar tarefa */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Buscar tarefa
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Digite o nome da tarefa"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Lista de tarefas */}
            <div className="max-h-48 overflow-y-auto space-y-1 border dark:border-gray-700 rounded-md p-2">
              {filteredTasks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma tarefa encontrada
                </p>
              ) : (
                filteredTasks.slice(0, 10).map(task => (
                  <button
                    key={task.id}
                    onClick={() => handleAdd(task.id)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-colors"
                  >
                    <div className="font-medium dark:text-gray-200">{task.title}</div>
                    <div className="text-xs text-gray-500">ID: {task.id}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
