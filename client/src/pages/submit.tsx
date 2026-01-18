import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Zap, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/auth-utils";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title must be less than 200 characters"),
  description: z.string().min(50, "Please provide at least 50 characters of description"),
  category: z.enum(["tech", "business", "design", "personal", "other"]),
  timeline: z.enum(["asap", "one_to_four_weeks", "one_to_three_months", "flexible"]),
  budgetMin: z.number().min(50, "Minimum budget is $50"),
  budgetMax: z.number().max(50000, "Maximum budget is $50,000"),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
  consentGiven: z.boolean().refine(val => val === true, "You must agree to the terms"),
});

type FormData = z.infer<typeof formSchema>;

const timelineLabels: Record<string, string> = {
  asap: "ASAP - Within 1 week",
  one_to_four_weeks: "1-4 weeks",
  one_to_three_months: "1-3 months",
  flexible: "Flexible - No rush",
};

const categoryLabels: Record<string, string> = {
  tech: "Technology / Software",
  business: "Business / Strategy",
  design: "Design / Creative",
  personal: "Personal / Lifestyle",
  other: "Other",
};

export default function SubmitPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [budgetRange, setBudgetRange] = useState([100, 500]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({ title: "Unauthorized", description: "Please log in to submit a problem.", variant: "destructive" });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "tech",
      timeline: "flexible",
      budgetMin: 100,
      budgetMax: 500,
      linkedinUrl: "",
      phoneNumber: "",
      consentGiven: false,
    },
  });

  const createSubmission = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/submissions", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Submission Created!",
        description: "Your problem has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/submissions/my"] });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to create submission",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createSubmission.mutate({
      ...data,
      budgetMin: budgetRange[0],
      budgetMax: budgetRange[1],
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
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

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Submit Your Problem</h1>
          <p className="text-muted-foreground">
            Describe your challenge in detail. The more context you provide, the better solution you'll receive.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Problem Details */}
            <Card>
              <CardHeader>
                <CardTitle>Problem Details</CardTitle>
                <CardDescription>Describe what you need help with</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="E.g., E-commerce website integration" 
                          data-testid="input-title"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>A short, descriptive title for your problem</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your problem in detail. Include any constraints, goals, existing attempts, or related resources..."
                          className="min-h-[200px]"
                          data-testid="textarea-description"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        The more detail you provide, the better. Include context, requirements, and any existing work.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(categoryLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Timeline & Budget */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline & Budget</CardTitle>
                <CardDescription>Set your expectations for delivery and investment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="timeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeline</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-timeline">
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(timelineLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <Label>Budget Range (USD)</Label>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-primary">${budgetRange[0]}</span>
                    <span className="text-muted-foreground">to</span>
                    <span className="text-2xl font-bold text-primary">${budgetRange[1]}</span>
                  </div>
                  <Slider
                    value={budgetRange}
                    onValueChange={setBudgetRange}
                    min={50}
                    max={10000}
                    step={50}
                    className="w-full"
                    data-testid="slider-budget"
                  />
                  <p className="text-sm text-muted-foreground">
                    This is what you're willing to invest for the solution.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact & Verification */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>For follow-up and verification (kept private)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://linkedin.com/in/yourprofile" 
                          data-testid="input-linkedin"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>Helps verify your identity for high-value requests</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+1 (555) 123-4567" 
                          data-testid="input-phone"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>For urgent communications only</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consentGiven"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-consent"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the terms and privacy policy
                        </FormLabel>
                        <FormDescription>
                          Your information will be kept confidential and only used to process your request (GDPR/CCPA compliant).
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex items-center justify-end gap-4">
              <Link href="/dashboard">
                <Button variant="outline" type="button" data-testid="button-cancel">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={createSubmission.isPending}
                className="gap-2"
                data-testid="button-submit"
              >
                {createSubmission.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Problem"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
