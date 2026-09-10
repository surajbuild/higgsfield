import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router";
import { BACKEND_URL } from "@/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Video,
  Image,
  Plus,
  Loader2,
  AlertCircle,
  Film,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

type User = {
  id: string;
  username: string;
};

type AvatarImage = {
  id: string;
  type: string;
  url: string;
};

type Avatar = {
  id: string;
  name: string;
  images: AvatarImage[];
};

type AvatarVideo = {
  id: string;
  prompt: string;
  status: "Pending" | "Done" | "Error";
  url?: string;
  startFrame?: string;
  endFrame?: string;
  duration?: number;
  width?: number;
  height?: number;
};

async function fetchMe(): Promise<User> {
  const response = await axios.get(`${BACKEND_URL}/api/v1/me`, {
    withCredentials: true,
  });
  return response.data.user;
}

async function fetchAvatars(): Promise<Avatar[]> {
  const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`, {
    withCredentials: true,
  });
  return response.data.avatars ?? [];
}

async function fetchVideos(): Promise<AvatarVideo[]> {
  const response = await axios.get(`${BACKEND_URL}/api/v1/videos`, {
    withCredentials: true,
  });
  return response.data.videos ?? [];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,
  });

  const { data: avatars = [], isLoading: avatarsLoading } = useQuery({
    queryKey: ["avatars"],
    queryFn: fetchAvatars,
    enabled: !!user,
  });

  const { data: videos = [], isLoading: videosLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
    enabled: !!user,
  });

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-73px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (userError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground text-lg">Please sign in to access the dashboard.</p>
        <Button onClick={() => navigate("/signin")} variant="outline">
          Sign In
        </Button>
      </div>
    );
  }

  const pendingVideos = videos.filter((v) => v.status === "Pending").length;
  const completedVideos = videos.filter((v) => v.status === "Done").length;

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-background via-background to-muted/30">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.username}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your avatars and videos
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/video-creator")}
              variant="outline"
              className="gap-2 cursor-pointer"
            >
              <Video className="h-4 w-4" />
              Create Video
            </Button>
            <Button
              onClick={() => navigate("/video-creator")}
              className="gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              New Avatar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Avatars</p>
                  <p className="text-3xl font-bold mt-1">{avatars.length}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Image className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Videos</p>
                  <p className="text-3xl font-bold mt-1">{videos.length}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Film className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold mt-1">{pendingVideos}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold mt-1">{completedVideos}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Create Something New</h3>
                  <p className="text-muted-foreground mt-1">
                    Generate AI avatar images or create identity videos from a single photo
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/video-creator")}
                    className="gap-2 cursor-pointer"
                  >
                    <Image className="h-4 w-4" />
                    Generate Avatar
                  </Button>
                  <Button
                    onClick={() => navigate("/video-creator")}
                    className="gap-2 cursor-pointer"
                  >
                    <Film className="h-4 w-4" />
                    Create Video
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Avatars</h2>
            {avatars.length > 0 && (
              <Button variant="ghost" size="sm" className="text-muted-foreground cursor-pointer">
                View all
              </Button>
            )}
          </div>

          {avatarsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : avatars.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Image className="h-10 w-10 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No avatars yet. Create your first avatar to get started.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/video-creator")}
                    className="gap-2 mt-2 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Create Avatar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {avatars.map((avatar) => (
                <Card key={avatar.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-square bg-muted/50 relative overflow-hidden">
                    {avatar.images[0] ? (
                      <img
                        src={avatar.images[0].url}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium truncate">{avatar.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {avatar.images.length} image{avatar.images.length !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Videos</h2>
            {videos.length > 0 && (
              <Button variant="ghost" size="sm" className="text-muted-foreground cursor-pointer">
                View all
              </Button>
            )}
          </div>

          {videosLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : videos.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Film className="h-10 w-10 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No videos yet. Create your first identity video.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/video-creator")}
                    className="gap-2 mt-2 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Create Video
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-video bg-muted/50 relative overflow-hidden">
                    {video.status === "Done" && (video.url || video.endFrame) ? (
                      <video
                        src={video.url || video.endFrame}
                        controls
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {video.status === "Pending" ? (
                          <Loader2 className="h-8 w-8 text-muted-foreground/30 animate-spin" />
                        ) : video.status === "Error" ? (
                          <XCircle className="h-8 w-8 text-destructive/50" />
                        ) : (
                          <Film className="h-8 w-8 text-muted-foreground/30" />
                        )}
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          video.status === "Done"
                            ? "bg-emerald-500/90 text-white"
                            : video.status === "Pending"
                              ? "bg-amber-500/90 text-white"
                              : "bg-destructive/90 text-white"
                        }`}
                      >
                        {video.status === "Done" && <CheckCircle className="h-3 w-3" />}
                        {video.status === "Pending" && <Clock className="h-3 w-3" />}
                        {video.status === "Error" && <XCircle className="h-3 w-3" />}
                        {video.status}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm truncate">{video.prompt}</p>
                    {video.duration && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {video.duration}s &middot; {video.width}x{video.height}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
