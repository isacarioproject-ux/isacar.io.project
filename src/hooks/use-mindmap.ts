import { useCallback } from 'react'
import { nanoid } from 'nanoid'
import { toast } from 'sonner'
import type { WhiteboardItem } from '@/types/whiteboard'

interface UseMindMapProps {
  items: WhiteboardItem[]
  addItem: (item: WhiteboardItem) => void
  updateItem: (id: string, updates: Partial<WhiteboardItem>) => void
  deleteItem: (id: string) => void
}

export function useMindMap({ items, addItem, updateItem, deleteItem }: UseMindMapProps) {
  
  // Cores por nível
  const LEVEL_COLORS = [
    '#8b5cf6', // Roxo - Root
    '#3b82f6', // Azul - Level 1
    '#10b981', // Verde - Level 2
    '#f59e0b', // Laranja - Level 3
    '#ef4444', // Vermelho - Level 4+
  ]

  // Criar node raiz (central)
  const createRootNode = useCallback((x: number, y: number) => {
    console.log('🧠 MIND MAP: Creating root node at position:', { x, y })
    const rootNode: WhiteboardItem = {
      id: nanoid(),
      type: 'mindmap-node',
      position: { x, y },
      width: 200,
      height: 100,
      content: 'Ideia Central',
      shapeColor: 'purple',
      childIds: [],
      level: 0,
      collapsed: false,
      metadata: {
        backgroundColor: LEVEL_COLORS[0],
        textColor: '#ffffff',
        borderColor: '#7c3aed'
      }
    }

    addItem(rootNode)
    toast.success('Mind Map criado! 🧠')
    return rootNode
  }, [addItem])

  // Adicionar node filho
  const addChildNode = useCallback((parentNode: WhiteboardItem) => {
    const parentLevel = parentNode.level || 0
    const childLevel = parentLevel + 1
    const color = LEVEL_COLORS[Math.min(childLevel, LEVEL_COLORS.length - 1)]

    // Calcular posição do filho
    const existingChildren = items.filter(
      el => el.type === 'mindmap-node' && el.parentId === parentNode.id
    )
    const childIndex = existingChildren.length
    
    // Posicionar em círculo ao redor do pai
    const angleStep = Math.PI * 2 / ((parentNode.childIds?.length || 0) + 1)
    const angle = angleStep * (childIndex + 1) - Math.PI / 2
    const distance = 250 // Distância do pai
    
    const childX = parentNode.position.x + Math.cos(angle) * distance
    const childY = parentNode.position.y + Math.sin(angle) * distance

    // Criar node filho
    const childNode: WhiteboardItem = {
      id: nanoid(),
      type: 'mindmap-node',
      position: { x: childX, y: childY },
      width: 180,
      height: 80,
      content: 'Nova Ideia',
      shapeColor: childLevel === 1 ? 'blue' : childLevel === 2 ? 'green' : childLevel === 3 ? 'orange' : 'red',
      parentId: parentNode.id,
      childIds: [],
      level: childLevel,
      collapsed: false,
      metadata: {
        backgroundColor: color,
        textColor: '#ffffff',
        borderColor: color
      }
    }

    // Criar conexão
    const connection: WhiteboardItem = {
      id: nanoid(),
      type: 'mindmap-connection',
      position: { x: 0, y: 0 },
      fromNodeId: parentNode.id,
      toNodeId: childNode.id,
      metadata: {
        connectionStyle: 'curved'
      }
    }

    // Atualizar pai
    updateItem(parentNode.id, {
      childIds: [...(parentNode.childIds || []), childNode.id]
    })

    addItem(childNode)
    addItem(connection)
    toast.success(`Node Level ${childLevel} adicionado!`)

    return childNode
  }, [items, addItem, updateItem])

  // Deletar node e seus filhos recursivamente
  const deleteNodeRecursive = useCallback((nodeId: string) => {
    const node = items.find(el => el.id === nodeId)
    if (!node) return

    // Coletar IDs para deletar (node + filhos + conexões)
    const idsToDelete = new Set<string>([nodeId])

    // Função recursiva para pegar todos os filhos
    const collectChildIds = (id: string) => {
      const n = items.find(el => el.id === id)
      if (!n || !n.childIds) return
      
      n.childIds.forEach((childId: string) => {
        idsToDelete.add(childId)
        collectChildIds(childId)
      })
    }

    collectChildIds(nodeId)

    // Pegar conexões relacionadas
    const connections = items.filter(
      el => el.type === 'mindmap-connection' &&
            (idsToDelete.has(el.fromNodeId || '') || idsToDelete.has(el.toNodeId || ''))
    )
    connections.forEach(conn => idsToDelete.add(conn.id))

    // Remover do pai
    if (node.parentId) {
      const parent = items.find(el => el.id === node.parentId)
      if (parent && parent.childIds) {
        updateItem(parent.id, {
          childIds: parent.childIds.filter((id: string) => id !== nodeId)
        })
      }
    }

    // Deletar todos os itens coletados
    idsToDelete.forEach(id => deleteItem(id))
    
    toast.success('Node deletado!')
  }, [items, updateItem, deleteItem])

  // Colapsar/Expandir node
  const toggleNodeCollapse = useCallback((nodeId: string) => {
    const node = items.find(el => el.id === nodeId)
    if (!node) return

    updateItem(nodeId, {
      collapsed: !node.collapsed
    })

    toast.success(node.collapsed ? 'Expandido!' : 'Colapsado!')
  }, [items, updateItem])

  // Reorganizar filhos em círculo
  const reorganizeChildren = useCallback((parentId: string) => {
    const parent = items.find(el => el.id === parentId)
    if (!parent) return

    const children = items.filter(
      el => el.type === 'mindmap-node' && el.parentId === parentId
    )

    if (children.length === 0) return

    const angleStep = Math.PI * 2 / children.length
    const distance = 250

    children.forEach((child, index) => {
      const angle = angleStep * index - Math.PI / 2
      const newX = parent.position.x + Math.cos(angle) * distance
      const newY = parent.position.y + Math.sin(angle) * distance

      updateItem(child.id, {
        position: { x: newX, y: newY }
      })
    })

    toast.success('Filhos reorganizados!')
  }, [items, updateItem])

  return {
    createRootNode,
    addChildNode,
    deleteNodeRecursive,
    toggleNodeCollapse,
    reorganizeChildren
  }
}
