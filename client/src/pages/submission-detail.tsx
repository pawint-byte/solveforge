import { useTranslation } from 'react-i18next';
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, Zap, Clock, CheckCircle, AlertCircle, 
  FileText, Send, Loader2, MessageSquare, CreditCard, Puzzle,
  FileSignature, Eye, PenTool, AlertTriangle
} from "lucide-react";
import type { Submission, Message, Payment, SubmissionAddOn, Document } from "@shared/schema";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/auth-utils";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any; color: string }> = {
  pending: { label: "Pending Review", variant: "secondary", icon: Clock, color: "text-amber-500" },
  in_review: { label: "In Review", variant: "default", icon: FileText, color: "text-blue-500" },
  approved: { label: "Approved", variant: "default", icon: CheckCircle, color: "text-green-500" },
  in_progress: { label: "In Progress", variant: "default", icon: Clock, color: "text-blue-500" },
  solution_proposed: { label: "Solution Proposed", variant: "default", icon: CheckCircle, color: "text-primary" },
  completed: { label: "Completed", variant: "secondary", icon: CheckCircle, color: "text-green-500" },
  cancelled: { label: "Cancelled", variant: "destructive", icon: AlertCircle, color: "text-destructive" },
};

const categoryColors: Record<string, string> = {
  tech: "bg-blue-500/10 text-blue-500",
  business: "bg-amber-500/10 text-amber-500",
  design: "bg-pink-500/10 text-pink-500",
  personal: "bg-green-500/10 text-green-500",
  other: "bg-gray-500/10 text-gray-500",
};

const timelineLabels: Record<string, string> = {
  asap: "ASAP - Within 1 week",
  one_to_four_weeks: "1-4 weeks",
  one_to_three_months: "1-3 months",
  flexible: "Flexible",
};

export default function SubmissionDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [paymentLoading, setPaymentLoading] = useState<"card" | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({ title: t('submissionDetail.unauthorized'), description: t('submissionDetail.pleaseLogin'), variant: "destructive" });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [isAuthenticated, authLoading, toast, t]);

  const { data: submission, isLoading } = useQuery<Submission>({
    queryKey: ["/api/submissions", id],
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/submissions", id, "messages"],
    enabled: !!submission,
  });

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["/api/submissions", id, "payments"],
    enabled: !!submission,
  });

  // Crypto payments handled via Stripe's Crypto.com partnership - enable in Stripe Dashboard

  const { data: submissionAddOns = [] } = useQuery<SubmissionAddOn[]>({
    queryKey: ["/api/submissions", id, "addons"],
    enabled: !!submission,
  });

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/submissions", id, "documents"],
    enabled: !!submission,
  });

  const { data: contractStatus } = useQuery<{ hasSignedContract: boolean; contractId: string | null; signedAt: string | null }>({
    queryKey: ["/api/submissions", id, "contract-status"],
    enabled: !!submission,
  });

  const signDocument = useMutation({
    mutationFn: async ({ documentId, agreedToTerms }: { documentId: string; agreedToTerms: boolean }) => {
      const response = await apiRequest("POST", `/api/documents/${documentId}/sign`, { agreedToTerms });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions", id, "documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/submissions", id, "contract-status"] });
      setSignDialogOpen(false);
      setSelectedDocument(null);
      setAgreedToTerms(false);
      toast({ title: "Document signed successfully" });
    },
    onError: () => {
      toast({ title: "Failed to sign document", variant: "destructive" });
    },
  });

  const handleCardPayment = async () => {
    setPaymentLoading("card");
    try {
      const response = await apiRequest("POST", `/api/submissions/${id}/checkout`);
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({ title: t('payments.error') || "Payment failed", variant: "destructive" });
    } finally {
      setPaymentLoading(null);
    }
  };

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/submissions/${id}/messages`, { content });
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/submissions", id, "messages"] });
      toast({ title: t('submissionDetail.messageSent') });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: t('submissionDetail.unauthorized'), variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: t('submissionDetail.failedToSend'), variant: "destructive" });
    },
  });

  if (isLoading || authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-8">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t('submissionDetail.notFound')}</h2>
            <p className="text-muted-foreground mb-4">{t('submissionDetail.noAccess')}</p>
            <Link href="/dashboard">
              <Button>{t('submissionDetail.backToDashboard')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusLabel = (statusKey: string) => t(`status.${statusKey}`) || statusConfig[statusKey]?.label;
  const getTimelineLabel = (timelineKey: string) => t(`submissionDetail.timelineLabels.${timelineKey}`) || timelineLabels[timelineKey];

  const status = statusConfig[submission.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">SolveForge</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="text-2xl mb-2">{submission.title}</CardTitle>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant={status.variant} className="gap-1">
                        <StatusIcon className="w-3 h-3" />
                        {getStatusLabel(submission.status)}
                      </Badge>
                      <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[submission.category]}`}>
                        {t(`submit.categories.${submission.category}`) || submission.category}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap">{submission.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {t('messages.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t('submissionDetail.noMessages')}
                  </p>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`p-4 rounded-lg ${
                          message.isFromAdmin 
                            ? "bg-primary/10 border-l-4 border-primary" 
                            : "bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">
                            {message.isFromAdmin ? t('submissionDetail.authorAdmin') : t('submissionDetail.authorYou')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.createdAt!).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Textarea
                    placeholder={t('submissionDetail.typeMessage')}
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    className="flex-1"
                    data-testid="textarea-message"
                  />
                  <Button
                    onClick={() => sendMessage.mutate(newMessage)}
                    disabled={!newMessage.trim() || sendMessage.isPending}
                    size="icon"
                    data-testid="button-send-message"
                  >
                    {sendMessage.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('submissionDetail.details')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('submissionDetail.budgetRange')}</p>
                  <p className="text-lg font-semibold">
                    ${submission.budgetMin} - ${submission.budgetMax} {submission.currency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('submissionDetail.timeline')}</p>
                  <p className="font-medium">{getTimelineLabel(submission.timeline)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('submissionDetail.submitted')}</p>
                  <p className="font-medium">
                    {new Date(submission.createdAt!).toLocaleDateString()}
                  </p>
                </div>
                {submission.linkedinUrl && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('submissionDetail.linkedin')}</p>
                    <a 
                      href={submission.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      {t('submissionDetail.viewProfile')}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Add-Ons */}
            {submissionAddOns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Puzzle className="w-5 h-5 text-primary" />
                    Selected Add-Ons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {submissionAddOns.map((addon: any) => (
                      <div key={addon.id} className="flex items-start justify-between p-2 rounded-lg bg-muted/50 gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{addon.itemName || "Add-On"}</p>
                          {addon.timelineLabel && (
                            <p className="text-xs text-muted-foreground">{addon.timelineLabel}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          ${addon.priceMin || 0} - ${addon.priceMax || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents Section */}
            {documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSignature className="w-5 h-5 text-primary" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {documents.map((doc: Document) => {
                    const docStatusBadge = () => {
                      switch (doc.status) {
                        case "signed": return <Badge variant="default" className="bg-green-500">Signed</Badge>;
                        case "sent": case "viewed": return <Badge variant="secondary">Awaiting Signature</Badge>;
                        case "draft": return <Badge variant="outline">Draft</Badge>;
                        case "declined": return <Badge variant="destructive">Declined</Badge>;
                        default: return <Badge variant="outline">{doc.status}</Badge>;
                      }
                    };
                    return (
                      <div 
                        key={doc.id} 
                        className="flex items-start justify-between p-3 rounded-lg bg-muted/50 gap-2 cursor-pointer hover-elevate"
                        onClick={() => setSelectedDocument(doc)}
                        data-testid={`document-${doc.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{doc.type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {docStatusBadge()}
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Payment Section - Show when approved and deposit not paid */}
            {submission.status === "approved" && !payments.some(p => p.milestoneNumber === 1 && p.status === "completed") && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    {t('payments.payDeposit')}
                  </CardTitle>
                  <CardDescription>
                    {t('payments.depositRequired')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Contract Required Warning */}
                  {!contractStatus?.hasSignedContract && documents.some(d => d.type === "contract" && (d.status === "sent" || d.status === "viewed")) && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium">Contract Required</p>
                        <p className="text-xs mt-1">Please sign the contract above before making payment.</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">
                      ${((submission.budgetMin + submission.budgetMax) / 2 * 0.3).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">{submission.currency}</p>
                  </div>
                  <Button 
                    onClick={handleCardPayment} 
                    className="w-full gap-2" 
                    disabled={paymentLoading !== null || (!contractStatus?.hasSignedContract && documents.some(d => d.type === "contract"))}
                    data-testid="button-pay-card"
                  >
                    {paymentLoading === "card" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    {t('payments.payWithCard')}
                  </Button>
                  {/* Crypto payments handled via Stripe's Crypto.com partnership - enable in Stripe Dashboard */}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StatusIcon className={`w-5 h-5 ${status.color}`} />
                  {t('submissionDetail.statusTimeline')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">{t('submissionDetail.submitted')}</span>
                  </div>
                  <div className={`flex items-center gap-3 ${
                    ["pending"].includes(submission.status) ? "opacity-40" : ""
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      ["in_review", "approved", "in_progress", "solution_proposed", "completed"].includes(submission.status) 
                        ? "bg-green-500" 
                        : "bg-muted"
                    }`} />
                    <span className="text-sm">{t('status.in_review')}</span>
                  </div>
                  <div className={`flex items-center gap-3 ${
                    !["approved", "in_progress", "solution_proposed", "completed"].includes(submission.status) ? "opacity-40" : ""
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      ["approved", "in_progress", "solution_proposed", "completed"].includes(submission.status) 
                        ? "bg-green-500" 
                        : "bg-muted"
                    }`} />
                    <span className="text-sm">{t('status.approved')}</span>
                  </div>
                  <div className={`flex items-center gap-3 ${
                    !["in_progress", "solution_proposed", "completed"].includes(submission.status) ? "opacity-40" : ""
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      ["in_progress", "solution_proposed", "completed"].includes(submission.status) 
                        ? "bg-green-500" 
                        : "bg-muted"
                    }`} />
                    <span className="text-sm">{t('status.in_progress')}</span>
                  </div>
                  <div className={`flex items-center gap-3 ${
                    submission.status !== "completed" ? "opacity-40" : ""
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      submission.status === "completed" ? "bg-green-500" : "bg-muted"
                    }`} />
                    <span className="text-sm">{t('status.completed')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Document Viewer Dialog */}
      <Dialog open={!!selectedDocument && !signDialogOpen} onOpenChange={(open) => !open && setSelectedDocument(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5" />
              {selectedDocument?.title}
            </DialogTitle>
            <DialogDescription className="capitalize">
              {selectedDocument?.type} Document
            </DialogDescription>
          </DialogHeader>
          
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <pre className="whitespace-pre-wrap font-sans text-sm bg-muted/50 p-4 rounded-lg">
              {selectedDocument?.bodyMarkdown}
            </pre>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedDocument?.status === "signed" && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Signed on {selectedDocument.signedAt ? new Date(selectedDocument.signedAt).toLocaleDateString() : "N/A"}</span>
              </div>
            )}
            {(selectedDocument?.status === "sent" || selectedDocument?.status === "viewed") && selectedDocument?.type === "contract" && (
              <Button 
                onClick={() => setSignDialogOpen(true)}
                className="gap-2"
                data-testid="button-open-sign-dialog"
              >
                <PenTool className="w-4 h-4" />
                Sign This Document
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedDocument(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sign Document Dialog */}
      <Dialog open={signDialogOpen} onOpenChange={setSignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Document</DialogTitle>
            <DialogDescription>
              By signing this document, you agree to the terms outlined in the contract.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="terms" 
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                data-testid="checkbox-agree-terms"
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                I have read and agree to the terms outlined in this document. I understand that this constitutes a legally binding agreement.
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedDocument && signDocument.mutate({ documentId: selectedDocument.id, agreedToTerms })}
              disabled={!agreedToTerms || signDocument.isPending}
              className="gap-2"
              data-testid="button-confirm-sign"
            >
              {signDocument.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PenTool className="w-4 h-4" />
              )}
              Sign Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
