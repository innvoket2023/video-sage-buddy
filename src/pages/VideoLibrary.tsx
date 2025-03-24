import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Clock,
  CalendarDays,
} from "lucide-react";
import VideoUploadDialog from "@/components/VideoUploadDialog";
import VideoPlayerDialog from "@/components/VideoPlayerDialog";
import { fetchVideos, deleteVideo } from "@/api/videoLibraryApi";

const DropdownMenu = ({ top, left, onDelete, dropdownRef }) => {
  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed rounded-md shadow-lg bg-white hover:bg-gray-100 ring-1 ring-black ring-opacity-5 z-50"
      style={{ top, left, width: "140px" }}
    >
      <div
        className="py-2 px-4 flex items-center gap-2 cursor-pointer"
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
  const [selectedFilter, setSelectedFilter] = useState(null);

  const dropdownRef = useRef(null);
  const buttonRefs = useRef({});
  const filterRef = useRef(null);

  // Fetch videos on component mount
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const fetchedVideos = await fetchVideos();
        setVideos(fetchedVideos);
      } catch (error) {
        console.error("Error loading videos:", error);
      }
    };
    loadVideos();
  }, []);

  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadComplete = async () => {
    try {
      const fetchedVideos = await fetchVideos();
      setVideos(fetchedVideos);
    } catch (error) {
      console.error("Error updating videos after upload:", error);
    }
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
      await deleteVideo();
      setShowDropdown(null);
      const fetchedVideos = await fetchVideos();
      setVideos(fetchedVideos);
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

  const handleFilterChange = (value) => {
    if (value === "reset") {
      setSelectedFilter(null);
    } else {
      setSelectedFilter(value);
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
              onChange={handleSearch}
            />
          </div>
          <Select value={selectedFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-fit flex items-center justify-center gap-1">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter By" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="reset">
                  <span className="text-sm text-gray-500">Clear Filter</span>
                </SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
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
