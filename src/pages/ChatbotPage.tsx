import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send, Play, Film, Loader2 } from "lucide-react";

type Message = {
  type: "bot" | "user";
  content: string;
  timestamp?: string;
  videoUrl?: string;
};

type Video = {
  video_name: string;
  video_url: string;
  public_id: string;
};

type QueryResult = {
  content: string;
  timestamp: string;
  source: string;
  video_url: string;
};

const ChatbotPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    { type: "bot", content: "Hello! I'm ready to help you analyze your videos. What would you like to know?" },
  ]);
  const [input, setInput] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  // Fetch videos from Cloudinary via Flask API
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { type: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call the query API
      const response = await axios.post("http://127.0.0.1:5000/query", {
        query: input,
      });

      const results = response.data.results as QueryResult[];

      if (results && results.length > 0) {
        // Format response from results
        const firstResult = results[0];
        
        // Create a response message with timestamp and video info
        const botMessage: Message = {
          type: "bot",
          content: `I found this information: ${firstResult.content}`,
          timestamp: firstResult.timestamp,
          videoUrl: firstResult.video_url,
        };

        // If there are additional results, add them to the message
        if (results.length > 1) {
          botMessage.content += "\n\nI also found these related sections:";
          for (let i = 1; i < results.length; i++) {
            botMessage.content += `\n- At ${results[i].timestamp}: ${results[i].content.substring(0, 100)}...`;
          }
        }

        // If the result is from a different video than currently selected, mention it
        if (firstResult.video_url !== selectedVideo && firstResult.video_url) {
          botMessage.content += `\n\nThis information is from the video "${firstResult.source}". Would you like me to switch to that video?`;
          
          // If no video is currently selected, automatically select this one
          if (!selectedVideo) {
            setSelectedVideo(firstResult.video_url);
          }
        }
        
        setMessages((prev) => [...prev, botMessage]);
      } else {
        // No results found
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            content: "I couldn't find any relevant information in the videos. Could you try rephrasing your question?",
          },
        ]);
      }
    } catch (error) {
      console.error("Error querying video content:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: "Sorry, I encountered an error while searching for information. Please make sure videos have been processed.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAtTimestamp = (timestamp: string, videoUrl?: string) => {
    // If a specific video URL is provided and it's different from the current one, switch to it
    if (videoUrl && videoUrl !== selectedVideo) {
      setSelectedVideo(videoUrl);
      
      // We need to wait for the video to load before seeking
      setTimeout(() => {
        seekToTimestamp(timestamp);
      }, 500);
    } else {
      // If we're already on the right video, just seek
      seekToTimestamp(timestamp);
    }
  };

  const seekToTimestamp = (timestamp: string) => {
    if (!videoRef) return;
    
    // Convert timestamp (e.g., "1:30" or "1:30:45") to seconds
    const parts = timestamp.split(':').map(Number);
    let seconds = 0;
    
    if (parts.length === 3) {
      // Hours:Minutes:Seconds
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // Minutes:Seconds
      seconds = parts[0] * 60 + parts[1];
    } else {
      // Just seconds
      seconds = parts[0];
    }
    
    // Set the current time and play
    videoRef.currentTime = seconds;
    videoRef.play().catch(err => console.error("Error playing video:", err));
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
        </div>

        <div className="flex gap-6 flex-1">
          {/* Chat Section */}
          <div className="flex-1 flex flex-col">
            <Card className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.type === "user" ? "bg-primary text-white" : "bg-gray-100"
                      }`}
                    >
                      <p className="whitespace-pre-line">{message.content}</p>
                      {message.timestamp && (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => handlePlayAtTimestamp(message.timestamp || "", message.videoUrl)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Play at {message.timestamp}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-4 rounded-lg bg-gray-100">
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Searching videos...
                      </div>
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
                    placeholder="Ask a question about your video..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Video Preview */}
          <Card className="w-96">
            <div className="aspect-video bg-gray-100 relative">
              {selectedVideo ? (
                <video 
                  ref={(el) => setVideoRef(el)} 
                  controls 
                  className="w-full h-full"
                >
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
              <h3 className="font-medium">
                {videos.find((video) => video.video_url === selectedVideo)?.video_name || "No video selected"}
              </h3>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatbotPage;