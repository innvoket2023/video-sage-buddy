import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Send,
  Play,
  Film,
  Trash2,
  Volume2,
  VolumeX,
  AudioLines,
} from "lucide-react";
import {
  fetchVideos,
  queryVideo,
  sendVideoURL,
  readMessage,
} from "@/api/chatbotApi";

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
  const [readingMessage, setReadingMessage] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const [voiceAvailable, setVoiceAvailable] = useState<boolean>(false);
  const [voiceLoading, setVoiceLoading] = useState<boolean>(false);
  const [voiceError, setVoiceError] = useState<boolean>(false);

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

    // Reset voice states when changing videos
    setVoiceAvailable(false);
    setVoiceLoading(false);
    setVoiceError(false);
  }, [selectedVideo]);

  // Update current video details when previewVideoId changes
  useEffect(() => {
    if (previewVideoId) {
      const videoDetails = videos.find(
        (video) => video.publicID === previewVideoId
      );
      if (videoDetails) {
        setCurrentVideo(videoDetails);
        if (voiceEnabled) {
          // Initialize voice processing when video changes
          initializeVoiceForVideo(videoDetails.video_url);
        }
      } else {
        setCurrentVideo(null);
      }
    } else {
      setCurrentVideo(null);
    }
  }, [previewVideoId, videos, voiceEnabled]);

  // Stop audio playback when changing videos
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setReadingMessage(null);
    }
  }, [selectedVideo]);

  // Initialize voice for a video
  const initializeVoiceForVideo = async (videoUrl) => {
    if (!videoUrl) return;

    setVoiceLoading(true);
    setVoiceAvailable(false);
    setVoiceError(false);

    try {
      const response = await sendVideoURL(videoUrl);
      setVoiceAvailable(true);
      setVoiceLoading(false);
    } catch (error) {
      // Check if it's a 409 error (conflict - voice clone already exists)
      if (error.response && error.response.status === 409) {
        setVoiceAvailable(true);
        setVoiceLoading(false);
      } else {
        // Handle other errors
        setVoiceError(true);
        setVoiceLoading(false);
        console.error("Error initializing voice:", error);
      }
    }
  };

  //^ Voice Toggle
  const toggleVoice = () => {
    const newVoiceEnabled = !voiceEnabled;
    setVoiceEnabled(newVoiceEnabled);

    if (newVoiceEnabled && currentVideo) {
      // Initialize voice when enabling
      initializeVoiceForVideo(currentVideo.video_url);
    }

    //^ Stop any playing audio when turning voice off
    if (voiceEnabled && audioRef.current) {
      audioRef.current.pause();
      setReadingMessage(null);
    }
  };

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

  //^ function to remove timestamps from message
  const removeTimeStampsFromMessage = (content: string) => {
    const timestampRegex = /\[(\d{2}:\d{2}:\d{2})\]/g;
    return content.replace(timestampRegex, "").trim();
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

  // Handle reading a message using TTS
  const handleReadMessage = async (messageContent: string, index: number) => {
    if (!voiceEnabled || !currentVideo || !voiceAvailable) return;

    try {
      setReadingMessage(index);

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      // Remove timestamps from message before sending to TTS
      const cleanMessage = removeTimeStampsFromMessage(messageContent);

      // Call readMessage API with responseType blob
      const response = await readMessage(currentVideo.video_url, cleanMessage);

      // Create audio element and play
      const audio = new Audio();
      audioRef.current = audio;

      // Set up event handlers
      audio.onended = () => {
        setReadingMessage(null);
      };

      audio.onerror = (e) => {
        console.error("Error playing audio:", e);
        setReadingMessage(null);
      };

      // Set the source and play
      audio.src = URL.createObjectURL(response);
      audio.play().catch((err) => {
        console.error("Error playing audio:", err);
        setReadingMessage(null);
      });
    } catch (error) {
      console.error("Error reading message:", error);
      setReadingMessage(null);
    }
  };

  // Handle video selection changes
  const handleVideoSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVideo(e.target.value);
  };

  //^ Delete Chat Messages
  const handleDeleteChat = () => {
    setMessages([
      {
        type: "bot",
        content:
          selectedVideo === "all"
            ? "I'm ready to answer questions about all your videos. What would you like to know?"
            : selectedVideo
            ? `I'm ready to answer questions about "${selectedVideo}". What would you like to know?`
            : "Hello! I'm ready to help you analyze your videos. What would you like to know?",
      },
    ]);

    setInput("");
  };

  // Get button text based on voice status
  const getVoiceButtonText = () => {
    if (voiceLoading) return "Loading Voice...";
    if (voiceError) return "Voice Error";
    return voiceEnabled ? "Voice On" : "Voice Off";
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Video Chat</h1>
            <p className="text-gray-600">Ask questions about your videos</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Voice toggle button */}
            <Button
              variant={voiceEnabled ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-1"
              onClick={toggleVoice}
              title={voiceEnabled ? "Mute Voice" : "Enable Voice"}
              disabled={voiceLoading}
            >
              {voiceLoading ? (
                <>
                  <AudioLines className="h-4 w-4 animate-pulse" />
                  <span className="text-xs">Loading Voice...</span>
                </>
              ) : voiceEnabled ? (
                <>
                  <AudioLines className="h-4 w-4" />
                  <span className="text-xs">Voice On</span>
                </>
              ) : (
                <>
                  <AudioLines className="h-4 w-4" />
                  <span className="text-xs">Voice Off</span>
                </>
              )}
            </Button>
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

        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* Chat Section */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Card className="flex-1 overflow-y-auto flex flex-col">
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

                      {message.type === "bot" && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {message.timestamp && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                handlePlayAtTimestamp(message.timestamp || "")
                              }
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Play at {message.timestamp}
                            </Button>
                          )}

                          {/* Read Message Button */}
                          {voiceEnabled && (
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={
                                !voiceEnabled ||
                                !currentVideo ||
                                readingMessage === index ||
                                voiceLoading ||
                                !voiceAvailable ||
                                voiceError
                              }
                              onClick={() =>
                                handleReadMessage(message.content, index)
                              }
                              className={
                                readingMessage === index ? "bg-blue-100" : ""
                              }
                              title={
                                voiceLoading
                                  ? "Voice is loading..."
                                  : voiceError
                                  ? "Voice error occurred"
                                  : !voiceAvailable
                                  ? "Voice not available yet"
                                  : "Read message aloud"
                              }
                            >
                              {readingMessage === index ? (
                                <>
                                  <Volume2 className="h-4 w-4 mr-2 animate-pulse" />
                                  Reading...
                                </>
                              ) : (
                                <>
                                  <Volume2 className="h-4 w-4 mr-2" />
                                  Read Message
                                </>
                              )}
                            </Button>
                          )}
                        </div>
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
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleDeleteChat}
                    title="Clear chat history"
                    className="bg-white hover:bg-red-600 text-red-600 hover:text-white"
                    disabled={!selectedVideo || loading}
                  >
                    <Trash2 className="h-4 w-4 hover:text-red-600" />
                  </Button>
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
          <div className="w-96 flex-shrink-0 sticky top-4 h-[calc(100vh-3rem)]">
            <Card className="h-full">
              <div className="aspect-video bg-gray-100 sticky">
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
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{currentVideo.publicID}</h3>
                    </div>
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
      </div>
    </DashboardLayout>
  );
};

export default ChatbotPage;
