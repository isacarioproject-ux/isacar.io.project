import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { FinanceBlockProps } from '@/types/finance-blocks'
import { useI18n } from '@/hooks/use-i18n'

interface QuickExpenseBlockProps extends FinanceBlockProps {
  categories: string[]
}

/**
 * Bloco para adicionar despesas rapidamente
 * Input ultra-rápido: valor + categoria
 */
export const QuickExpenseBlock = ({
  documentId,
  categories,
  onRefresh,
}: QuickExpenseBlockProps) => {
  const { t } = useI18n()
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)

  const handleQuickAdd = async () => {
    // Validações
    if (!amount || !category) {
      toast.error(t('finance.quickExpense.fillValueCategory'))
      return
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error(t('finance.budget.invalidValue'))
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('finance_transactions').insert({
        finance_document_id: documentId,
        type: 'expense',
        category: category,
        description: `${t('finance.quickExpense.quickExpense')} - ${category}`,
        amount: parsedAmount,
        transaction_date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: 'cash',
        status: 'completed',
        tags: [],
      })

      if (error) throw error

      // Reset
      setAmount('')
      setCategory('')
      
      onRefresh()
      toast.success(`✓ R$ ${parsedAmount.toFixed(2)} ${t('finance.quickExpense.added')}`)
    } catch (err: any) {
      toast.error(t('finance.table.errorAdd'), {
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Descrição */}
      <p className="text-sm text-muted-foreground">
        {t('finance.quickExpense.description')}
      </p>

      {/* Form compacto */}
      <div className="flex gap-2">
        {/* Valor */}
        <div className="flex-1">
          <Input
            type="number"
            placeholder="R$ 0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-10"
            step="0.01"
            min="0"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && amount && category) {
                handleQuickAdd()
              }
            }}
          />
        </div>

        {/* Categoria */}
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px] h-10">
            <SelectValue placeholder={t('finance.table.category')} />
          </SelectTrigger>
          <SelectContent>
            {categories.length === 0 ? (
              <SelectItem value="Geral" disabled>
                {t('finance.table.noCategory')}
              </SelectItem>
            ) : (
              categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {/* Botão adicionar */}
        <Button
          onClick={handleQuickAdd}
          disabled={loading || !amount || !category}
          className="h-10 px-4"
        >
          <Zap className="h-4 w-4 mr-2" />
          {t('finance.table.add')}
        </Button>
      </div>

      {/* Dica */}
      <p className="text-xs text-muted-foreground">
        {t('finance.quickExpense.pressEnter')} <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Enter</kbd> {t('finance.quickExpense.toAddQuickly')}
      </p>
    </div>
  )
}
