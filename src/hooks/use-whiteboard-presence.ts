import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface Collaborator {
  id: string
  name: string
  avatar?: string
  color: string
  cursor?: { x: number; y: number }
  lastSeen: number
}

const colors = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
]

export const useWhiteboardPresence = (whiteboardId?: string, userId?: string) => {
  const [collaborators, setCollaborators] = useState<Map<string, Collaborator>>(new Map())
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!whiteboardId || !userId) return

    // Criar canal de presença
    const presenceChannel = supabase.channel(`whiteboard:${whiteboardId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    })

    // Sincronizar presença
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const newCollaborators = new Map<string, Collaborator>()

        Object.entries(state).forEach(([key, presences]) => {
          const presence = presences[0] as any
          if (presence && key !== userId) {
            newCollaborators.set(key, {
              id: key,
              name: presence.name || 'Anonymous',
              avatar: presence.avatar,
              color: presence.color || colors[Math.floor(Math.random() * colors.length)],
              cursor: presence.cursor,
              lastSeen: Date.now(),
            })
          }
        })

        setCollaborators(newCollaborators)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key)
        setCollaborators(prev => {
          const next = new Map(prev)
          next.delete(key)
          return next
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Obter info do usuário atual
          const { data: { user } } = await supabase.auth.getUser()
          
          await presenceChannel.track({
            name: user?.user_metadata?.name || user?.email || 'Anonymous',
            avatar: user?.user_metadata?.avatar_url,
            color: colors[Math.floor(Math.random() * colors.length)],
            online_at: new Date().toISOString(),
          })
        }
      })

    setChannel(presenceChannel)

    return () => {
      presenceChannel.unsubscribe()
    }
  }, [whiteboardId, userId])

  const updateCursor = (x: number, y: number) => {
    if (channel) {
      channel.track({ cursor: { x, y } })
    }
  }

  return {
    collaborators: Array.from(collaborators.values()),
    updateCursor,
  }
}
