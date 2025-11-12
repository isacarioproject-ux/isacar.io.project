import { useState } from 'react';
import { toast } from 'sonner';
import { useI18n } from '@/hooks/use-i18n';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Bell, 
  Repeat, 
  ChevronRight,
  Paperclip,
  ChevronUp,
  ChevronDown,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReminderTabProps {
  onCreateReminder?: (data: any) => void;
}

export function ReminderTab({ onCreateReminder }: ReminderTabProps) {
  const { t } = useI18n();
  const [reminderText, setReminderText] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('Hoje');
  const [notifyMe, setNotifyMe] = useState(true);
  const [notificationTime, setNotificationTime] = useState('Na data final');
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const quickOptions = [
    { label: 'Hoje', icon: CalendarIcon, time: 'Hoje' },
    { label: 'Para mim', icon: Bell, badge: true },
    { label: 'Notifique-me', icon: Bell },
  ];

  const timeOptions = [
    { label: 'Mais tarde', time: 'em 2 horas' },
    { label: 'Amanhã', time: 'sáb, 8:00' },
    { label: 'Semana que vem', time: 'seg, 8:00' },
    { label: 'Configurar recorrência', icon: Repeat },
  ];

  const notificationOptions = [
    'Na data final',
    '10 minutos antes',
    '1 hora antes',
    'Personalizar...',
    'Não notificar',
  ];

  // Gerar dias do calendário
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }

    // Dias do próximo mês
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }

    return days;
  };

  const monthNames = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez'
  ];

  const handleCreateReminder = () => {
    if (!reminderText.trim()) return;

    const reminderData = {
      text: reminderText,
      date: selectedDate,
      time: selectedTime,
      notifyMe,
      notificationTime,
    };

    onCreateReminder?.(reminderData);
    setReminderText('');
  };

  return (
    <div className="space-y-4 p-4">
      {/* Input */}
      <input
        type="text"
        value={reminderText}
        onChange={(e) => setReminderText(e.target.value)}
        placeholder="Nome do lembrete ou digite '/' para comandos"
        className="w-full px-0 py-2 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && reminderText.trim()) {
            handleCreateReminder();
          }
        }}
      />

      {/* Opções Rápidas */}
      <div className="flex items-center gap-2 px-4 py-3 border-b dark:border-gray-800">
        {/* Data com Calendário */}
        <Popover open={showCalendar} onOpenChange={setShowCalendar}>
          <PopoverTrigger asChild>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 gap-1.5"
            >
              <CalendarIcon className="size-3" />
              {selectedTime}
              {showCalendar && <span className="ml-1">×</span>}
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-3 space-y-2">
              {/* Opções Rápidas de Tempo */}
              {timeOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (!option.icon) {
                      setSelectedTime(option.label);
                      setShowCalendar(false);
                    }
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    {option.icon && <option.icon className="size-4" />}
                    <span>{option.label}</span>
                  </div>
                  {option.time && (
                    <span className="text-xs text-gray-500">{option.time}</span>
                  )}
                  {option.icon && <ChevronRight className="size-4" />}
                </button>
              ))}

              {/* Calendário */}
              <div className="pt-2 border-t dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <div className="flex items-center gap-1">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => {
                          const newDate = new Date(currentMonth);
                          newDate.setMonth(newDate.getMonth() - 1);
                          setCurrentMonth(newDate);
                        }}
                      >
                        <ChevronUp className="size-3" />
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => {
                          const newDate = new Date(currentMonth);
                          newDate.setMonth(newDate.getMonth() + 1);
                          setCurrentMonth(newDate);
                        }}
                      >
                        <ChevronDown className="size-3" />
                      </Button>
                    </motion.div>
                  </div>
                </div>

                {/* Dias da Semana */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['do', '2ª', '3ª', '4ª', '5ª', '6ª', 'sá'].map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs text-gray-500 dark:text-gray-400"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Grid de Dias */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonth).map((dayObj, idx) => {
                    const isToday =
                      dayObj.isCurrentMonth &&
                      dayObj.day === new Date().getDate() &&
                      currentMonth.getMonth() === new Date().getMonth();

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (dayObj.isCurrentMonth) {
                            const newDate = new Date(
                              currentMonth.getFullYear(),
                              currentMonth.getMonth(),
                              dayObj.day
                            );
                            setSelectedDate(newDate);
                            setShowCalendar(false);
                          }
                        }}
                        className={cn(
                          'aspect-square flex items-center justify-center text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800',
                          !dayObj.isCurrentMonth && 'text-gray-400 dark:text-gray-600',
                          isToday && 'bg-blue-600 text-white hover:bg-blue-700'
                        )}
                      >
                        {dayObj.day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Para mim */}
        <Badge
          variant="secondary"
          className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 gap-1.5"
        >
          <Bell className="size-3 text-blue-600" />
          {t('tasks.reminder.forMe')}
        </Badge>

        {/* Notifique-me */}
        <Popover>
          <PopoverTrigger asChild>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 gap-1.5"
            >
              <Bell className="size-3" />
              {t('tasks.reminder.notifyMe')}
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-1" align="start">
            <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2">
              ME NOTIFICAR
            </div>
            {notificationOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setNotificationTime(option);
                }}
                className={cn(
                  'flex items-center justify-between w-full px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800',
                  notificationTime === option && 'bg-gray-100 dark:bg-gray-800'
                )}
              >
                <span>{option}</span>
                {notificationTime === option && (
                  <span className="text-blue-600">✓</span>
                )}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* Anexos */}
      <div className="flex-1 px-4 py-3">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('tasks.reminder.attachments')}</div>
        <div className="border-2 border-dashed dark:border-gray-800 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('tasks.reminder.dragDrop')}{' '}
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-blue-600 hover:underline">{t('tasks.reminder.browse')}</button>
              </TooltipTrigger>
              <TooltipContent>{t('tasks.reminder.browseFiles')}</TooltipContent>
            </Tooltip>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-800">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <Paperclip className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('tasks.reminder.attachFile')}</TooltipContent>
        </Tooltip>
        <Button
          onClick={handleCreateReminder}
          disabled={!reminderText.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {t('tasks.reminder.create')}
        </Button>
      </div>
    </div>
  );
}
