import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useI18n } from '@/hooks/use-i18n'

interface AddTransactionDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentId: string
  categories: string[]
  onSuccess: () => void
}

export const AddTransactionDrawer = ({
  open,
  onOpenChange,
  documentId,
  categories,
  onSuccess,
}: AddTransactionDrawerProps) => {
  const { t } = useI18n()
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    amount: '',
    transaction_date: format(new Date(), 'yyyy-MM-dd'),
    payment_method: 'money',
    status: 'completed' as 'pending' | 'completed',
  })

  const handleAddTransaction = async () => {
    // Validações
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
      toast.error(t('finance.table.fillRequired'))
      return
    }

    const amount = parseFloat(newTransaction.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error(t('finance.budget.invalidValue'), {
        description: t('finance.budget.invalidValueDesc')
      })
      return
    }

    try {
      const { error } = await supabase.from('finance_transactions').insert({
        finance_document_id: documentId,
        type: newTransaction.type,
        category: newTransaction.category,
        description: newTransaction.description,
        amount: parseFloat(newTransaction.amount),
        transaction_date: newTransaction.transaction_date,
        payment_method: newTransaction.payment_method,
        status: newTransaction.status,
      })

      if (error) throw error

      // Reset form
      setNewTransaction({
        type: 'expense',
        category: '',
        description: '',
        amount: '',
        transaction_date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: 'money',
        status: 'completed',
      })

      onSuccess()
      onOpenChange(false)
      toast.success(t('finance.addTransaction.success'))
    } catch (err: any) {
      toast.error(t('finance.table.errorAdd'), {
        description: err.message,
      })
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        className="max-w-2xl p-0"
        drawerProps={{
          className: "h-[85vh]"
        }}
      >
        <ModalHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b">
          <ModalTitle className="text-base font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t('finance.addTransaction.title')}
          </ModalTitle>
        </ModalHeader>

        <div className="px-4 sm:px-6 py-4 space-y-4 overflow-y-auto max-h-[calc(85vh-120px)]">
          {/* Tipo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('finance.table.type')}</label>
            <Select
              value={newTransaction.type}
              onValueChange={(value: 'income' | 'expense') =>
                setNewTransaction({ ...newTransaction, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                    {t('finance.filters.income')}
                  </div>
                </SelectItem>
                <SelectItem value="expense">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                    {t('finance.filters.expense')}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('finance.table.category')}</label>
            <Select
              value={newTransaction.category}
              onValueChange={(value) =>
                setNewTransaction({ ...newTransaction, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('finance.addTransaction.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {categories.length === 0 ? (
                  <SelectItem value={t('finance.table.general')} disabled>
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
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('finance.table.description')}</label>
            <Input
              placeholder={t('finance.addTransaction.descriptionPlaceholder')}
              value={newTransaction.description}
              onChange={(e) =>
                setNewTransaction({ ...newTransaction, description: e.target.value })
              }
            />
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('finance.table.value')}</label>
            <Input
              type="number"
              placeholder="0.00"
              value={newTransaction.amount}
              onChange={(e) =>
                setNewTransaction({ ...newTransaction, amount: e.target.value })
              }
              step="0.01"
              min="0"
            />
          </div>

          {/* Data */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('finance.table.date')}</label>
            <Input
              type="date"
              value={newTransaction.transaction_date}
              onChange={(e) =>
                setNewTransaction({ ...newTransaction, transaction_date: e.target.value })
              }
            />
          </div>

          {/* Método de Pagamento */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('finance.addTransaction.paymentMethod')}</label>
            <Select
              value={newTransaction.payment_method}
              onValueChange={(value) =>
                setNewTransaction({ ...newTransaction, payment_method: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="money">{t('finance.payment.cash')}</SelectItem>
                <SelectItem value="credit_card">{t('finance.payment.creditCard')}</SelectItem>
                <SelectItem value="debit_card">{t('finance.payment.debitCard')}</SelectItem>
                <SelectItem value="pix">{t('finance.payment.pix')}</SelectItem>
                <SelectItem value="bank_transfer">{t('finance.payment.bankTransfer')}</SelectItem>
                <SelectItem value="other">{t('finance.addTransaction.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('finance.table.status')}</label>
            <Select
              value={newTransaction.status}
              onValueChange={(value: 'pending' | 'completed') =>
                setNewTransaction({ ...newTransaction, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">{t('finance.filters.completed')}</SelectItem>
                <SelectItem value="pending">{t('finance.filters.pending')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botão Adicionar */}
          <Button
            onClick={handleAddTransaction}
            className="w-full"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('finance.addTransaction.button')}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  )
}
