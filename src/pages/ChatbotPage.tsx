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
  timestamp?: string;
};

// Define the video type
type Video = {
  video_name: string;
  video_url: string;
  public_id: string;
};

const ChatbotPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Fetch videos from backend
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/videos");
        setVideos(response.data.videos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };
    fetchVideos();
  }, []);

  // Reset messages when changing videos
  useEffect(() => {
    if (selectedVideo) {
      setMessages([
        { 
          type: "bot", 
          content: `I'm ready to answer questions about the selected video. What would you like to know?` 
        },
      ]);
    }
  }, [selectedVideo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedVideo) return;
    
    setMessages([...messages, { type: "user", content: input }]);
    setInput("");
    setLoading(true);
    
    try {
      const response = await axios.post("http://127.0.0.1:5000/query", {
        query: input,
        video_url: selectedVideo,
      });
      const results = response.data.results;
      
      if (results.length > 0) {
        setMessages(prev => [
          ...prev,
          { type: "bot", content: results[0].content, timestamp: results[0].timestamp },
        ]);
      } else {
        setMessages(prev => [...prev, { type: "bot", content: "No relevant information found in this video." }]);
      }
    } catch (error) {
      console.error("Error querying video:", error);
      setMessages(prev => [...prev, { type: "bot", content: "An error occurred while processing your request." }]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAtTimestamp = (timestamp: string) => {
    if (videoRef.current) {
      const [minutes, seconds] = timestamp.split(":").map(Number);
      const timeInSeconds = minutes * 60 + seconds;
      videoRef.current.currentTime = timeInSeconds;
      videoRef.current.play();
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
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => setSelectedVideo(e.target.value)}
            value={selectedVideo}
          >
            <option value="">Select a video</option>
            {videos.map((video) => (
              <option key={video.public_id} value={video.video_url}>
                {video.video_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-6 flex-1">
          {/* Chat Section */}
          <Card className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-4 rounded-lg ${message.type === "user" ? "bg-primary text-white" : "bg-gray-100"}`}>
                    <p>{message.content}</p>
                    {message.timestamp && (
                      <Button variant="secondary" size="sm" className="mt-2" onClick={() => handlePlayAtTimestamp(message.timestamp)}>
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
                  placeholder={selectedVideo ? "Ask a question about this video..." : "Please select a video first..."}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={!selectedVideo || loading}
                />
                <Button type="submit" disabled={!selectedVideo || loading}>
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? "Processing..." : "Send"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Video Preview */}
          <Card className="w-96">
            <div className="aspect-video bg-gray-100 relative">
              {selectedVideo ? (
                <video ref={videoRef} id="video-preview" key={selectedVideo} controls className="w-full h-full">
                  <source src={selectedVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Film className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium">{videos.find(video => video.video_url === selectedVideo)?.video_name || "No video selected"}</h3>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatbotPage;
