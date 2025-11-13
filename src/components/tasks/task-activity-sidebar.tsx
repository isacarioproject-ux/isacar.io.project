import { addComment, getCurrentUserId, addTaskLink, deleteTaskLink } from '@/lib/tasks/tasks-storage';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Comment, Activity, TaskLink } from '@/types/tasks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AtSign, Paperclip, Send, Smile, Link2, Plus, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/hooks/use-i18n';

interface TaskActivitySidebarProps {
  taskId: string;
  comments: Comment[];
  activities: Activity[];
  links?: TaskLink[];
  onUpdate: () => void;
}

export function TaskActivitySidebar({
  taskId,
  comments,
  activities,
  links = [],
  onUpdate,
}: TaskActivitySidebarProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'atividade' | 'comentarios' | 'links'>('atividade');
  const [commentText, setCommentText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    try {
    const userId = await getCurrentUserId();
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      task_id: taskId,
      user_id: userId,
        user_name: 'Você',
      text: commentText,
      created_at: new Date().toISOString(),
      mentions: [],
    };

    await addComment(newComment);
    setCommentText('');
    toast.success(t('tasks.activity.commentAdded'));
    onUpdate();
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error('Erro ao adicionar comentário');
    }
  };

  const handleAddLink = async () => {
    if (!linkUrl.trim()) {
      toast.error('Digite uma URL válida');
      return;
    }

    try {
      // Validar URL
      let url = linkUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }

      await addTaskLink(taskId, url, linkTitle || undefined);
      setLinkUrl('');
      setLinkTitle('');
      toast.success('Link adicionado');
      onUpdate();
    } catch (error) {
      console.error('Erro ao adicionar link:', error);
      toast.error('Erro ao adicionar link');
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await deleteTaskLink(linkId);
      toast.success('Link removido');
      onUpdate();
    } catch (error) {
      console.error('Erro ao remover link:', error);
      toast.error('Erro ao remover link');
    }
  };

  const getDomainFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

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

  const allActivities = [
    ...(activities || []).map(a => ({ ...a, type: 'activity' as const })),
    ...(comments || []).map(c => ({ ...c, type: 'comment' as const })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black border-l dark:border-gray-800">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-800 bg-white dark:bg-black">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="w-full">
            <TabsTrigger value="atividade" className="flex-1 text-xs">
              {t('tasks.activity.title')}
            </TabsTrigger>
            <TabsTrigger value="comentarios" className="flex-1 text-xs">
              {t('tasks.activity.comments')} ({(comments || []).length})
            </TabsTrigger>
            <TabsTrigger value="links" className="flex-1 text-xs">
              Links ({(links || []).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {activeTab === 'atividade' && (
          <>
            {allActivities.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-3"
              >
                <Avatar className="size-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {(item.user_name || 'U').substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="dark:text-gray-100">{item.user_name || 'Usuário'}</span>
                    <span className="text-gray-600 dark:text-gray-400 ml-1">
                      {item.type === 'activity' ? item.details : 'comentou'}
                    </span>
                  </div>
                  {item.type === 'comment' && (
                    <div className="mt-1 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
                      {item.text}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatTimestamp(item.created_at)}
                  </div>
                </div>
              </motion.div>
            ))}
            {allActivities.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center text-gray-500 dark:text-gray-400 py-8"
              >
                <p className="text-sm">{t('tasks.activity.noActivity')}</p>
              </motion.div>
            )}
          </>
        )}

        {activeTab === 'comentarios' && (
          <>
            {(comments || []).map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-3"
              >
                <Avatar className="size-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {(comment.user_name || 'U').substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm dark:text-gray-100">{comment.user_name || 'Usuário'}</div>
                  <div className="mt-1 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
                    {comment.text}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatTimestamp(comment.created_at)}
                  </div>
                </div>
              </motion.div>
            ))}
            {(comments || []).length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center text-gray-500 dark:text-gray-400 py-8"
              >
                <p className="text-sm">{t('tasks.activity.noComments')}</p>
                <p className="text-xs mt-1">{t('tasks.activity.beFirst')}</p>
              </motion.div>
            )}
          </>
        )}

        {activeTab === 'links' && (
          <>
            {(links || []).map((link, index) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 border dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link2 className="size-4 text-gray-400 flex-shrink-0" />
                        <p className="text-sm font-medium dark:text-gray-100 truncate">
                          {link.title || getDomainFromUrl(link.url)}
                        </p>
                        <ExternalLink className="size-3 text-gray-400 flex-shrink-0" />
                      </div>
                      {link.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {link.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                        {getDomainFromUrl(link.url)}
                      </p>
                    </div>
                  </a>
                </div>
                <button
                  onClick={() => handleDeleteLink(link.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <X className="size-4 text-red-500" />
                </button>
              </motion.div>
            ))}
            {(links || []).length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center text-gray-500 dark:text-gray-400 py-8"
              >
                <Link2 className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum link adicionado</p>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Input Footer - Comentário ou Link */}
      <div className="p-4 border-t dark:border-gray-800 bg-white dark:bg-black">
        {activeTab === 'comentarios' ? (
          <>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder={t('tasks.activity.writeComment')}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendComment();
              }
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title={t('tasks.activity.mention')}
            >
              <AtSign className="size-4 text-gray-600 dark:text-gray-400" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title={t('tasks.activity.emoji')}
            >
              <Smile className="size-4 text-gray-600 dark:text-gray-400" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title={t('tasks.activity.attach')}
            >
              <Paperclip className="size-4 text-gray-600 dark:text-gray-400" />
            </motion.button>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="sm"
              onClick={handleSendComment}
              disabled={!commentText.trim()}
            >
              <Send className="size-4 mr-1" />
              {t('tasks.activity.send')}
            </Button>
          </motion.div>
        </div>
          </>
        ) : activeTab === 'links' ? (
          <div className="space-y-2">
            <Input
              placeholder="https://exemplo.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLink();
                }
              }}
              className="text-sm"
            />
            <Input
              placeholder="Título (opcional)"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLink();
                }
              }}
              className="text-sm"
            />
            <Button
              size="sm"
              onClick={handleAddLink}
              disabled={!linkUrl.trim()}
              className="w-full"
            >
              <Plus className="size-4 mr-1" />
              Adicionar Link
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}