import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Play, Loader2, AlertCircle, ArrowRight } from "lucide-react";

interface VideoData {
  video_id: string;
  video_url: string;
  thumbnail_url?: string;
  destination_url?: string;
  duration?: number;
}

export default function VideoPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [redirectCancelled, setRedirectCancelled] = useState(false);

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

  useEffect(() => {
    if (videoEnded && countdown !== null && countdown > 0 && !redirectCancelled) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (videoEnded && countdown === 0 && video?.destination_url && !redirectCancelled) {
      window.location.href = video.destination_url;
    }
  }, [videoEnded, countdown, video?.destination_url, redirectCancelled]);

  const handleVideoEnd = () => {
    setVideoEnded(true);
    setIsPlaying(false);
    setRedirectCancelled(false);
    if (video?.destination_url) {
      setCountdown(5);
    }
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
    setVideoEnded(false);
    setCountdown(null);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const cancelRedirect = () => {
    setCountdown(null);
    setRedirectCancelled(true);
  };

  const replayVideo = () => {
    setVideoEnded(false);
    setCountdown(null);
    setRedirectCancelled(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const goToDestination = () => {
    if (video?.destination_url) {
      window.location.href = video.destination_url;
    }
  };

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
          {/* Video Player with Overlay */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
            <video
              ref={videoRef}
              src={video.video_url}
              poster={video.thumbnail_url}
              controls
              autoPlay
              className="w-full aspect-video"
              data-testid="video-player"
              onEnded={handleVideoEnd}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
            >
              Your browser does not support the video tag.
            </video>

            {/* End Screen Overlay */}
            {videoEnded && video.destination_url && (
              <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300"
                data-testid="video-end-overlay"
              >
                <div className="text-center text-white p-8 max-w-lg">
                  <div className="mb-6">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <ArrowRight className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3">
                      {redirectCancelled ? "Thanks for Watching!" : "Continue to Our Site"}
                    </h2>
                    <p className="text-lg text-white/80">
                      {redirectCancelled 
                        ? "Click the button below to visit our site" 
                        : "Click the button below to learn more"}
                    </p>
                  </div>

                  <Button
                    size="lg"
                    className="text-lg px-10 py-6 h-auto"
                    onClick={goToDestination}
                    data-testid="button-overlay-visit"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Visit Site Now
                  </Button>

                  {countdown !== null && countdown > 0 && !redirectCancelled && (
                    <div className="mt-6 space-y-2">
                      <p className="text-white/70 text-sm">
                        Redirecting in <span className="font-bold text-primary text-lg">{countdown}</span> seconds...
                      </p>
                      <button
                        onClick={cancelRedirect}
                        className="text-white/50 hover:text-white text-sm underline"
                        data-testid="button-cancel-redirect"
                      >
                        Cancel auto-redirect
                      </button>
                    </div>
                  )}

                  <div className="mt-6">
                    <button
                      onClick={replayVideo}
                      className="text-white/60 hover:text-white text-sm flex items-center gap-2 mx-auto"
                      data-testid="button-replay-video"
                    >
                      <Play className="w-4 h-4" />
                      Watch again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Clickable overlay hint (shows when video is paused) */}
            {video.destination_url && !videoEnded && !isPlaying && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute bottom-16 right-4"
                onClick={goToDestination}
                data-testid="button-corner-visit"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Site
              </Button>
            )}
          </div>

          {/* Call to Action - Always visible below video */}
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
