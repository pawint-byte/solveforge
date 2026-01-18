import { useAuth } from "@/hooks/use-auth";
import Landing from "./landing";
import Dashboard from "./dashboard";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Dashboard />;
  }

  return <Landing />;
}
