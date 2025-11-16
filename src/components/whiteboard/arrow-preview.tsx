import React from 'react'

interface ArrowPreviewProps {
  startPoint: { x: number; y: number }
  currentPoint: { x: number; y: number }
  style: 'straight' | 'curved' | 'double' | 'dashed' | 'thick'
  color: string
  viewportRef: React.RefObject<{ zoom: number; pan: { x: number; y: number } }>
}

export function ArrowPreview({
  startPoint,
  currentPoint,
  style,
  color,
  viewportRef
}: ArrowPreviewProps) {
  const scale = viewportRef.current?.zoom || 1

  // IMPORTANTE: NÃO adicionar pan.x/pan.y aqui porque o canvas já está transformado
  const startX = startPoint.x * scale
  const startY = startPoint.y * scale
  const endX = currentPoint.x * scale
  const endY = currentPoint.y * scale

  const angle = Math.atan2(endY - startY, endX - startX)
  const arrowSize = 12

  const arrowPoint1X = endX - arrowSize * Math.cos(angle - Math.PI / 6)
  const arrowPoint1Y = endY - arrowSize * Math.sin(angle - Math.PI / 6)
  const arrowPoint2X = endX - arrowSize * Math.cos(angle + Math.PI / 6)
  const arrowPoint2Y = endY - arrowSize * Math.sin(angle + Math.PI / 6)

  // Para seta dupla
  const reverseAngle = angle + Math.PI
  const arrow2Point1X = startX - arrowSize * Math.cos(reverseAngle - Math.PI / 6)
  const arrow2Point1Y = startY - arrowSize * Math.sin(reverseAngle - Math.PI / 6)
  const arrow2Point2X = startX - arrowSize * Math.cos(reverseAngle + Math.PI / 6)
  const arrow2Point2Y = startY - arrowSize * Math.sin(reverseAngle + Math.PI / 6)

  // Renderizar baseado no estilo
  const renderArrowPath = () => {
    switch (style) {
      case 'straight':
        return (
          <>
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={color}
              strokeWidth={2}
              opacity={0.7}
            />
            <polygon
              points={`${endX},${endY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
              fill={color}
              opacity={0.7}
            />
          </>
        )

      case 'double':
        return (
          <>
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={color}
              strokeWidth={2}
              opacity={0.7}
            />
            <polygon
              points={`${endX},${endY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
              fill={color}
              opacity={0.7}
            />
            <polygon
              points={`${startX},${startY} ${arrow2Point1X},${arrow2Point1Y} ${arrow2Point2X},${arrow2Point2Y}`}
              fill={color}
              opacity={0.7}
            />
          </>
        )

      case 'curved':
        const midX = (startX + endX) / 2
        const midY = (startY + endY) / 2
        const perpX = -(endY - startY) / 4
        const perpY = (endX - startX) / 4
        const ctrlX = midX + perpX
        const ctrlY = midY + perpY
        
        return (
          <>
            <path
              d={`M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`}
              stroke={color}
              strokeWidth={2}
              fill="none"
              opacity={0.7}
            />
            <polygon
              points={`${endX},${endY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
              fill={color}
              opacity={0.7}
            />
          </>
        )

      case 'dashed':
        return (
          <>
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={color}
              strokeWidth={2}
              strokeDasharray="5,5"
              opacity={0.7}
            />
            <polygon
              points={`${endX},${endY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
              fill={color}
              opacity={0.7}
            />
          </>
        )

      case 'thick':
        return (
          <>
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={color}
              strokeWidth={4}
              opacity={0.7}
            />
            <polygon
              points={`${endX},${endY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
              fill={color}
              opacity={0.7}
            />
          </>
        )

      default:
        return null
    }
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    >
      {renderArrowPath()}
    </svg>
  )
}
