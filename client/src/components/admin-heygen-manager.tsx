import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Video, User, Mic, Play, CheckCircle, Clock, AlertCircle, ExternalLink } from "lucide-react";

interface Avatar {
  avatar_id: string;
  avatar_name: string;
  preview_image_url?: string;
  gender?: string;
}

interface Voice {
  voice_id: string;
  name: string;
  language?: string;
  gender?: string;
  preview_audio?: string;
}

interface VideoResult {
  video_id: string;
  status: string;
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
}

export function AdminHeyGenManager() {
  const { toast } = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [script, setScript] = useState<string>("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>("");
  const [destinationUrl, setDestinationUrl] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [generatedVideoId, setGeneratedVideoId] = useState<string>("");
  const [videoStatus, setVideoStatus] = useState<VideoResult | null>(null);
  const [savedDestinationUrl, setSavedDestinationUrl] = useState<string>("");

  const { data: heygenAvailable } = useQuery<{ available: boolean }>({
    queryKey: ["/api/heygen/available"],
  });

  const { data: avatars = [], isLoading: loadingAvatars } = useQuery<Avatar[]>({
    queryKey: ["/api/admin/heygen/avatars"],
    enabled: heygenAvailable?.available === true,
  });

  const { data: voices = [], isLoading: loadingVoices } = useQuery<Voice[]>({
    queryKey: ["/api/admin/heygen/voices"],
    enabled: heygenAvailable?.available === true,
  });

  const generateVideo = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/heygen/generate", {
        script,
        avatarId: selectedAvatar || undefined,
        voiceId: selectedVoice || undefined,
        aspectRatio,
        waitForCompletion: false,
        test: false,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedVideoId(data.video_id);
      setVideoStatus({ video_id: data.video_id, status: "pending" });
      toast({ title: "Video generation started!", description: "Check status below to monitor progress." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to generate video", description: error.message, variant: "destructive" });
    },
  });

  const checkStatus = useMutation({
    mutationFn: async (videoId: string) => {
      const response = await apiRequest("GET", `/api/admin/heygen/video/${videoId}`);
      return response.json();
    },
    onSuccess: (data) => {
      setVideoStatus(data);
      if (data.destination_url) {
        setSavedDestinationUrl(data.destination_url);
      }
      if (data.status === "completed") {
        toast({ title: "Video ready!", description: "Your video has been generated successfully." });
      } else if (data.status === "failed") {
        toast({ title: "Video generation failed", variant: "destructive" });
      }
    },
    onError: (error: Error) => {
      toast({ title: "Failed to check status", description: error.message, variant: "destructive" });
    },
  });

  const createAvatarVideo = useMutation({
    mutationFn: async () => {
      if (!selectedAvatar || !selectedVoice) {
        throw new Error("Please select both an avatar and a voice");
      }
      const response = await apiRequest("POST", "/api/admin/heygen/create-avatar-video", {
        avatarId: selectedAvatar,
        voiceId: selectedVoice,
        script,
        aspectRatio,
        backgroundImageUrl: backgroundImageUrl || undefined,
        destinationUrl: destinationUrl || undefined,
        test: false,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedVideoId(data.video_id);
      setVideoStatus({ video_id: data.video_id, status: "pending" });
      setSavedDestinationUrl(data.destination_url || destinationUrl || "");
      toast({ title: "Avatar video generation started!" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create avatar video", description: error.message, variant: "destructive" });
    },
  });

  if (!heygenAvailable?.available) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">HeyGen Not Configured</h3>
            <p className="text-muted-foreground">
              Add your HEYGEN_API_KEY to the secrets to enable video generation.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
      case "processing":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Generate AI Video
          </CardTitle>
          <CardDescription>
            Create professional AI-generated videos with virtual presenters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avatar" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Select Avatar
                </Label>
                {loadingAvatars ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading avatars...
                  </div>
                ) : (
                  <Select value={selectedAvatar} onValueChange={setSelectedAvatar}>
                    <SelectTrigger data-testid="select-avatar">
                      <SelectValue placeholder="Choose an avatar" />
                    </SelectTrigger>
                    <SelectContent>
                      {avatars.map((avatar) => (
                        <SelectItem key={avatar.avatar_id} value={avatar.avatar_id}>
                          <div className="flex items-center gap-2">
                            {avatar.preview_image_url && (
                              <img 
                                src={avatar.preview_image_url} 
                                alt={avatar.avatar_name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            )}
                            <span>{avatar.avatar_name}</span>
                            {avatar.gender && (
                              <Badge variant="outline" className="text-xs">{avatar.gender}</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="voice" className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Select Voice
                </Label>
                {loadingVoices ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading voices...
                  </div>
                ) : (
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger data-testid="select-voice">
                      <SelectValue placeholder="Choose a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice) => (
                        <SelectItem key={voice.voice_id} value={voice.voice_id}>
                          <div className="flex items-center gap-2">
                            <span>{voice.name}</span>
                            {voice.language && (
                              <Badge variant="outline" className="text-xs">{voice.language}</Badge>
                            )}
                            {voice.gender && (
                              <Badge variant="secondary" className="text-xs">{voice.gender}</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger data-testid="select-aspect-ratio">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                    <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backgroundImageUrl">Background Image URL (Optional)</Label>
                <Input
                  id="backgroundImageUrl"
                  placeholder="https://example.com/screenshot.png"
                  value={backgroundImageUrl}
                  onChange={(e) => setBackgroundImageUrl(e.target.value)}
                  data-testid="input-background-image-url"
                />
                <p className="text-xs text-muted-foreground">
                  Add a screenshot or image to show behind the avatar
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destinationUrl">Destination URL (Optional)</Label>
                <Input
                  id="destinationUrl"
                  placeholder="https://example.com"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  data-testid="input-destination-url"
                />
                <p className="text-xs text-muted-foreground">
                  Where viewers should go after watching the video
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="script">Script *</Label>
                <Textarea
                  id="script"
                  placeholder="Enter the script for your AI presenter to speak..."
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  rows={6}
                  data-testid="textarea-script"
                />
                <p className="text-xs text-muted-foreground">
                  {script.length} characters
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button
              onClick={() => generateVideo.mutate()}
              disabled={!script || generateVideo.isPending}
              data-testid="button-generate-video"
            >
              {generateVideo.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate Video
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => createAvatarVideo.mutate()}
              disabled={!script || !selectedAvatar || !selectedVoice || createAvatarVideo.isPending}
              data-testid="button-create-avatar-video"
            >
              {createAvatarVideo.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Create Avatar Video
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedVideoId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Video Status
              {videoStatus && getStatusIcon(videoStatus.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Video ID</p>
                <p className="font-mono text-sm">{generatedVideoId}</p>
              </div>
              {videoStatus && (
                <Badge variant={videoStatus.status === "completed" ? "default" : "secondary"}>
                  {videoStatus.status}
                </Badge>
              )}
            </div>

            {videoStatus?.status !== "completed" && (
              <Button
                variant="outline"
                onClick={() => checkStatus.mutate(generatedVideoId)}
                disabled={checkStatus.isPending}
                data-testid="button-check-status"
              >
                {checkStatus.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Check Status
                  </>
                )}
              </Button>
            )}

            {videoStatus?.status === "completed" && videoStatus.video_url && (
              <div className="space-y-4">
                {videoStatus.thumbnail_url && (
                  <img 
                    src={videoStatus.thumbnail_url} 
                    alt="Video thumbnail"
                    className="rounded-lg max-w-md"
                  />
                )}
                <div className="flex flex-wrap gap-3">
                  <Button asChild data-testid="button-view-video">
                    <a href={videoStatus.video_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Video
                    </a>
                  </Button>
                  <Button variant="outline" asChild data-testid="button-download-video">
                    <a href={videoStatus.video_url} download>
                      Download
                    </a>
                  </Button>
                  {savedDestinationUrl && (
                    <Button variant="secondary" asChild data-testid="button-visit-site">
                      <a href={savedDestinationUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Site
                      </a>
                    </Button>
                  )}
                </div>
                {videoStatus.duration && (
                  <p className="text-sm text-muted-foreground">
                    Duration: {Math.round(videoStatus.duration)}s
                  </p>
                )}
                {savedDestinationUrl && (
                  <p className="text-sm text-muted-foreground">
                    Destination: <a href={savedDestinationUrl} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{savedDestinationUrl}</a>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
