import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Check, 
  CreditCard, 
  Download, 
  FileText,
  Zap,
  Crown,
  Rocket,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Grátis',
    price: 0,
    period: 'mês',
    description: 'Perfeito para começar',
    icon: Star,
    color: 'from-slate-500 to-slate-600',
    features: [
      '3 projetos',
      '50 documentos',
      '1 GB de armazenamento',
      'Até 2 membros',
      'Suporte por email',
    ],
    limitations: [
      'Sem analytics avançado',
      'Sem exportação',
    ]
  },
  {
    name: 'Pro',
    price: 29,
    period: 'mês',
    description: 'Para equipes pequenas',
    icon: Zap,
    color: 'from-indigo-500 to-violet-500',
    popular: true,
    features: [
      'Projetos ilimitados',
      'Documentos ilimitados',
      '50 GB de armazenamento',
      'Até 10 membros',
      'Analytics avançado',
      'Exportação CSV/JSON',
      'Suporte prioritário',
      'API access',
    ],
    limitations: []
  },
  {
    name: 'Business',
    price: 79,
    period: 'mês',
    description: 'Para empresas em crescimento',
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    features: [
      'Tudo do Pro +',
      '200 GB de armazenamento',
      'Membros ilimitados',
      'Branding customizado',
      'SSO (Single Sign-On)',
      'Backup automático',
      'Suporte 24/7',
      'Gerente de conta dedicado',
    ],
    limitations: []
  },
  {
    name: 'Enterprise',
    price: null,
    period: 'personalizado',
    description: 'Para grandes organizações',
    icon: Rocket,
    color: 'from-emerald-500 to-green-500',
    features: [
      'Tudo do Business +',
      'Armazenamento ilimitado',
      'On-premise deployment',
      'SLA 99.9%',
      'Auditoria de segurança',
      'Treinamento personalizado',
      'Integrações customizadas',
      'Contrato anual',
    ],
    limitations: []
  },
]

const invoices = [
  { id: 'INV-2024-001', date: '01/10/2024', amount: 29, status: 'paid' },
  { id: 'INV-2024-002', date: '01/09/2024', amount: 29, status: 'paid' },
  { id: 'INV-2024-003', date: '01/08/2024', amount: 29, status: 'paid' },
]

export default function BillingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const currentPlan = 'Pro'

  const getDiscountedPrice = (price: number | null) => {
    if (!price) return null
    if (billingPeriod === 'yearly') {
      return Math.round(price * 12 * 0.8) // 20% de desconto anual
    }
    return price
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Planos e Cobrança</h1>
          <p className="mt-2 text-slate-400">
            Gerencie sua assinatura, método de pagamento e faturas
          </p>
        </div>

        {/* Current Plan */}
        <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-violet-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Plano Atual</CardTitle>
                <CardDescription className="mt-1">
                  Você está no plano {currentPlan}
                </CardDescription>
              </div>
              <Badge className="bg-indigo-500">
                {currentPlan}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-sm text-slate-400">Próxima cobrança</p>
                <p className="mt-1 text-2xl font-bold text-slate-50">R$ 29</p>
                <p className="text-xs text-slate-500">01/11/2024</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-sm text-slate-400">Membros</p>
                <p className="mt-1 text-2xl font-bold text-slate-50">3 / 10</p>
                <p className="text-xs text-slate-500">30% usado</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-sm text-slate-400">Armazenamento</p>
                <p className="mt-1 text-2xl font-bold text-slate-50">12 GB</p>
                <p className="text-xs text-slate-500">24% de 50 GB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Period Toggle */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={billingPeriod === 'monthly' ? 'default' : 'outline'}
            onClick={() => setBillingPeriod('monthly')}
          >
            Mensal
          </Button>
          <div className="relative">
            <Button
              variant={billingPeriod === 'yearly' ? 'default' : 'outline'}
              onClick={() => setBillingPeriod('yearly')}
            >
              Anual
            </Button>
            {billingPeriod === 'yearly' && (
              <Badge className="absolute -right-12 top-0 bg-green-500">
                -20%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const Icon = plan.icon
            const discountedPrice = getDiscountedPrice(plan.price)
            const isCurrentPlan = plan.name === currentPlan

            return (
              <Card
                key={plan.name}
                className={cn(
                  'relative overflow-hidden',
                  plan.popular && 'border-indigo-500/50 shadow-lg shadow-indigo-500/20',
                  isCurrentPlan && 'ring-2 ring-indigo-500'
                )}
              >
                {plan.popular && (
                  <div className="absolute right-4 top-4">
                    <Badge className="bg-indigo-500">Popular</Badge>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute left-4 top-4">
                    <Badge variant="outline" className="border-indigo-500 text-indigo-400">
                      Plano Atual
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className={cn(
                    'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br',
                    plan.color
                  )}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    {discountedPrice !== null ? (
                      <>
                        <span className="text-4xl font-bold text-slate-50">
                          R$ {discountedPrice}
                        </span>
                        <span className="text-slate-400">/{plan.period}</span>
                        {billingPeriod === 'yearly' && plan.price && (
                          <p className="mt-1 text-xs text-slate-500 line-through">
                            R$ {plan.price * 12}
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-slate-50">
                        Personalizado
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <Separator className="mb-4" />
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 flex-shrink-0 text-green-400" />
                        <span className="text-sm text-slate-300">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation) => (
                      <li key={limitation} className="flex items-start gap-2 opacity-50">
                        <span className="text-sm text-slate-500">{limitation}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="mt-6 w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Plano Atual' : plan.price === null ? 'Falar com Vendas' : 'Fazer Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Método de Pagamento
            </CardTitle>
            <CardDescription>
              Gerencie seus cartões e métodos de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-slate-800 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-50">•••• •••• •••• 4242</p>
                  <p className="text-sm text-slate-400">Expira em 12/2025</p>
                </div>
              </div>
              <Button variant="outline">
                Alterar
              </Button>
            </div>

            <Button variant="ghost" className="mt-4 w-full">
              + Adicionar Novo Método
            </Button>
          </CardContent>
        </Card>

        {/* Invoice History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Histórico de Faturas
            </CardTitle>
            <CardDescription>
              Baixe suas faturas anteriores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 p-4"
                >
                  <div>
                    <p className="font-medium text-slate-50">{invoice.id}</p>
                    <p className="text-sm text-slate-400">{invoice.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-slate-50">R$ {invoice.amount}</p>
                      <Badge 
                        variant="outline" 
                        className="border-green-500/50 text-green-400"
                      >
                        Pago
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium text-slate-50">Posso cancelar a qualquer momento?</p>
              <p className="mt-1 text-sm text-slate-400">
                Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas adicionais.
              </p>
            </div>
            <Separator />
            <div>
              <p className="font-medium text-slate-50">O que acontece quando eu cancelo?</p>
              <p className="mt-1 text-sm text-slate-400">
                Você terá acesso até o final do período pago. Seus dados serão mantidos por 30 dias.
              </p>
            </div>
            <Separator />
            <div>
              <p className="font-medium text-slate-50">Posso fazer upgrade/downgrade?</p>
              <p className="mt-1 text-sm text-slate-400">
                Sim! Mudanças de plano são proporcionais e refletidas na próxima fatura.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
