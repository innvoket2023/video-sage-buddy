import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send, Play, Film } from "lucide-react";
import axios from "axios";

// Define the message type
type Message = {
  type: "bot" | "user";
  content: string;
  timestamp?: string; // Make timestamp optional
};

// Define the video type
type Video = {
  publicID: string;
  video_url: string;
  description?: string;
  transcript?: string;
  processed?: boolean;
  index_path?: string;
};

const ChatbotPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "bot",
      content: "Hello! I'm ready to help you analyze your videos. What would you like to know?"
    },
  ]);
  const [input, setInput] = useState("");
  const [videos, setVideos] = useState<Video[]>([]); // State to store video objects
  const [selectedVideo, setSelectedVideo] = useState<string>(""); // State to store selected video ID
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null); // Video details to display
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  console.log(input)

  // Fetch videos when the component mounts
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // Get video list with full details
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/preview`);
        console.log("Videos response:", response.data);
        setVideos(response.data.videos || []);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideos();
  }, []);

  // Update current video when selection changes
  useEffect(() => {
    if (selectedVideo) {
      // Find the selected video in our videos array
      const videoDetails = videos.find(video => video.publicID === selectedVideo);

      if (videoDetails) {
        setCurrentVideo(videoDetails);
      } else {
        setCurrentVideo(null);
      }

      // Reset messages when changing videos
      setMessages([
        {
          type: "bot",
          content: `I'm ready to answer questions about "${selectedVideo}". What would you like to know?`
        },
      ]);
    } else {
      setCurrentVideo(null);
    }
  }, [selectedVideo, videos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Validate if a video is selected
    if (!selectedVideo) {
      setMessages([
        ...messages,
        { type: "user", content: input },
        { type: "bot", content: "Please select a video first before asking questions." }
      ]);
      setInput("");
      return;
    }

    // Add user message
    setMessages([...messages, { type: "user", content: input }]);
    // Clear input
    setInput("");

    setLoading(true);

    try {
      // Query the backend with the selected video name
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/query`, null, {
        params: {
          query: input,
          video_name: selectedVideo
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })


      const results = response.data.results;

      // Add bot response
      if (results.length > 0) {
        setMessages(prev => [
          ...prev,
          {
            type: "bot",
            content: results[0].content,
            timestamp: results[0].timestamp,
          },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            type: "bot",
            content: "I couldn't find any relevant information in this video.",
          },
        ]);
      }
    } catch (error) {
      console.error("Error querying video:", error);
      setMessages(prev => [
        ...prev,
        {
          type: "bot",
          content: "An error occurred while processing your request.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAtTimestamp = (timestamp: string) => {
    if (videoRef.current && timestamp) {
      // Convert timestamp (like "1:30") to seconds
      const parts = timestamp.split(':').map(Number);
      let seconds = 0;

      // Handle different timestamp formats (HH:MM:SS or MM:SS)
      if (parts.length === 3) {
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        seconds = parts[0] * 60 + parts[1];
      }

      // Set video time and play
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(err => {
        console.error("Error playing video:", err);
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-2rem)] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Video Chat</h1>
            <p className="text-gray-600">Ask questions about your videos</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedVideo}
              onChange={(e) => setSelectedVideo(e.target.value)}
            >
              <option value="">Select a video</option>
              <option value="all">All Videos</option>
              {videos.map((video, index) => (
                <option key={index} value={video.publicID}>
                  {video.publicID}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-6 flex-1">
          {/* Chat Section */}
          <div className="flex-1 flex flex-col">
            <Card className="flex-1 overflow-hidden flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${message.type === "user"
                        ? "bg-primary text-white"
                        : "bg-gray-100"
                        }`}
                    >
                      <p>{message.content}</p>
                      {message.timestamp && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mt-2"
                          onClick={() => handlePlayAtTimestamp(message.timestamp || '')}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Play at {message.timestamp}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-4 rounded-lg bg-gray-100">
                      <p>Thinking...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      selectedVideo
                        ? `Ask a question about "${selectedVideo}"...`
                        : "Please select a video first..."
                    }
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={!selectedVideo || loading}
                  />
                  <Button type="submit" disabled={!selectedVideo || loading}>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Video Preview */}
          <Card className="w-96">
            <div className="aspect-video bg-gray-100 relative">
              {selectedVideo && currentVideo?.video_url ? (
                <video
                  ref={videoRef}
                  id="video-preview"
                  key={selectedVideo}
                  controls
                  className="w-full h-full"
                >
                  <source src={currentVideo.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : selectedVideo ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Film className="h-16 w-16 text-gray-400 mb-2" />
                  <p className="text-gray-500 font-medium">Video loading or unavailable</p>
                  <p className="text-sm text-gray-400">Selected: {selectedVideo}</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-400">No video selected</p>
                </div>
              )}
            </div>
            <div className="p-4">
              {currentVideo ? (
                <>
                  <h3 className="font-medium">{currentVideo.publicID}</h3>
                  {currentVideo.description && (
                    <p className="text-sm text-gray-600 mt-1">{currentVideo.description}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Please select a video from the dropdown</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatbotPage;