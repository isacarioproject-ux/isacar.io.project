/**
 * INTEGRAÇÃO: Whiteboard → Tasks
 * 
 * Quando criar "action item" no whiteboard, cria task automaticamente
 */

import { eventBus } from '@/lib/event-bus';
import { tasksAdapter } from '../adapters/tasks-adapter';
import { isIntegrationEnabled, INTEGRATION_CONFIG } from '../config';
import type { WhiteboardActionItemCreatedEvent } from '../types/integration-events';
import { toast } from 'sonner';

/**
 * Inicializar integração
 * Chame esta função UMA VEZ no app (ex: no App.tsx)
 */
export function initWhiteboardToTasks() {
  if (!isIntegrationEnabled('WHITEBOARD_TO_TASKS')) {
    console.log('[Integration] Whiteboard → Tasks: DISABLED');
    return;
  }

  console.log('[Integration] Whiteboard → Tasks: ENABLED');

  // Listener: Quando criar action item no whiteboard
  eventBus.on(
    'whiteboard.action-item.created',
    async (data: WhiteboardActionItemCreatedEvent) => {
      try {
        if (INTEGRATION_CONFIG.DEBUG_MODE) {
          console.log('[Integration] Creating task from whiteboard:', data);
        }

        // Aguardar debounce (evitar criar várias vezes)
        await new Promise(resolve => 
          setTimeout(resolve, INTEGRATION_CONFIG.DEBOUNCE_DELAY)
        );

        // Criar task usando adapter
        const taskId = await tasksAdapter.createTask({
          title: data.content,
          cost: data.metadata?.cost,
          linkedTo: data.whiteboardId,
          source: 'whiteboard'
        });

        // Notificar usuário
        if (INTEGRATION_CONFIG.SHOW_NOTIFICATIONS) {
          toast.success('✅ Tarefa criada automaticamente!', {
            description: data.content,
            action: {
              label: 'Ver tarefa',
              onClick: () => {
                // Navegar para tasks
                window.location.href = '/tasks';
              }
            }
          });
        }

        // Disparar evento de task criada (para outras integrações)
        eventBus.emit('task.created', {
          taskId,
          title: data.content,
          cost: data.metadata?.cost,
          linkedTo: data.whiteboardId,
          source: 'whiteboard'
        });

        if (INTEGRATION_CONFIG.DEBUG_MODE) {
          console.log('[Integration] Task created successfully:', taskId);
        }

      } catch (error) {
        console.error('[Integration] Error creating task from whiteboard:', error);
        
        if (INTEGRATION_CONFIG.SHOW_NOTIFICATIONS) {
          toast.error('❌ Erro ao criar tarefa automaticamente');
        }
      }
    }
  );
}
