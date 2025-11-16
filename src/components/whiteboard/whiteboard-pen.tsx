import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { WhiteboardItem } from '@/types/whiteboard';

interface WhiteboardPenProps {
  item: WhiteboardItem;
  onUpdate: (id: string, updates: Partial<WhiteboardItem>) => void;
  onDelete: (id: string) => void;
  viewportRef?: React.RefObject<{ zoom: number; pan: { x: number; y: number } }>;
  isEditable?: boolean;
}

export function WhiteboardPen({
  item,
  onDelete,
  isEditable = true
}: WhiteboardPenProps) {
  const [isHovered, setIsHovered] = useState(false);

  // ✅ Função para suavizar o path
  const getSmoothPath = (points: { x: number; y: number }[]) => {
    if (!points || points.length < 2) return '';
    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return path;
  };

  const points = item.points || [];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="absolute inset-0"
      style={{ pointerEvents: 'none' }} // ✅ CRÍTICO: Não bloqueia outros elementos
    >
      {/* ✅ SVG do desenho */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        <path
          d={getSmoothPath(points)}
          stroke={item.color || '#3b82f6'}
          strokeWidth={item.strokeWidth || 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{ 
            vectorEffect: 'non-scaling-stroke',
            pointerEvents: 'stroke' // ✅ Só o path detecta hover
          }}
        />
      </svg>

      {/* ✅ Botão delete (no centro do path) */}
      {isHovered && isEditable && points.length > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          className="absolute p-1.5 bg-red-500 hover:bg-red-600 
                     rounded-full text-white shadow-lg transition-all z-50
                     hover:scale-110"
          style={{
            // ✅ Posicionar no centro aproximado do desenho
            left: `${Math.min(...points.map(p => p.x))}px`,
            top: `${Math.min(...points.map(p => p.y)) - 30}px`,
            pointerEvents: 'auto'
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
