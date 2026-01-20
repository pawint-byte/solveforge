import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Play, Loader2, AlertCircle } from "lucide-react";

interface VideoData {
  video_id: string;
  video_url: string;
  thumbnail_url?: string;
  destination_url?: string;
  duration?: number;
}

export default function VideoPage() {
  const { videoId } = useParams<{ videoId: string }>();

  const { data: video, isLoading, error } = useQuery<VideoData>({
    queryKey: ["/api/video", videoId],
    queryFn: async () => {
      const response = await fetch(`/api/video/${videoId}`);
      if (!response.ok) {
        throw new Error("Video not found");
      }
      return response.json();
    },
    enabled: !!videoId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Video Not Found</h1>
            <p className="text-muted-foreground">
              This video is not available or may still be processing.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
        <div className="space-y-8">
          {/* Video Player */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
            <video
              src={video.video_url}
              poster={video.thumbnail_url}
              controls
              autoPlay
              className="w-full aspect-video"
              data-testid="video-player"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Call to Action */}
          {video.destination_url && (
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="py-8">
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-bold">
                      Ready to Get Started?
                    </h2>
                    <p className="text-muted-foreground text-lg">
                      Click below to visit our site and learn more
                    </p>
                  </div>
                  
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 h-auto"
                    asChild
                    data-testid="button-visit-destination"
                  >
                    <a href={video.destination_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Visit Site
                    </a>
                  </Button>

                  <p className="text-sm text-muted-foreground">
                    <a 
                      href={video.destination_url} 
                      className="hover:underline text-primary"
                      target="_blank" 
                      rel="noopener noreferrer"
                      data-testid="link-destination-url"
                    >
                      {video.destination_url}
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Video Info */}
          {video.duration && (
            <p className="text-center text-sm text-muted-foreground">
              Video duration: {Math.round(video.duration)} seconds
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
