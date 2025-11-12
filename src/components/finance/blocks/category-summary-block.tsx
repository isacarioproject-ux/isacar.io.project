import { useMemo } from 'react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { FinanceTransaction } from '@/types/finance'
import { FinanceBlockProps } from '@/types/finance-blocks'
import { useI18n } from '@/hooks/use-i18n'

interface CategorySummaryBlockProps extends FinanceBlockProps {
  transactions: FinanceTransaction[]
}

/**
 * Bloco de resumo por categoria
 * Mostra gastos/receitas agrupados por categoria com percentuais
 */
export const CategorySummaryBlock = ({
  transactions,
}: CategorySummaryBlockProps) => {
  const { t } = useI18n()
  
  // Agrupar transações por categoria
  const summary = useMemo(() => {
    const groups: Record<string, {
      category: string
      type: 'income' | 'expense'
      amount: number
      count: number
    }> = {}

    transactions
      .filter((t) => t.status === 'completed' && t.type !== 'transfer')
      .forEach((t) => {
        if (!groups[t.category]) {
          groups[t.category] = {
            category: t.category,
            type: t.type as 'income' | 'expense',
            amount: 0,
            count: 0,
          }
        }
        groups[t.category].amount += Number(t.amount)
        groups[t.category].count += 1
      })

    return Object.values(groups).sort((a, b) => b.amount - a.amount)
  }, [transactions])

  // Calcular totais
  const totals = useMemo(() => {
    const expenses = summary
      .filter((s) => s.type === 'expense')
      .reduce((sum, s) => sum + s.amount, 0)
    
    const income = summary
      .filter((s) => s.type === 'income')
      .reduce((sum, s) => sum + s.amount, 0)

    return { expenses, income, total: income - expenses }
  }, [summary])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (summary.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">{t('finance.charts.noData')}</p>
        <p className="text-xs mt-1">{t('finance.charts.addTransactions')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Totais */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">{t('finance.charts.income')}</p>
          <p className="text-sm font-semibold text-green-600">
            {formatCurrency(totals.income)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">{t('finance.charts.expenses')}</p>
          <p className="text-sm font-semibold text-red-600">
            {formatCurrency(totals.expenses)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">{t('finance.charts.balance')}</p>
          <p className={`text-sm font-semibold ${totals.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totals.total)}
          </p>
        </div>
      </div>

      {/* Lista de categorias */}
      <div className="space-y-3">
        {summary.map((item) => {
          const total = item.type === 'expense' ? totals.expenses : totals.income
          const percentage = (item.amount / total) * 100

          return (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.type === 'expense' ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  )}
                  <span className="text-sm font-medium">{item.category}</span>
                  <Badge variant="secondary" className="text-xs">
                    {item.count}x
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatCurrency(item.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
              <Progress
                value={percentage}
                className="h-2"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
