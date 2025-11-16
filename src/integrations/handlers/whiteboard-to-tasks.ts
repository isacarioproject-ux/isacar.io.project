/**
 * HANDLER: Whiteboard → Tasks
 * 
 * DESABILITADO - Módulo Whiteboard removido da aplicação
 */

import { eventBus } from '@/lib/event-bus';
import { tasksAdapter } from '../adapters/tasks-adapter';
import { isIntegrationEnabled, INTEGRATION_CONFIG } from '../config';
import type { WhiteboardActionItemCreatedEvent } from '../types/integration-events';
import { toast } from 'sonner';

/**
 * Função desabilitada - Whiteboard removido
 */
export function initWhiteboardToTasks() {
  // Desabilitado - whiteboard removido
  return;
}
