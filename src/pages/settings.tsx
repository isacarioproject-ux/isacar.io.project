import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { User, Bell, Shield, CreditCard, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useI18n } from '@/hooks/use-i18n'

export default function SettingsPage() {
  const { t } = useI18n()
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">{t('nav.dashboard')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('settings.title')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Perfil</CardTitle>
            </div>
            <CardDescription>
              Atualize suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                JS
              </div>
              <div className="space-y-1">
                <Button variant="outline" size="sm">
                  Alterar Foto
                </Button>
                <p className="text-xs text-muted-foreground">JPG, PNG ou GIF. Máximo 2MB.</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" defaultValue="João Silva" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="joao@isacar.io" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                placeholder="Conte um pouco sobre você..."
                defaultValue="Product Designer na ISACAR"
              />
            </div>

            <Button>Salvar Alterações</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Notificações</CardTitle>
            </div>
            <CardDescription>
              Configure como você quer receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-sm font-medium">
                  Notificações por Email
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receba atualizações importantes por email
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="project-updates" className="text-sm font-medium">
                  Atualizações de Projetos
                </Label>
                <p className="text-xs text-muted-foreground">
                  Notificações sobre mudanças nos seus projetos
                </p>
              </div>
              <Switch id="project-updates" defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="team-invites" className="text-sm font-medium">
                  Convites de Equipe
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receba notificações de novos membros
                </p>
              </div>
              <Switch id="team-invites" defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing" className="text-sm font-medium">
                  Emails de Marketing
                </Label>
                <p className="text-xs text-muted-foreground">
                  Novidades, dicas e ofertas especiais
                </p>
              </div>
              <Switch id="marketing" />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Segurança</CardTitle>
            </div>
            <CardDescription>
              Mantenha sua conta segura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Senha</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Última alteração há 3 meses
              </p>
              <Button variant="outline" size="sm">Alterar Senha</Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="2fa" className="text-sm font-medium">
                  Autenticação de Dois Fatores
                </Label>
                <p className="text-xs text-muted-foreground">
                  Adicione uma camada extra de segurança
                </p>
              </div>
              <Switch id="2fa" />
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium">Sessões Ativas</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Gerencie onde você está logado
              </p>
              <Button variant="outline" size="sm">Ver Sessões</Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Plano e Cobrança</CardTitle>
            </div>
            <CardDescription>
              Gerencie sua assinatura e método de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Plano Pro</h3>
                  <p className="text-xs text-muted-foreground">Próxima cobrança em 15/02/2024</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">R$ 49</p>
                  <p className="text-xs text-muted-foreground">/mês</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                Alterar Plano
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Gerenciar Método de Pagamento
              </Button>
              <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive">
                Cancelar Assinatura
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Idioma e Região</CardTitle>
            </div>
            <CardDescription>
              Configure suas preferências de localização
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Input id="language" defaultValue="Português (Brasil)" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Input id="timezone" defaultValue="(UTC-03:00) Brasília" disabled />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
            <CardDescription>
              Ações irreversíveis para sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div>
                <p className="text-sm font-medium">Excluir Conta</p>
                <p className="text-xs text-muted-foreground">
                  Remova permanentemente sua conta e todos os dados
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Excluir Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
