import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '@/hooks/use-i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, ListFilter } from 'lucide-react';
import { TasksCard, PlansCard, JourneyCard } from '@/components/management-cards';
import { WhiteboardDataTable, type CollaboratorProfileSummary } from '@/components/whiteboard/whiteboard-data-table';
import { CardSkeleton } from '@/components/loading-skeleton';
import { WhiteboardDialog } from '@/components/whiteboard/whiteboard-dialog';
import { toast } from 'sonner';
import { useWhiteboardsList } from '@/hooks/use-whiteboards-list';
import type { Whiteboard, WhiteboardStatus, WhiteboardType } from '@/types/whiteboard';
import { supabase } from '@/lib/supabase';

interface DashboardManagementProps {
  loading?: boolean;
}

export function DashboardManagement({ loading = false }: DashboardManagementProps) {
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<WhiteboardStatus | 'all'>('all');
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [selectedWhiteboardId, setSelectedWhiteboardId] = useState<string | undefined>();

  const whiteboardList = useWhiteboardsList();
  const [collaboratorProfiles, setCollaboratorProfiles] = useState<Record<string, CollaboratorProfileSummary>>({});
  const loadedProfileIdsRef = useRef<Set<string>>(new Set());

  const isLoading = loading || whiteboardList.loading;

  const openBoard = useCallback((board: Whiteboard) => {
    if (!board) return;
    setSelectedWhiteboardId(board.id);
    setWhiteboardOpen(true);
    void whiteboardList.updateLastAccessed(board.id);
  }, [whiteboardList]);

  const openBoardById = useCallback((boardId: string | undefined) => {
    if (!boardId) return;
    const board = whiteboardList.whiteboards.find((item) => item.id === boardId);
    if (board) {
      openBoard(board);
    }
  }, [openBoard, whiteboardList.whiteboards]);

  const handleCreateOrOpen = useCallback(async (type: WhiteboardType) => {
    const ownedBoards = whiteboardList.ownedBoardsByType[type] ?? [];
    const canCreate = whiteboardList.canCreate(type);

    if (!canCreate) {
      if (whiteboardList.planId === 'free') {
        toast.info('Você já criou o whiteboard de tarefas disponível no plano Free. Acesse-o pela tabela na aba “Recentes”.');
      } else {
        toast.info('Limite atingido para este tipo de whiteboard no seu plano. Abra os existentes pela tabela ou faça upgrade.');
      }
      return;
    }

    if (whiteboardList.planId === 'free' && ownedBoards.length > 0) {
      toast.info('Plano Free libera apenas um whiteboard por tipo. Acesse o existente pela tabela.');
      return;
    }

    const newBoard = await whiteboardList.createWhiteboard({ type });
    if (newBoard) {
      openBoard(newBoard);
    }
  }, [openBoard, whiteboardList]);

  const handleRowClick = useCallback((board: Whiteboard) => {
    openBoard(board);
  }, [openBoard]);

  const handleFavoriteToggle = useCallback((board: Whiteboard) => {
    whiteboardList.toggleFavorite(board.id, board.is_favorite);
  }, [whiteboardList]);

  const handleDelete = useCallback((board: Whiteboard) => {
    whiteboardList.removeWhiteboard(board.id);
  }, [whiteboardList]);

  const handleStatusFilterChange = useCallback((status: WhiteboardStatus | 'all') => {
    setStatusFilter(status);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setWhiteboardOpen(open);
    if (!open) {
      setSelectedWhiteboardId(undefined);
      void whiteboardList.refresh();
    }
  }, [whiteboardList]);

  useEffect(() => {
    const uniqueIds = new Set<string>();
    whiteboardList.whiteboards.forEach((board) => {
      if (board.user_id) uniqueIds.add(board.user_id);
      if (Array.isArray(board.collaborators)) {
        board.collaborators.forEach((id) => {
          if (typeof id === 'string') uniqueIds.add(id);
        });
      }
    });

    const missing = Array.from(uniqueIds).filter((id) => !loadedProfileIdsRef.current.has(id));
    if (!missing.length) return;

    let cancelled = false;

    const loadProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', missing);

        if (error) throw error;

        const updates: Record<string, CollaboratorProfileSummary> = {};

        data?.forEach((profile) => {
          updates[profile.id] = {
            id: profile.id,
            name: profile.full_name,
            avatarUrl: profile.avatar_url,
          };
        });

        missing.forEach((id) => {
          if (!updates[id]) {
            updates[id] = { id };
          }
        });

        if (!cancelled) {
          setCollaboratorProfiles((prev) => ({ ...prev, ...updates }));
          missing.forEach((id) => loadedProfileIdsRef.current.add(id));
        }
      } catch (err) {
        console.warn('Não foi possível carregar perfis de colaboradores', err);
        if (!cancelled) {
          const fallbacks: Record<string, CollaboratorProfileSummary> = {};
          missing.forEach((id) => {
            fallbacks[id] = { id };
            loadedProfileIdsRef.current.add(id);
          });
          setCollaboratorProfiles((prev) => ({ ...prev, ...fallbacks }));
        }
      }
    };

    void loadProfiles();

    return () => {
      cancelled = true;
    };
  }, [whiteboardList.whiteboards]);

  const normalizedSearch = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

  const filteredBoards = useMemo(() => {
    let boards = [...whiteboardList.whiteboards];

    if (statusFilter !== 'all') {
      boards = boards.filter((board) => board.status === statusFilter);
    }

    if (normalizedSearch) {
      boards = boards.filter((board) =>
        board.name?.toLowerCase().includes(normalizedSearch)
      );
    }

    return boards;
  }, [whiteboardList.whiteboards, statusFilter, normalizedSearch]);

  const recentBoards = useMemo(() => {
    return [...filteredBoards].sort((a, b) => {
      const aTime = a.last_accessed_at ? new Date(a.last_accessed_at).getTime() : 0;
      const bTime = b.last_accessed_at ? new Date(b.last_accessed_at).getTime() : 0;
      if (bTime !== aTime) return bTime - aTime;
      const aUpdated = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const bUpdated = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return bUpdated - aUpdated;
    });
  }, [filteredBoards]);

  const favoritesBoards = useMemo(() => filteredBoards.filter((board) => board.is_favorite), [filteredBoards]);

  const createdByMeBoards = useMemo(
    () => filteredBoards.filter((board) => board.user_id === whiteboardList.currentUserId),
    [filteredBoards, whiteboardList.currentUserId]
  );


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 3 Cards Animados */}
      <div className="grid gap-4 md:grid-cols-3">
        <TasksCard
          title={t('dashboard.management.tasks.title')}
          description={t('dashboard.management.tasks.description')}
          onOpenWhiteboard={() => handleCreateOrOpen('tasks')}
        />
        <PlansCard
          title={t('dashboard.management.plans.title')}
          description={t('dashboard.management.plans.description')}
        />
        <JourneyCard
          title={t('dashboard.management.journey.title')}
          description={t('dashboard.management.journey.description')}
        />
      </div>

      {/* Tabs com Tabelas */}
      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList key={locale} className="h-9 w-fit">
              <TabsTrigger value="recent" className="text-xs sm:text-sm">
                {t('dashboard.management.tabs.recent')}
              </TabsTrigger>
              <TabsTrigger value="favorites" className="text-xs sm:text-sm">
                {t('dashboard.management.tabs.favorites')}
              </TabsTrigger>
              <TabsTrigger value="createdByMe" className="text-xs sm:text-sm">
                {t('dashboard.management.tabs.createdByMe')}
              </TabsTrigger>
            </TabsList>

            {/* Busca */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('dashboard.management.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>

          {/* Filtro de Status */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">{t('dashboard.management.filters')}:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <ListFilter className="mr-2 h-3 w-3" />
                  {statusFilter === 'all'
                    ? t('dashboard.management.allStatuses')
                    : {
                        active: t('dashboard.management.status.active'),
                        draft: t('dashboard.management.status.draft') ?? 'Rascunho',
                        archived: t('dashboard.management.status.archived') ?? 'Arquivado',
                      }[statusFilter]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel className="text-xs">
                  {t('dashboard.management.filterByStatus')}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusFilterChange('all')} className="text-xs">
                  {t('dashboard.management.allStatuses')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilterChange('active')} className="text-xs">
                  {t('dashboard.management.status.active')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilterChange('draft')} className="text-xs">
                  {t('dashboard.management.status.draft') ?? 'Rascunho'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilterChange('archived')} className="text-xs">
                  {t('dashboard.management.status.archived') ?? 'Arquivado'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value="recent" className="mt-4">
          <WhiteboardDataTable
            whiteboards={recentBoards}
            isLoading={whiteboardList.loading}
            onRowClick={handleRowClick}
            onFavorite={handleFavoriteToggle}
            onDelete={handleDelete}
            collaboratorProfiles={collaboratorProfiles}
          />
        </TabsContent>

        <TabsContent value="favorites" className="mt-4">
          <WhiteboardDataTable
            whiteboards={favoritesBoards}
            isLoading={whiteboardList.loading}
            onRowClick={handleRowClick}
            onFavorite={handleFavoriteToggle}
            onDelete={handleDelete}
            collaboratorProfiles={collaboratorProfiles}
          />
        </TabsContent>

        <TabsContent value="createdByMe" className="mt-4">
          <WhiteboardDataTable
            whiteboards={createdByMeBoards}
            isLoading={whiteboardList.loading}
            onRowClick={handleRowClick}
            onFavorite={handleFavoriteToggle}
            onDelete={handleDelete}
            collaboratorProfiles={collaboratorProfiles}
          />
        </TabsContent>
      </Tabs>

      {/* Whiteboard Dialog */}
      <WhiteboardDialog
        whiteboardId={selectedWhiteboardId}
        open={whiteboardOpen}
        onOpenChange={handleDialogOpenChange}
      />
    </div>
  );
}
