import { useState, useCallback, useMemo } from 'react';
import type { WhiteboardItem } from '@/types/whiteboard';

interface LayerState {
  itemId: string;
  zIndex: number;
  lastInteracted: number;
}

export const useWhiteboardLayers = (items: WhiteboardItem[]) => {
  const [layers, setLayers] = useState<LayerState[]>([]);

  // Inicializar layers baseado nos items existentes
  const initializeLayers = useCallback(() => {
    const newLayers: LayerState[] = items.map((item, index) => ({
      itemId: item.id,
      zIndex: index + 1,
      lastInteracted: Date.now() - (items.length - index) * 1000 // Ordem inicial
    }));
    
    setLayers(newLayers);
  }, [items]);

  // Trazer item para frente (maior z-index)
  const bringToFront = useCallback((itemId: string) => {
    setLayers(prev => {
      const maxZIndex = Math.max(...prev.map(l => l.zIndex), 0);
      
      return prev.map(layer => 
        layer.itemId === itemId 
          ? { ...layer, zIndex: maxZIndex + 1, lastInteracted: Date.now() }
          : layer
      );
    });
  }, []);

  // Enviar item para trás (menor z-index)
  const sendToBack = useCallback((itemId: string) => {
    setLayers(prev => {
      const minZIndex = Math.min(...prev.map(l => l.zIndex), 1);
      
      return prev.map(layer => 
        layer.itemId === itemId 
          ? { ...layer, zIndex: Math.max(minZIndex - 1, 1), lastInteracted: Date.now() }
          : layer
      );
    });
  }, []);

  // Mover item uma camada para cima
  const moveUp = useCallback((itemId: string) => {
    setLayers(prev => {
      const currentLayer = prev.find(l => l.itemId === itemId);
      if (!currentLayer) return prev;

      const layersAbove = prev.filter(l => l.zIndex > currentLayer.zIndex);
      if (layersAbove.length === 0) return prev; // Já está no topo

      const nextZIndex = Math.min(...layersAbove.map(l => l.zIndex));
      
      return prev.map(layer => {
        if (layer.itemId === itemId) {
          return { ...layer, zIndex: nextZIndex + 0.5, lastInteracted: Date.now() };
        }
        return layer;
      });
    });
  }, []);

  // Mover item uma camada para baixo
  const moveDown = useCallback((itemId: string) => {
    setLayers(prev => {
      const currentLayer = prev.find(l => l.itemId === itemId);
      if (!currentLayer) return prev;

      const layersBelow = prev.filter(l => l.zIndex < currentLayer.zIndex);
      if (layersBelow.length === 0) return prev; // Já está no fundo

      const prevZIndex = Math.max(...layersBelow.map(l => l.zIndex));
      
      return prev.map(layer => {
        if (layer.itemId === itemId) {
          return { ...layer, zIndex: Math.max(prevZIndex - 0.5, 0.5), lastInteracted: Date.now() };
        }
        return layer;
      });
    });
  }, []);

  // Adicionar novo item (sempre no topo)
  const addItem = useCallback((itemId: string) => {
    setLayers(prev => {
      const maxZIndex = Math.max(...prev.map(l => l.zIndex), 0);
      
      return [
        ...prev,
        {
          itemId,
          zIndex: maxZIndex + 1,
          lastInteracted: Date.now()
        }
      ];
    });
  }, []);

  // Remover item
  const removeItem = useCallback((itemId: string) => {
    setLayers(prev => prev.filter(l => l.itemId !== itemId));
  }, []);

  // Obter z-index de um item
  const getZIndex = useCallback((itemId: string): number => {
    const layer = layers.find(l => l.itemId === itemId);
    return layer?.zIndex || 1;
  }, [layers]);

  // Items ordenados por z-index (para renderização)
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aZIndex = getZIndex(a.id);
      const bZIndex = getZIndex(b.id);
      return aZIndex - bZIndex;
    });
  }, [items, getZIndex]);

  // Items ordenados por última interação (para seleção)
  const itemsByInteraction = useMemo(() => {
    return [...items].sort((a, b) => {
      const aLayer = layers.find(l => l.itemId === a.id);
      const bLayer = layers.find(l => l.itemId === b.id);
      
      const aTime = aLayer?.lastInteracted || 0;
      const bTime = bLayer?.lastInteracted || 0;
      
      return bTime - aTime; // Mais recente primeiro
    });
  }, [items, layers]);

  // Encontrar item no ponto (considerando z-index)
  const getItemAtPoint = useCallback((x: number, y: number): WhiteboardItem | null => {
    // Iterar de cima para baixo (z-index maior primeiro)
    const sortedByZIndex = [...items].sort((a, b) => {
      const aZIndex = getZIndex(a.id);
      const bZIndex = getZIndex(b.id);
      return bZIndex - aZIndex; // Maior z-index primeiro
    });

    for (const item of sortedByZIndex) {
      // Verificar se o ponto está dentro do item
      const itemLeft = item.position.x;
      const itemTop = item.position.y;
      const itemRight = itemLeft + (item.width || 100);
      const itemBottom = itemTop + (item.height || 50);

      if (x >= itemLeft && x <= itemRight && y >= itemTop && y <= itemBottom) {
        return item;
      }
    }

    return null;
  }, [items, getZIndex]);

  // Normalizar z-indexes (remover gaps)
  const normalizeZIndexes = useCallback(() => {
    setLayers(prev => {
      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
      
      return sorted.map((layer, index) => ({
        ...layer,
        zIndex: index + 1
      }));
    });
  }, []);

  return {
    // Estado
    layers,
    sortedItems,
    itemsByInteraction,
    
    // Funções de controle
    bringToFront,
    sendToBack,
    moveUp,
    moveDown,
    addItem,
    removeItem,
    getZIndex,
    getItemAtPoint,
    
    // Utilitários
    initializeLayers,
    normalizeZIndexes
  };
};
