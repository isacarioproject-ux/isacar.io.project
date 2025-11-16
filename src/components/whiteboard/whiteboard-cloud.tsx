import { WhiteboardShapeBase } from './whiteboard-shape-base';
import { getShapeColor } from '@/lib/whiteboard-colors';
import type { WhiteboardItem } from '@/types/whiteboard';

interface Props {
  item: WhiteboardItem;
  onUpdate: (id: string, updates: Partial<WhiteboardItem>) => void;
  onDelete: (id: string) => void;
  viewportRef?: React.RefObject<{ zoom: number; pan: { x: number; y: number } }>;
  isEditable?: boolean;
}

export const WhiteboardCloud = ({ 
  item, 
  onUpdate, 
  onDelete, 
  viewportRef, 
  isEditable = true 
}: Props) => {
  const color = getShapeColor(item.shapeColor);

  return (
    <WhiteboardShapeBase
      item={item}
      onUpdate={onUpdate}
      onDelete={onDelete}
      viewportRef={viewportRef}
      isEditable={isEditable}
      showTextInput={true}
    >
      {/* ✅ APENAS o SVG da nuvem */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        <path
          d="M25,60 Q25,50 35,50 Q35,35 50,35 Q65,35 65,50 Q75,50 75,60 Q75,70 65,70 L35,70 Q25,70 25,60"
          fill={item.fill ? color : 'none'}
          stroke={color}
          strokeWidth="2"
          style={{ vectorEffect: 'non-scaling-stroke' }}
          className="transition-all duration-200"
        />
      </svg>
    </WhiteboardShapeBase>
  );
};
