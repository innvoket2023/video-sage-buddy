import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Search, Filter, MoreVertical } from "lucide-react";
import { useState } from "react";
import VideoUploadDialog from "./VideoUploadDialog";

const VideoLibrary = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const videos = [
    {
      id: 1,
      title: "Marketing Presentation",
      thumbnail: "/placeholder.svg",
      duration: "12:34",
      date: "2024-02-15",
      status: "Processed",
    },
    {
      id: 2,
      title: "Product Demo",
      thumbnail: "/placeholder.svg",
      duration: "08:45",
      date: "2024-02-14",
      status: "Processing",
    },
    {
      id: 3,
      title: "Team Meeting",
      thumbnail: "/placeholder.svg",
      duration: "45:21",
      date: "2024-02-13",
      status: "Processed",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Video Library</h1>
            <p className="text-gray-600">Manage and analyze your videos</p>
          </div>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
          <VideoUploadDialog
            open={uploadDialogOpen}
            setOpen={setUploadDialogOpen}
          />
        </div>

        {/* Search and Filter */}
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

        {/* Video Grid */}
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
                <span className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-sm">
                  {video.duration}
                </span>
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
    </DashboardLayout>
  );
};

export default VideoLibrary;
