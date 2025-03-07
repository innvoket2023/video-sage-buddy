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
  video_name: string;
  duration?: string;
  public_id: string;
  video_url: string;
};

const ChatbotPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "bot",
      content: "Hello! I'm ready to help you analyze your videos. What would you like to know?"
    },
  ]);
  const [input, setInput] = useState("");
  const [videos, setVideos] = useState<Video[]>([]); // State to store video names
  const [selectedVideo, setSelectedVideo] = useState<string>(""); // State to store selected video
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null); // Video details to display
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Fetch video names when the component mounts
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get("http://localhost:5000/videos");

        console.log("response",response )
        setVideos(response.data.videos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideos();
  }, []);

  // Update current video when selection changes
  useEffect(() => {
    if (selectedVideo) {
      // You can fetch additional video details here if needed
      setCurrentVideo({
        name: selectedVideo,
        duration: "12:34" // This would ideally come from the backend
      });

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
  }, [selectedVideo]);

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

    try {
      // Query the backend with the selected video name
      const response = await axios.post("http://localhost:5000/query", {
        query: input,
        video_name: selectedVideo, // Pass the selected video name
      });
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
    }
  };

  const handlePlayAtTimestamp = (timestamp: string) => {
    // This would be implemented to play the video at the specific timestamp
    console.log(`Playing video at timestamp: ${timestamp}`);
    // You could integrate with a video player API here
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
              <option value="all">All Videos</option> {/* Add this line */}
              {videos.map((video, index) => (
                <option key={index} value={video}>
                  {video}
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
                    disabled={!selectedVideo}
                  />
                  <Button type="submit" disabled={!selectedVideo}>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Video Preview */}
          console.log(video.video);
          
          <Card className="w-96">
            <div className="aspect-video bg-gray-100 relative">
              {selectedVideo ? (
                // <div className="absolute inset-0 flex flex-col items-center justify-center">
                //   <Film className="h-16 w-16 text-gray-400 mb-2" />
                //   <p className="text-gray-500 font-medium">Preview not available</p>
                //   <p className="text-sm text-gray-400">Video loaded and ready for queries</p>
                // </div>
                <video ref={videoRef} id="video-preview" key={selectedVideo} controls className="w-full h-full">
                  <source src={videos.find(video => video.publicId === selectedVideo)?.video_url} type="video/mp4" /></video>

              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-400">No video selected</p>
                </div>
              )}
            </div>
            <div className="p-4">
              {currentVideo ? (
                <>
                  <h3 className="font-medium">{currentVideo.name}</h3>
                  {currentVideo.duration && (
                    <p className="text-sm text-gray-600">{currentVideo.duration} duration</p>
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
