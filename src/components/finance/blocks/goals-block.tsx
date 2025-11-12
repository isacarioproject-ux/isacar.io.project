import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Target, TrendingUp, AlertTriangle } from 'lucide-react'
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
  
  // Form states
  const [category, setCategory] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly')

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
    if (!category) {
      toast.error(t('finance.goals.selectCategory'))
      return
    }
    
    if (!targetAmount) {
      toast.error(t('finance.goals.enterValue'))
      return
    }

    const value = parseFloat(targetAmount)
    if (isNaN(value) || value <= 0) {
      toast.error(t('finance.goals.valueMustBePositive'))
      return
    }

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
          category,
          target_amount: value,
          period,
        })

      if (error) throw error

      setCategory('')
      setTargetAmount('')
      setPeriod('monthly')
      
      await loadGoals()
      toast.success(t('finance.goals.added'))
    } catch (err: any) {
      toast.error(t('finance.goals.errorAdd'), {
        description: err.message,
      })
    }
  }

  const deleteGoal = async (id: string) => {
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
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Form */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={t('finance.table.category')} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder={t('finance.goals.targetValue')}
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          className="flex-1"
          step="0.01"
          min="0"
        />

        <Select value={period} onValueChange={(v: 'monthly' | 'yearly') => setPeriod(v)}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">{t('finance.goals.monthly')}</SelectItem>
            <SelectItem value="yearly">{t('finance.goals.yearly')}</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleAdd} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-1" />
          {t('finance.table.add')}
        </Button>
      </div>

      {/* Lista de Metas */}
      {goals.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <Target className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm text-muted-foreground">
            {t('finance.goals.noGoals')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('finance.goals.defineGoals')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => {
            const spent = spendingByCategory[goal.category] || 0
            const percentage = (spent / goal.target_amount) * 100
            const isOverBudget = percentage >= 100
            const isWarning = percentage >= 80 && percentage < 100

            return (
              <div
                key={goal.id}
                className="p-4 border rounded-lg space-y-3 hover:bg-accent/50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{goal.category}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {goal.period === 'monthly' ? t('finance.goals.monthly') : t('finance.goals.yearly')}
                      </Badge>
                      {isOverBudget && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      {isWarning && (
                        <TrendingUp className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('finance.goals.goal')} {formatCurrency(goal.target_amount)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteGoal(goal.id)}
                    className="h-8 w-8 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t('finance.budget.spent')} {formatCurrency(spent)}
                    </span>
                    <span className={`font-semibold ${
                      isOverBudget ? 'text-red-600' : 
                      isWarning ? 'text-yellow-600' : 
                      'text-green-600'
                    }`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-2"
                  />
                  {isOverBudget && (
                    <p className="text-xs text-red-600 font-medium">
                      {t('finance.goals.exceeded')} {formatCurrency(spent - goal.target_amount)}
                    </p>
                  )}
                  {isWarning && !isOverBudget && (
                    <p className="text-xs text-yellow-600 font-medium">
                      {t('finance.goals.warning')} {formatCurrency(goal.target_amount - spent)} {t('finance.goals.toReachGoal')}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
