import { Link } from 'react-router-dom'
import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
} from 'lucide-react'

export function LegalFooter() {
  const year = new Date().getFullYear()

  const company = [
    {
      title: 'Sobre',
      href: '/empresa',
    },
    {
      title: 'Clientes',
      href: '/clientes',
    },
    {
      title: 'Carreiras',
      href: '/empresa',
    },
    {
      title: 'Política de Privacidade',
      href: '/privacy-policy',
    },
    {
      title: 'Termos de Serviço',
      href: '/terms-of-service',
    },
  ]

  const resources = [
    {
      title: 'Blog',
      href: '/recursos',
    },
    {
      title: 'Documentação',
      href: '/recursos',
    },
    {
      title: 'Suporte',
      href: '/recursos',
    },
    {
      title: 'Comunidade',
      href: '/recursos',
    },
    {
      title: 'Status',
      href: '/recursos',
    },
  ]

  const socialLinks = [
    {
      icon: <TwitterIcon className="size-4" />,
      link: 'https://twitter.com/isacar',
    },
    {
      icon: <GithubIcon className="size-4" />,
      link: 'https://github.com/isacarioproject-ux',
    },
    {
      icon: <LinkedinIcon className="size-4" />,
      link: 'https://linkedin.com/company/isacar',
    },
    {
      icon: <YoutubeIcon className="size-4" />,
      link: 'https://youtube.com/@isacar',
    },
    {
      icon: <FacebookIcon className="size-4" />,
      link: 'https://facebook.com/isacar',
    },
    {
      icon: <InstagramIcon className="size-4" />,
      link: 'https://instagram.com/isacar',
    },
  ]

  return (
    <footer className="relative mt-16">
      <div className="bg-[radial-gradient(35%_80%_at_30%_0%,hsl(var(--foreground)/.1),transparent)] mx-auto max-w-4xl md:border-x border-border">
        <div className="bg-border absolute inset-x-0 h-px w-full" />
        <div className="grid max-w-4xl grid-cols-6 gap-6 p-4">
          <div className="col-span-6 flex flex-col gap-5 md:col-span-4">
            <Link to="/auth" className="w-max">
              <span className="text-2xl font-serif font-bold tracking-tight text-foreground">
                Isacar.dev
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm font-mono text-sm text-balance">
              Onde a colaboração da sua equipe é co-criada em tempo real.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((item, i) => (
                <a
                  key={i}
                  className="hover:bg-accent rounded-md border border-border p-1.5 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={item.link}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="col-span-3 w-full md:col-span-1">
            <span className="text-muted-foreground mb-1 text-xs">
              Recursos
            </span>
            <div className="flex flex-col gap-1">
              {resources.map(({ href, title }, i) => (
                <a
                  key={i}
                  className="w-max py-1 text-sm duration-200 hover:underline text-foreground"
                  href={href}
                >
                  {title}
                </a>
              ))}
            </div>
          </div>
          <div className="col-span-3 w-full md:col-span-1">
            <span className="text-muted-foreground mb-1 text-xs">Empresa</span>
            <div className="flex flex-col gap-1">
              {company.map(({ href, title }, i) => (
                <Link
                  key={i}
                  className="w-max py-1 text-sm duration-200 hover:underline text-foreground"
                  to={href}
                >
                  {title}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-border absolute inset-x-0 h-px w-full" />
        <div className="flex max-w-4xl flex-col justify-between gap-2 pt-2 pb-5">
          <p className="text-muted-foreground text-center font-thin text-sm">
            © {year} Isacar.dev. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
