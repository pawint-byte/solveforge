import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Lightbulb, Clock, DollarSign, Shield, ArrowRight, Zap, MessageSquare,
  ExternalLink, Sparkles, Users, ShoppingBag, TrendingUp, Mail, BookOpen,
  QrCode, Smartphone, Share2, HelpCircle, CreditCard, Bitcoin, Lock,
  RefreshCw, Layers, Coins, Heart, Home, Menu, X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { SocialShareButtons } from "@/components/social-share";
import { LanguageSwitcher } from "@/components/language-switcher";
import qrCodeImage from "@assets/qrcode.png";
import wintLogo from "@assets/N3A1k_1774885450173.jpg";
import founderPhoto from "@assets/4x25mxjh_1774888592999.png";

type Section = 'home' | 'portfolio' | 'about' | 'solveforge' | 'newsletter';

const NAV_ITEMS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'home',       label: 'Home',       icon: Home        },
  { id: 'portfolio',  label: 'Portfolio',  icon: Layers      },
  { id: 'about',      label: 'About',      icon: Users       },
  { id: 'solveforge', label: 'SolveForge', icon: Lightbulb   },
  { id: 'newsletter', label: 'Newsletter', icon: Mail        },
];

export default function Landing() {
  const { t } = useTranslation();
  const [active, setActive] = useState<Section>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">

      {/* ── Top Nav ── */}
      <nav className="shrink-0 z-50 backdrop-blur-md bg-background/90 border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mobile sidebar toggle */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors mr-1"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              data-testid="button-sidebar-toggle"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <img src={wintLogo} alt="Wint Enterprises, Inc." className="h-9 w-auto object-contain" />
            <span className="text-lg font-bold hidden sm:block">Wint Enterprises, Inc.</span>
            <span className="text-lg font-bold sm:hidden">Wint Ent.</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <a href="/api/login">
              <Button size="sm" data-testid="button-login">{t('nav.getStarted')}</Button>
            </a>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">

        {/* ── Mobile sidebar overlay ── */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar (desktop: always visible | mobile: slide-in drawer) ── */}
        <aside className={`
          z-50 flex flex-col shrink-0 w-56 border-r border-border bg-background overflow-y-auto
          transition-transform duration-200
          lg:relative lg:translate-x-0 lg:flex
          fixed top-[57px] bottom-0 left-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-3 pt-4 space-y-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setActive(id); setSidebarOpen(false); }}
                data-testid={`nav-${id}`}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
                  ${active === id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>

          {/* Sidebar footer */}
          <div className="mt-auto p-4 border-t border-border">
            <a
              href="mailto:pawint@me.com"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-email-sidebar"
            >
              <Mail className="w-3 h-3" />
              pawint@me.com
            </a>
            <p className="text-xs text-muted-foreground mt-2">
              &copy; {new Date().getFullYear()} Wint Enterprises, Inc.
            </p>
          </div>
        </aside>

        {/* ── Main content area ── */}
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">

          {/* ════ HOME ════ */}
          {active === 'home' && (
            <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-12">
              {/* Hero */}
              <div className="grid lg:grid-cols-2 gap-10 items-center pt-4">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                    <Shield className="w-4 h-4" />
                    Wint Enterprises, Inc.
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    Empowering <span className="text-primary">Independence.</span>{" "}
                    Securing <span className="text-primary">Legacies.</span>
                  </h1>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Enterprise-grade technology built for individuals — giving you real control over your financial future, personal legacy, and digital life.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a href="/api/login">
                      <Button size="lg" className="gap-2" data-testid="button-get-started">
                        {t('hero.submitProblem')} <ArrowRight className="w-5 h-5" />
                      </Button>
                    </a>
                    <Button size="lg" variant="outline" className="gap-2" onClick={() => setActive('portfolio')}>
                      View Portfolio <Layers className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>{t('hero.securePrivate')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span>{t('hero.flexiblePricing')}</span>
                    </div>
                  </div>
                </div>
                <div className="relative hidden lg:block">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-8 border border-primary/20">
                    <div className="space-y-4">
                      <div className="bg-card rounded-xl p-5 shadow-lg border border-card-border">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Lightbulb className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">E-commerce Integration</h3>
                            <p className="text-sm text-muted-foreground">Need help integrating payment systems...</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">Technology</span>
                              <span className="text-xs text-muted-foreground">$500–$2000</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-card rounded-xl p-5 shadow-lg border border-card-border opacity-75">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                            <MessageSquare className="w-5 h-5 text-amber-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">Marketing Strategy</h3>
                            <p className="text-sm text-muted-foreground">Looking for social media growth...</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-500">Business</span>
                              <span className="text-xs text-muted-foreground">$200–$800</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">{t('howItWorks.title')}</h2>
                  <p className="text-muted-foreground max-w-xl mx-auto">{t('howItWorks.subtitle')}</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { icon: Lightbulb, color: 'text-primary', bg: 'bg-primary/10', title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc') },
                    { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc') },
                    { icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10', title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc') },
                  ].map(({ icon: Icon, color, bg, title, desc }) => (
                    <Card key={title} className="hover-elevate">
                      <CardContent className="pt-6 pb-6 text-center">
                        <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-4`}>
                          <Icon className={`w-7 h-7 ${color}`} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{title}</h3>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ PORTFOLIO ════ */}
          {active === 'portfolio' && (
            <div className="p-6 lg:p-10 max-w-6xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Wint Enterprises Portfolio</h2>
                <p className="text-muted-foreground">A suite of user-first platforms built on enterprise-grade foundations</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    href: 'https://cryptoownbank.com', testId: 'cryptoownbank',
                    icon: Coins, color: 'text-amber-500', bg: 'bg-amber-500/10',
                    name: 'CryptoOwnBank',
                    desc: 'Get your money on the blockchain — earn 5–8% fixed yield on RLUSD, trade on native DEXs, pay anyone in seconds, and pass your crypto to heirs with a Legacy Plan. Your keys, your security level.',
                  },
                  {
                    href: 'https://familyroots.family', testId: 'familyroots',
                    icon: Heart, color: 'text-purple-500', bg: 'bg-purple-500/10',
                    name: 'FamilyRoots',
                    desc: 'Build private, members-only networks for your family, church, or team. Unlike social media, every connection is labeled with real meaning and kept completely private.',
                  },
                  {
                    href: 'https://paygatedating.com', testId: 'paygate',
                    icon: Shield, color: 'text-pink-500', bg: 'bg-pink-500/10',
                    name: 'Paygate Dating',
                    desc: 'A dating platform where gifts unlock connections — acting as your personal screening tool. Serious seekers only, with a 3D gift experience and every chapter bringing you closer to something real.',
                  },
                  {
                    href: '/api/login', testId: 'solveforge',
                    icon: Lightbulb, color: 'text-primary', bg: 'bg-primary/10',
                    name: 'SolveForge',
                    desc: 'A transparent crowdsourcing marketplace connecting real-world technical, business, and creative challenges with expert solutions and milestone-based payments.',
                  },
                  {
                    href: 'https://kinship-chronicle--pawint.replit.app', testId: 'kinship',
                    icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10',
                    name: 'Kinship Chronicle',
                    desc: 'Build private, invitation-only networks where every relationship is labeled and meaningful. Keep your circles secure and separate from public social media.',
                  },
                  {
                    href: 'https://glam-market--pawint.replit.app', testId: 'glammarket',
                    icon: ShoppingBag, color: 'text-pink-400', bg: 'bg-pink-400/10',
                    name: 'Glam Market',
                    desc: 'Shop premium skincare, makeup, and wellness products from vetted independent sellers with transparent 12% commission pricing and secure payments.',
                  },
                  {
                    href: 'https://dca-portfolio--pawint.replit.app', testId: 'dca',
                    icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10',
                    name: 'DCA Portfolio',
                    desc: 'Track and manage dollar-cost averaging investments with portfolio analytics and performance insights. Coming soon.',
                  },
                  {
                    href: 'https://story-weaver--pawint.replit.app', testId: 'storyweaver',
                    icon: BookOpen, color: 'text-orange-500', bg: 'bg-orange-500/10',
                    name: 'Story Weaver',
                    desc: 'An AI-powered interactive story adventure. Get 3 AI-generated story paths free daily — premium unlocks unlimited adventures.',
                  },
                  {
                    href: 'https://app-hub--pawint.replit.app', testId: 'apphub',
                    icon: Sparkles, color: 'text-indigo-500', bg: 'bg-indigo-500/10',
                    name: 'App Hub',
                    desc: 'Your central hub for all app features. AppHub Manager handles authentication, payments, AI bots, and chat — enterprise security, 99.9% uptime, API-first.',
                  },
                ].map(({ href, testId, icon: Icon, color, bg, name, desc }) => (
                  <a
                    key={testId}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="block"
                    data-testid={`link-portfolio-${testId}`}
                  >
                    <Card className="h-full hover-elevate cursor-pointer group">
                      <CardContent className="pt-5 pb-5">
                        <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <h3 className="text-base font-semibold mb-1.5 flex items-center gap-2">
                          {name}
                          <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ════ ABOUT ════ */}
          {active === 'about' && (
            <div className="p-6 lg:p-10 max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-10 items-start">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                    <Users className="w-4 h-4" />
                    About the Founder
                  </div>
                  <div className="flex items-center gap-4">
                    <img
                      src={founderPhoto}
                      alt="Peter Wint, Founder of Wint Enterprises"
                      className="w-20 h-20 rounded-2xl object-cover object-top border-2 border-primary/20 shadow-md shrink-0"
                      data-testid="img-founder"
                    />
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold">Peter Wint</h2>
                      <p className="text-sm text-muted-foreground mt-1">Founder &amp; CEO, Wint Enterprises, Inc.</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Peter Wint is the founder of Wint Enterprises and the creator of nine platforms spanning finance, family, relationships, beauty, and productivity — including CryptoOwnBank, FamilyRoots, Kinship Chronicle, Paygate Dating, SolveForge, Glam Market, DCA Portfolio, Story Weaver, and App Hub. With more than 25 years of enterprise IT and cybersecurity leadership — including senior roles at Lockheed Martin, IBM, Incyte Pharmaceuticals, AT&T, Raytheon, and Boeing — Peter has designed, deployed, and secured complex global infrastructures for government and Fortune 500 clients.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    He holds active CISSP and CompTIA Linux+ certifications, along with CCNA and Blockchain Essentials from Cornell University. His work is guided by a simple philosophy: technology should empower individuals, protect privacy, and give people real control over both their financial futures and personal legacies.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["CISSP", "CompTIA Linux+", "CCNA", "Cornell Blockchain Essentials", "25+ Years Enterprise IT"].map((cert) => (
                      <span key={cert} className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground font-medium border border-border">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Shield, label: "Cybersecurity", desc: "25+ years securing enterprise infrastructure", color: "text-blue-500", bg: "bg-blue-500/10" },
                    { icon: Layers, label: "Architecture", desc: "Global systems for Fortune 500 & government", color: "text-indigo-500", bg: "bg-indigo-500/10" },
                    { icon: Coins, label: "Crypto", desc: "Multi-chain portfolio & self-custody expert", color: "text-amber-500", bg: "bg-amber-500/10" },
                    { icon: Sparkles, label: "Innovation", desc: "Turning enterprise expertise into user-first tools", color: "text-green-500", bg: "bg-green-500/10" },
                  ].map(({ icon: Icon, label, desc, color, bg }) => (
                    <Card key={label} className="hover-elevate">
                      <CardContent className="pt-5 pb-5">
                        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <h4 className="font-semibold mb-1 text-sm">{label}</h4>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ SOLVEFORGE ════ */}
          {active === 'solveforge' && (
            <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-10">
              {/* CTA */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Lightbulb className="w-4 h-4" />
                  SolveForge — Problem Solving Platform
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">{t('cta.title')}</h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">{t('cta.subtitle')}</p>
                <a href="/api/login">
                  <Button size="lg" className="gap-2" data-testid="button-cta-submit">
                    {t('hero.submitProblem')} <ArrowRight className="w-5 h-5" />
                  </Button>
                </a>
              </div>

              {/* Payment FAQ */}
              <div>
                <div className="text-center mb-6">
                  <Badge variant="secondary" className="mb-3">
                    <CreditCard className="w-3 h-3 mr-1" />
                    {t('paymentFaq.badge')}
                  </Badge>
                  <h3 className="text-xl font-bold mb-2">{t('paymentFaq.title')}</h3>
                  <p className="text-muted-foreground text-sm max-w-xl mx-auto">{t('paymentFaq.subtitle')}</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: CreditCard, color: 'text-primary', bg: 'bg-primary/10', title: t('paymentFaq.paymentMethodsTitle'), desc: t('paymentFaq.paymentMethodsDesc'), testId: 'card-faq-payment-methods' },
                    { icon: Bitcoin, color: 'text-amber-500', bg: 'bg-amber-500/10', title: t('paymentFaq.cryptoTitle'), desc: t('paymentFaq.cryptoDesc'), testId: 'card-faq-crypto' },
                    { icon: Layers, color: 'text-blue-500', bg: 'bg-blue-500/10', title: t('paymentFaq.milestonesTitle'), desc: t('paymentFaq.milestonesDesc'), testId: 'card-faq-milestones' },
                    { icon: Lock, color: 'text-green-500', bg: 'bg-green-500/10', title: t('paymentFaq.securityTitle'), desc: t('paymentFaq.securityDesc'), testId: 'card-faq-security' },
                    { icon: RefreshCw, color: 'text-purple-500', bg: 'bg-purple-500/10', title: t('paymentFaq.refundsTitle'), desc: t('paymentFaq.refundsDesc'), testId: 'card-faq-refunds' },
                  ].map(({ icon: Icon, color, bg, title, desc, testId }) => (
                    <Card key={testId} data-testid={testId}>
                      <CardContent className="pt-5">
                        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <h4 className="font-semibold mb-1 text-sm">{title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* QR Code */}
              <div className="grid md:grid-cols-2 gap-8 items-start bg-muted/30 rounded-2xl p-6">
                <div className="flex flex-col items-center">
                  <div className="bg-card rounded-2xl p-6 shadow-lg border border-card-border">
                    <img src={qrCodeImage} alt="Scan to visit SolveForge" className="w-48 h-48" data-testid="img-qr-code" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground text-center">{t('qrCode.caption')}</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-primary" />
                    {t('qrCode.title')}
                  </h3>
                  {[
                    { icon: Smartphone, title: t('qrCode.openCameraTitle'), desc: t('qrCode.openCameraDesc') },
                    { icon: Share2, title: t('qrCode.shareTitle'), desc: t('qrCode.shareDesc') },
                    { icon: Zap, title: t('qrCode.instantTitle'), desc: t('qrCode.instantDesc') },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{title}</h4>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ NEWSLETTER ════ */}
          {active === 'newsletter' && (
            <div className="p-6 lg:p-10 max-w-3xl mx-auto space-y-10">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">{t('newsletter.title')}</h2>
                <p className="text-muted-foreground mb-6">{t('newsletter.subtitle')}</p>
                <NewsletterSignup />
              </div>
              <div className="text-center border-t border-border pt-8">
                <p className="text-sm text-muted-foreground mb-4">{t('cta.shareWith')}</p>
                <div className="flex justify-center">
                  <SocialShareButtons
                    title="Wint Enterprises - Empowering Independence. Securing Legacies."
                    type="app"
                  />
                </div>
              </div>
              <div className="text-center border-t border-border pt-8">
                <img src={wintLogo} alt="Wint Enterprises, Inc." className="h-10 w-auto object-contain mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Wint Enterprises, Inc. {t('footer.copyright')}</p>
                <a
                  href="mailto:pawint@me.com"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
                  data-testid="link-email-contact"
                >
                  <Mail className="w-4 h-4" />
                  pawint@me.com
                </a>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="flex items-stretch">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              data-testid={`mobile-nav-${id}`}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors
                ${active === id ? 'text-primary' : 'text-muted-foreground'}
              `}
            >
              <Icon className={`w-5 h-5 ${active === id ? 'text-primary' : ''}`} />
              {label}
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
}
