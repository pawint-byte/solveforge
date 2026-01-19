import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, Zap, Clock, CheckCircle, AlertCircle, 
  FileText, LogOut, Loader2, Users, DollarSign, TrendingUp, Package, FileSignature
} from "lucide-react";
import type { Submission } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { AdminAddOnsManager } from "@/components/admin-addons-manager";
import { AdminDocumentsManager } from "@/components/admin-documents-manager";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending Review", variant: "secondary" },
  in_review: { label: "In Review", variant: "default" },
  approved: { label: "Approved", variant: "default" },
  in_progress: { label: "In Progress", variant: "default" },
  solution_proposed: { label: "Solution Proposed", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

const categoryColors: Record<string, string> = {
  tech: "bg-blue-500/10 text-blue-500",
  business: "bg-amber-500/10 text-amber-500",
  design: "bg-pink-500/10 text-pink-500",
  personal: "bg-green-500/10 text-green-500",
  other: "bg-gray-500/10 text-gray-500",
};

export default function AdminDashboard() {
  const { user, logout, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({ title: "Unauthorized", description: "Please log in to access admin.", variant: "destructive" });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [authLoading, isAuthenticated, toast]);

  const { data: adminCheck, isLoading: checkingAdmin } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/admin/check"],
    enabled: isAuthenticated,
  });

  const { data: submissions = [], isLoading } = useQuery<Submission[]>({
    queryKey: ["/api/admin/submissions"],
    enabled: adminCheck?.isAdmin === true && isAuthenticated,
  });

  useEffect(() => {
    if (!checkingAdmin && !authLoading && isAuthenticated && adminCheck && !adminCheck.isAdmin) {
      toast({ title: "Access denied", description: "Admin access required", variant: "destructive" });
      setLocation("/dashboard");
    }
  }, [checkingAdmin, authLoading, isAuthenticated, adminCheck, setLocation, toast]);

  const updateSubmission = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/submissions/${id}`, { status, adminNotes });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Submission updated!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/submissions"] });
      setSelectedSubmission(null);
      setNewStatus("");
      setAdminNotes("");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Failed to update submission", variant: "destructive" });
    },
  });

  if (authLoading || checkingAdmin || !isAuthenticated || !adminCheck?.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === "pending" || s.status === "in_review").length,
    inProgress: submissions.filter(s => s.status === "in_progress" || s.status === "solution_proposed" || s.status === "approved").length,
    completed: submissions.filter(s => s.status === "completed").length,
    totalBudget: submissions.reduce((sum, s) => sum + (s.budgetMin + s.budgetMax) / 2, 0),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold">SolveForge</span>
                <Badge variant="outline" className="ml-2">Admin</Badge>
              </div>
            </div>
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
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.inProgress}</div>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">${Math.round(stats.totalBudget).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Avg Budget</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Submissions and Add-Ons */}
        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submissions" className="gap-2" data-testid="tab-submissions">
              <FileText className="w-4 h-4" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="addons" className="gap-2" data-testid="tab-addons">
              <Package className="w-4 h-4" />
              Add-Ons
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2" data-testid="tab-documents">
              <FileSignature className="w-4 h-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submissions">
            {/* Submissions Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No submissions yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Title</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Budget</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Timeline</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map(submission => {
                          const status = statusConfig[submission.status] || statusConfig.pending;
                          return (
                            <tr key={submission.id} className="border-b hover:bg-muted/50" data-testid={`row-submission-${submission.id}`}>
                              <td className="py-3 px-4">
                                <div className="font-medium max-w-[200px] truncate">{submission.title}</div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[submission.category]}`}>
                                  {submission.category}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm">
                                ${submission.budgetMin}-${submission.budgetMax}
                              </td>
                              <td className="py-3 px-4 text-sm text-muted-foreground">
                                {submission.timeline.replace(/_/g, " ")}
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant={status.variant}>{status.label}</Badge>
                              </td>
                              <td className="py-3 px-4 text-sm text-muted-foreground">
                                {new Date(submission.createdAt!).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedSubmission(submission);
                                    setNewStatus(submission.status);
                                    setAdminNotes(submission.adminNotes || "");
                                  }}
                                  data-testid={`button-edit-${submission.id}`}
                                >
                                  Manage
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addons">
            <AdminAddOnsManager />
          </TabsContent>

          <TabsContent value="documents">
            <AdminDocumentsManager />
          </TabsContent>
        </Tabs>

        {/* Edit Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>Manage Submission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Title</p>
                  <p className="font-medium">{selectedSubmission.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm line-clamp-3">{selectedSubmission.description}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Update Status</p>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="solution_proposed">Solution Proposed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Admin Notes (Internal)</p>
                  <Textarea
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    placeholder="Internal notes about this submission..."
                    data-testid="textarea-admin-notes"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSubmission(null)}
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => updateSubmission.mutate({
                      id: selectedSubmission.id,
                      status: newStatus,
                      adminNotes,
                    })}
                    disabled={updateSubmission.isPending}
                    data-testid="button-save-changes"
                  >
                    {updateSubmission.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
