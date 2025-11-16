import { useState, useCallback, useRef, useEffect } from 'react';

interface ViewportState {
  zoom: number;
  pan: { x: number; y: number };
}

interface UseWhiteboardViewportOptions {
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  containerRef: React.RefObject<HTMLElement>;
}

export const useWhiteboardViewport = ({
  minZoom = 0.1,
  maxZoom = 5,
  zoomStep = 0.1,
  containerRef
}: UseWhiteboardViewportOptions) => {
  const [viewport, setViewport] = useState<ViewportState>({
    zoom: 1,
    pan: { x: 0, y: 0 }
  });

  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panInitialRef = useRef({ x: 0, y: 0 });

  // Conversão de coordenadas: mouse/touch → canvas
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    if (!containerRef.current) return { x: screenX, y: screenY };
    
    const rect = containerRef.current.getBoundingClientRect();
    const canvasX = (screenX - rect.left - viewport.pan.x) / viewport.zoom;
    const canvasY = (screenY - rect.top - viewport.pan.y) / viewport.zoom;
    
    return { x: canvasX, y: canvasY };
  }, [viewport.zoom, viewport.pan, containerRef]);

  // Conversão de coordenadas: canvas → screen
  const canvasToScreen = useCallback((canvasX: number, canvasY: number) => {
    if (!containerRef.current) return { x: canvasX, y: canvasY };
    
    const rect = containerRef.current.getBoundingClientRect();
    const screenX = canvasX * viewport.zoom + viewport.pan.x + rect.left;
    const screenY = canvasY * viewport.zoom + viewport.pan.y + rect.top;
    
    return { x: screenX, y: screenY };
  }, [viewport.zoom, viewport.pan, containerRef]);

  // Zoom com ponto focal (mouse position)
  const zoomAtPoint = useCallback((delta: number, focalX: number, focalY: number) => {
    setViewport(prev => {
      const newZoom = Math.min(Math.max(prev.zoom + delta, minZoom), maxZoom);
      const zoomRatio = newZoom / prev.zoom;
      
      // Ajustar pan para manter o ponto focal no mesmo lugar
      const newPanX = focalX - (focalX - prev.pan.x) * zoomRatio;
      const newPanY = focalY - (focalY - prev.pan.y) * zoomRatio;
      
      return {
        zoom: newZoom,
        pan: { x: newPanX, y: newPanY }
      };
    });
  }, [minZoom, maxZoom]);

  // Zoom simples (centro da tela)
  const zoomIn = useCallback(() => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    zoomAtPoint(zoomStep, centerX, centerY);
  }, [zoomAtPoint, zoomStep, containerRef]);

  const zoomOut = useCallback(() => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    zoomAtPoint(-zoomStep, centerX, centerY);
  }, [zoomAtPoint, zoomStep, containerRef]);

  const resetViewport = useCallback(() => {
    setViewport({ zoom: 1, pan: { x: 0, y: 0 } });
  }, []);

  // Pan handlers
  const startPan = useCallback((clientX: number, clientY: number) => {
    setIsPanning(true);
    panStartRef.current = { x: clientX, y: clientY };
    panInitialRef.current = { ...viewport.pan };
  }, [viewport.pan]);

  const updatePan = useCallback((clientX: number, clientY: number) => {
    if (!isPanning) return;
    
    const deltaX = clientX - panStartRef.current.x;
    const deltaY = clientY - panStartRef.current.y;
    
    setViewport(prev => ({
      ...prev,
      pan: {
        x: panInitialRef.current.x + deltaX,
        y: panInitialRef.current.y + deltaY
      }
    }));
  }, [isPanning]);

  const endPan = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Wheel handler para zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY * -0.001;
    const scaledDelta = delta * zoomStep;
    
    zoomAtPoint(scaledDelta, e.clientX, e.clientY);
  }, [zoomAtPoint, zoomStep]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2) { // Middle or right button
      e.preventDefault();
      startPan(e.clientX, e.clientY);
    }
  }, [startPan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    updatePan(e.clientX, e.clientY);
  }, [updatePan]);

  const handleMouseUp = useCallback(() => {
    endPan();
  }, [endPan]);

  // Touch handlers para mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      startPan(touch.clientX, touch.clientY);
    } else if (e.touches.length === 2) {
      // TODO: Implementar pinch-to-zoom
      endPan();
    }
  }, [startPan, endPan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning) {
      e.preventDefault();
      const touch = e.touches[0];
      updatePan(touch.clientX, touch.clientY);
    }
  }, [updatePan, isPanning]);

  const handleTouchEnd = useCallback(() => {
    endPan();
  }, [endPan]);

  // Adicionar event listeners para wheel
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel, containerRef]);

  // CSS transform para aplicar no container do canvas
  const canvasTransform = `scale(${viewport.zoom}) translate(${viewport.pan.x / viewport.zoom}px, ${viewport.pan.y / viewport.zoom}px)`;

  return {
    // Estado
    zoom: viewport.zoom,
    pan: viewport.pan,
    isPanning,
    
    // Funções de controle
    zoomIn,
    zoomOut,
    zoomAtPoint,
    resetViewport,
    
    // Conversão de coordenadas
    screenToCanvas,
    canvasToScreen,
    
    // Event handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    
    // CSS
    canvasTransform,
    
    // Pan manual
    startPan,
    updatePan,
    endPan
  };
};
