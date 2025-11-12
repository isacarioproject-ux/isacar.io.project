import { supabase } from '@/lib/supabase';
import { Task, TaskWithDetails, Comment, Activity, User, CustomField, Checklist, Attachment } from '@/types/tasks';

// =====================================================
// HELPER: Converter DB Task para Task do Frontend
// =====================================================

function dbTaskToTask(dbTask: any): Task {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || '',
    status: dbTask.status,
    priority: dbTask.priority,
    due_date: dbTask.due_date,
    start_date: dbTask.start_date,
    created_at: dbTask.created_at,
    completed_at: dbTask.completed_at,
    assignee_ids: dbTask.assigned_to || [],
    creator_id: dbTask.created_by,
    tag_ids: dbTask.labels || [],
    project_id: dbTask.project_id,
    list_id: null, // Não existe na tabela atual
    parent_task_id: dbTask.parent_task_id,
    custom_fields: dbTask.custom_fields ? Object.entries(dbTask.custom_fields).map(([key, value]: [string, any]) => ({
      id: key,
      name: key,
      type: 'text',
      value: value,
    })) : [],
  };
}

// =====================================================
// WORKSPACE & USER
// =====================================================

export async function getCurrentUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Usuário não autenticado');
  return user.id;
}

export async function getCurrentWorkspaceId(): Promise<string> {
  // Buscar workspace ativo do usuário
  const userId = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw new Error('Nenhum workspace ativo encontrado');
  }

  return data.workspace_id;
}

export async function getUsers(): Promise<User[]> {
  const workspaceId = await getCurrentWorkspaceId();
  
  // Buscar membros do workspace
  const { data, error } = await supabase
    .from('workspace_members')
    .select(`
      user_id,
      profiles:user_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('workspace_id', workspaceId);

  if (error) throw error;

  return data.map((member: any) => ({
    id: member.user_id,
    name: member.profiles?.full_name || 'Usuário',
    email: '', // Email não está disponível em profiles
    avatar: member.profiles?.avatar_url,
  }));
}

// =====================================================
// TASKS
// =====================================================

export async function getTasks(): Promise<Task[]> {
  const workspaceId = await getCurrentWorkspaceId();

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(dbTaskToTask);
}

export async function getTaskById(id: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return dbTaskToTask(data);
}

export async function getTaskWithDetails(id: string): Promise<TaskWithDetails | null> {
  const task = await getTaskById(id);
  if (!task) return null;

  // Buscar subtarefas
  const { data: subtasksData } = await supabase
    .from('tasks')
    .select('*')
    .eq('parent_task_id', id);

  const subtasks = subtasksData ? subtasksData.map(dbTaskToTask) : [];

  // Buscar checklists
  const { data: checklistsData } = await supabase
    .from('task_checklists')
    .select('*')
    .eq('task_id', id)
    .order('position');

  const checklists: Checklist[] = checklistsData ? checklistsData.map((cl: any) => ({
    id: cl.id,
    title: cl.title,
    items: cl.items || [],
  })) : [];

  // Buscar attachments
  const { data: attachmentsData } = await supabase
    .from('task_attachments')
    .select('*')
    .eq('task_id', id)
    .order('created_at', { ascending: false });

  const attachments: Attachment[] = attachmentsData ? attachmentsData.map((att: any) => ({
    id: att.id,
    name: att.file_name,
    url: att.file_url,
    type: att.file_type || '',
    size: att.file_size || 0,
    uploaded_at: att.created_at,
  })) : [];

  // Buscar comments
  const { data: commentsData } = await supabase
    .from('task_comments')
    .select(`
      *,
      profiles:user_id (
        full_name
      )
    `)
    .eq('task_id', id)
    .order('created_at', { ascending: false });

  const comments: Comment[] = commentsData ? commentsData.map((c: any) => ({
    id: c.id,
    task_id: c.task_id,
    user_id: c.user_id,
    user_name: c.profiles?.full_name || 'Usuário',
    text: c.content,
    created_at: c.created_at,
    mentions: c.mentions || [],
  })) : [];

  // Buscar activities
  const { data: activitiesData } = await supabase
    .from('task_activities')
    .select(`
      *,
      profiles:user_id (
        full_name
      )
    `)
    .eq('task_id', id)
    .order('created_at', { ascending: false });

  const activities: Activity[] = activitiesData ? activitiesData.map((a: any) => ({
    id: a.id,
    task_id: a.task_id,
    user_id: a.user_id,
    user_name: a.profiles?.full_name || 'Usuário',
    action: a.action,
    details: a.changes ? JSON.stringify(a.changes) : '',
    created_at: a.created_at,
  })) : [];

  return {
    ...task,
    subtasks,
    checklists,
    attachments,
    comments,
    activities,
  };
}

export async function createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
  const userId = await getCurrentUserId();
  const workspaceId = await getCurrentWorkspaceId();

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      workspace_id: workspaceId,
      created_by: userId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      start_date: task.start_date,
      due_date: task.due_date,
      parent_task_id: task.parent_task_id,
      assigned_to: task.assignee_ids,
      labels: task.tag_ids,
      custom_fields: task.custom_fields.reduce((acc: any, field) => {
        acc[field.name] = field.value;
        return acc;
      }, {}),
    })
    .select()
    .single();

  if (error) throw error;

  // Registrar atividade
  await supabase.from('task_activities').insert({
    task_id: data.id,
    user_id: userId,
    action: 'created',
    changes: { title: task.title },
  });

  return dbTaskToTask(data);
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const userId = await getCurrentUserId();

  const updateData: any = {};
  
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.priority !== undefined) updateData.priority = updates.priority;
  if (updates.start_date !== undefined) updateData.start_date = updates.start_date;
  if (updates.due_date !== undefined) updateData.due_date = updates.due_date;
  if (updates.assignee_ids !== undefined) updateData.assigned_to = updates.assignee_ids;
  if (updates.tag_ids !== undefined) updateData.labels = updates.tag_ids;
  if (updates.completed_at !== undefined) updateData.completed_at = updates.completed_at;
  
  if (updates.custom_fields !== undefined) {
    updateData.custom_fields = updates.custom_fields.reduce((acc: any, field) => {
      acc[field.name] = field.value;
      return acc;
    }, {});
  }

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Registrar atividade
  await supabase.from('task_activities').insert({
    task_id: id,
    user_id: userId,
    action: 'updated',
    changes: updateData,
  });

  return dbTaskToTask(data);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =====================================================
// COMMENTS
// =====================================================

export async function addComment(taskId: string, text: string, mentions: string[] = []): Promise<Comment> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('task_comments')
    .insert({
      task_id: taskId,
      user_id: userId,
      content: text,
      mentions,
    })
    .select(`
      *,
      profiles:user_id (
        full_name
      )
    `)
    .single();

  if (error) throw error;

  // Registrar atividade
  await supabase.from('task_activities').insert({
    task_id: taskId,
    user_id: userId,
    action: 'commented',
    changes: { comment: text },
  });

  return {
    id: data.id,
    task_id: data.task_id,
    user_id: data.user_id,
    user_name: data.profiles?.full_name || 'Você',
    text: data.content,
    created_at: data.created_at,
    mentions: data.mentions || [],
  };
}
