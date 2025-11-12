import { useState } from 'react';
import { Clock, Play, Pause, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

interface TimeTrackerProps {
  taskId: string;
  onTimeAdd: (minutes: number) => void;
}

export function TimeTracker({ taskId, onTimeAdd }: TimeTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [manualTime, setManualTime] = useState('');

  const handleStartStop = () => {
    setIsTracking(!isTracking);
    toast.success(isTracking ? 'Tempo pausado' : 'Tempo iniciado');
  };

  const handleManualAdd = () => {
    const minutes = parseInt(manualTime);
    if (minutes > 0) {
      onTimeAdd(minutes);
      setManualTime('');
      toast.success(`${minutes} minutos adicionados`);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
          Adicionar hora
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold dark:text-gray-200">Tempo rastreado</h4>
            <Clock className="size-4 text-gray-500" />
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isTracking ? 'destructive' : 'default'}
              onClick={handleStartStop}
              className="flex-1"
            >
              {isTracking ? (
                <>
                  <Pause className="size-4 mr-2" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="size-4 mr-2" />
                  Iniciar
                </>
              )}
            </Button>
          </div>

          <div className="border-t dark:border-gray-700 pt-4 space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Adicionar tempo manualmente
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Horas</label>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Minutos</label>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  max="59"
                  onChange={(e) => {
                    const hours = parseInt(manualTime) || 0;
                    const mins = parseInt(e.target.value) || 0;
                    setManualTime(String(hours * 60 + mins));
                  }}
                />
              </div>
            </div>
            <Button size="sm" onClick={handleManualAdd} className="w-full">
              <Plus className="size-4 mr-2" />
              Adicionar tempo
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
