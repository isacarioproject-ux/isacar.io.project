import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Check, X, AlertCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { FinanceBlockProps } from '@/types/finance-blocks'
import { useI18n } from '@/hooks/use-i18n'

interface RecurringBill {
  id: string
  user_id: string
  finance_document_id: string
  name: string
  amount: number
  due_day: number
  category: string
  paid: boolean
  auto_create: boolean
  created_at: string
  updated_at: string
}

interface RecurringBillsBlockProps extends FinanceBlockProps {
  categories: string[]
}

export const RecurringBillsBlock = ({
  documentId,
  categories,
}: RecurringBillsBlockProps) => {
  const { t } = useI18n()
  const [bills, setBills] = useState<RecurringBill[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDay, setDueDay] = useState('5')
  const [category, setCategory] = useState('')

  useEffect(() => {
    loadBills()
  }, [documentId])

  const loadBills = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('recurring_bills')
        .select('*')
        .eq('finance_document_id', documentId)
        .order('due_day', { ascending: true })

      if (error) throw error
      setBills(data || [])
    } catch (err: any) {
      console.error('Error loading bills:', err)
      toast.error(t('finance.recurringBills.errorLoad'), {
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    const trimmedName = name.trim()
    
    if (!trimmedName) {
      toast.error(t('finance.recurringBills.billName'))
      return
    }
    
    if (!amount) {
      toast.error(t('finance.recurringBills.enterValue'))
      return
    }
    
    if (!category) {
      toast.error(t('finance.goals.selectCategory'))
      return
    }

    const value = parseFloat(amount)
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
        .from('recurring_bills')
        .insert({
          user_id: user.id,
          finance_document_id: documentId,
          name: trimmedName,
          amount: value,
          due_day: parseInt(dueDay),
          category,
          paid: false,
          auto_create: false,
        })

      if (error) throw error

      // Reset form
      setName('')
      setAmount('')
      setDueDay('5')
      setCategory('')
      
      // Reload bills
      await loadBills()
      
      toast.success(t('finance.recurringBills.added'))
    } catch (err: any) {
      toast.error(t('finance.recurringBills.errorAdd'), {
        description: err.message,
      })
    }
  }

  const togglePaid = async (id: string) => {
    try {
      const bill = bills.find(b => b.id === id)
      if (!bill) return

      const { error } = await supabase
        .from('recurring_bills')
        .update({ paid: !bill.paid })
        .eq('id', id)

      if (error) throw error

      // Atualizar localmente
      setBills(bills.map(b => 
        b.id === id ? { ...b, paid: !b.paid } : b
      ))
    } catch (err: any) {
      toast.error(t('finance.recurringBills.errorUpdate'), {
        description: err.message,
      })
    }
  }

  const deleteBill = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recurring_bills')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Atualizar localmente
      setBills(bills.filter(b => b.id !== id))
      toast.success(t('finance.recurringBills.removed'))
    } catch (err: any) {
      toast.error(t('finance.recurringBills.errorRemove'), {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const total = bills.reduce((sum, b) => sum + b.amount, 0)
  const paidCount = bills.filter(b => b.paid).length

  // Calcular contas vencendo
  const today = new Date().getDate()
  const upcomingBills = bills.filter(b => {
    if (b.paid) return false
    const daysUntilDue = b.due_day - today
    return daysUntilDue >= 0 && daysUntilDue <= 7 // Próximos 7 dias
  })

  const overdueBills = bills.filter(b => {
    if (b.paid) return false
    return b.due_day < today
  })

  return (
    <div className="space-y-4">
      {/* Form - TUDO EM LINHA */}
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder={t('finance.table.description')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-[150px]"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        
        <Input
          type="number"
          placeholder={t('finance.table.value')}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-[120px]"
          step="0.01"
          min="0"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        
        <Select value={dueDay} onValueChange={setDueDay}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <SelectItem key={d} value={d.toString()}>
                {t('finance.recurringBills.dueDay')} {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t('finance.table.category')} />
          </SelectTrigger>
          <SelectContent>
            {categories.length === 0 ? (
              <SelectItem value="none" disabled>
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

        <Button 
          onClick={handleAdd}
          size="default"
          className="px-4"
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('finance.table.add')}
        </Button>
      </div>

      {/* Alertas de Vencimento */}
      {(overdueBills.length > 0 || upcomingBills.length > 0) && (
        <div className="space-y-2">
          {/* Contas Vencidas */}
          {overdueBills.length > 0 && (
            <div className="p-3 border border-red-200 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-semibold text-red-900 dark:text-red-100">
                  {overdueBills.length} {overdueBills.length === 1 ? t('finance.recurringBills.pending').toLowerCase() : t('finance.recurringBills.pending').toLowerCase()}
                </span>
              </div>
              <div className="space-y-1">
                {overdueBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between text-sm">
                    <span className="text-red-800 dark:text-red-200">{bill.name}</span>
                    <span className="font-semibold text-red-900 dark:text-red-100">
                      {formatCurrency(bill.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contas Vencendo */}
          {upcomingBills.length > 0 && (
            <div className="p-3 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                  {upcomingBills.length} {upcomingBills.length === 1 ? t('finance.recurringBills.pending').toLowerCase() : t('finance.recurringBills.pending').toLowerCase()}
                </span>
              </div>
              <div className="space-y-1">
                {upcomingBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-800 dark:text-yellow-200">{bill.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {t('finance.recurringBills.due')} {bill.due_day}
                      </Badge>
                    </div>
                    <span className="font-semibold text-yellow-900 dark:text-yellow-100">
                      {formatCurrency(bill.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lista de contas */}
      {bills.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-sm text-muted-foreground">
            {t('finance.recurringBills.noBills')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('finance.recurringBills.addBills')}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                  bill.paid ? 'bg-muted/50' : 'hover:bg-accent/50'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => togglePaid(bill.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    bill.paid 
                      ? 'bg-green-600 border-green-600' 
                      : 'border-muted-foreground hover:border-green-600'
                  }`}
                  title={bill.paid ? t('finance.recurringBills.markPending') : t('finance.recurringBills.markPaid')}
                >
                  {bill.paid && <Check className="h-3 w-3 text-white" />}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${bill.paid ? 'line-through text-muted-foreground' : ''}`}>
                    {bill.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-xs">
                      {t('finance.recurringBills.due')} {bill.due_day}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {bill.category}
                    </span>
                  </div>
                </div>

                {/* Valor */}
                <span className={`text-sm font-semibold ${
                  bill.paid ? 'text-muted-foreground' : 'text-red-600'
                }`}>
                  {formatCurrency(bill.amount)}
                </span>

                {/* Botão excluir */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteBill(bill.id)}
                  className="h-8 w-8 flex-shrink-0 hover:text-destructive"
                  title={t('finance.receipts.delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Resumo */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
            <div className="text-sm">
              <span className="text-muted-foreground">{t('finance.budget.totalBudget')}: </span>
              <span className="font-semibold">{formatCurrency(total)}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">{t('finance.recurringBills.paid')}: </span>
              <span className="font-semibold text-green-600">
                {paidCount}/{bills.length}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
