import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, FileText, Clock, CheckCircle, AlertCircle, 
  LogOut, Zap, ArrowRight, Settings
} from "lucide-react";
import type { Submission } from "@shared/schema";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  pending: { label: "Pending Review", variant: "secondary", icon: Clock },
  in_review: { label: "In Review", variant: "default", icon: FileText },
  approved: { label: "Approved", variant: "default", icon: CheckCircle },
  in_progress: { label: "In Progress", variant: "default", icon: Clock },
  solution_proposed: { label: "Solution Proposed", variant: "default", icon: CheckCircle },
  completed: { label: "Completed", variant: "secondary", icon: CheckCircle },
  cancelled: { label: "Cancelled", variant: "destructive", icon: AlertCircle },
};

const categoryColors: Record<string, string> = {
  tech: "bg-blue-500/10 text-blue-500",
  business: "bg-amber-500/10 text-amber-500",
  design: "bg-pink-500/10 text-pink-500",
  personal: "bg-green-500/10 text-green-500",
  other: "bg-gray-500/10 text-gray-500",
};

export default function Dashboard() {
  const { user, logout } = useAuth();

  const { data: submissions = [], isLoading } = useQuery<Submission[]>({
    queryKey: ["/api/submissions/my"],
  });

  const { data: adminCheck } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/admin/check"],
  });

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === "pending" || s.status === "in_review").length,
    inProgress: submissions.filter(s => s.status === "in_progress" || s.status === "solution_proposed").length,
    completed: submissions.filter(s => s.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SolveForge</span>
          </div>
          <div className="flex items-center gap-4">
            {adminCheck?.isAdmin && (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="gap-2" data-testid="link-admin">
                  <Settings className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
            )}
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => logout()}
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Manage your problem submissions and track their progress.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Submissions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-amber-500">{stats.pending}</div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-500">{stats.inProgress}</div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-500">{stats.completed}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Submissions</h2>
          <Link href="/submit">
            <Button className="gap-2" data-testid="button-new-submission">
              <Plus className="w-4 h-4" />
              New Submission
            </Button>
          </Link>
        </div>

        {/* Submissions List */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-1/3 mb-3" />
                  <div className="h-4 bg-muted rounded w-2/3 mb-4" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by submitting your first problem or idea to be solved.
              </p>
              <Link href="/submit">
                <Button className="gap-2" data-testid="button-first-submission">
                  <Plus className="w-4 h-4" />
                  Create Your First Submission
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {submissions.map(submission => {
              const status = statusConfig[submission.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              
              return (
                <Link key={submission.id} href={`/submissions/${submission.id}`}>
                  <Card className="hover-elevate cursor-pointer" data-testid={`card-submission-${submission.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-semibold text-lg truncate">
                              {submission.title}
                            </h3>
                            <Badge variant={status.variant} className="gap-1 shrink-0">
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground line-clamp-2 mb-3">
                            {submission.description}
                          </p>
                          <div className="flex items-center gap-4 flex-wrap">
                            <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[submission.category]}`}>
                              {submission.category}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ${submission.budgetMin} - ${submission.budgetMax} {submission.currency}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(submission.createdAt!).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
