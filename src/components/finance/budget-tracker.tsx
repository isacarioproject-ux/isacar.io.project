import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Target,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { FinanceBudget, FinanceCategory } from '@/types/finance'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/use-i18n'

interface BudgetTrackerProps {
  documentId: string
  month: number
  year: number
  categories: FinanceCategory[]
  onRefresh: () => void
}

export const BudgetTracker = ({
  documentId,
  month,
  year,
  categories,
  onRefresh,
}: BudgetTrackerProps) => {
  const { t } = useI18n()
  const [budgets, setBudgets] = useState<FinanceBudget[]>([])
  const [loading, setLoading] = useState(true)
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
  })

  useEffect(() => {
    fetchBudgets()
  }, [documentId])

  const fetchBudgets = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('finance_budgets')
        .select('*')
        .eq('finance_document_id', documentId)
        .order('category_name')

      if (error) throw error
      setBudgets(data || [])
    } catch (err: any) {
      toast.error(t('finance.budget.errorLoad'), {
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddBudget = async () => {
    // Validações
    if (!newBudget.category || !newBudget.amount) {
      toast.error(t('finance.budget.fillFields'))
      return
    }

    const amount = parseFloat(newBudget.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error(t('finance.budget.invalidValue'), {
        description: t('finance.budget.invalidValueDesc')
      })
      return
    }

    try {
      const { error } = await supabase.from('finance_budgets').insert({
        finance_document_id: documentId,
        category_name: newBudget.category,
        planned_amount: parseFloat(newBudget.amount),
        month,
        year,
      })

      if (error) throw error

      setNewBudget({ category: '', amount: '' })
      fetchBudgets()
      toast.success(t('finance.budget.added'))
    } catch (err: any) {
      toast.error(t('finance.budget.errorAdd'), {
        description: err.message,
      })
    }
  }

  const handleDeleteBudget = async (id: string) => {
    if (!confirm(t('finance.budget.confirmDelete'))) return

    try {
      const { error} = await supabase
        .from('finance_budgets')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchBudgets()
      toast.success(t('finance.budget.deleted'))
    } catch (err: any) {
      toast.error(t('finance.budget.errorDelete'), {
        description: err.message,
      })
    }
  }

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

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 100)
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (percentage >= 80)
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <CheckCircle2 className="h-4 w-4 text-green-500" />
  }

  const totalPlanned = budgets.reduce((sum, b) => sum + Number(b.planned_amount), 0)
  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent_amount), 0)
  const totalPercentage = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0

  const expenseCategories = categories.filter((c) => c.type === 'expense')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Card de resumo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-5 w-5" />
            {t('finance.budget.title')}
          </CardTitle>
          <CardDescription>
            {t('finance.budget.description')} {month}/{year}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Resumo geral */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('finance.budget.totalBudget')}</span>
                <span className="text-sm font-mono">
                  {formatCurrency(totalSpent)} / {formatCurrency(totalPlanned)}
                </span>
              </div>
              <Progress
                value={totalPercentage}
                className="h-2"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {totalPercentage.toFixed(1)}% {t('finance.budget.used')}
                </span>
                <span className="text-xs font-medium">
                  {t('finance.budget.remaining')} {formatCurrency(totalPlanned - totalSpent)}
                </span>
              </div>
            </div>

            {/* Form adicionar orçamento */}
            <div className="p-4 border rounded-lg space-y-3">
              <h4 className="text-sm font-semibold">{t('finance.budget.addGoal')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  value={newBudget.category}
                  onValueChange={(value) =>
                    setNewBudget({ ...newBudget, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('finance.table.category')} />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.icon && `${cat.icon} `}
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder={t('finance.budget.plannedValue')}
                  value={newBudget.amount}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, amount: e.target.value })
                  }
                  step="0.01"
                  min="0"
                />
              </div>
              <Button onClick={handleAddBudget} className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t('finance.budget.addGoalButton')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de orçamentos por categoria */}
      {budgets.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-sm text-muted-foreground">
            {t('finance.budget.noGoals')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('finance.budget.addGoalsDesc')}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {budgets.map((budget) => {
            const percentage =
              Number(budget.planned_amount) > 0
                ? (Number(budget.spent_amount) / Number(budget.planned_amount)) * 100
                : 0

            return (
              <div
                key={budget.id}
                className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(percentage)}
                    <div>
                      <h4 className="text-sm font-medium">{budget.category_name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(Number(budget.spent_amount))} de{' '}
                        {formatCurrency(Number(budget.planned_amount))}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={percentage >= 100 ? 'destructive' : 'secondary'}
                      className="font-mono text-xs"
                    >
                      {percentage.toFixed(0)}%
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleDeleteBudget(budget.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Progress
                  value={Math.min(percentage, 100)}
                  className="h-2"
                />

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {percentage >= 100 ? t('finance.budget.exceeded') : t('finance.budget.withinBudget')}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      Number(budget.planned_amount) - Number(budget.spent_amount) < 0
                        ? 'text-red-600'
                        : 'text-green-600'
                    )}
                  >
                    {Number(budget.planned_amount) - Number(budget.spent_amount) >= 0
                      ? t('finance.budget.remains') + ' '
                      : t('finance.budget.exceededBy') + ' '}
                    {formatCurrency(
                      Math.abs(Number(budget.planned_amount) - Number(budget.spent_amount))
                    )}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
