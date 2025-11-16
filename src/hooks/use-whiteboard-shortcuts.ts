import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

interface UseWhiteboardShortcutsOptions {
  onSelectTool: (tool: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  enabled?: boolean;
}

export const useWhiteboardShortcuts = ({
  onSelectTool,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onUndo,
  onRedo,
  onSave,
  onDelete,
  enabled = true
}: UseWhiteboardShortcutsOptions) => {

  const shortcuts: ShortcutConfig[] = [
    // Ferramentas básicas
    { key: 'v', action: () => onSelectTool('select'), description: 'Ferramenta de seleção' },
    { key: 'h', action: () => onSelectTool('hand'), description: 'Ferramenta de pan' },
    { key: 't', action: () => onSelectTool('text'), description: 'Ferramenta de texto' },
    { key: 'p', action: () => onSelectTool('pen'), description: 'Ferramenta de caneta' },
    
    // Formas
    { key: 'r', action: () => onSelectTool('box'), description: 'Retângulo' },
    { key: 'o', action: () => onSelectTool('circle'), description: 'Círculo' },
    { key: 'l', action: () => onSelectTool('line'), description: 'Linha' },
    { key: 'a', action: () => onSelectTool('arrow'), description: 'Seta' },
    { key: 'n', action: () => onSelectTool('note'), description: 'Nota adesiva' },
    
    // Zoom
    { key: '+', action: onZoomIn, description: 'Zoom in' },
    { key: '=', action: onZoomIn, description: 'Zoom in' },
    { key: '-', action: onZoomOut, description: 'Zoom out' },
    { key: '0', action: onZoomReset, description: 'Resetar zoom' },
    
    // Zoom com Ctrl
    { key: '+', ctrlKey: true, action: onZoomIn, description: 'Zoom in' },
    { key: '=', ctrlKey: true, action: onZoomIn, description: 'Zoom in' },
    { key: '-', ctrlKey: true, action: onZoomOut, description: 'Zoom out' },
    { key: '0', ctrlKey: true, action: onZoomReset, description: 'Resetar zoom' },
    
    // Ações
    ...(onUndo ? [{ key: 'z', ctrlKey: true, action: onUndo, description: 'Desfazer' }] : []),
    ...(onRedo ? [
      { key: 'z', ctrlKey: true, shiftKey: true, action: onRedo, description: 'Refazer' },
      { key: 'y', ctrlKey: true, action: onRedo, description: 'Refazer' }
    ] : []),
    ...(onSave ? [{ key: 's', ctrlKey: true, action: onSave, description: 'Salvar' }] : []),
    ...(onDelete ? [
      { key: 'Delete', action: onDelete, description: 'Deletar selecionado' },
      { key: 'Backspace', action: onDelete, description: 'Deletar selecionado' }
    ] : []),
  ];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    
    // Ignorar se estiver digitando em um input
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    const key = e.key.toLowerCase();
    const ctrlKey = e.ctrlKey || e.metaKey;
    const shiftKey = e.shiftKey;
    const altKey = e.altKey;

    const matchingShortcut = shortcuts.find(shortcut => 
      shortcut.key.toLowerCase() === key &&
      !!shortcut.ctrlKey === ctrlKey &&
      !!shortcut.shiftKey === shiftKey &&
      !!shortcut.altKey === altKey
    );

    if (matchingShortcut) {
      e.preventDefault();
      e.stopPropagation();
      matchingShortcut.action();
    }
  }, [enabled, shortcuts]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);

  // Agrupar atalhos por categoria para exibição
  const shortcutsByCategory = {
    tools: shortcuts.filter(s => ['v', 'h', 't', 'p'].includes(s.key)),
    shapes: shortcuts.filter(s => ['r', 'o', 'l', 'a', 'n'].includes(s.key)),
    zoom: shortcuts.filter(s => ['+', '=', '-', '0'].includes(s.key) && !s.ctrlKey),
    actions: shortcuts.filter(s => s.ctrlKey || ['Delete', 'Backspace'].includes(s.key))
  };

  // Função para exibir atalho formatado
  const formatShortcut = useCallback((shortcut: ShortcutConfig): string => {
    const parts: string[] = [];
    
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.altKey) parts.push('Alt');
    
    let key = shortcut.key;
    if (key === '+' || key === '=') key = '+';
    if (key === ' ') key = 'Space';
    
    parts.push(key.toUpperCase());
    
    return parts.join(' + ');
  }, []);

  return {
    shortcuts,
    shortcutsByCategory,
    formatShortcut,
    enabled
  };
};
