import { useState, useEffect } from 'react'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Plus, Trash2, Check, AlertCircle, Clock, Loader2, CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { FinanceBlockProps } from '@/types/finance-blocks'
import { useI18n } from '@/hooks/use-i18n'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Bloco para gerenciar contas recorrentes
 * Tabela inline editável estilo Notion
 */
export const RecurringBillsBlock = ({
  documentId,
  categories,
  onRefresh,
}: RecurringBillsBlockProps) => {
  const { t } = useI18n()
  const [bills, setBills] = useState<RecurringBill[]>([])
  const [loading, setLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  
  // Estados para edição inline
  const [editingCell, setEditingCell] = useState<{rowId: string, field: string} | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [selectOpen, setSelectOpen] = useState<{field: string} | null>(null)
  const [calendarOpen, setCalendarOpen] = useState<{rowId: string} | null>(null)

  useEffect(() => {
    loadBills()
  }, [documentId])

  useEffect(() => {
    // Simular inicialização
    const timer = setTimeout(() => {
      setIsInitializing(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const loadBills = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('recurring_bills')
        .select('*')
        .eq('finance_document_id', documentId)
        .order('created_at', { ascending: true }) // Ordenar por data de criação para manter sequência

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

  const handleCellEdit = (e: React.MouseEvent, rowId: string, field: string, currentValue: any) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingCell({ rowId, field })
    setEditingValue(String(currentValue || ''))
    if (field === 'category') {
      setSelectOpen({ field })
    } else if (field === 'due_day') {
      setCalendarOpen({ rowId })
    }
  }

  const handleCellSave = async (rowId: string, field: string) => {
    if (!editingCell || editingCell.rowId !== rowId || editingCell.field !== field) return

    const bill = bills.find(b => b.id === rowId)
    if (!bill) {
      setEditingCell(null)
      setEditingValue('')
      return
    }

    const updateData: any = {}
    
    if (field === 'name') {
      updateData.name = editingValue.trim()
    } else if (field === 'amount') {
      const value = parseFloat(editingValue.replace(',', '.')) || 0
      if (value <= 0) {
        toast.error(t('finance.quickExpense.invalidValue'))
        setEditingCell(null)
        setEditingValue('')
        return
      }
      // Garantir valor mínimo para não violar constraint
      updateData.amount = Math.max(value, 0.01)
    } else if (field === 'due_day') {
      const day = parseInt(editingValue) || 1
      if (day < 1 || day > 31) {
        toast.error(t('finance.recurringBills.invalidDay'))
        setEditingCell(null)
        setEditingValue('')
        setCalendarOpen(null)
        return
      }
      updateData.due_day = day
    } else if (field === 'category') {
      updateData.category = editingValue.trim()
    }

    try {
      const { error } = await supabase
        .from('recurring_bills')
        .update(updateData)
        .eq('id', rowId)

      if (error) throw error
      
      // Atualizar estado local sem recarregar tudo
      setBills(bills.map(b => 
        b.id === rowId ? { ...b, ...updateData } : b
      ))
      
      toast.success(t('finance.recurringBills.updated'))
    } catch (err: any) {
      toast.error(t('finance.recurringBills.errorUpdate'), {
        description: err.message,
      })
    }
    
    setEditingCell(null)
    setEditingValue('')
    setSelectOpen(null)
    setCalendarOpen(null)
  }

  const handleAddNew = async () => {
    // Criar nova conta com valores padrão
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error(t('finance.goals.userNotAuthenticated'))
        return
      }

      const { data, error } = await supabase
        .from('recurring_bills')
        .insert({
          user_id: user.id,
          finance_document_id: documentId,
          name: '',
          amount: 0.01, // Valor mínimo para não violar constraint
          due_day: 5,
          category: categories[0] || '',
          paid: false,
          auto_create: false,
        })
        .select()
        .single()

      if (error) throw error
      
      // Adicionar à lista local no final (sequência de criação)
      setBills([...bills, data])
      
      // Entrar em modo de edição para o nome
      setEditingCell({ rowId: data.id, field: 'name' })
      setEditingValue('')
      
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

      const newPaidStatus = !bill.paid
      const { error } = await supabase
        .from('recurring_bills')
        .update({ paid: newPaidStatus })
        .eq('id', id)

      if (error) throw error
      
      // Atualizar estado local
      setBills(bills.map(b => 
        b.id === id ? { ...b, paid: newPaidStatus } : b
      ))
      
      toast.success(t('finance.recurringBills.updated'))
    } catch (err: any) {
      toast.error(t('finance.recurringBills.errorUpdate'), {
        description: err.message,
      })
    }
  }

  const deleteBill = async (id: string) => {
    if (!confirm(t('finance.table.deleteConfirm'))) return

    try {
      const { error } = await supabase
        .from('recurring_bills')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Remover do estado local
      setBills(bills.filter(b => b.id !== id))
      
      toast.success(t('finance.recurringBills.removed'))
    } catch (err: any) {
      toast.error(t('finance.recurringBills.errorRemove'), {
        description: err.message,
      })
    }
  }

  // Calcular contas vencendo e vencidas
  const today = new Date().getDate()
  const overdueBills = bills.filter(b => !b.paid && b.due_day < today)
  const upcomingBills = bills.filter(b => {
    if (b.paid) return false
    const daysUntilDue = b.due_day - today
    return daysUntilDue >= 0 && daysUntilDue <= 7
  })

  // Skeleton
  if (isInitializing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border rounded-lg overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="h-8 text-xs w-8">
                <Skeleton className="h-3 w-3" />
              </TableHead>
              <TableHead className="h-8 text-xs">
                <Skeleton className="h-3 w-20" />
              </TableHead>
              <TableHead className="h-8 text-xs text-right">
                <Skeleton className="h-3 w-24 ml-auto" />
              </TableHead>
              <TableHead className="h-8 text-xs hidden md:table-cell">
                <Skeleton className="h-3 w-16" />
              </TableHead>
              <TableHead className="h-8 text-xs hidden lg:table-cell">
                <Skeleton className="h-3 w-20" />
              </TableHead>
              <TableHead className="h-8 w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i} className="h-8">
                <TableCell className="text-xs py-0 px-2">
                  <Skeleton className="h-4 w-4 rounded" />
                </TableCell>
                <TableCell className="text-xs py-0 px-2">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="text-xs py-0 px-2 text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </TableCell>
                <TableCell className="text-xs py-0 px-2 hidden md:table-cell">
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell className="text-xs py-0 px-2 hidden lg:table-cell">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="text-xs py-0 px-1">
                  <Skeleton className="h-6 w-6 rounded" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Alertas de Vencimento */}
      <AnimatePresence>
        {(overdueBills.length > 0 || upcomingBills.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {overdueBills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 border border-red-200 bg-red-50 dark:bg-red-950/20 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-semibold text-red-900 dark:text-red-100">
                    {overdueBills.length} {t('finance.recurringBills.overdue')}
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
              </motion.div>
            )}

            {upcomingBills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="p-3 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                    {upcomingBills.length} {t('finance.recurringBills.upcoming')}
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
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabela */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="border rounded-lg overflow-hidden"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="h-8 text-xs w-8">
                <Check className="h-3 w-3" />
              </TableHead>
              <TableHead className="h-8 text-xs">{t('finance.table.description')}</TableHead>
              <TableHead className="h-8 text-xs text-right">{t('finance.budget.value')}</TableHead>
              <TableHead className="h-8 text-xs">{t('finance.recurringBills.dueDay')}</TableHead>
              <TableHead className="h-8 text-xs hidden lg:table-cell">{t('finance.table.category')}</TableHead>
              <TableHead className="h-8 w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <TableRow
                key={bill.id}
                className={`h-8 ${bill.paid ? 'opacity-60' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onMouseDown={(e) => {
                  const target = e.target as HTMLElement
                  if (target.closest('.cursor-text') || target.closest('input') || target.closest('[role="combobox"]') || target.closest('button') || target.closest('[data-slot="popover-trigger"]')) {
                    return
                  }
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                {/* Status Paid */}
                <TableCell className="text-xs py-0 px-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        togglePaid(bill.id)
                      }}
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        bill.paid 
                          ? 'bg-green-600 border-green-600' 
                          : 'border-muted-foreground hover:border-green-600'
                      }`}
                      title={bill.paid ? t('finance.recurringBills.markPending') : t('finance.recurringBills.markPaid')}
                    >
                      {bill.paid && <Check className="h-3 w-3 text-white" />}
                    </button>
                  </motion.div>
                </TableCell>

                {/* Nome - Editável inline */}
                <TableCell className="text-xs py-0 px-2">
                  <AnimatePresence mode="wait">
                    {editingCell?.rowId === bill.id && editingCell?.field === 'name' ? (
                      <motion.div
                        key="edit-name"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (editingValue.trim()) {
                              handleCellSave(bill.id, 'name')
                            } else {
                              setEditingCell(null)
                              setEditingValue('')
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              e.stopPropagation()
                              if (editingValue.trim()) {
                                handleCellSave(bill.id, 'name')
                              }
                            }
                            if (e.key === 'Escape') {
                              e.preventDefault()
                              e.stopPropagation()
                              setEditingCell(null)
                              setEditingValue(bill.name)
                            }
                          }}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                          className="h-7 text-xs border-none p-1 focus-visible:ring-1"
                          autoFocus
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="display-name"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleCellEdit(e, bill.id, 'name', bill.name)
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        className={`cursor-text hover:bg-muted/50 px-1 py-0.5 rounded min-h-[28px] flex items-center transition-colors ${
                          bill.paid ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {bill.name || (
                          <span className="text-muted-foreground italic">
                            {t('finance.table.description')}...
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TableCell>

                {/* Valor - Editável inline */}
                <TableCell className="text-xs text-right font-mono py-0 px-2">
                  <AnimatePresence mode="wait">
                    {editingCell?.rowId === bill.id && editingCell?.field === 'amount' ? (
                      <motion.div
                        key="edit-amount"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="flex justify-end"
                      >
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={editingValue}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9,.-]/g, '')
                            setEditingValue(value)
                          }}
                          onBlur={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const cleanedValue = editingValue.trim().replace(/[^0-9,.-]/g, '')
                            if (cleanedValue) {
                              handleCellSave(bill.id, 'amount')
                            } else {
                              setEditingCell(null)
                              setEditingValue('')
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              e.stopPropagation()
                              const cleanedValue = editingValue.trim().replace(/[^0-9,.-]/g, '')
                              if (cleanedValue) {
                                handleCellSave(bill.id, 'amount')
                              }
                            }
                            if (e.key === 'Escape') {
                              e.preventDefault()
                              e.stopPropagation()
                              setEditingCell(null)
                              setEditingValue(String(bill.amount))
                            }
                          }}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                          className="h-7 text-xs border-none p-1 focus-visible:ring-1 text-right w-full max-w-[120px]"
                          autoFocus
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="display-amount"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleCellEdit(e, bill.id, 'amount', bill.amount)
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        className={`cursor-text hover:bg-muted/50 px-1 py-0.5 rounded min-h-[28px] flex items-center justify-end font-semibold transition-colors ${
                          bill.paid ? 'text-muted-foreground' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(bill.amount)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TableCell>

                {/* Dia de Vencimento - Calendário moderno */}
                <TableCell className="text-xs py-0 px-2">
                  <Popover
                    open={calendarOpen?.rowId === bill.id}
                    onOpenChange={(open) => {
                      setCalendarOpen(open ? { rowId: bill.id } : null)
                      if (!open && editingCell?.rowId === bill.id && editingCell?.field === 'due_day') {
                        handleCellSave(bill.id, 'due_day')
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setEditingCell({ rowId: bill.id, field: 'due_day' })
                          setEditingValue(String(bill.due_day))
                          setCalendarOpen({ rowId: bill.id })
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        className="cursor-pointer hover:bg-muted/50 px-1 py-0.5 rounded min-h-[28px] flex items-center gap-1.5 transition-colors w-full text-left"
                      >
                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="secondary" className="text-xs">
                          {bill.due_day}
                        </Badge>
                      </motion.button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-auto p-3 sm:p-4 border-2 shadow-xl bg-background rounded-xl max-w-[95vw]" 
                      align="start"
                      sideOffset={5}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="bg-gradient-to-br from-background to-muted/20 rounded-lg p-1"
                      >
                        <Calendar
                          mode="single"
                          selected={(() => {
                            const currentDate = new Date()
                            const year = currentDate.getFullYear()
                            const month = currentDate.getMonth()
                            const day = parseInt(editingValue || String(bill.due_day)) || 1
                            // Garantir que o dia está dentro do range válido do mês
                            const daysInMonth = new Date(year, month + 1, 0).getDate()
                            const validDay = Math.min(Math.max(day, 1), daysInMonth)
                            return new Date(year, month, validDay)
                          })()}
                          onSelect={async (date) => {
                            if (date) {
                              const day = date.getDate()
                              setEditingValue(String(day))
                              // Salvar diretamente
                              const updateData = { due_day: day }
                              try {
                                const { error } = await supabase
                                  .from('recurring_bills')
                                  .update(updateData)
                                  .eq('id', bill.id)

                                if (error) throw error
                                
                                // Atualizar estado local
                                setBills(bills.map(b => 
                                  b.id === bill.id ? { ...b, due_day: day } : b
                                ))
                                
                                toast.success(t('finance.recurringBills.updated'))
                              } catch (err: any) {
                                toast.error(t('finance.recurringBills.errorUpdate'), {
                                  description: err.message,
                                })
                              }
                              setEditingCell(null)
                              setEditingValue('')
                              setCalendarOpen(null)
                            }
                          }}
                          locale={ptBR}
                          className="rounded-lg"
                          classNames={{
                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4",
                            caption: "flex justify-center pt-2 pb-4 relative items-center border-b border-border/50 mb-2",
                            caption_label: "text-base font-bold text-foreground tracking-wide",
                            nav: "space-x-1 flex items-center",
                            nav_button: "h-8 w-8 bg-background border border-border hover:bg-accent hover:border-accent-foreground/20 rounded-lg p-0 opacity-70 hover:opacity-100 transition-all duration-200 shadow-sm hover:shadow-md",
                            nav_button_previous: "absolute left-2",
                            nav_button_next: "absolute right-2",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex mb-2",
                            head_cell: "text-muted-foreground/80 rounded-md w-10 font-semibold text-[0.75rem] uppercase tracking-wider",
                            row: "flex w-full mt-1",
                            cell: "h-10 w-10 text-center text-sm p-0 relative rounded-lg [&:has([aria-selected].day-range-end)]:rounded-r-lg [&:has([aria-selected].day-outside)]:bg-accent/30 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg focus-within:relative focus-within:z-20",
                            day: "h-10 w-10 p-0 font-medium aria-selected:opacity-100 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-110 active:scale-95",
                            day_range_end: "day-range-end",
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-bold shadow-md scale-110",
                            day_today: "bg-accent/50 text-accent-foreground font-bold border-2 border-primary/50",
                            day_outside: "day-outside text-muted-foreground/40 opacity-50 aria-selected:bg-accent/30 aria-selected:text-muted-foreground aria-selected:opacity-50",
                            day_disabled: "text-muted-foreground/30 opacity-30 cursor-not-allowed",
                            day_range_middle: "aria-selected:bg-accent/50 aria-selected:text-accent-foreground",
                            day_hidden: "invisible",
                          }}
                        />
                      </motion.div>
                    </PopoverContent>
                  </Popover>
                </TableCell>

                {/* Categoria - Editável inline */}
                <TableCell className="text-xs py-0 px-2 hidden lg:table-cell">
                  <AnimatePresence mode="wait">
                    {editingCell?.rowId === bill.id && editingCell?.field === 'category' ? (
                      <motion.div
                        key="edit-category"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Select
                          value={editingValue || bill.category}
                          open={selectOpen?.field === 'category'}
                          onOpenChange={(open) => {
                            setSelectOpen(open ? { field: 'category' } : null)
                            if (!open) {
                              handleCellSave(bill.id, 'category')
                            }
                          }}
                          onValueChange={(value) => {
                            setEditingValue(value)
                            handleCellSave(bill.id, 'category')
                          }}
                        >
                          <SelectTrigger className="h-7 text-xs border-none p-1 focus-visible:ring-1">
                            <SelectValue placeholder={t('finance.table.category')} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.length === 0 ? (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                {t('finance.table.noCategory')}
                              </div>
                            ) : (
                              categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="display-category"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleCellEdit(e, bill.id, 'category', bill.category)
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        className="cursor-text hover:bg-muted/50 px-1 py-0.5 rounded min-h-[28px] flex items-center transition-colors"
                      >
                        {bill.category || (
                          <span className="text-muted-foreground italic">
                            {t('finance.table.category')}...
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TableCell>

                {/* Botão deletar */}
                <TableCell className="text-xs py-0 px-1">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        deleteBill(bill.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </motion.div>
                </TableCell>
              </TableRow>
            ))}

            {/* Linha para adicionar nova conta */}
            <TableRow 
              className="h-8 border-t-2 border-dashed"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <TableCell colSpan={6} className="text-xs py-0 px-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleAddNew()
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  className="w-full text-left px-1 py-0.5 rounded hover:bg-muted/50 text-muted-foreground italic flex items-center gap-2 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  {t('finance.recurringBills.addNew')}
                </motion.button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </motion.div>

      {/* Resumo */}
      {bills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
        >
          <div className="text-sm">
            <span className="text-muted-foreground">{t('finance.budget.totalBudget')}: </span>
            <span className="font-semibold">
              {formatCurrency(bills.reduce((sum, b) => sum + b.amount, 0))}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">{t('finance.recurringBills.paid')}: </span>
            <span className="font-semibold text-green-600">
              {bills.filter(b => b.paid).length}/{bills.length}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
