import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Search, Filter, MoreVertical, Trash2 } from "lucide-react";
import axios from "axios";
import VideoUploadDialog from "@/components/VideoUploadDialog";
import VideoPlayerDialog from "@/components/VideoPlayerDialog";

const parseThumbnailUrl = (videoUrl) => {
  if (!videoUrl) return "/placeholder.svg";
  const lastDotIndex = videoUrl.lastIndexOf(".");
  const versionRegex = /\/v\d+/g;
  const versionResult = videoUrl.match(versionRegex);
  const reqIndex = videoUrl.lastIndexOf(versionResult);
  if (lastDotIndex === -1) return videoUrl;
  let finalUrl = videoUrl.substring(0, lastDotIndex) + ".jpg";
  finalUrl =
    finalUrl.slice(0, reqIndex) + "/c_fill/so_auto" + finalUrl.slice(reqIndex);
  return finalUrl;
};

const DropdownMenu = ({ top, left, onDelete, dropdownRef }) => {
  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed rounded-md shadow-lg bg-white hover:bg-gray-100 ring-1 ring-black ring-opacity-5 z-50"
      style={{ top, left, width: "140px" }}
    >
      <div
        className="py-2 px-4 flex items-center gap-2  cursor-pointer"
        role="menu"
        aria-orientation="vertical"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4 text-red-500" />
        <span className="text-sm">Delete</span>
      </div>
    </div>,
    document.body
  );
};

const VideoLibrary = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [showDropdown, setShowDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState({
    title: "",
    videoUrl: "",
  });
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [videoNotFound, setVideoNotFound] = useState("");
  const [searching, setSearching] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
  const dropdownRef = useRef(null);
  const buttonRefs = useRef({});

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

  const updateDropdownPosition = () => {
    if (showDropdown !== null && buttonRefs.current[showDropdown]) {
      const buttonElement = buttonRefs.current[showDropdown];
      const rect = buttonElement.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom,
        left: rect.right - 140,
      });
    }
  };

  const handleMoreClick = (videoId, event) => {
    event.stopPropagation();

    if (showDropdown === videoId) {
      setShowDropdown(null);
      return;
    }

    const buttonElement = buttonRefs.current[videoId];
    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom,
        left: rect.right - 140,
      });
      setShowDropdown(videoId);
    }
  };

  const handleDeleteVideo = async () => {
    try {
      await axios.delete(`${API_URL}/delete-video`, {
        data: {},
      });

      setShowDropdown(null);
      fetchVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(null);
      }
    };

    const handleScroll = () => {
      updateDropdownPosition();
    };

    if (showDropdown !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showDropdown]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleVideoClick = (video) => {
    setSelectedVideo({ title: video.title, videoUrl: video.videoUrl });
    setVideoPlayerOpen(true);
  };
  const handleSearch = (e) => {
    setSearching(true);
    const searchWord = e.target.value.toLowerCase();
    const relatedVideos = videos.filter((video) =>
      video.title.toLowerCase().includes(searchWord)
    );
    setFilteredVideos(relatedVideos);
    if (relatedVideos.length === 0) {
      setVideoNotFound(`No videos found with the name "${searchWord}".`);
    }
  };
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
              onChange={(event) => {
                handleSearch(event);
              }}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {videos.length > 0 ? (
            filteredVideos.length > 0 ? (
              filteredVideos.map((video) => (
                <Card
                  key={video.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleVideoClick(video)}
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
                      <div onClick={(e) => e.stopPropagation()}>
                        <Button
                          ref={(el) => (buttonRefs.current[video.id] = el)}
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleMoreClick(video.id, e)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : searching && videoNotFound !== "" ? (
              <div className="col-span-3 flex items-center justify-center py-8">
                <p className="text-center text-lg">{videoNotFound}</p>
              </div>
            ) : (
              videos.map((video) => (
                <Card
                  key={video.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleVideoClick(video)}
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
                      <div onClick={(e) => e.stopPropagation()}>
                        <Button
                          ref={(el) => (buttonRefs.current[video.id] = el)}
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleMoreClick(video.id, e)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )
          ) : (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No videos found. Upload a video to get started.
            </div>
          )}
        </div>
      </div>

      {/* dropdown menu */}
      {showDropdown !== null && (
        <DropdownMenu
          top={dropdownPosition.top}
          left={dropdownPosition.left}
          onDelete={handleDeleteVideo}
          dropdownRef={dropdownRef}
        />
      )}

      <VideoUploadDialog
        open={uploadDialogOpen}
        setOpen={(isOpen) => {
          setUploadDialogOpen(isOpen);
          if (!isOpen) {
            handleUploadComplete();
          }
        }}
      />
      <VideoPlayerDialog
        open={videoPlayerOpen}
        setOpen={setVideoPlayerOpen}
        videoTitle={selectedVideo.title}
        videoUrl={selectedVideo.videoUrl}
      />
    </DashboardLayout>
  );
};

export default VideoLibrary;
