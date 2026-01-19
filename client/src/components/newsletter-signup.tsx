import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Loader2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface NewsletterSignupProps {
  variant?: "inline" | "card";
  className?: string;
}

export function NewsletterSignup({ variant = "inline", className = "" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/newsletter/subscribe", { email });
      toast({
        title: "Subscribed!",
        description: "Thanks for subscribing to our newsletter.",
      });
      trackEvent("newsletter_subscribe", "engagement", "footer");
      setEmail("");
    } catch (error: any) {
      toast({
        title: "Subscription failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "card") {
    return (
      <div className={`bg-card border rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Stay Updated</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Get notified about new features, success stories, and tips for better problem submissions.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder={t('newsletter.placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            data-testid="input-newsletter-email"
          />
          <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-newsletter-subscribe">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('newsletter.subscribe')}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <Input
        type="email"
        placeholder={t('newsletter.placeholder')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
        className="max-w-xs"
        data-testid="input-newsletter-email-inline"
      />
      <Button type="submit" disabled={isLoading} data-testid="button-newsletter-subscribe-inline">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('newsletter.subscribe')}
      </Button>
    </form>
  );
}
