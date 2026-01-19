import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient as qc } from "@/lib/queryClient";
import { 
  Plus, Edit, Trash2, FileText, FileSignature, FileCheck, 
  Loader2, Save, X, RefreshCw, Wand2 
} from "lucide-react";
import type { DocumentTemplate } from "@shared/schema";

const typeConfig: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  estimate: { label: "Estimate", icon: FileText, color: "bg-blue-500/10 text-blue-500" },
  contract: { label: "Contract", icon: FileSignature, color: "bg-amber-500/10 text-amber-500" },
  terms: { label: "Terms of Service", icon: FileCheck, color: "bg-green-500/10 text-green-500" },
};

export function AdminDocumentsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "estimate",
    content: "",
    version: 1,
    isActive: true,
    requiresSignature: false,
  });

  const { data: templates = [], isLoading } = useQuery<DocumentTemplate[]>({
    queryKey: ["/api/admin/document-templates"],
  });

  const seedTemplates = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/document-templates/seed");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Default templates created!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/document-templates"] });
    },
    onError: () => {
      toast({ title: "Failed to seed templates", variant: "destructive" });
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/admin/document-templates", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Template created!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/document-templates"] });
      setIsCreating(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create template", variant: "destructive" });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const response = await apiRequest("PATCH", `/api/admin/document-templates/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Template updated!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/document-templates"] });
      setEditingTemplate(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update template", variant: "destructive" });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/document-templates/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Template deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/document-templates"] });
    },
    onError: () => {
      toast({ title: "Failed to delete template", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "estimate",
      content: "",
      version: 1,
      isActive: true,
      requiresSignature: false,
    });
  };

  const handleEdit = (template: DocumentTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      content: template.bodyMarkdown,
      version: template.version,
      isActive: template.isActive,
      requiresSignature: template.requiresSignature,
    });
  };

  const handleSave = () => {
    const saveData = {
      name: formData.name,
      type: formData.type,
      bodyMarkdown: formData.content,
      version: formData.version,
      isActive: formData.isActive,
      requiresSignature: formData.requiresSignature,
    };
    if (editingTemplate) {
      updateTemplate.mutate({ id: editingTemplate.id, data: saveData });
    } else {
      createTemplate.mutate(saveData as any);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Document Templates</h3>
          <p className="text-sm text-muted-foreground">
            Manage templates for estimates, contracts, and terms of service
          </p>
        </div>
        <div className="flex gap-2">
          {templates.length === 0 && (
            <Button
              variant="outline"
              onClick={() => seedTemplates.mutate()}
              disabled={seedTemplates.isPending}
              data-testid="button-seed-templates"
            >
              {seedTemplates.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              Seed Defaults
            </Button>
          )}
          <Button onClick={() => setIsCreating(true)} data-testid="button-create-template">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No templates yet</p>
            <p className="text-sm text-muted-foreground">
              Click "Seed Defaults" to create standard document templates
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            const config = typeConfig[template.type] || typeConfig.estimate;
            const Icon = config.icon;
            return (
              <Card key={template.id} className="relative" data-testid={`card-template-${template.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            v{template.version}
                          </Badge>
                          {template.requiresSignature && (
                            <Badge variant="secondary" className="text-xs">
                              Signature Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                    {template.bodyMarkdown.substring(0, 150)}...
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(template)}
                      data-testid={`button-edit-template-${template.id}`}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => deleteTemplate.mutate(template.id)}
                      data-testid={`button-delete-template-${template.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isCreating || !!editingTemplate} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setEditingTemplate(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Project Contract"
                  data-testid="input-template-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger data-testid="select-template-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estimate">Estimate</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="terms">Terms of Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="requiresSignature"
                  checked={formData.requiresSignature}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresSignature: checked }))}
                />
                <Label htmlFor="requiresSignature">Requires Signature</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content (Markdown)</Label>
              <p className="text-xs text-muted-foreground">
                Use variables like {"{{client_name}}"}, {"{{submission_id}}"}, {"{{date}}"}, {"{{description}}"}, 
                {"{{addons_list}}"}, {"{{budget_min}}"}, {"{{budget_max}}"}, {"{{total_min}}"}, {"{{total_max}}"}, 
                {"{{timeline}}"}, {"{{deposit_amount}}"}, {"{{midpoint_amount}}"}, {"{{final_amount}}"}
              </p>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter document content in Markdown format..."
                className="min-h-[400px] font-mono text-sm"
                data-testid="textarea-template-content"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setEditingTemplate(null);
                resetForm();
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || !formData.content || createTemplate.isPending || updateTemplate.isPending}
              data-testid="button-save-template"
            >
              {(createTemplate.isPending || updateTemplate.isPending) ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
