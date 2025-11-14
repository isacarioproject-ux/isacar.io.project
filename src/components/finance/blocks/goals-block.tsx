import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Target, TrendingUp, AlertTriangle, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { FinanceBlockProps } from '@/types/finance-blocks'
import { FinanceTransaction } from '@/types/finance'
import { useI18n } from '@/hooks/use-i18n'

interface Goal {
  id: string
  user_id: string
  finance_document_id: string
  category: string
  target_amount: number
  period: 'monthly' | 'yearly'
  created_at: string
  updated_at: string
}

interface GoalsBlockProps extends FinanceBlockProps {
  categories: string[]
  transactions: FinanceTransaction[]
}

export const GoalsBlock = ({
  documentId,
  categories,
  transactions,
}: GoalsBlockProps) => {
  const { t } = useI18n()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  // Inline form state
  const [showAddRow, setShowAddRow] = useState(false)
  const [newGoal, setNewGoal] = useState({
    category: '',
    targetAmount: '',
    period: 'monthly' as 'monthly' | 'yearly'
  })

  useEffect(() => {
    loadGoals()
  }, [documentId])

  const loadGoals = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('finance_goals')
        .select('*')
        .eq('finance_document_id', documentId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (err: any) {
      console.error('Error loading goals:', err)
      toast.error(t('finance.goals.errorLoad'), {
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newGoal.category) {
      toast.error(t('finance.goals.selectCategory'))
      return
    }
    
    if (!newGoal.targetAmount) {
      toast.error(t('finance.goals.enterValue'))
      return
    }

    const value = parseFloat(newGoal.targetAmount)
    if (isNaN(value) || value <= 0) {
      toast.error(t('finance.goals.valueMustBePositive'))
      return
    }

    setAdding(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error(t('finance.goals.userNotAuthenticated'))
        return
      }

      const { error } = await supabase
        .from('finance_goals')
        .insert({
          user_id: user.id,
          finance_document_id: documentId,
          category: newGoal.category,
          target_amount: value,
          period: newGoal.period,
        })

      if (error) throw error

      setNewGoal({
        category: '',
        targetAmount: '',
        period: 'monthly'
      })
      setShowAddRow(false)
      
      await loadGoals()
      toast.success(t('finance.goals.added'))
    } catch (err: any) {
      toast.error(t('finance.goals.errorAdd'), {
        description: err.message,
      })
    } finally {
      setAdding(false)
    }
  }

  const cancelAdd = () => {
    setNewGoal({
      category: '',
      targetAmount: '',
      period: 'monthly'
    })
    setShowAddRow(false)
  }

  const deleteGoal = async (id: string) => {
    if (deleting === id) return

    setDeleting(id)
    try {
      const { error } = await supabase
        .from('finance_goals')
        .delete()
        .eq('id', id)

      if (error) throw error

      setGoals(goals.filter(g => g.id !== id))
      toast.success(t('finance.goals.removed'))
    } catch (err: any) {
      toast.error(t('finance.goals.errorRemove'), {
        description: err.message,
      })
    } finally {
      setDeleting(null)
    }
  }

  // Calcular gastos por categoria
  const spendingByCategory = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return transactions
      .filter(t => {
        if (t.type !== 'expense' || t.status !== 'completed') return false
        
        const transactionDate = new Date(t.transaction_date)
        const isCurrentMonth = transactionDate.getMonth() === currentMonth && 
                               transactionDate.getFullYear() === currentYear
        
        return isCurrentMonth
      })
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount)
        return acc
      }, {} as Record<string, number>)
  }, [transactions])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (loading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="h-10">
              <TableHead className="h-10 text-xs">
                <Skeleton className="h-3 w-16" />
              </TableHead>
              <TableHead className="h-10 text-xs">
                <Skeleton className="h-3 w-12" />
              </TableHead>
              <TableHead className="h-10 text-xs text-right">
                <Skeleton className="h-3 w-20" />
              </TableHead>
              <TableHead className="h-10 text-xs text-right hidden md:table-cell">
                <Skeleton className="h-3 w-16" />
              </TableHead>
              <TableHead className="h-10 text-xs text-center">
                <Skeleton className="h-3 w-12" />
              </TableHead>
              <TableHead className="h-10 w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i} className="h-12">
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-2 w-full" /></TableCell>
                <TableCell><Skeleton className="h-6 w-6" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Tabela inline estilo Notion */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="h-10 hover:bg-muted/50">
              <TableHead className="h-10 text-xs font-semibold">Categoria</TableHead>
              <TableHead className="h-10 text-xs font-semibold">Período</TableHead>
              <TableHead className="h-10 text-xs font-semibold text-right">Meta</TableHead>
              <TableHead className="h-10 text-xs font-semibold text-right hidden md:table-cell">Gasto</TableHead>
              <TableHead className="h-10 text-xs font-semibold text-center">Progresso</TableHead>
              <TableHead className="h-10 w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Linha de adicionar nova meta */}
            <AnimatePresence>
              {showAddRow && (
                <motion.tr
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b bg-muted/20"
                >
                  <TableCell className="py-2 px-3">
                    <Select 
                      value={newGoal.category} 
                      onValueChange={(value) => setNewGoal({...newGoal, category: value})}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  
                  <TableCell className="py-2 px-3">
                    <Select 
                      value={newGoal.period} 
                      onValueChange={(value: 'monthly' | 'yearly') => setNewGoal({...newGoal, period: value})}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  
                  <TableCell className="py-2 px-3">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                      className="h-8 text-sm text-right"
                      step="0.01"
                      min="0"
                    />
                  </TableCell>
                  
                  <TableCell className="py-2 px-3 hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">-</span>
                  </TableCell>
                  
                  <TableCell className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm" 
                        onClick={handleAdd}
                        disabled={adding}
                        className="h-7 w-7 p-0"
                      >
                        {adding ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="sm" 
                        variant="ghost"
                        onClick={cancelAdd}
                        className="h-7 w-7 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  </TableCell>
                  
                  <TableCell></TableCell>
                </motion.tr>
              )}
            </AnimatePresence>

            {/* Metas existentes */}
            {goals.map((goal, index) => {
              const spent = spendingByCategory[goal.category] || 0
              const percentage = (spent / goal.target_amount) * 100
              const isOverBudget = percentage >= 100
              const isWarning = percentage >= 80 && percentage < 100

              return (
                <motion.tr
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b hover:bg-muted/30 group transition-colors"
                >
                  <TableCell className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{goal.category}</span>
                      {isOverBudget && (
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                      )}
                      {isWarning && !isOverBudget && (
                        <TrendingUp className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-3 px-3">
                    <Badge variant="secondary" className="text-xs">
                      {goal.period === 'monthly' ? 'Mensal' : 'Anual'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="py-3 px-3 text-right">
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(goal.target_amount)}
                    </span>
                  </TableCell>
                  
                  <TableCell className="py-3 px-3 text-right hidden md:table-cell">
                    <span className={`text-sm font-medium ${
                      isOverBudget ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      {formatCurrency(spent)}
                    </span>
                  </TableCell>
                  
                  <TableCell className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full overflow-hidden h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(percentage, 100)}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full ${
                            isOverBudget ? 'bg-red-500' : 
                            isWarning ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}
                        />
                      </div>
                      <span className={`text-xs font-medium min-w-[2.5rem] text-right ${
                        isOverBudget ? 'text-red-600' : 
                        isWarning ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-3 px-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                      disabled={deleting === goal.id}
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                    >
                      {deleting === goal.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </TableCell>
                </motion.tr>
              )
            })}

            {/* Linha vazia para adicionar meta */}
            {!showAddRow && (
              <TableRow className="border-b hover:bg-muted/30">
                <TableCell colSpan={6} className="py-4 px-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddRow(true)}
                    className="w-full justify-start text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar meta financeira
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Rodapé com estatísticas */}
      {goals.length > 0 && (
        <div className="flex justify-between items-center text-xs text-muted-foreground px-2">
          <span>{goals.length} meta{goals.length !== 1 ? 's' : ''}</span>
          <span>
            {goals.filter(g => (spendingByCategory[g.category] || 0) / g.target_amount >= 1).length} excedidas
          </span>
        </div>
      )}

      {/* Estado vazio */}
      {goals.length === 0 && !showAddRow && (
        <div className="text-center py-8">
          <div className="flex flex-col items-center gap-3">
            <Target className="h-12 w-12 text-muted-foreground/30" />
            <div>
              <p className="text-sm text-muted-foreground">Nenhuma meta financeira</p>
              <p className="text-xs text-muted-foreground mt-1">
                Clique no botão acima para adicionar sua primeira meta
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
