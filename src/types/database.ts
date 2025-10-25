// Database types for Supabase tables

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: Project
        Insert: ProjectInsert
        Update: ProjectUpdate
      }
      documents: {
        Row: Document
        Insert: DocumentInsert
        Update: DocumentUpdate
      }
      team_members: {
        Row: TeamMember
        Insert: TeamMemberInsert
        Update: TeamMemberUpdate
      }
    }
  }
}

export type ProjectStatus = 'Planejamento' | 'Em andamento' | 'Concluído' | 'Pausado' | 'Cancelado'

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  status: ProjectStatus
  progress: number
  team_size: number | null
  due_date: string | null
  color: string
  created_at: string
  updated_at: string
}

export interface ProjectInsert {
  user_id: string
  name: string
  description?: string | null
  status?: ProjectStatus
  progress?: number
  team_size?: number | null
  due_date?: string | null
  color?: string
}

export interface ProjectUpdate {
  name?: string
  description?: string | null
  status?: ProjectStatus
  progress?: number
  team_size?: number | null
  due_date?: string | null
  color?: string
}

// Document types
export type DocumentCategory = 'PDF' | 'Word' | 'Excel' | 'PowerPoint' | 'Image' | 'Other'

export interface Document {
  id: string
  user_id: string
  project_id: string | null
  name: string
  description: string | null
  file_url: string | null
  file_type: string | null
  file_size: number | null
  category: DocumentCategory
  tags: string[]
  is_shared: boolean
  shared_with: string[]
  created_at: string
  updated_at: string
}

export interface DocumentInsert {
  user_id: string
  project_id?: string | null
  name: string
  description?: string | null
  file_url?: string | null
  file_type?: string | null
  file_size?: number | null
  category?: DocumentCategory
  tags?: string[]
  is_shared?: boolean
  shared_with?: string[]
}

export interface DocumentUpdate {
  name?: string
  description?: string | null
  project_id?: string | null
  file_url?: string | null
  file_type?: string | null
  file_size?: number | null
  category?: DocumentCategory
  tags?: string[]
  is_shared?: boolean
  shared_with?: string[]
}

// Team Member types
export type TeamMemberRole = 'owner' | 'admin' | 'editor' | 'viewer'
export type TeamMemberStatus = 'pending' | 'active' | 'declined' | 'removed'

export interface TeamMember {
  id: string
  project_id: string
  user_id: string | null
  email: string
  role: TeamMemberRole
  status: TeamMemberStatus
  invited_by: string
  invited_at: string
  joined_at: string | null
  created_at: string
  updated_at: string
}

export interface TeamMemberInsert {
  project_id: string
  email: string
  role?: TeamMemberRole
  status?: TeamMemberStatus
  invited_by: string
}

export interface TeamMemberUpdate {
  role?: TeamMemberRole
  status?: TeamMemberStatus
  user_id?: string | null
  joined_at?: string | null
}
