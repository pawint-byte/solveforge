import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Clock, DollarSign, Shield, ArrowRight, Zap, MessageSquare } from "lucide-react";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { SocialShareButtons } from "@/components/social-share";

export default function Landing() {
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
          <div className="flex items-center gap-4">
            <a href="/api/login">
              <Button data-testid="button-login">Get Started</Button>
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
                Turn Your <span className="text-primary">Problems</span> Into{" "}
                <span className="text-primary">Solutions</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Submit your technical challenges, business ideas, or creative projects. 
                Get expert solutions tailored to your needs with transparent pricing and timelines.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="/api/login">
                  <Button size="lg" className="gap-2" data-testid="button-get-started">
                    Submit Your Problem <ArrowRight className="w-5 h-5" />
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span>Flexible Pricing</span>
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
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">Tech</span>
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
                          <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-500">Business</span>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple, transparent process to get your problems solved
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover-elevate">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Lightbulb className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">1. Describe Your Problem</h3>
                <p className="text-muted-foreground">
                  Submit a detailed description of what you need solved, your timeline, and budget range.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">2. Get a Proposal</h3>
                <p className="text-muted-foreground">
                  Receive a detailed proposal with scope, timeline, and pricing for your review.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Get Your Solution</h3>
                <p className="text-muted-foreground">
                  Approve the proposal, make milestone payments, and receive your custom solution.
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
            Stay Updated
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Get tips on problem-solving, success stories, and platform updates delivered to your inbox.
          </p>
          <NewsletterSignup />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Your Problem Solved?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join others who have successfully turned their challenges into solutions.
          </p>
          <a href="/api/login">
            <Button size="lg" className="gap-2" data-testid="button-cta-submit">
              Submit Your Problem <ArrowRight className="w-5 h-5" />
            </Button>
          </a>
          <div className="mt-8">
            <p className="text-sm text-muted-foreground mb-4">Share SolveForge with others</p>
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
            &copy; {new Date().getFullYear()} SolveForge. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
