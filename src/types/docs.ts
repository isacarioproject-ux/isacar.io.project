export interface Document {
  id: string
  user_id: string
  project_id: string | null
  parent_id: string | null // ✅ Suporte a hierarquia
  name: string
  file_type: string
  file_size: number
  file_url: string
  description: string | null
  category: string
  is_wiki: boolean
  icon: string | null
  cover_image: string | null
  created_at: string
  updated_at: string
}

export interface DocumentWithChildren extends Document {
  children?: DocumentWithChildren[]
  level?: number
}
