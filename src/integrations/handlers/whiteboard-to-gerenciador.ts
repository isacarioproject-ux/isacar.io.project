/**
 * INTEGRAÇÃO: Whiteboard → Gerenciador
 * 
 * Quando criar meta no whiteboard, cria no Gerenciador automaticamente
 */

import { eventBus } from '@/lib/event-bus';
import { gerenciadorAdapter } from '../adapters/gerenciador-adapter';
import { isIntegrationEnabled, INTEGRATION_CONFIG } from '../config';
import type { WhiteboardMetaItemCreatedEvent } from '../types/integration-events';
import { toast } from 'sonner';

/**
 * Inicializar integração
 */
export function initWhiteboardToGerenciador() {
  if (!isIntegrationEnabled('WHITEBOARD_TO_GERENCIADOR')) {
    console.log('[Integration] Whiteboard → Gerenciador: DISABLED');
    return;
  }

  console.log('[Integration] Whiteboard → Gerenciador: ENABLED');

  // Listener: Quando criar meta no whiteboard
  eventBus.on(
    'whiteboard.meta-item.created',
    async (data: WhiteboardMetaItemCreatedEvent) => {
      try {
        if (INTEGRATION_CONFIG.DEBUG_MODE) {
          console.log('[Integration] Creating goal from whiteboard:', data);
        }

        await new Promise(resolve => 
          setTimeout(resolve, INTEGRATION_CONFIG.DEBOUNCE_DELAY)
        );

        // Criar meta no Gerenciador
        const goalId = await gerenciadorAdapter.createGoal({
          name: data.goalName,
          targetAmount: data.targetAmount,
          category: data.category,
          linkedWhiteboard: data.whiteboardId
        });

        if (INTEGRATION_CONFIG.SHOW_NOTIFICATIONS) {
          toast.success('🎯 Meta criada no Gerenciador!', {
            description: `${data.goalName} - R$ ${data.targetAmount.toFixed(2)}`
          });
        }

        // Disparar evento
        eventBus.emit('gerenciador.goal.created', {
          goalId,
          name: data.goalName,
          targetAmount: data.targetAmount,
          linkedWhiteboard: data.whiteboardId,
          source: 'whiteboard'
        });

      } catch (error) {
        console.error('[Integration] Error creating goal from whiteboard:', error);
        
        if (INTEGRATION_CONFIG.SHOW_NOTIFICATIONS) {
          toast.error('❌ Erro ao criar meta automaticamente');
        }
      }
    }
  );
}
