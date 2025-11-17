import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { FinanceCard } from '@/components/finance/finance-card'
import { BudgetCard } from '@/components/finance/budget-card'
import { TasksCard } from '@/components/tasks/tasks-card'
import { RecentCard } from '@/components/recent/recent-card'
// import { EmpresaCard } from '@/components/empresa/empresa-card' // REMOVIDO - Whiteboard
// import { DashboardSkeleton } from '@/components/loading-skeleton' // REMOVIDO - Skeleton interno nos cards
import { DraggableCardWrapper } from '@/components/draggable-card-wrapper'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { useI18n } from '@/hooks/use-i18n'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable'

export default function DashboardPage() {
  const { t } = useI18n()
  const { stats, loading, error } = useDashboardStats()
  

  // Estado para ordem dos cards
  const [cardOrder, setCardOrder] = useState(() => {
    const saved = localStorage.getItem('dashboard-card-order')
    const defaultOrder = ['finance-card', 'budget-card', 'recent-card', 'tasks-card'] // 'empresa-card' removido
    const order = saved ? JSON.parse(saved) : defaultOrder
    
    // Garantir que todos os cards estão na lista
    if (!order.includes('finance-card')) {
      order.push('finance-card')
    }
    if (!order.includes('budget-card')) {
      order.push('budget-card')
    }
    if (!order.includes('tasks-card')) {
      order.push('tasks-card')
    }
    if (!order.includes('recent-card')) {
      order.push('recent-card')
    }
    // empresa-card removido - whiteboard deletado
    localStorage.setItem('dashboard-card-order', JSON.stringify(order))
    
    console.log('Card Order:', order)
    return order
  })

  // Sensores para drag & drop - Desktop + Mobile
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Precisa mover 8px para ativar o drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms de toque para ativar no mobile
        tolerance: 5, // Tolerância de movimento
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handler para quando terminar o drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setCardOrder((items: string[]) => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over.id as string)
        const newOrder = arrayMove(items, oldIndex, newIndex)
        localStorage.setItem('dashboard-card-order', JSON.stringify(newOrder))
        return newOrder
      })
    }
  }

  return (
    <DashboardLayout>
      {/* Container responsivo - mobile scroll, desktop h-full */}
      <div className="w-full p-2 md:h-full md:overflow-hidden">
            {error ? (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-destructive">{error.message}</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Cards de Gestão com Drag & Drop - Renderiza sempre, skeletons internos */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={cardOrder} strategy={rectSortingStrategy}>
                    {/* Grid responsivo: 1 coluna mobile, 2 tablet, 3 desktop */}
                    <div className="grid gap-3 md:gap-[3px] grid-cols-1 md:grid-cols-2 xl:grid-cols-3 w-full md:h-full md:auto-rows-fr transition-all duration-300 ease-in-out">
                      {cardOrder.map((cardId: string) => {
                        if (cardId === 'finance-card') {
                          return (
                            <DraggableCardWrapper key="finance-card" id="finance-card">
                              <FinanceCard />
                            </DraggableCardWrapper>
                          )
                        }
                        if (cardId === 'tasks-card') {
                          return (
                            <DraggableCardWrapper key="tasks-card" id="tasks-card">
                              <TasksCard />
                            </DraggableCardWrapper>
                          )
                        }
                        if (cardId === 'recent-card') {
                          return (
                            <DraggableCardWrapper key="recent-card" id="recent-card">
                              <RecentCard />
                            </DraggableCardWrapper>
                          )
                        }
                        if (cardId === 'budget-card') {
                          return (
                            <DraggableCardWrapper key="budget-card" id="budget-card">
                              <BudgetCard />
                            </DraggableCardWrapper>
                          )
                        }
                        // empresa-card removido - whiteboard deletado
                        return null
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              </>
            )}
      </div>
    </DashboardLayout>
  )
}
