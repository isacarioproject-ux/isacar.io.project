export type WhiteboardItemType =
  | 'checkbox'
  | 'note'
  | 'text'
  | 'arrow'
  | 'box'
  | 'image'
  | 'circle'
  | 'triangle'
  | 'diamond'
  | 'hexagon'
  | 'star'
  | 'pentagon'
  | 'trapezoid'
  | 'cloud'
  | 'speech'
  | 'heart'
  | 'line'
  | 'pen'

export type ShapeColor = 'blue' | 'green' | 'purple' | 'pink' | 'orange' | 'red' | 'yellow' | 'cyan' | 'gray'

export type WhiteboardType = 'tasks' | 'plans' | 'journey'

export type WhiteboardStatus = 'active' | 'archived' | 'draft'

export interface WhiteboardItem {
  id: string
  type: WhiteboardItemType
  position: { x: number; y: number }
  content?: string
  checked?: boolean // para checkbox
  color?: 'yellow' | 'pink' | 'blue' | 'green' // para notes
  shapeColor?: ShapeColor // para shapes geométricas
  width?: number
  height?: number
  radius?: number // para circles
  points?: { x: number; y: number }[] // para arrows e lines
  imageUrl?: string // para images
  fill?: boolean // se a forma é preenchida ou apenas contorno
  // Novos opcionais (backward-compatible)
  strokeWidth?: number // para linhas/setas
  arrowStyle?: 'triangle' | 'bar' | 'diamond' | 'line' // variações de ponta de seta
  opacity?: number
  penStyle?: 'pen' | 'marker'
  // Texto
  fontFamily?: string
  fontWeight?: number
  fontSize?: number
  // Autoria (para undo/redo por usuário)
  created_by?: string
  last_edited_by?: string
}

export interface Whiteboard {
  id: string
  user_id: string
  project_id: string | null
  team_id: string | null
  name: string
  items: WhiteboardItem[]
  is_favorite: boolean
  whiteboard_type: WhiteboardType
  status: WhiteboardStatus
  collaborators: string[] // user_ids
  created_at: string
  updated_at: string
  last_accessed_at: string | null
}

export interface WhiteboardCollaborator {
  id: string
  user_id: string
  whiteboard_id: string
  avatar_url?: string
  name: string
  email: string
  is_online: boolean
  last_seen: string
}
