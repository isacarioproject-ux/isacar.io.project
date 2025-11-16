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

export const WhiteboardHeart = ({ 
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
      {/* ✅ APENAS o SVG do coração */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        <path
          d="M50,90 C20,70 5,55 5,40 C5,25 15,15 27.5,15 C37,15 45,20 50,27 C55,20 63,15 72.5,15 C85,15 95,25 95,40 C95,55 80,70 50,90"
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
