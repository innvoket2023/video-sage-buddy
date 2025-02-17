
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send, Play, Film } from "lucide-react";

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { type: "bot", content: "Hello! I'm ready to help you analyze your videos. What would you like to know?" },
  ]);
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages([...messages, { type: "user", content: input }]);
    // Clear input
    setInput("");
    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: "bot",
        content: "I've analyzed the video and found relevant information. The key points are discussed at 2:34 in the video. Would you like me to play that section?",
        timestamp: "2:34"
      }]);
    }, 1000);
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
            <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select a video</option>
              <option value="1">Marketing Presentation</option>
              <option value="2">Product Demo</option>
              <option value="3">Team Meeting</option>
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
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.type === "user"
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
                    placeholder="Ask a question about your video..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button type="submit">
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
              <div className="absolute inset-0 flex items-center justify-center">
                <Film className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium">Marketing Presentation</h3>
              <p className="text-sm text-gray-600">12:34 duration</p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatbotPage;
