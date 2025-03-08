import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Search, Filter, MoreVertical } from "lucide-react";
import axios from "axios";
import VideoUploadDialog from "@/components/VideoUploadDialog";

const VideoLibrary = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [videos, setVideos] = useState([]);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/videos`);
      const fetchedVideos = response.data.videos.map((videoName, index) => ({
        id: videos.length + index + 1,
        title: videoName,
        thumbnail: "/placeholder.svg",
        date: new Date().toISOString().split("T")[0], // Today's date
        status: "Processed",
      }));

      // Combine existing videos with new ones
      setVideos((prevVideos) => {
        // Filter out any duplicates based on title
        const existingTitles = new Set(prevVideos.map((v) => v.title));
        const newVideos = fetchedVideos.filter(
          (v) => !existingTitles.has(v.title)
        );
        return [...prevVideos, ...newVideos];
      });
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
          {videos.map((video) => (
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
          ))}
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

