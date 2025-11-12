import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Filter, X, Search } from 'lucide-react'
import { FinanceCategory } from '@/types/finance'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { useI18n } from '@/hooks/use-i18n'

interface TransactionFiltersProps {
  categories: FinanceCategory[]
  onFilterChange: (filters: FilterState) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideButton?: boolean
}

export interface FilterState {
  search: string
  type: 'all' | 'income' | 'expense'
  category: string
  status: 'all' | 'pending' | 'completed'
  paymentMethod: string
  dateFrom: string
  dateTo: string
}

export const TransactionFilters = ({
  categories,
  onFilterChange,
  open,
  onOpenChange,
  hideButton = false,
}: TransactionFiltersProps) => {
  const { t } = useI18n()
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    category: 'all',
    status: 'all',
    paymentMethod: 'all',
    dateFrom: '',
    dateTo: '',
  })

  // Debounce apenas para busca (search)
  const debouncedSearch = useDebounce(filters.search, 300)

  // Notificar mudanças de filtros (exceto search que usa debounce)
  useEffect(() => {
    onFilterChange({ ...filters, search: debouncedSearch })
  }, [debouncedSearch, filters.type, filters.category, filters.status, filters.paymentMethod, filters.dateFrom, filters.dateTo])

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      search: '',
      type: 'all',
      category: 'all',
      status: 'all',
      paymentMethod: 'all',
      dateFrom: '',
      dateTo: '',
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => key !== 'search' && value !== 'all' && value !== ''
  ).length

  return (
    <div className="flex gap-2">
      {/* Busca */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('finance.filters.searchPlaceholder')}
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-9 h-8"
        />
      </div>

      {/* Filtros */}
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "h-8 gap-2 px-3",
              hideButton && "hidden md:hidden"
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">{t('finance.filters')}</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end" side="top">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{t('finance.filters')}</h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  {t('finance.filters.clear')}
                </Button>
              )}
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <label className="text-xs font-medium">{t('finance.filters.type')}</label>
              <Select
                value={filters.type}
                onValueChange={(value) => updateFilter('type', value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('finance.filters.all')}</SelectItem>
                  <SelectItem value="income">{t('finance.filters.income')}</SelectItem>
                  <SelectItem value="expense">{t('finance.filters.expense')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <label className="text-xs font-medium">{t('finance.filters.category')}</label>
              <Select
                value={filters.category}
                onValueChange={(value) => updateFilter('category', value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('finance.filters.allCategories')}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      <div className="flex items-center gap-2">
                        {cat.icon && <span className="text-sm">{cat.icon}</span>}
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-xs font-medium">{t('finance.filters.status')}</label>
              <Select
                value={filters.status}
                onValueChange={(value) => updateFilter('status', value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('finance.filters.all')}</SelectItem>
                  <SelectItem value="completed">{t('finance.filters.completed')}</SelectItem>
                  <SelectItem value="pending">{t('finance.filters.pending')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Método de Pagamento */}
            <div className="space-y-2">
              <label className="text-xs font-medium">{t('finance.filters.payment')}</label>
              <Select
                value={filters.paymentMethod}
                onValueChange={(value) => updateFilter('paymentMethod', value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('finance.filters.all')}</SelectItem>
                  <SelectItem value="money">{t('finance.filters.money')}</SelectItem>
                  <SelectItem value="card">{t('finance.filters.card')}</SelectItem>
                  <SelectItem value="pix">{t('finance.filters.pix')}</SelectItem>
                  <SelectItem value="transfer">{t('finance.filters.transfer')}</SelectItem>
                  <SelectItem value="other">{t('finance.filters.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data */}
            <div className="space-y-2">
              <label className="text-xs font-medium">{t('finance.filters.date')}</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">{t('finance.filters.dateFrom')}</label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilter('dateFrom', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">{t('finance.filters.dateTo')}</label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilter('dateTo', e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
