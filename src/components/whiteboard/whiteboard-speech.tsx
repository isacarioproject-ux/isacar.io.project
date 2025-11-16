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

export const WhiteboardSpeech = ({ 
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
      {/* ✅ APENAS o SVG do balão de fala */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        <path
          d="M15 20 Q15 10 25 10 L75 10 Q85 10 85 20 L85 50 Q85 60 75 60 L45 60 L30 75 L40 60 L25 60 Q15 60 15 50 Z"
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
