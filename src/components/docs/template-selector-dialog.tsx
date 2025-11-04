import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Sparkles } from 'lucide-react'
import { getTranslatedTemplates, getCategoryLabel, PageTemplate } from '@/lib/page-templates'
import { useI18n } from '@/hooks/use-i18n'

interface TemplateSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: PageTemplate) => void
}

export const TemplateSelectorDialog = ({
  open,
  onOpenChange,
  onSelectTemplate,
}: TemplateSelectorDialogProps) => {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredTemplates = getTranslatedTemplates().filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const categories = [
    { id: 'all', label: t('pages.templates.all') },
    { id: 'business', label: t('pages.templates.business') },
    { id: 'personal', label: t('pages.templates.personal') },
    { id: 'education', label: t('pages.templates.education') },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[600px] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            {t('pages.templates.title')}
          </DialogTitle>
          <DialogDescription>
            {t('pages.templates.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Busca */}
        <div className="px-6 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('pages.templates.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Categorias */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
          <div className="px-6 py-2 border-b border-border">
            <TabsList className="grid w-full grid-cols-4">
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    onSelectTemplate(template)
                    onOpenChange(false)
                  }}
                  className="group text-left p-4 border border-border rounded-lg hover:border-primary hover:bg-accent transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      {template.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                        {template.name}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                      <div className="mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {getCategoryLabel(template.category)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">Nenhum template encontrado</p>
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
