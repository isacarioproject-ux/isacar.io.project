import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Globe } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { LegalFooter } from '@/components/legal-footer'
import { useI18n } from '@/hooks/use-i18n'

export default function PrivacyPolicyPage() {
  const { t, locale, changeLocale } = useI18n()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/auth" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('auth.backToLogin')}
            </Link>
            
            <Link to="/auth" className="text-xl font-serif font-bold text-foreground">
              Isacar.dev
            </Link>
            
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <button
                type="button"
                onClick={() => {
                  const nextLocale = locale === 'pt-BR' ? 'en' : locale === 'en' ? 'es' : 'pt-BR'
                  changeLocale(nextLocale)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                title="Change language"
              >
                <Globe className="h-3.5 w-3.5" />
                <span className="uppercase font-medium">
                  {locale === 'pt-BR' ? 'PT' : locale === 'en' ? 'EN' : 'ES'}
                </span>
              </button>
              
              <ThemeToggle />
            </div>
          </div>
        </div>
        
        {/* Sub-navigation */}
        <div className="border-t border-border">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-6 py-2 text-sm">
              <Link 
                to="/privacy-policy" 
                className="text-primary font-medium border-b-2 border-primary py-1"
              >
                {t('auth.privacyPolicy')}
              </Link>
              <Link 
                to="/terms-of-service" 
                className="text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                {t('auth.termsOfService')}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            {locale === 'pt-BR' ? 'Política de Privacidade' : locale === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'pt-BR' ? 'Última Atualização: 2 de Novembro de 2025' : locale === 'es' ? 'Última Actualización: 2 de Noviembre de 2025' : 'Last Updated: November 2, 2025'}
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {locale === 'pt-BR' ? 'Índice' : locale === 'es' ? 'Índice' : 'Table of Contents'}
          </h2>
          <nav className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <a href="#introduction" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">1. {locale === 'pt-BR' ? 'Introdução' : locale === 'es' ? 'Introducción' : 'Introduction'}</a>
            <a href="#information-we-collect" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">2. {locale === 'pt-BR' ? 'Informações que Coletamos' : locale === 'es' ? 'Información que Recopilamos' : 'Information We Collect'}</a>
            <a href="#how-we-use" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">3. {locale === 'pt-BR' ? 'Como Usamos suas Informações' : locale === 'es' ? 'Cómo Usamos su Información' : 'How We Use Your Information'}</a>
            <a href="#data-sharing" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">4. {locale === 'pt-BR' ? 'Compartilhamento de Dados' : locale === 'es' ? 'Compartir Datos' : 'Data Sharing'}</a>
            <a href="#data-security" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">5. {locale === 'pt-BR' ? 'Segurança dos Dados' : locale === 'es' ? 'Seguridad de Datos' : 'Data Security'}</a>
            <a href="#your-rights" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">6. {locale === 'pt-BR' ? 'Seus Direitos (LGPD/GDPR)' : locale === 'es' ? 'Sus Derechos (LGPD/GDPR)' : 'Your Rights (LGPD/GDPR)'}</a>
            <a href="#cookies" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">7. {locale === 'pt-BR' ? 'Cookies' : locale === 'es' ? 'Cookies' : 'Cookies'}</a>
            <a href="#data-retention" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">8. {locale === 'pt-BR' ? 'Retenção de Dados' : locale === 'es' ? 'Retención de Datos' : 'Data Retention'}</a>
            <a href="#international-transfers" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">9. {locale === 'pt-BR' ? 'Transferências Internacionais' : locale === 'es' ? 'Transferencias Internacionales' : 'International Transfers'}</a>
            <a href="#children" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">10. {locale === 'pt-BR' ? 'Privacidade de Menores' : locale === 'es' ? 'Privacidad de Menores' : 'Children\'s Privacy'}</a>
            <a href="#updates" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">11. {locale === 'pt-BR' ? 'Atualizações' : locale === 'es' ? 'Actualizaciones' : 'Updates'}</a>
            <a href="#contact" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">12. {locale === 'pt-BR' ? 'Contato' : locale === 'es' ? 'Contacto' : 'Contact'}</a>
          </nav>
        </div>

        {/* Content Sections */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {/* Introduction */}
          <section id="introduction" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              1. {locale === 'pt-BR' ? 'Introdução' : locale === 'es' ? 'Introducción' : 'Introduction'}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {locale === 'pt-BR' 
                ? 'Bem-vindo à ISACAR ("nós", "nosso" ou "nos"). Estamos comprometidos em proteger suas informações pessoais e seu direito à privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você usa nossa plataforma e serviços.'
                : locale === 'es'
                ? 'Bienvenido a ISACAR ("nosotros", "nuestro" o "nos"). Estamos comprometidos a proteger su información personal y su derecho a la privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando utiliza nuestra plataforma y servicios.'
                : 'Welcome to ISACAR ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.'
              }
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {locale === 'pt-BR'
                ? 'Ao usar a ISACAR, você concorda com a coleta e uso de informações de acordo com esta política. Se você não concorda com nossas políticas e práticas, por favor não use nossos serviços.'
                : locale === 'es'
                ? 'Al usar ISACAR, acepta la recopilación y el uso de información de acuerdo con esta política. Si no está de acuerdo con nuestras políticas y prácticas, no utilice nuestros servicios.'
                : 'By using ISACAR, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.'
              }
            </p>
          </section>

          {/* Information We Collect */}
          <section id="information-we-collect" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. {locale === 'pt-BR' ? 'Informações que Coletamos' : locale === 'es' ? 'Información que Recopilamos' : 'Information We Collect'}
            </h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              2.1 {locale === 'pt-BR' ? 'Informações que Você Fornece' : locale === 'es' ? 'Información que Usted Proporciona' : 'Information You Provide'}
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              {locale === 'pt-BR'
                ? 'Coletamos informações que você fornece voluntariamente ao usar nossos serviços:'
                : locale === 'es'
                ? 'Recopilamos información que usted proporciona voluntariamente al usar nuestros servicios:'
                : 'We collect information that you voluntarily provide when using our services:'
              }
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong>{locale === 'pt-BR' ? 'Informações de Conta' : locale === 'es' ? 'Información de Cuenta' : 'Account Information'}:</strong> {locale === 'pt-BR' ? 'Nome, email, telefone (opcional), senha' : locale === 'es' ? 'Nombre, correo electrónico, teléfono (opcional), contraseña' : 'Name, email address, phone number (optional), password'}</li>
              <li><strong>{locale === 'pt-BR' ? 'Informações de Perfil' : locale === 'es' ? 'Información de Perfil' : 'Profile Information'}:</strong> {locale === 'pt-BR' ? 'Foto de perfil, cargo, informações da empresa' : locale === 'es' ? 'Foto de perfil, cargo, información de la empresa' : 'Profile picture, job title, company information'}</li>
              <li><strong>{locale === 'pt-BR' ? 'Conteúdo' : locale === 'es' ? 'Contenido' : 'Content'}:</strong> {locale === 'pt-BR' ? 'Projetos, documentos, comentários, arquivos que você cria ou envia' : locale === 'es' ? 'Proyectos, documentos, comentarios, archivos que crea o envía' : 'Projects, documents, comments, files you create or upload'}</li>
              <li><strong>{locale === 'pt-BR' ? 'Informações de Pagamento' : locale === 'es' ? 'Información de Pago' : 'Payment Information'}:</strong> {locale === 'pt-BR' ? 'Detalhes de cobrança, processados com segurança por processadores de pagamento terceirizados' : locale === 'es' ? 'Detalles de facturación, procesados de forma segura por procesadores de pago de terceros' : 'Billing details, processed securely through third-party payment processors'}</li>
              <li><strong>{locale === 'pt-BR' ? 'Comunicações' : locale === 'es' ? 'Comunicaciones' : 'Communications'}:</strong> {locale === 'pt-BR' ? 'Mensagens, solicitações de suporte, feedback que você nos envia' : locale === 'es' ? 'Mensajes, solicitudes de soporte, comentarios que nos envía' : 'Messages, support requests, feedback you send to us'}</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              2.2 {locale === 'pt-BR' ? 'Informações Coletadas Automaticamente' : locale === 'es' ? 'Información Recopilada Automáticamente' : 'Information Collected Automatically'}
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              {locale === 'pt-BR'
                ? 'Quando você acessa nossa plataforma, coletamos automaticamente certas informações:'
                : locale === 'es'
                ? 'Cuando accede a nuestra plataforma, recopilamos automáticamente cierta información:'
                : 'When you access our platform, we automatically collect certain information:'
              }
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong>{locale === 'pt-BR' ? 'Dados de Uso' : locale === 'es' ? 'Datos de Uso' : 'Usage Data'}:</strong> {locale === 'pt-BR' ? 'Páginas visualizadas, recursos usados, tempo gasto, ações realizadas' : locale === 'es' ? 'Páginas vistas, funciones utilizadas, tiempo empleado, acciones realizadas' : 'Pages viewed, features used, time spent, actions taken'}</li>
              <li><strong>{locale === 'pt-BR' ? 'Informações do Dispositivo' : locale === 'es' ? 'Información del Dispositivo' : 'Device Information'}:</strong> {locale === 'pt-BR' ? 'Endereço IP, tipo de navegador, sistema operacional, identificadores do dispositivo' : locale === 'es' ? 'Dirección IP, tipo de navegador, sistema operativo, identificadores del dispositivo' : 'IP address, browser type, operating system, device identifiers'}</li>
              <li><strong>{locale === 'pt-BR' ? 'Dados de Localização' : locale === 'es' ? 'Datos de Ubicación' : 'Location Data'}:</strong> {locale === 'pt-BR' ? 'Localização aproximada baseada no endereço IP' : locale === 'es' ? 'Ubicación aproximada basada en la dirección IP' : 'Approximate location based on IP address'}</li>
              <li><strong>Cookies:</strong> {locale === 'pt-BR' ? 'Veja a Seção 7 para detalhes' : locale === 'es' ? 'Consulte la Sección 7 para más detalles' : 'See Section 7 for details'}</li>
            </ul>
          </section>

          {/* Contact */}
          <section id="contact" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              12. {locale === 'pt-BR' ? 'Contato' : locale === 'es' ? 'Contacto' : 'Contact Us'}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {locale === 'pt-BR'
                ? 'Se você tiver dúvidas, preocupações ou solicitações sobre esta Política de Privacidade ou nossas práticas de dados, entre em contato conosco:'
                : locale === 'es'
                ? 'Si tiene preguntas, inquietudes o solicitudes sobre esta Política de Privacidad o nuestras prácticas de datos, contáctenos:'
                : 'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:'
              }
            </p>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-foreground font-semibold mb-2">ISACAR Technologies</p>
              <p className="text-muted-foreground mb-1">Email: <a href="mailto:isacar.dev@gmail.com" className="text-primary hover:underline">isacar.dev@gmail.com</a></p>
              <p className="text-muted-foreground mb-1">{locale === 'pt-BR' ? 'Suporte' : locale === 'es' ? 'Soporte' : 'Support'}: <a href="mailto:isacar.dev@gmail.com" className="text-primary hover:underline">isacar.dev@gmail.com</a></p>
              <p className="text-muted-foreground">Website: <a href="https://isacar.dev" className="text-primary hover:underline">https://isacar.dev</a></p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer from Landing Page */}
      <LegalFooter />
    </div>
  )
}
