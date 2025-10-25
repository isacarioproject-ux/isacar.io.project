import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { User, Bell, Shield, CreditCard, Globe } from 'lucide-react'

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-slate-50">Configurações</h1>
          <p className="mt-2 text-slate-400">
            Gerencie suas preferências e configurações da conta
          </p>
        </header>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-slate-400" />
              <CardTitle>Perfil</CardTitle>
            </div>
            <CardDescription>
              Atualize suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-bold text-white">
                JS
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm">
                  Alterar Foto
                </Button>
                <p className="text-xs text-slate-500">JPG, PNG ou GIF. Máximo 2MB.</p>
              </div>
            </div>

            <Separator className="bg-slate-800" />

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
              <Bell className="h-5 w-5 text-slate-400" />
              <CardTitle>Notificações</CardTitle>
            </div>
            <CardDescription>
              Configure como você quer receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-base">
                  Notificações por Email
                </Label>
                <p className="text-sm text-slate-500">
                  Receba atualizações importantes por email
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>

            <Separator className="bg-slate-800" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="project-updates" className="text-base">
                  Atualizações de Projetos
                </Label>
                <p className="text-sm text-slate-500">
                  Notificações sobre mudanças nos seus projetos
                </p>
              </div>
              <Switch id="project-updates" defaultChecked />
            </div>

            <Separator className="bg-slate-800" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="team-invites" className="text-base">
                  Convites de Equipe
                </Label>
                <p className="text-sm text-slate-500">
                  Receba notificações de novos membros
                </p>
              </div>
              <Switch id="team-invites" defaultChecked />
            </div>

            <Separator className="bg-slate-800" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing" className="text-base">
                  Emails de Marketing
                </Label>
                <p className="text-sm text-slate-500">
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
              <Shield className="h-5 w-5 text-slate-400" />
              <CardTitle>Segurança</CardTitle>
            </div>
            <CardDescription>
              Mantenha sua conta segura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base">Senha</Label>
                <p className="text-sm text-slate-500 mb-3">
                  Última alteração há 3 meses
                </p>
                <Button variant="outline">Alterar Senha</Button>
              </div>

              <Separator className="bg-slate-800" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="2fa" className="text-base">
                    Autenticação de Dois Fatores
                  </Label>
                  <p className="text-sm text-slate-500">
                    Adicione uma camada extra de segurança
                  </p>
                </div>
                <Switch id="2fa" />
              </div>

              <Separator className="bg-slate-800" />

              <div>
                <Label className="text-base">Sessões Ativas</Label>
                <p className="text-sm text-slate-500 mb-3">
                  Gerencie onde você está logado
                </p>
                <Button variant="outline">Ver Sessões</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-slate-400" />
              <CardTitle>Plano e Cobrança</CardTitle>
            </div>
            <CardDescription>
              Gerencie sua assinatura e método de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-50">Plano Pro</h3>
                  <p className="text-sm text-slate-400">Próxima cobrança em 15/02/2024</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-50">R$ 49</p>
                  <p className="text-sm text-slate-400">/mês</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button variant="outline" className="w-full">
                Alterar Plano
              </Button>
              <Button variant="outline" className="w-full">
                Gerenciar Método de Pagamento
              </Button>
              <Button variant="outline" className="w-full text-red-400 hover:text-red-300">
                Cancelar Assinatura
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-slate-400" />
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
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400">Zona de Perigo</CardTitle>
            <CardDescription>
              Ações irreversíveis para sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-4">
              <div>
                <p className="font-medium text-slate-50">Excluir Conta</p>
                <p className="text-sm text-slate-500">
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
