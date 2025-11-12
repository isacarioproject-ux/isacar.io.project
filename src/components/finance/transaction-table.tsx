import { useState, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  Plus, MoreVertical, Trash2, Edit, Copy, TrendingUp, TrendingDown, Calendar, Check, X
} from 'lucide-react'
import { FinanceTransaction } from '@/types/finance'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useI18n } from '@/hooks/use-i18n'

interface TransactionTableProps {
  documentId: string
  transactions: FinanceTransaction[]
  categories: string[]
  onRefresh: () => void
}

export const TransactionTable = ({
  documentId,
  transactions,
  categories,
  onRefresh,
}: TransactionTableProps) => {
  const { t } = useI18n()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showMobileForm, setShowMobileForm] = useState(false)
  const [editingData, setEditingData] = useState<Partial<FinanceTransaction>>({})
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    amount: '',
    transaction_date: format(new Date(), 'yyyy-MM-dd'),
    payment_method: 'cash',
    status: 'completed' as 'pending' | 'completed',
  })

  const handleAddTransaction = useCallback(async () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
      toast.error(t('finance.table.fillRequired'))
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
        tags: [],
      })

      if (error) throw error

      // Resetar form
      setNewTransaction({
        type: 'expense',
        category: '',
        description: '',
        amount: '',
        transaction_date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: 'cash',
        status: 'completed',
      })
      setShowMobileForm(false)

      onRefresh()
      toast.success(t('finance.table.added'))
    } catch (err: any) {
      toast.error(t('finance.table.errorAdd'), {
        description: err.message,
      })
    }
  }, [documentId, newTransaction, onRefresh])

  const handleDeleteTransaction = useCallback(async (id: string) => {
    if (!confirm(t('finance.table.deleteConfirm'))) return

    try {
      const { error } = await supabase
        .from('finance_transactions')
        .delete()
        .eq('id', id)

      if (error) throw error

      onRefresh()
      toast.success(t('finance.table.deleted'))
    } catch (err: any) {
      toast.error(t('finance.table.errorDelete'), {
        description: err.message,
      })
    }
  }, [onRefresh])

  const handleDuplicateTransaction = useCallback(async (transaction: FinanceTransaction) => {
    try {
      const { error } = await supabase.from('finance_transactions').insert({
        finance_document_id: documentId,
        type: transaction.type,
        category: transaction.category,
        description: `${transaction.description} (${t('finance.table.duplicate')})`,
        amount: transaction.amount,
        transaction_date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: transaction.payment_method,
        status: transaction.status,
        tags: transaction.tags || [],
      })

      if (error) throw error

      onRefresh()
      toast.success(t('finance.table.duplicated'))
    } catch (err: any) {
      toast.error(t('finance.table.errorDuplicate'), {
        description: err.message,
      })
    }
  }, [documentId, onRefresh])

  const handleToggleStatus = useCallback(async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'

    try {
      const { error } = await supabase
        .from('finance_transactions')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      onRefresh()
    } catch (err: any) {
      toast.error(t('finance.table.errorUpdate'), {
        description: err.message,
      })
    }
  }, [onRefresh])

  const handleDuplicate = useCallback(async (id: string) => {
    const transaction = transactions.find(t => t.id === id)
    if (!transaction) return

    try {
      const { error } = await supabase
        .from('finance_transactions')
        .insert({
          finance_document_id: transaction.finance_document_id,
          type: transaction.type,
          category: transaction.category,
          description: `${transaction.description} (${t('finance.table.duplicate')})`,
          amount: transaction.amount,
          transaction_date: transaction.transaction_date,
          payment_method: transaction.payment_method,
          status: 'pending',
        })

      if (error) throw error

      toast.success(t('finance.table.duplicated'))
      onRefresh()
    } catch (err: any) {
      toast.error(t('finance.table.errorDuplicate'), {
        description: err.message,
      })
    }
  }, [transactions, onRefresh])

  const handleDelete = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('finance_transactions')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success(t('finance.table.deleted'))
      onRefresh()
    } catch (err: any) {
      toast.error(t('finance.table.errorDelete'), {
        description: err.message,
      })
    }
  }, [onRefresh])

  const formatCurrency = useMemo(() => (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }, [])

  const getPaymentMethodLabel = useCallback((method: string) => {
    const labels: Record<string, string> = {
      cash: t('finance.payment.cash'),
      credit_card: t('finance.payment.creditCard'),
      debit_card: t('finance.payment.debitCard'),
      pix: t('finance.payment.pix'),
      bank_transfer: t('finance.payment.bankTransfer'),
    }
    return labels[method] || method
  }, [t])

  const handleStartEdit = useCallback((transaction: FinanceTransaction) => {
    setEditingId(transaction.id)
    setEditingData({
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category,
      transaction_date: transaction.transaction_date,
      payment_method: transaction.payment_method,
      status: transaction.status,
      type: transaction.type,
    })
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditingData({})
  }, [])

  const handleSaveEdit = useCallback(async () => {
    if (!editingId) return

    try {
      const { error } = await supabase
        .from('finance_transactions')
        .update({
          description: editingData.description,
          amount: editingData.amount,
          category: editingData.category,
          transaction_date: editingData.transaction_date,
          payment_method: editingData.payment_method,
          status: editingData.status,
          type: editingData.type,
        })
        .eq('id', editingId)

      if (error) throw error

      setEditingId(null)
      setEditingData({})
      onRefresh()
      toast.success(t('finance.table.updated'))
    } catch (err: any) {
      toast.error(t('finance.table.errorUpdate'), {
        description: err.message,
      })
    }
  }, [editingId, editingData, onRefresh])

  return (
    <div className="space-y-4">
      {/* Form adicionar transação - versão mobile */}
      <div className="md:hidden border rounded-lg bg-muted/40">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold"
          onClick={() => setShowMobileForm((prev) => !prev)}
        >
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t('finance.newTransaction')}
          </span>
          <span className="text-xs text-muted-foreground">
            {showMobileForm ? t('finance.table.close') : t('finance.table.add')}
          </span>
        </button>

        {showMobileForm && (
          <div className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <Select
                value={newTransaction.type}
                onValueChange={(value: 'income' | 'expense') =>
                  setNewTransaction({ ...newTransaction, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('finance.table.type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">{t('finance.filters.income')}</SelectItem>
                  <SelectItem value="expense">{t('finance.filters.expense')}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={newTransaction.category}
                onValueChange={(value) =>
                  setNewTransaction({ ...newTransaction, category: value })
                }
              >
                <SelectTrigger>
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

              <Input
                placeholder={t('finance.table.description')}
                value={newTransaction.description}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, description: e.target.value })
                }
              />

              <Input
                type="number"
                placeholder={t('finance.table.value')}
                value={newTransaction.amount}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, amount: e.target.value })
                }
                step="0.01"
                min="0"
              />

              <Input
                type="date"
                value={newTransaction.transaction_date}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    transaction_date: e.target.value,
                  })
                }
              />

              <Select
                value={newTransaction.payment_method}
                onValueChange={(value) =>
                  setNewTransaction({ ...newTransaction, payment_method: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('finance.table.payment')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{t('finance.payment.cash')}</SelectItem>
                  <SelectItem value="credit_card">{t('finance.payment.creditCard')}</SelectItem>
                  <SelectItem value="debit_card">{t('finance.payment.debitCard')}</SelectItem>
                  <SelectItem value="pix">{t('finance.payment.pix')}</SelectItem>
                  <SelectItem value="bank_transfer">{t('finance.payment.bankTransfer')}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={newTransaction.status}
                onValueChange={(value: 'pending' | 'completed') =>
                  setNewTransaction({ ...newTransaction, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('finance.table.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">{t('finance.filters.completed')}</SelectItem>
                  <SelectItem value="pending">{t('finance.filters.pending')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full" onClick={handleAddTransaction}>
              <Plus className="h-4 w-4 mr-2" />
              {t('finance.table.save')}
            </Button>
          </div>
        )}
      </div>

      {/* Form adicionar transação - escondido em mobile */}
      <div className="hidden md:block p-2.5 border rounded-lg bg-muted/30 space-y-2">
        <h3 className="text-xs font-semibold flex items-center gap-1.5 px-1">
          <Plus className="h-3 w-3" />
          {t('finance.newTransaction')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-1.5">
          {/* Tipo */}
          <Select
            value={newTransaction.type}
            onValueChange={(value: 'income' | 'expense') =>
              setNewTransaction({ ...newTransaction, type: value })
            }
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  {t('finance.filters.income')}
                </div>
              </SelectItem>
              <SelectItem value="expense">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  {t('finance.filters.expense')}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Categoria */}
          <Select
            value={newTransaction.category}
            onValueChange={(value) =>
              setNewTransaction({ ...newTransaction, category: value })
            }
          >
            <SelectTrigger className="h-8 text-sm">
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

          {/* Descrição */}
          <Input
            placeholder={t('finance.table.description')}
            value={newTransaction.description}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, description: e.target.value })
            }
            className="lg:col-span-2 h-8 text-sm"
          />

          {/* Valor */}
          <Input
            type="number"
            placeholder={t('finance.table.value')}
            value={newTransaction.amount}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, amount: e.target.value })
            }
            step="0.01"
            min="0"
            className="h-8 text-sm"
          />

          {/* Data */}
          <Input
            type="date"
            value={newTransaction.transaction_date}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, transaction_date: e.target.value })
            }
            className="h-8 text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {/* Método de pagamento */}
          <Select
            value={newTransaction.payment_method}
            onValueChange={(value) =>
              setNewTransaction({ ...newTransaction, payment_method: value })
            }
          >
            <SelectTrigger className="w-[180px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">{t('finance.payment.cash')}</SelectItem>
              <SelectItem value="credit_card">{t('finance.payment.creditCard')}</SelectItem>
              <SelectItem value="debit_card">{t('finance.payment.debitCard')}</SelectItem>
              <SelectItem value="pix">{t('finance.payment.pix')}</SelectItem>
              <SelectItem value="bank_transfer">{t('finance.payment.bankTransfer')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Status */}
          <Select
            value={newTransaction.status}
            onValueChange={(value: 'pending' | 'completed') =>
              setNewTransaction({ ...newTransaction, status: value })
            }
          >
            <SelectTrigger className="w-[140px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">{t('finance.filters.completed')}</SelectItem>
              <SelectItem value="pending">{t('finance.filters.pending')}</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleAddTransaction} size="sm" className="ml-auto h-8">
            <Plus className="h-3 w-3 mr-1.5" />
            {t('finance.table.add')}
          </Button>
        </div>
      </div>

      {/* Tabela de transações */}
      {transactions.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-sm text-muted-foreground">
            {t('finance.table.noTransactions')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('finance.table.add')}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: Cards */}
          <div className="md:hidden space-y-2">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 flex-shrink-0"
                      onClick={() => handleToggleStatus(transaction.id, transaction.status)}
                    >
                      {transaction.status === 'completed' ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <div className="h-3 w-3 border-2 border-muted-foreground rounded-full" />
                      )}
                    </Button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className={cn(
                      'text-sm font-semibold',
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(Number(transaction.amount))}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStartEdit(transaction)}>
                          <Edit className="h-3 w-3 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(transaction.id)}>
                          <Copy className="h-3 w-3 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(transaction.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(transaction.transaction_date).toLocaleDateString('pt-BR')}</span>
                  <span>{getPaymentMethodLabel(transaction.payment_method || 'cash')}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">{t('finance.table.status')}</TableHead>
                <TableHead className="w-[100px]">{t('finance.table.type')}</TableHead>
                <TableHead>{t('finance.table.description')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('finance.table.category')}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('finance.table.payment')}</TableHead>
                <TableHead className="hidden xl:table-cell">{t('finance.table.date')}</TableHead>
                <TableHead className="text-right">{t('finance.table.value')}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="group">
                  {/* Status */}
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleToggleStatus(transaction.id, transaction.status)}
                    >
                      {transaction.status === 'completed' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <div className="h-4 w-4 border-2 border-muted-foreground rounded-full" />
                      )}
                    </Button>
                  </TableCell>

                  {/* Tipo */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'gap-1',
                        transaction.type === 'income'
                          ? 'border-green-500 text-green-600'
                          : 'border-red-500 text-red-600'
                      )}
                    >
                      {transaction.type === 'income' ? (
                        <>
                          <TrendingUp className="h-3 w-3" />
                          <span className="hidden sm:inline">{t('finance.filters.income')}</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3" />
                          <span className="hidden sm:inline">{t('finance.filters.expense')}</span>
                        </>
                      )}
                    </Badge>
                  </TableCell>

                  {/* Descrição */}
                  <TableCell className="font-medium">
                    <div>
                      <p className="text-sm">{transaction.description}</p>
                      {transaction.notes && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {transaction.notes}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* Categoria */}
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary" className="text-xs">
                      {transaction.category}
                    </Badge>
                  </TableCell>

                  {/* Método de pagamento */}
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {getPaymentMethodLabel(transaction.payment_method || '')}
                  </TableCell>

                  {/* Data */}
                  <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(transaction.transaction_date), 'dd/MM/yyyy')}
                    </div>
                  </TableCell>

                  {/* Valor */}
                  <TableCell
                    className={cn(
                      'text-right font-mono font-semibold',
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(Number(transaction.amount))}
                  </TableCell>

                  {/* Ações */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleStartEdit(transaction)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          {t('finance.table.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicateTransaction(transaction)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          {t('finance.table.duplicate')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('finance.table.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </>
      )}

      {/* Resumo */}
      {transactions.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border text-sm">
          <span className="text-muted-foreground">
            {transactions.length} {transactions.length === 1 ? 'transação' : 'transações'}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="font-mono text-green-600">
                {formatCurrency(
                  transactions
                    .filter((t) => t.type === 'income' && t.status === 'completed')
                    .reduce((sum, t) => sum + Number(t.amount), 0)
                )}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-600" />
              <span className="font-mono text-red-600">
                {formatCurrency(
                  transactions
                    .filter((t) => t.type === 'expense' && t.status === 'completed')
                    .reduce((sum, t) => sum + Number(t.amount), 0)
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de Edição */}
      <Dialog open={!!editingId} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Tipo */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={editingData.type}
                onValueChange={(value: 'income' | 'expense') =>
                  setEditingData({ ...editingData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Descrição */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Descrição</label>
              <Input
                value={editingData.description || ''}
                onChange={(e) =>
                  setEditingData({ ...editingData, description: e.target.value })
                }
                placeholder="Ex: Almoço"
              />
            </div>

            {/* Valor */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Valor</label>
              <Input
                type="number"
                value={editingData.amount || ''}
                onChange={(e) =>
                  setEditingData({ ...editingData, amount: parseFloat(e.target.value) })
                }
                step="0.01"
                min="0"
              />
            </div>

            {/* Categoria */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select
                value={editingData.category}
                onValueChange={(value) =>
                  setEditingData({ ...editingData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Data</label>
              <Input
                type="date"
                value={editingData.transaction_date || ''}
                onChange={(e) =>
                  setEditingData({ ...editingData, transaction_date: e.target.value })
                }
              />
            </div>

            {/* Método de Pagamento */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Pagamento</label>
              <Select
                value={editingData.payment_method || undefined}
                onValueChange={(value) =>
                  setEditingData({ ...editingData, payment_method: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                  <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="bank_transfer">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={editingData.status}
                onValueChange={(value: 'pending' | 'completed') =>
                  setEditingData({ ...editingData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
