import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Wand2, Expand, FileText, Lightbulb, Loader2, Check, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AISubmissionAssistantProps {
  description: string;
  onApply: (improvedDescription: string) => void;
}

type ActionType = "improve" | "expand" | "simplify" | "suggest";

export function AISubmissionAssistant({ description, onApply }: AISubmissionAssistantProps) {
  const { toast } = useToast();
  const [result, setResult] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<ActionType | null>(null);

  const { data: availabilityData } = useQuery<{ available: boolean }>({
    queryKey: ["/api/ai/available"],
  });

  const isAvailable = availabilityData?.available ?? false;

  const improveDescription = useMutation({
    mutationFn: async ({ description, action }: { description: string; action: ActionType }) => {
      const response = await apiRequest("POST", "/api/ai/improve-description", {
        description,
        action,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data.result);
    },
    onError: () => {
      toast({
        title: "AI Assistant Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAction = (action: ActionType) => {
    if (!description || description.trim().length < 10) {
      toast({
        title: "Need More Text",
        description: "Please write at least a few sentences before using the AI assistant.",
        variant: "destructive",
      });
      return;
    }
    setCurrentAction(action);
    setResult(null);
    improveDescription.mutate({ description, action });
  };

  const handleApply = () => {
    if (result && currentAction !== "suggest") {
      onApply(result);
      setResult(null);
      setCurrentAction(null);
      toast({
        title: "Applied!",
        description: "The improved description has been applied.",
      });
    }
  };

  const handleDismiss = () => {
    setResult(null);
    setCurrentAction(null);
  };

  if (!isAvailable) {
    return null;
  }

  const actions = [
    { action: "improve" as ActionType, icon: Wand2, label: "Improve", description: "Make it clearer" },
    { action: "expand" as ActionType, icon: Expand, label: "Expand", description: "Add more detail" },
    { action: "simplify" as ActionType, icon: FileText, label: "Simplify", description: "Make it concise" },
    { action: "suggest" as ActionType, icon: Lightbulb, label: "Suggest", description: "Get ideas" },
  ];

  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">AI Writing Assistant</CardTitle>
        </div>
        <CardDescription>
          Let AI help you write a better problem description
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {actions.map(({ action, icon: Icon, label, description: desc }) => (
            <Button
              key={action}
              variant="outline"
              size="sm"
              onClick={() => handleAction(action)}
              disabled={improveDescription.isPending || !description?.trim()}
              className="gap-2"
              data-testid={`button-ai-${action}`}
            >
              {improveDescription.isPending && currentAction === action ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <span>{label}</span>
            </Button>
          ))}
        </div>

        {result && (
          <div className="mt-4 space-y-3">
            <div className="rounded-md bg-background border p-4">
              <p className="text-sm font-medium mb-2 text-muted-foreground">
                {currentAction === "suggest" ? "Suggestions:" : "AI Improved Version:"}
              </p>
              <p className="text-sm whitespace-pre-wrap">{result}</p>
            </div>
            
            <div className="flex gap-2">
              {currentAction !== "suggest" && (
                <Button
                  size="sm"
                  onClick={handleApply}
                  className="gap-2"
                  data-testid="button-ai-apply"
                >
                  <Check className="h-4 w-4" />
                  Apply This
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="gap-2"
                data-testid="button-ai-dismiss"
              >
                <X className="h-4 w-4" />
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
