import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Clock, DollarSign, Shield, ArrowRight, Zap, MessageSquare, ExternalLink, Sparkles, Users, ShoppingBag, TrendingUp, Mail, BookOpen, QrCode, Smartphone, Share2, HelpCircle, CreditCard, Bitcoin, Lock, RefreshCw, Layers, Coins, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { SocialShareButtons } from "@/components/social-share";
import { LanguageSwitcher } from "@/components/language-switcher";
import qrCodeImage from "@assets/qrcode.png";
import wintLogo from "@assets/N3A1k_1774885450173.jpg";
import founderPhoto from "@assets/4x25mxjh_1774888592999.png";

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={wintLogo} alt="Wint Enterprises, Inc." className="h-10 w-auto object-contain" />
            <span className="text-xl font-bold">Wint Enterprises, Inc.</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <a href="/api/login">
              <Button data-testid="button-login">{t('nav.getStarted')}</Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4" />
                Wint Enterprises, Inc.
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Empowering <span className="text-primary">Independence.</span>{" "}
                Securing <span className="text-primary">Legacies.</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Enterprise-grade technology built for individuals — giving you real control over your financial future, personal legacy, and digital life.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="/api/login">
                  <Button size="lg" className="gap-2" data-testid="button-get-started">
                    {t('hero.submitProblem')} <ArrowRight className="w-5 h-5" />
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-6 pt-4">
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
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-8 border border-primary/20">
                <div className="space-y-4">
                  <div className="bg-card rounded-xl p-6 shadow-lg border border-card-border">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Lightbulb className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">E-commerce Integration</h3>
                        <p className="text-sm text-muted-foreground">Need help integrating payment systems...</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{t('submit.categories.tech')}</span>
                          <span className="text-xs text-muted-foreground">$500-$2000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card rounded-xl p-6 shadow-lg border border-card-border opacity-75">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Marketing Strategy</h3>
                        <p className="text-sm text-muted-foreground">Looking for social media growth...</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-500">{t('submit.categories.business')}</span>
                          <span className="text-xs text-muted-foreground">$200-$800</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('howItWorks.title')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover-elevate">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Lightbulb className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('howItWorks.step1Title')}</h3>
                <p className="text-muted-foreground">
                  {t('howItWorks.step1Desc')}
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('howItWorks.step2Title')}</h3>
                <p className="text-muted-foreground">
                  {t('howItWorks.step2Desc')}
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('howItWorks.step3Title')}</h3>
                <p className="text-muted-foreground">
                  {t('howItWorks.step3Desc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Founder Bio Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Users className="w-4 h-4" />
                About the Founder
              </div>
              <div className="flex items-center gap-5">
                <img
                  src={founderPhoto}
                  alt="Peter Wint, Founder of Wint Enterprises"
                  className="w-24 h-24 rounded-2xl object-cover object-top border-2 border-primary/20 shadow-md flex-shrink-0"
                  data-testid="img-founder"
                />
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold">Peter Wint</h2>
                  <p className="text-sm text-muted-foreground mt-1">Founder &amp; CEO, Wint Enterprises, Inc.</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Peter Wint is the founder of Wint Enterprises and the creator of nine platforms spanning finance, family, relationships, beauty, and productivity — including CryptoOwnBank, FamilyRoots, Kinship Chronicle, Paygate Dating, SolveForge, Glam Market, DCA Portfolio, Story Weaver, and App Hub. With more than 25 years of enterprise IT and cybersecurity leadership — including senior roles at Lockheed Martin, IBM, Incyte Pharmaceuticals, AT&T, Raytheon, and Boeing — Peter has designed, deployed, and secured complex global infrastructures for government and Fortune 500 clients.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                He holds active CISSP and CompTIA Linux+ certifications, along with CCNA and Blockchain Essentials from Cornell University. His work is guided by a simple philosophy: technology should empower individuals, protect privacy, and give people real control over both their financial futures and personal legacies.
              </p>
              <div className="flex flex-wrap gap-3">
                {["CISSP", "CompTIA Linux+", "CCNA", "25+ Years Enterprise IT"].map((cert) => (
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
                  <CardContent className="pt-6 pb-6">
                    <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <h4 className="font-semibold mb-1">{label}</h4>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Wint Enterprises Portfolio</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A suite of user-first platforms built on enterprise-grade foundations
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a 
              href="https://cryptoownbank.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
              data-testid="link-portfolio-cryptoownbank"
            >
              <Card className="h-full hover-elevate cursor-pointer group">
                <CardContent className="pt-6 pb-6">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                    <Coins className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    CryptoOwnBank
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get your money on the blockchain — earn 5–8% fixed yield on RLUSD, trade on native DEXs, pay anyone in seconds, and pass your crypto to heirs with a Legacy Plan. Your keys, your security level.
                  </p>
                </CardContent>
              </Card>
            </a>
            <a 
              href="https://familyroots.family" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
              data-testid="link-portfolio-familyroots"
            >
              <Card className="h-full hover-elevate cursor-pointer group">
                <CardContent className="pt-6 pb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    FamilyRoots
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A private, invitation-only family and group networking platform with interactive trees, AI-powered genealogy assistance, and collaboration tools.
                  </p>
                </CardContent>
              </Card>
            </a>
            <a 
              href="https://paygatedating.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
              data-testid="link-portfolio-paygate"
            >
              <Card className="h-full hover-elevate cursor-pointer group">
                <CardContent className="pt-6 pb-6">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-pink-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    Paygate Dating
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A dating platform with built-in payment verification to create a safer, more serious community of genuine connections.
                  </p>
                </CardContent>
              </Card>
            </a>
            <a 
              href="/api/login"
              className="block"
              data-testid="link-portfolio-solveforge"
            >
              <Card className="h-full hover-elevate cursor-pointer group">
                <CardContent className="pt-6 pb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Lightbulb className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    SolveForge
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A transparent crowdsourcing marketplace connecting real-world technical, business, and creative challenges with expert proposals and milestone-based payments.
                  </p>
                </CardContent>
              </Card>
            </a>
            <a 
              href="https://kinship-chronicle--pawint.replit.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
              data-testid="link-portfolio-kinship"
            >
              <Card className="h-full hover-elevate cursor-pointer group">
                <CardContent className="pt-6 pb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    Kinship Chronicle
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A family tree and genealogy app to document and preserve your family history across generations.
                  </p>
                </CardContent>
              </Card>
            </a>
            <a 
              href="https://glam-market--pawint.replit.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
              data-testid="link-portfolio-glammarket"
            >
              <Card className="h-full hover-elevate cursor-pointer group">
                <CardContent className="pt-6 pb-6">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-6 h-6 text-pink-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    Glam Market
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A stylish e-commerce marketplace for beauty and fashion products with a modern shopping experience.
                  </p>
                </CardContent>
              </Card>
            </a>
            <a 
              href="https://dca-portfolio--pawint.replit.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
              data-testid="link-portfolio-dca"
            >
              <Card className="h-full hover-elevate cursor-pointer group">
                <CardContent className="pt-6 pb-6">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    DCA Portfolio
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Track and manage dollar-cost averaging investments with portfolio analytics and performance insights.
                  </p>
                </CardContent>
              </Card>
            </a>
            <a 
              href="https://story-weaver--pawint.replit.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
              data-testid="link-portfolio-storyweaver"
            >
              <Card className="h-full hover-elevate cursor-pointer group">
                <CardContent className="pt-6 pb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    Story Weaver
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    An interactive storytelling platform for creating and sharing engaging narratives and stories.
                  </p>
                </CardContent>
              </Card>
            </a>
            <a 
              href="https://app-hub--pawint.replit.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
              data-testid="link-portfolio-apphub"
            >
              <Card className="h-full hover-elevate cursor-pointer group">
                <CardContent className="pt-6 pb-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    App Hub
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A centralized hub for discovering and accessing multiple applications from a single dashboard.
                  </p>
                </CardContent>
              </Card>
            </a>
          </div>
        </div>
      </section>

      {/* QR Code Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <QrCode className="w-4 h-4" />
              {t('qrCode.badge')}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-qr-title">
              {t('qrCode.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('qrCode.subtitle')}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* QR Code */}
            <div className="flex flex-col items-center">
              <div className="bg-card rounded-2xl p-8 shadow-lg border border-card-border">
                <img 
                  src={qrCodeImage} 
                  alt="Scan to visit SolveForge" 
                  className="w-64 h-64"
                  data-testid="img-qr-code"
                />
              </div>
              <p className="mt-4 text-sm text-muted-foreground text-center">
                {t('qrCode.caption')}
              </p>
            </div>
            
            {/* FAQ */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold flex flex-wrap items-center gap-2" data-testid="text-qr-faq-title">
                <HelpCircle className="w-5 h-5 text-primary" />
                {t('qrCode.faqTitle')}
              </h3>
              
              <div className="space-y-4">
                <Card data-testid="card-qr-faq-camera">
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Smartphone className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium mb-1" data-testid="text-faq-open-camera">{t('qrCode.openCameraTitle')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t('qrCode.openCameraDesc')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card data-testid="card-qr-faq-share">
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Share2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium mb-1" data-testid="text-faq-share">{t('qrCode.shareTitle')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t('qrCode.shareDesc')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card data-testid="card-qr-faq-instant">
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium mb-1" data-testid="text-faq-instant">{t('qrCode.instantTitle')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t('qrCode.instantDesc')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment FAQ Section */}
      <section className="py-20 px-6" data-testid="section-payment-faq">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4" data-testid="badge-payment-options">
              <CreditCard className="w-3 h-3 mr-1" />
              {t('paymentFaq.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-payment-faq-title">
              {t('paymentFaq.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('paymentFaq.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card data-testid="card-faq-payment-methods">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('paymentFaq.paymentMethodsTitle')}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t('paymentFaq.paymentMethodsDesc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-faq-crypto">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Bitcoin className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('paymentFaq.cryptoTitle')}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t('paymentFaq.cryptoDesc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-faq-milestones">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Layers className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('paymentFaq.milestonesTitle')}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t('paymentFaq.milestonesDesc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-faq-security">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                    <Lock className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('paymentFaq.securityTitle')}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t('paymentFaq.securityDesc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-faq-refunds">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                    <RefreshCw className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('paymentFaq.refundsTitle')}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t('paymentFaq.refundsDesc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('newsletter.title')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t('newsletter.subtitle')}
          </p>
          <NewsletterSignup />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t('cta.subtitle')}
          </p>
          <a href="/api/login">
            <Button size="lg" className="gap-2" data-testid="button-cta-submit">
              {t('hero.submitProblem')} <ArrowRight className="w-5 h-5" />
            </Button>
          </a>
          <div className="mt-8">
            <p className="text-sm text-muted-foreground mb-4">{t('cta.shareWith')}</p>
            <div className="flex justify-center">
              <SocialShareButtons 
                title="Wint Enterprises - Empowering Independence. Securing Legacies." 
                type="app" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={wintLogo} alt="Wint Enterprises, Inc." className="h-7 w-auto object-contain" />
            <span className="font-semibold">Wint Enterprises, Inc.</span>
          </div>
          <a 
            href="mailto:pawint@me.com" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="link-email-contact"
          >
            <Mail className="w-4 h-4" />
            pawint@me.com
          </a>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Wint Enterprises, Inc. {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}
