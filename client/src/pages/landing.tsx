import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Clock, DollarSign, Shield, ArrowRight, Zap, MessageSquare } from "lucide-react";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { SocialShareButtons } from "@/components/social-share";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SolveForge</span>
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
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {t('hero.title1')} <span className="text-primary">{t('hero.problems')}</span> {t('hero.into')}{" "}
                <span className="text-primary">{t('hero.solutions')}</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {t('hero.subtitle')}
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

      {/* Newsletter Section */}
      <section className="py-20 px-6">
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
      <section className="py-20 px-6 bg-muted/30">
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
                title="SolveForge - Crowdsourcing Problem Solving" 
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
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-semibold">SolveForge</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SolveForge. {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}
