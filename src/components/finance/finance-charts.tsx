import { useMemo, useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { FinanceTransaction, FinanceCategory } from '@/types/finance'
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Maximize2, Minimize2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useI18n } from '@/hooks/use-i18n'

interface FinanceChartsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactions: FinanceTransaction[]
  categories: FinanceCategory[]
}

// Cores para os gráficos
const COLORS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
]

const INCOME_COLORS = [
  '#22c55e', // green-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#0ea5e9', // sky-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const FinanceCharts = ({
  open,
  onOpenChange,
  transactions,
  categories,
}: FinanceChartsProps) => {
  const { t } = useI18n()
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Calcular totais
  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const expenses = transactions
      .filter((t) => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    return { income, expenses, balance: income - expenses }
  }, [transactions])

  // Agrupar por categoria
  const categoryData = useMemo(() => {
    const data: Record<string, { amount: number; count: number; type: string }> = {}

    transactions
      .filter((t) => t.status === 'completed')
      .forEach((t) => {
        if (!data[t.category]) {
          data[t.category] = { amount: 0, count: 0, type: t.type }
        }
        data[t.category].amount += Number(t.amount)
        data[t.category].count += 1
      })

    return Object.entries(data)
      .map(([name, info]) => ({ name, ...info }))
      .sort((a, b) => b.amount - a.amount)
  }, [transactions])

  // Preparar dados para gráfico de pizza (Despesas)
  const expenseChartData = categoryData
    .filter((c) => c.type === 'expense')
    .slice(0, 8)
    .map((cat, index) => ({
      name: cat.name,
      value: cat.amount,
      count: cat.count,
      percentage: ((cat.amount / totals.expenses) * 100).toFixed(1),
      color: COLORS[index % COLORS.length],
    }))

  // Preparar dados para gráfico de pizza (Receitas)
  const incomeChartData = categoryData
    .filter((c) => c.type === 'income')
    .slice(0, 8)
    .map((cat, index) => ({
      name: cat.name,
      value: cat.amount,
      count: cat.count,
      percentage: ((cat.amount / totals.income) * 100).toFixed(1),
      color: INCOME_COLORS[index % INCOME_COLORS.length],
    }))

  // Tooltip customizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3 min-w-[200px]">
          <p className="font-semibold text-sm mb-2">{data.name}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t('finance.charts.value')}</span>
              <span className="font-mono font-semibold">{formatCurrency(data.value)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t('finance.charts.transactions')}</span>
              <span className="font-medium">{data.count}x</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t('finance.charts.percentage')}</span>
              <span className="font-medium">{data.percentage}%</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        className={cn(
          "p-0 [&>button]:hidden",
          isFullscreen ? "max-w-[100vw] h-[100vh] rounded-none" : "max-w-5xl max-h-[90vh]"
        )}
        drawerProps={{
          className: 'h-[96vh]',
        }}
      >
        <div className="flex items-center justify-between gap-2 px-[5px] py-0.5 border-b">
          <ModalTitle className="text-sm font-semibold px-2 h-7 flex items-center gap-2">
            <BarChart3 className="h-3.5 w-3.5" />
            {t('finance.charts.title')}
          </ModalTitle>
          
          <div className="flex items-center gap-1">
            {/* Botão Expandir - escondido em mobile */}
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="h-7 w-7 hidden sm:flex"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-3.5 w-3.5" />
                    ) : (
                      <Maximize2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFullscreen ? t('finance.charts.minimize') : t('finance.charts.expand')}</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>

            {/* Botão Fechar - escondido em mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-7 w-7 hidden sm:flex"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className={cn(
          "px-3 sm:px-4 md:px-6 py-4 space-y-6",
          isFullscreen ? "overflow-y-auto h-[calc(100vh-60px)]" : "overflow-y-auto sm:overflow-y-visible max-h-[calc(90vh-80px)]"
        )}>
          {/* Resumo Geral - escondido em mobile */}
          <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                  {t('finance.charts.income')}
                </span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totals.income)}
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-xs font-medium text-red-700 dark:text-red-400">
                  {t('finance.charts.expenses')}
                </span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totals.expenses)}
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                  {t('finance.charts.balance')}
                </span>
              </div>
              <p
                className={cn(
                  'text-2xl font-bold',
                  totals.balance >= 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {formatCurrency(totals.balance)}
              </p>
            </div>
          </div>

          {/* Gráfico de Despesas */}
          {expenseChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  {t('finance.charts.expensesByCategory')}
                </CardTitle>
                <CardDescription>
                  {t('finance.charts.expensesDistribution')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] sm:h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={expenseChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} (${percentage}%)`}
                        outerRadius={window.innerWidth < 640 ? 60 : 80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value, entry: any) => (
                          <span className="text-xs">{value}</span>
                        )}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gráfico de Receitas */}
          {incomeChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  {t('finance.charts.incomeByCategory')}
                </CardTitle>
                <CardDescription>
                  {t('finance.charts.incomeDistribution')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] sm:h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={incomeChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} (${percentage}%)`}
                        outerRadius={window.innerWidth < 640 ? 60 : 80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {incomeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value, entry: any) => (
                          <span className="text-xs">{value}</span>
                        )}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {categoryData.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <PieChart className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">{t('finance.charts.noData')}</p>
              <p className="text-xs mt-1">{t('finance.charts.addTransactions')}</p>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  )
}
