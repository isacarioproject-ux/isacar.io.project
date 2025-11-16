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

export const WhiteboardHexagon = ({ 
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
      {/* ✅ APENAS o SVG do hexágono */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        <path
          d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
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
