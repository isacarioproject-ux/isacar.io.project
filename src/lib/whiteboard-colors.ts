// Utilitário para mapear cores de formas do whiteboard
export const getShapeColor = (shapeColor?: string) => {
  const colorMap: Record<string, string> = {
    blue: '#3b82f6',
    green: '#10b981',
    purple: '#8b5cf6',
    pink: '#ec4899',
    orange: '#f97316',
    red: '#ef4444',
    yellow: '#eab308',
    cyan: '#06b6d4',
    gray: '#6b7280'
  };
  return colorMap[shapeColor || 'blue'] || '#3b82f6';
};
