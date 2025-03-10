import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Search, Filter, MoreVertical } from "lucide-react";
import axios from "axios";
import VideoUploadDialog from "@/components/VideoUploadDialog";

const parseThumbnailUrl = (videoUrl) => {
  if (!videoUrl) return "/placeholder.svg";
  const lastDotIndex = videoUrl.lastIndexOf(".");
  const reqIndex = videoUrl.lastIndexOf("/v");
  if (lastDotIndex === -1) return videoUrl;
  let finalUrl = videoUrl.substring(0, lastDotIndex) + ".jpg";
  finalUrl =
    finalUrl.slice(0, reqIndex) + "/c_fill/so_auto" + finalUrl.slice(reqIndex);
  return finalUrl;
};

const VideoLibrary = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${API_URL}/preview`);
      if (response.data.videos && Array.isArray(response.data.videos)) {
        const fetchedVideos = response.data.videos.map((video, index) => ({
          id: index + 1,
          title: video.publicID || "Untitled Video",
          description: video.description || "",
          thumbnail: parseThumbnailUrl(video.video_url),
          videoUrl: video.video_url,
          date: new Date().toISOString().split("T")[0], // Today's date
          status: video.processed ? "Processed" : "Processing",
        }));

        setVideos(fetchedVideos);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadComplete = () => {
    fetchVideos();
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Video Library</h1>
            <p className="text-gray-600">Manage and analyze your videos</p>
          </div>
          <div>
            <Button onClick={handleUploadClick}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Video
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search videos..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.length > 0 ? (
            videos.map((video) => (
              <Card
                key={video.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{video.title}</h3>
                      <p className="text-sm text-gray-600">{video.date}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2">
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        video.status === "Processed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {video.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No videos found. Upload a video to get started.
            </div>
          )}
        </div>
      </div>

      <VideoUploadDialog
        open={uploadDialogOpen}
        setOpen={(isOpen) => {
          setUploadDialogOpen(isOpen);
          if (!isOpen) {
            handleUploadComplete();
          }
        }}
      />
    </DashboardLayout>
  );
};

export default VideoLibrary;
