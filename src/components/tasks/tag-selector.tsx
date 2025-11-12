import { useState } from 'react';
import { Tag, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface TagSelectorProps {
  selectedTags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}

const predefinedTags = [
  { name: 'Bug', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  { name: 'Feature', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { name: 'Urgente', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  { name: 'Documentação', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  { name: 'Design', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
  { name: 'Backend', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { name: 'Frontend', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
];

export function TagSelector({ selectedTags, onAdd, onRemove }: TagSelectorProps) {
  const [customTag, setCustomTag] = useState('');

  const handleAddCustom = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      onAdd(customTag.trim());
      setCustomTag('');
      toast.success('Etiqueta adicionada');
    }
  };

  const handleAddPredefined = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onAdd(tag);
      toast.success('Etiqueta adicionada');
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium">
          + Adicionar etiqueta
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold dark:text-gray-200">Etiquetas</h4>
            <Tag className="size-4 text-gray-500" />
          </div>

          {/* Tags selecionadas */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => onRemove(tag)}
                    className="hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-0.5"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Etiquetas predefinidas */}
          <div className="space-y-2">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Etiquetas sugeridas
            </p>
            <div className="flex flex-wrap gap-2">
              {predefinedTags.map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => handleAddPredefined(tag.name)}
                  disabled={selectedTags.includes(tag.name)}
                  className={`px-2 py-1 text-xs rounded-md transition-opacity ${
                    tag.color
                  } ${
                    selectedTags.includes(tag.name)
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:opacity-80'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Criar etiqueta customizada */}
          <div className="space-y-2 border-t dark:border-gray-700 pt-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Criar etiqueta personalizada
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Nome da etiqueta"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                className="flex-1"
              />
              <Button size="sm" onClick={handleAddCustom}>
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
