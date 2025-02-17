
import { ArrowRight, Play, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">VideoSage</div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-sm">Sign In</Button>
              <Button className="text-sm">Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-padding pt-32 min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-8 fade-in">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Transform Your Videos with AI-Powered Analysis
            </h1>
            <p className="text-lg text-gray-600 md:text-xl">
              Upload your videos and get instant, accurate answers to any question about their content.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" className="text-base">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-base">
                Watch Demo <Play className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for Video Analysis
            </h2>
            <p className="text-gray-600 text-lg">
              Everything you need to understand and interact with your video content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 slide-in hover:shadow-lg transition-shadow">
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="section-padding bg-gray-50">
        <div className="container mx-auto text-center text-gray-600">
          <p>&copy; 2024 VideoSage. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: Zap,
    title: "Instant Analysis",
    description: "Get immediate insights from your videos with our advanced AI technology."
  },
  {
    icon: Shield,
    title: "Secure Storage",
    description: "Your videos are encrypted and stored securely in the cloud."
  },
  {
    icon: Play,
    title: "Interactive Playback",
    description: "Jump to specific moments mentioned in the analysis with precise timestamps."
  }
];

export default Index;
