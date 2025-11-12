import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ResizableCard } from '@/components/ui/resizable-card';
import { RecentExpandedView } from '@/components/recent/recent-expanded-view';
import { MoreVertical, Clock, Settings, Maximize2, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getActivities } from '@/lib/tasks/tasks-storage';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Activity } from '@/types/tasks';

interface RecentCardProps {
  className?: string;
  dragHandleProps?: any;
}

export function RecentCard({ className, dragHandleProps }: RecentCardProps) {
  const [isExpandedViewOpen, setIsExpandedViewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const activities = getActivities();

  // Simular loading inicial
  useState(() => {
    setTimeout(() => setLoading(false), 500);
  });

  // Pegar apenas as 10 atividades mais recentes
  const recentActivities = activities
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <>
    <ResizableCard
      minWidth={350}
      minHeight={350}
      maxWidth={1400}
      maxHeight={900}
      defaultWidth={500}
      defaultHeight={500}
      storageKey="recent-card"
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
                className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-muted/70 rounded transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 relative z-50"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              </div>
              
              {/* Ícone Animado + Badge + Input */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <motion.div
                  animate={{
                    scale: recentActivities.length > 0 ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  <Clock className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                </motion.div>
                {recentActivities.length > 0 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Badge variant="secondary" className="text-xs h-5 px-1.5">
                      {recentActivities.length}
                    </Badge>
                  </motion.div>
                )}
                <Input
                  defaultValue="Recente"
                  className="text-sm font-semibold bg-transparent border-none focus:border-border focus:ring-1 focus:ring-ring h-7 px-2 w-full max-w-[160px] sm:max-w-[200px] truncate"
                />
              </div>
            </div>

            {/* Botões Animados - Visível no hover */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 sm:opacity-100 transition-opacity">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  title="Expandir"
                  onClick={() => setIsExpandedViewOpen(true)}
                >
                  <Maximize2 className="size-3.5" />
                </Button>
              </motion.div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreVertical className="size-3.5" />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Configurações</DropdownMenuItem>
                  <DropdownMenuItem>Filtros</DropdownMenuItem>
                  <DropdownMenuItem>Limpar histórico</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        {/* Conteúdo com Animações */}
        <CardContent className="flex-1 overflow-y-auto p-2">
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Clock className="size-12 mx-auto mb-3 opacity-50" />
                  </motion.div>
                  <p className="text-sm">Nenhuma atividade recente</p>
                  <p className="text-xs mt-1">Suas atividades aparecerão aqui</p>
                </div>
              </motion.div>
            ) : (
              recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                >
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarFallback className="text-xs">
                      {activity.user_name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <span className="font-medium dark:text-gray-100">
                        {activity.user_name}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-1">
                        {activity.details}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatTimestamp(activity.created_at)}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </ResizableCard>

      {/* Expanded View */}
      <RecentExpandedView
        open={isExpandedViewOpen}
        onClose={() => setIsExpandedViewOpen(false)}
        activities={activities}
      />
    </>
  );
}
