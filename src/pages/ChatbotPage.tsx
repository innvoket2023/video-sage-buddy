import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send, Play, Film } from "lucide-react";
import { fetchVideos, queryVideo } from "@/api/chatbotApi"; // Import API functions

// Define the message type
type Message = {
  type: "bot" | "user";
  content: string;
  timestamp?: string; // Make timestamp optional
  source?: string;
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
      content:
        "Hello! I'm ready to help you analyze your videos. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [videos, setVideos] = useState<Video[]>([]); // State to store video objects
  const [selectedVideo, setSelectedVideo] = useState<string>(""); // State to store selected video ID
  const [previewVideoId, setPreviewVideoId] = useState<string>("");
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null); // Video details to display
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Fetch videos when the component mounts
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

  // Update preview video ID when selection changes
  useEffect(() => {
    if (selectedVideo) {
      if (selectedVideo === "all") {
        setPreviewVideoId("");
      } else {
        setPreviewVideoId(selectedVideo);
      }

      // Reset messages when changing videos
      setMessages([
        {
          type: "bot",
          content:
            selectedVideo === "all"
              ? "I'm ready to answer questions about all your videos. What would you like to know?"
              : `I'm ready to answer questions about "${selectedVideo}". What would you like to know?`,
        },
      ]);
    } else {
      setPreviewVideoId("");
    }
  }, [selectedVideo]);

  // Update current video details when previewVideoId changes
  useEffect(() => {
    if (previewVideoId) {
      const videoDetails = videos.find(
        (video) => video.publicID === previewVideoId
      );
      setCurrentVideo(videoDetails || null);
    } else {
      setCurrentVideo(null);
    }
  }, [previewVideoId, videos]);

  // Parse message content for timestamps
  const parseMessageWithTimestamps = (content: string) => {
    const timestampRegex = /\[(\d{2}:\d{2}:\d{2})\]/g;
    const timestamps: string[] = [];
    let match;
    while ((match = timestampRegex.exec(content)) !== null) {
      const timestamp = match[1];
      if (!timestamps.includes(timestamp)) {
        timestamps.push(timestamp);
      }
    }
    const finalContent = content.replace(timestampRegex, "");

    return (
      <>
        <p>{finalContent}</p>
        {timestamps.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {timestamps.map((timestamp, index) => (
              <Button
                key={`timestamp-btn-${index}`}
                variant="secondary"
                size="sm"
                onClick={() => handlePlayAtTimestamp(timestamp)}
              >
                <Play className="h-4 w-4 mr-2" />
                Play at {timestamp}
              </Button>
            ))}
          </div>
        )}
      </>
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Validate if a video is selected
    if (!selectedVideo) {
      setMessages([
        ...messages,
        { type: "user", content: input },
        {
          type: "bot",
          content: "Please select a video first before asking questions.",
        },
      ]);
      setInput("");
      return;
    }

    // Add user message
    setMessages([...messages, { type: "user", content: input }]);
    setInput("");
    setLoading(true);

    try {
      // Query the backend with the selected video name
      const response = await queryVideo(input, selectedVideo);
      const results = response.results;

      // Add bot response
      if (results.length > 0) {
        if (selectedVideo === "all" && results[0].source) {
          setPreviewVideoId(results[0].source);
        }

        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            content: results[0].content,
            timestamp: results[0].timestamp,
            source: results[0].source,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            content: "I couldn't find any relevant information in this video.",
          },
        ]);
      }
    } catch (error) {
      console.error("Error querying video:", error);
      setMessages((prev) => [
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

  // Handle playing video at a specific timestamp
  const handlePlayAtTimestamp = (timestamp: string) => {
    if (videoRef.current && timestamp) {
      const parts = timestamp.split(":").map(Number);
      let seconds = 0;

      if (parts.length === 3) {
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        seconds = parts[0] * 60 + parts[1];
      } else if (parts.length === 1) {
        seconds = parts[0];
      }

      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch((err) => {
        console.error("Error playing video:", err);
      });
    }
  };

  // Handle video selection changes
  const handleVideoSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVideo(e.target.value);
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
              onChange={handleVideoSelection}
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
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.type === "user"
                          ? "bg-primary text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      {message.type === "bot" ? (
                        parseMessageWithTimestamps(message.content)
                      ) : (
                        <p>{message.content}</p>
                      )}

                      {message.timestamp && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mt-2"
                          onClick={() =>
                            handlePlayAtTimestamp(message.timestamp || "")
                          }
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
                        ? `Ask a question about "${
                            selectedVideo === "all"
                              ? "all videos"
                              : selectedVideo
                          }"...`
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
              {currentVideo?.video_url ? (
                <video
                  ref={videoRef}
                  id="video-preview"
                  key={currentVideo.publicID}
                  controls
                  className="w-full h-full"
                >
                  <source src={currentVideo.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {selectedVideo ? (
                    <>
                      <Film className="h-16 w-16 text-gray-400 mb-2" />
                      <p className="text-gray-500 font-medium">
                        Video loading or unavailable
                      </p>
                      <p className="text-sm text-gray-400">
                        {selectedVideo === "all"
                          ? "Ask a question to see a relevant video"
                          : `Selected: ${selectedVideo}`}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-400">No video selected</p>
                  )}
                </div>
              )}
            </div>
            <div className="p-4">
              {currentVideo ? (
                <>
                  <h3 className="font-medium">{currentVideo.publicID}</h3>
                  {currentVideo.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {currentVideo.description}
                    </p>
                  )}
                  {selectedVideo === "all" && previewVideoId && (
                    <p className="text-xs text-gray-500 mt-2">
                      Showing video relevant to your query
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">
                  {selectedVideo === "all"
                    ? "Ask a question to see a relevant video"
                    : "Please select a video from the dropdown"}
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatbotPage;
