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
  FileText, Send, Loader2, MessageSquare
} from "lucide-react";
import type { Submission, Message } from "@shared/schema";
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
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({ title: "Unauthorized", description: "Please log in to view this submission.", variant: "destructive" });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: submission, isLoading } = useQuery<Submission>({
    queryKey: ["/api/submissions", id],
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/submissions", id, "messages"],
    enabled: !!submission,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/submissions/${id}/messages`, { content });
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/submissions", id, "messages"] });
      toast({ title: "Message sent!" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Failed to send message", variant: "destructive" });
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
            <h2 className="text-xl font-bold mb-2">Submission Not Found</h2>
            <p className="text-muted-foreground mb-4">This submission doesn't exist or you don't have access.</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                        {status.label}
                      </Badge>
                      <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[submission.category]}`}>
                        {submission.category}
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
                  Messages
                </CardTitle>
                <CardDescription>Communication about this submission</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
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
                            {message.isFromAdmin ? "Admin" : "You"}
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
                    placeholder="Type your message..."
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
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Budget Range</p>
                  <p className="text-lg font-semibold">
                    ${submission.budgetMin} - ${submission.budgetMax} {submission.currency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Timeline</p>
                  <p className="font-medium">{timelineLabels[submission.timeline]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Submitted</p>
                  <p className="font-medium">
                    {new Date(submission.createdAt!).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                {submission.linkedinUrl && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">LinkedIn</p>
                    <a 
                      href={submission.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      View Profile
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StatusIcon className={`w-5 h-5 ${status.color}`} />
                  Status Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">Submitted</span>
                  </div>
                  <div className={`flex items-center gap-3 ${
                    ["pending"].includes(submission.status) ? "opacity-40" : ""
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      ["in_review", "approved", "in_progress", "solution_proposed", "completed"].includes(submission.status) 
                        ? "bg-green-500" 
                        : "bg-muted"
                    }`} />
                    <span className="text-sm">In Review</span>
                  </div>
                  <div className={`flex items-center gap-3 ${
                    !["approved", "in_progress", "solution_proposed", "completed"].includes(submission.status) ? "opacity-40" : ""
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      ["approved", "in_progress", "solution_proposed", "completed"].includes(submission.status) 
                        ? "bg-green-500" 
                        : "bg-muted"
                    }`} />
                    <span className="text-sm">Approved</span>
                  </div>
                  <div className={`flex items-center gap-3 ${
                    !["in_progress", "solution_proposed", "completed"].includes(submission.status) ? "opacity-40" : ""
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      ["in_progress", "solution_proposed", "completed"].includes(submission.status) 
                        ? "bg-green-500" 
                        : "bg-muted"
                    }`} />
                    <span className="text-sm">In Progress</span>
                  </div>
                  <div className={`flex items-center gap-3 ${
                    submission.status !== "completed" ? "opacity-40" : ""
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      submission.status === "completed" ? "bg-green-500" : "bg-muted"
                    }`} />
                    <span className="text-sm">Completed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
