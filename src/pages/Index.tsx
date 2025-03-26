import {
  ArrowRight,
  Play,
  Shield,
  Zap,
  MessageSquare,
  CloudLightning,
  Globe,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">VideoSage</div>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Testimonials
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="text-sm"
                onClick={() => navigate("/signin")}
              >
                Sign In
              </Button>
              <Button className="text-sm" onClick={() => navigate("/signup")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-padding pt-32 min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(155,135,245,0.1),transparent)]" />
        <div className="container mx-auto relative">
          <div className="text-center max-w-3xl mx-auto space-y-8 fade-in">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Transform Your Videos with AI-Powered Analysis
            </h1>
            <p className="text-lg text-gray-600 md:text-xl">
              Upload your videos and get instant, accurate answers to any
              question about their content. Powered by advanced AI technology.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-base w-full sm:w-auto">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base w-full sm:w-auto"
              >
                Watch Demo <Play className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="pt-8 flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                14-day free trial
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for Video Analysis
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Everything you need to understand and interact with your video
              content, powered by state-of-the-art AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 slide-in hover:shadow-lg transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="section-padding bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Content Creators
            </h2>
            <p className="text-gray-600 text-lg">
              See what our users are saying about VideoSage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="p-8 hover:shadow-lg transition-shadow"
              >
                <p className="text-gray-600 mb-6">{testimonial.content}</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200" />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section-padding bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-600 text-lg">
              Choose the plan that's right for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className="p-8 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={index === 1 ? "default" : "outline"}
                >
                  Get Started
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Video Content?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of content creators who are already using VideoSage
          </p>
          <Button size="lg" variant="secondary" className="text-primary">
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="section-padding bg-gray-900 text-gray-400">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="hover:text-white">
                    Testimonials
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center">
            <p>&copy; 2024 VideoSage. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: Zap,
    title: "Instant Analysis",
    description:
      "Get immediate insights from your videos with our advanced AI technology.",
  },
  {
    icon: Shield,
    title: "Secure Storage",
    description: "Your videos are encrypted and stored securely in the cloud.",
  },
  {
    icon: MessageSquare,
    title: "AI Chat Interface",
    description:
      "Ask questions about your videos and get accurate, contextual answers.",
  },
  {
    icon: Play,
    title: "Interactive Playback",
    description:
      "Jump to specific moments mentioned in the analysis with precise timestamps.",
  },
  {
    icon: CloudLightning,
    title: "Fast Processing",
    description:
      "Upload and process videos quickly with our optimized infrastructure.",
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Access your videos and insights from anywhere in the world.",
  },
];

const testimonials = [
  {
    content:
      "VideoSage has revolutionized how we analyze our educational content. The AI-powered insights are incredibly accurate and save us hours of manual work.",
    name: "Sarah Johnson",
    role: "Educational Content Creator",
  },
  {
    content:
      "The ability to instantly search through video content and get precise answers has transformed our training process. It's like having a video expert on demand.",
    name: "Michael Chen",
    role: "Corporate Training Manager",
  },
  {
    content:
      "As a YouTuber, VideoSage helps me understand my content better and make data-driven decisions about future videos. It's an invaluable tool.",
    name: "Alex Rodriguez",
    role: "Content Creator",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "29",
    features: [
      "5 hours of video processing",
      "Basic AI analysis",
      "Email support",
      "1 user account",
    ],
  },
  {
    name: "Professional",
    price: "99",
    features: [
      "25 hours of video processing",
      "Advanced AI analysis",
      "Priority support",
      "5 user accounts",
      "Custom integrations",
    ],
  },
  {
    name: "Enterprise",
    price: "299",
    features: [
      "Unlimited video processing",
      "Custom AI models",
      "24/7 premium support",
      "Unlimited users",
      "API access",
    ],
  },
];

export default Index;
