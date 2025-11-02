import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, Globe } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { LegalFooter } from '@/components/legal-footer'
import { useI18n } from '@/hooks/use-i18n'

export default function TermsOfServicePage() {
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
                className="text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                {t('auth.privacyPolicy')}
              </Link>
              <Link 
                to="/terms-of-service" 
                className="text-primary font-medium border-b-2 border-primary py-1"
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
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            {locale === 'pt-BR' ? 'Termos de Serviço' : locale === 'es' ? 'Términos de Servicio' : 'Terms of Service'}
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
            <a href="#acceptance" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">1. {locale === 'pt-BR' ? 'Aceitação dos Termos' : locale === 'es' ? 'Aceptación de los Términos' : 'Acceptance of Terms'}</a>
            <a href="#description" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">2. {locale === 'pt-BR' ? 'Descrição do Serviço' : locale === 'es' ? 'Descripción del Servicio' : 'Description of Service'}</a>
            <a href="#account" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">3. {locale === 'pt-BR' ? 'Registro e Segurança da Conta' : locale === 'es' ? 'Registro y Seguridad de Cuenta' : 'Account Registration'}</a>
            <a href="#acceptable-use" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">4. {locale === 'pt-BR' ? 'Política de Uso Aceitável' : locale === 'es' ? 'Política de Uso Aceptable' : 'Acceptable Use Policy'}</a>
            <a href="#intellectual-property" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">5. {locale === 'pt-BR' ? 'Propriedade Intelectual' : locale === 'es' ? 'Propiedad Intelectual' : 'Intellectual Property'}</a>
            <a href="#user-content" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">6. {locale === 'pt-BR' ? 'Conteúdo do Usuário' : locale === 'es' ? 'Contenido del Usuario' : 'User Content'}</a>
            <a href="#plans-payments" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">7. {locale === 'pt-BR' ? 'Planos e Pagamentos' : locale === 'es' ? 'Planes y Pagos' : 'Plans and Payments'}</a>
            <a href="#limitation-liability" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">8. {locale === 'pt-BR' ? 'Limitação de Responsabilidade' : locale === 'es' ? 'Limitación de Responsabilidad' : 'Limitation of Liability'}</a>
            <a href="#warranties" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">9. {locale === 'pt-BR' ? 'Garantias e Isenções' : locale === 'es' ? 'Garantías y Exenciones' : 'Warranties'}</a>
            <a href="#modifications" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">10. {locale === 'pt-BR' ? 'Modificações dos Termos' : locale === 'es' ? 'Modificaciones de Términos' : 'Modifications'}</a>
            <a href="#termination" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">11. {locale === 'pt-BR' ? 'Rescisão' : locale === 'es' ? 'Rescisión' : 'Termination'}</a>
            <a href="#disputes" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">12. {locale === 'pt-BR' ? 'Disputas e Lei Aplicável' : locale === 'es' ? 'Disputas y Ley Aplicable' : 'Disputes'}</a>
            <a href="#general" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">13. {locale === 'pt-BR' ? 'Disposições Gerais' : locale === 'es' ? 'Disposiciones Generales' : 'General Provisions'}</a>
            <a href="#contact" className="text-sm text-primary hover:underline hover:translate-x-1 transition-all">14. {locale === 'pt-BR' ? 'Contato' : locale === 'es' ? 'Contacto' : 'Contact'}</a>
          </nav>
        </div>

        {/* Content Sections */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {/* Acceptance */}
          <section id="acceptance" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              1. {locale === 'pt-BR' ? 'Aceitação dos Termos' : locale === 'es' ? 'Aceptación de los Términos' : 'Acceptance of Terms'}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {locale === 'pt-BR'
                ? 'Bem-vindo à ISACAR. Estes Termos de Serviço ("Termos") regem seu acesso e uso da plataforma ISACAR, website e serviços (coletivamente, o "Serviço"). Ao acessar ou usar o Serviço, você concorda em estar vinculado a estes Termos.'
                : locale === 'es'
                ? 'Bienvenido a ISACAR. Estos Términos de Servicio ("Términos") rigen su acceso y uso de la plataforma ISACAR, sitio web y servicios (colectivamente, el "Servicio"). Al acceder o usar el Servicio, acepta estar sujeto a estos Términos.'
                : 'Welcome to ISACAR. These Terms of Service ("Terms") govern your access to and use of the ISACAR platform, website, and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.'
              }
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {locale === 'pt-BR'
                ? 'Se você está usando o Serviço em nome de uma organização, você declara e garante que tem autoridade para vincular essa organização a estes Termos, e seu acordo com estes Termos será tratado como o acordo da organização.'
                : locale === 'es'
                ? 'Si está utilizando el Servicio en nombre de una organización, declara y garantiza que tiene autoridad para vincular a esa organización a estos Términos, y su acuerdo con estos Términos se tratará como el acuerdo de la organización.'
                : 'If you are using the Service on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms, and your agreement to these Terms will be treated as the agreement of the organization.'
              }
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {locale === 'pt-BR'
                ? 'Se você não concorda com estes Termos, não deve acessar ou usar o Serviço.'
                : locale === 'es'
                ? 'Si no está de acuerdo con estos Términos, no debe acceder ni usar el Servicio.'
                : 'If you do not agree to these Terms, you must not access or use the Service.'
              }
            </p>
          </section>

          {/* Description */}
          <section id="description" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. {locale === 'pt-BR' ? 'Descrição do Serviço' : locale === 'es' ? 'Descripción del Servicio' : 'Description of Service'}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              {locale === 'pt-BR'
                ? 'A ISACAR fornece uma plataforma baseada em nuvem para gerenciamento de projetos, colaboração em equipe e produtividade. Nosso Serviço inclui, mas não se limita a:'
                : locale === 'es'
                ? 'ISACAR proporciona una plataforma basada en la nube para gestión de proyectos, colaboración en equipo y productividad. Nuestro Servicio incluye, pero no se limita a:'
                : 'ISACAR provides a cloud-based platform for project management, team collaboration, and productivity. Our Service includes, but is not limited to:'
              }
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>{locale === 'pt-BR' ? 'Ferramentas de gerenciamento de projetos e tarefas' : locale === 'es' ? 'Herramientas de gestión de proyectos y tareas' : 'Project and task management tools'}</li>
              <li>{locale === 'pt-BR' ? 'Edição e compartilhamento colaborativo de documentos' : locale === 'es' ? 'Edición y compartición colaborativa de documentos' : 'Collaborative document editing and sharing'}</li>
              <li>{locale === 'pt-BR' ? 'Recursos de whiteboard e brainstorming em tempo real' : locale === 'es' ? 'Funciones de pizarra y lluvia de ideas en tiempo real' : 'Real-time whiteboard and brainstorming features'}</li>
              <li>{locale === 'pt-BR' ? 'Ferramentas de comunicação e colaboração em equipe' : locale === 'es' ? 'Herramientas de comunicación y colaboración en equipo' : 'Team communication and collaboration tools'}</li>
              <li>{locale === 'pt-BR' ? 'Capacidades de analytics e relatórios' : locale === 'es' ? 'Capacidades de análisis e informes' : 'Analytics and reporting capabilities'}</li>
              <li>{locale === 'pt-BR' ? 'Armazenamento e gerenciamento de arquivos' : locale === 'es' ? 'Almacenamiento y gestión de archivos' : 'File storage and management'}</li>
              <li>{locale === 'pt-BR' ? 'Integração com serviços de terceiros' : locale === 'es' ? 'Integración con servicios de terceros' : 'Integration with third-party services'}</li>
            </ul>
          </section>

          {/* Contact */}
          <section id="contact" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              14. {locale === 'pt-BR' ? 'Informações de Contato' : locale === 'es' ? 'Información de Contacto' : 'Contact Information'}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {locale === 'pt-BR'
                ? 'Se você tiver dúvidas, preocupações ou solicitações sobre estes Termos, entre em contato conosco:'
                : locale === 'es'
                ? 'Si tiene preguntas, inquietudes o solicitudes sobre estos Términos, contáctenos:'
                : 'If you have any questions, concerns, or requests regarding these Terms, please contact us:'
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
