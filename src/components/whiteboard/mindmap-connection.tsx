import type { WhiteboardItem } from '@/types/whiteboard'

interface MindMapConnectionProps {
  connection: WhiteboardItem
  fromNode: WhiteboardItem | undefined
  toNode: WhiteboardItem | undefined
  viewportRef: React.RefObject<{ zoom: number; pan: { x: number; y: number } }>
}

export function MindMapConnection({
  connection,
  fromNode,
  toNode,
  viewportRef
}: MindMapConnectionProps) {
  if (!fromNode || !toNode) return null

  // Não renderizar se o node pai está colapsado
  if (fromNode.collapsed) return null

  // Calcular centro dos nodes
  // IMPORTANTE: NÃO adicionar pan.x/pan.y aqui porque o canvas já está transformado
  const scale = viewportRef.current?.zoom || 1
  
  const fromCenterX = (fromNode.position.x + (fromNode.width || 200) / 2) * scale
  const fromCenterY = (fromNode.position.y + (fromNode.height || 100) / 2) * scale
  const toCenterX = (toNode.position.x + (toNode.width || 180) / 2) * scale
  const toCenterY = (toNode.position.y + (toNode.height || 80) / 2) * scale

  // Estilo da linha
  const style = connection.metadata?.connectionStyle || 'curved'
  const color = fromNode.metadata?.backgroundColor || '#8b5cf6'

  const renderPath = () => {
    if (style === 'curved') {
      // Curva suave (bezier)
      const midX = (fromCenterX + toCenterX) / 2
      const midY = (fromCenterY + toCenterY) / 2
      
      // Ponto de controle perpendicular à linha
      const dx = toCenterX - fromCenterX
      const dy = toCenterY - fromCenterY
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance === 0) return null
      
      const offset = distance * 0.2 // 20% da distância
      
      const ctrlX = midX - (dy / distance) * offset
      const ctrlY = midY + (dx / distance) * offset

      return (
        <path
          d={`M ${fromCenterX} ${fromCenterY} Q ${ctrlX} ${ctrlY} ${toCenterX} ${toCenterY}`}
          stroke={color}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          opacity={0.7}
          style={{ vectorEffect: 'non-scaling-stroke' }}
        />
      )
    }

    if (style === 'stepped') {
      // Linha em degraus (estilo organograma)
      const midX = (fromCenterX + toCenterX) / 2

      return (
        <path
          d={`M ${fromCenterX} ${fromCenterY} 
              L ${midX} ${fromCenterY} 
              L ${midX} ${toCenterY} 
              L ${toCenterX} ${toCenterY}`}
          stroke={color}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          opacity={0.7}
          style={{ vectorEffect: 'non-scaling-stroke' }}
        />
      )
    }

    // Linha reta (fallback)
    return (
      <line
        x1={fromCenterX}
        y1={fromCenterY}
        x2={toCenterX}
        y2={toCenterY}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.7}
        style={{ vectorEffect: 'non-scaling-stroke' }}
      />
    )
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ 
        zIndex: 1,
        width: '100%',
        height: '100%',
        overflow: 'visible'
      }}
    >
      {renderPath()}
    </svg>
  )
}
