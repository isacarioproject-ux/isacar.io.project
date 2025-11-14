import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ResizableCard } from '@/components/ui/resizable-card';
import { EmpresaExpandedView } from '@/components/empresa/empresa-expanded-view';
import { WhiteboardDataTable } from '@/components/whiteboard/whiteboard-data-table';
import { WhiteboardDialog } from '@/components/whiteboard/whiteboard-dialog';
import { useWhiteboardsList } from '@/hooks/use-whiteboards-list';
import { MoreVertical, Building2, Settings, Maximize2, GripVertical, Trash2, Copy, Search, ListFilter } from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';
import { toast } from 'sonner';

interface EmpresaCardProps {
  className?: string;
  dragHandleProps?: any;
}

export function EmpresaCard({ className, dragHandleProps }: EmpresaCardProps) {
  const { t } = useI18n();
  const [isExpandedViewOpen, setIsExpandedViewOpen] = useState(false);
  const [selectedWhiteboardId, setSelectedWhiteboardId] = useState<string | undefined>();
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [cardName, setCardName] = useState(() => {
    const saved = localStorage.getItem('empresa-card-name');
    return saved || t('empresa.card.title');
  });
  
  const whiteboardList = useWhiteboardsList();
  
  const handleRowClick = (board: any) => {
    setSelectedWhiteboardId(board.id);
    setWhiteboardOpen(true);
    whiteboardList.updateLastAccessed(board.id);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setCardName(newName);
    localStorage.setItem('empresa-card-name', newName);
  };

  const handleDelete = () => {
    const confirmed = window.confirm(t('empresa.card.deleteConfirm'));
    if (confirmed) {
      toast.info(t('empresa.card.inDevelopment'));
    }
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
        storageKey="empresa-card"
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
                
                {/* Ícone + Input */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Building2 className="size-4 text-gray-700 dark:text-gray-300 flex-shrink-0" />
                  <Input
                    value={cardName}
                    onChange={handleNameChange}
                    placeholder={t('empresa.card.title')}
                    className="text-sm font-semibold bg-transparent border-none focus:border-border focus:ring-1 focus:ring-ring h-7 px-2 w-full max-w-[160px] sm:max-w-[200px] truncate"
                  />
                </div>
              </div>

              {/* Botões - Visível no hover */}
              <motion.div 
                className="flex items-center gap-0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    title={t('empresa.card.expand')}
                    onClick={() => setIsExpandedViewOpen(true)}
                  >
                    <Maximize2 className="size-3.5" />
                  </Button>
                </motion.div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="size-3.5" />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toast.info(t('empresa.card.comingSoon'))}>
                      <Settings className="h-4 w-4 mr-2" />
                      {t('empresa.card.settings')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.info(t('empresa.card.comingSoon'))}>
                      <Copy className="h-4 w-4 mr-2" />
                      {t('empresa.card.duplicate')}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('empresa.card.deleteCard')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            </div>
          </CardHeader>

          {/* Conteúdo - Tabs com Tabela (igual ao modal) */}
          <CardContent className="flex-1 overflow-hidden p-2 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              {/* Tabs Header */}
              <div className="flex items-center gap-2 mb-2">
                <TabsList className="h-8">
                  <TabsTrigger value="recent" className="text-xs h-7">
                    {t('empresa.tabs.recent')}
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="text-xs h-7">
                    {t('empresa.tabs.favorites')}
                  </TabsTrigger>
                  <TabsTrigger value="mine" className="text-xs h-7">
                    {t('empresa.tabs.mine')}
                  </TabsTrigger>
                </TabsList>
                
                {/* Busca compacta */}
                <div className="relative flex-1 max-w-[200px]">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder={t('empresa.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-7 pl-7 text-xs"
                  />
                </div>
              </div>

              {/* Tabela */}
              <div className="flex-1 overflow-hidden">
                <WhiteboardDataTable
                  whiteboards={whiteboardList.whiteboards}
                  isLoading={whiteboardList.loading}
                  onRowClick={handleRowClick}
                  onDelete={(board) => whiteboardList.removeWhiteboard(board.id)}
                  compact={true}
                />
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </ResizableCard>

      {/* Whiteboard Dialog - Abre o whiteboard específico */}
      <WhiteboardDialog
        open={whiteboardOpen}
        onOpenChange={setWhiteboardOpen}
        whiteboardId={selectedWhiteboardId}
      />

      {/* Expanded View - Conteúdo completo da página de Gestão */}
      <EmpresaExpandedView
        open={isExpandedViewOpen}
        onClose={() => setIsExpandedViewOpen(false)}
      />
    </>
  );
}
