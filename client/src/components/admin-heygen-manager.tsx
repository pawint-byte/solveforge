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
import { Loader2, Video, User, Mic, Play, CheckCircle, Clock, AlertCircle, ExternalLink, Pencil, Save, X, Copy, Link } from "lucide-react";

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

interface SavedVideo {
  id: string;
  videoId: string;
  status: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  destinationUrl: string | null;
  duration: string | null;
  createdAt: string;
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
  const [isEditingUrl, setIsEditingUrl] = useState<boolean>(false);
  const [editingUrlValue, setEditingUrlValue] = useState<string>("");

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

  const { data: savedVideos = [], isLoading: loadingSavedVideos, refetch: refetchVideos } = useQuery<SavedVideo[]>({
    queryKey: ["/api/admin/heygen/videos"],
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

  const updateDestinationUrl = useMutation({
    mutationFn: async (newUrl: string) => {
      const response = await apiRequest("PATCH", `/api/admin/heygen/video/${generatedVideoId}`, {
        destinationUrl: newUrl,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSavedDestinationUrl(data.destination_url || "");
      setIsEditingUrl(false);
      refetchVideos();
      toast({ title: "Destination URL updated!" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update URL", description: error.message, variant: "destructive" });
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

  const selectSavedVideo = (video: SavedVideo) => {
    setGeneratedVideoId(video.videoId);
    setVideoStatus({
      video_id: video.videoId,
      status: video.status,
      video_url: video.videoUrl || undefined,
      thumbnail_url: video.thumbnailUrl || undefined,
      duration: video.duration ? parseFloat(video.duration) : undefined,
    });
    setSavedDestinationUrl(video.destinationUrl || "");
    toast({ title: "Video loaded", description: "You can now manage this video's settings." });
  };

  return (
    <div className="space-y-6">
      {savedVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Saved Videos ({savedVideos.length})
            </CardTitle>
            <CardDescription>
              Previously generated videos. Click to manage destination URL and sharing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSavedVideos ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading saved videos...
              </div>
            ) : (
              <div className="grid gap-3">
                {savedVideos.map((video) => (
                  <div
                    key={video.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
                      generatedVideoId === video.videoId 
                        ? "bg-primary/10 border-primary" 
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => selectSavedVideo(video)}
                    data-testid={`video-item-${video.videoId}`}
                  >
                    {video.thumbnailUrl ? (
                      <img 
                        src={video.thumbnailUrl} 
                        alt="Video thumbnail"
                        className="w-16 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-16 h-12 rounded bg-muted flex items-center justify-center">
                        <Video className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm truncate">{video.videoId}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={video.status === "completed" ? "default" : "secondary"}>
                          {video.status}
                        </Badge>
                        {video.destinationUrl && (
                          <Badge variant="outline" className="text-xs">
                            Has URL
                          </Badge>
                        )}
                        {video.duration && (
                          <span className="text-xs text-muted-foreground">
                            {Math.round(parseFloat(video.duration))}s
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={generatedVideoId === video.videoId ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectSavedVideo(video);
                      }}
                      data-testid={`button-select-video-${video.videoId}`}
                    >
                      {generatedVideoId === video.videoId ? "Selected" : "Manage"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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

            <Button
              variant="outline"
              onClick={() => checkStatus.mutate(generatedVideoId)}
              disabled={checkStatus.isPending}
              data-testid="button-check-status"
            >
              {checkStatus.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {videoStatus?.status === "completed" ? "Syncing..." : "Checking..."}
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  {videoStatus?.status === "completed" ? "Refresh / Sync" : "Check Status"}
                </>
              )}
            </Button>

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
                
                {/* Destination URL Editor */}
                <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3">
                  <Label className="text-sm font-medium">Destination URL (where viewers should go)</Label>
                  {isEditingUrl ? (
                    <div className="flex gap-2">
                      <Input
                        value={editingUrlValue}
                        onChange={(e) => setEditingUrlValue(e.target.value)}
                        placeholder="https://example.com"
                        className="flex-1"
                        data-testid="input-edit-destination-url"
                      />
                      <Button
                        size="icon"
                        onClick={() => updateDestinationUrl.mutate(editingUrlValue)}
                        disabled={updateDestinationUrl.isPending}
                        data-testid="button-save-destination-url"
                      >
                        {updateDestinationUrl.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          setIsEditingUrl(false);
                          setEditingUrlValue(savedDestinationUrl);
                        }}
                        data-testid="button-cancel-edit-url"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {savedDestinationUrl ? (
                        <a href={savedDestinationUrl} className="text-primary hover:underline flex-1 truncate" target="_blank" rel="noopener noreferrer">
                          {savedDestinationUrl}
                        </a>
                      ) : (
                        <span className="text-muted-foreground italic flex-1">No destination URL set</span>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingUrlValue(savedDestinationUrl);
                          setIsEditingUrl(true);
                        }}
                        data-testid="button-edit-destination-url"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        {savedDestinationUrl ? "Edit" : "Add URL"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Shareable Video Link */}
                <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Shareable Video Link
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Share this link with viewers. They'll see the video with a "Visit Site" button.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={`${window.location.origin}/video/${generatedVideoId}`}
                      readOnly
                      className="flex-1 bg-background"
                      data-testid="input-shareable-link"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/video/${generatedVideoId}`);
                        toast({ title: "Link copied!", description: "Shareable video link copied to clipboard." });
                      }}
                      data-testid="button-copy-shareable-link"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full"
                    data-testid="button-preview-video-page"
                  >
                    <a href={`/video/${generatedVideoId}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Preview Video Page
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
