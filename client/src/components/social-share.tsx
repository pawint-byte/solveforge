import { Button } from "@/components/ui/button";
import { trackShare } from "@/lib/analytics";
import { SiX, SiFacebook, SiLinkedin } from "react-icons/si";
import { Link2, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SocialShareProps {
  url?: string;
  title: string;
  description?: string;
  type: "submission" | "referral" | "app";
  itemId?: string;
}

export function SocialShare({ url, title, description, type, itemId }: SocialShareProps) {
  const { toast } = useToast();
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  
  const getShareText = () => {
    switch (type) {
      case "submission":
        return `Check out this problem on SolveForge: "${title}" - Get expert solutions to your toughest challenges!`;
      case "referral":
        return `Join SolveForge with my referral link! Get crowdsourced solutions to your problems and challenges.`;
      case "app":
        return `Discover SolveForge - Where problems meet solutions! Submit your challenges and get expert help.`;
      default:
        return title;
    }
  };

  const shareText = getShareText();
  const hashtags = "SolveForge,CrowdSourcing,ProblemSolving";

  const handleShare = (platform: string) => {
    let shareLink = "";
    
    switch (platform) {
      case "x":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${hashtags}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description || shareText)}`;
        break;
    }
    
    trackShare(platform, type, itemId);
    window.open(shareLink, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
      trackShare("copy_link", type, itemId);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually from your browser.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-share">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleShare("x")} data-testid="share-x">
          <SiX className="h-4 w-4 mr-2" />
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("facebook")} data-testid="share-facebook">
          <SiFacebook className="h-4 w-4 mr-2" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("linkedin")} data-testid="share-linkedin">
          <SiLinkedin className="h-4 w-4 mr-2" />
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} data-testid="share-copy-link">
          <Link2 className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SocialShareButtons({ url, title, description, type, itemId }: SocialShareProps) {
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  
  const getShareText = () => {
    switch (type) {
      case "submission":
        return `Check out this problem on SolveForge: "${title}"`;
      case "referral":
        return `Join SolveForge with my referral link!`;
      case "app":
        return `Discover SolveForge - Where problems meet solutions!`;
      default:
        return title;
    }
  };

  const shareText = getShareText();
  const hashtags = "SolveForge,CrowdSourcing";

  const handleShare = (platform: string) => {
    let shareLink = "";
    
    switch (platform) {
      case "x":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${hashtags}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
    }
    
    trackShare(platform, type, itemId);
    window.open(shareLink, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare("x")}
        data-testid="button-share-x"
        title="Share on X"
      >
        <SiX className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare("facebook")}
        data-testid="button-share-facebook"
        title="Share on Facebook"
      >
        <SiFacebook className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare("linkedin")}
        data-testid="button-share-linkedin"
        title="Share on LinkedIn"
      >
        <SiLinkedin className="h-4 w-4" />
      </Button>
    </div>
  );
}
