"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit,
  ExternalLink,
  Heart,
  Lightbulb,
  Loader2,
  Menu,
  Play,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Target,
  TrendingUp,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ChatPageProps {
  params: {
    chatId: string;
  };
}

// Enhanced interfaces based on Accio specification
interface ChatMessage {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  status: "sending" | "processing" | "completed" | "error";
  metadata?: {
    sources?: Source[];
    tasks?: TaskStep[];
    recommendations?: Recommendation[];
    processingSteps?: ProcessingStep[];
  };
}

interface TaskStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  steps: string[];
  expanded: boolean;
}

interface Source {
  id: string;
  title: string;
  url: string;
  domain: string;
  verified: boolean;
  citationNumber: number;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: "course" | "job" | "skill" | "network" | "tool";
  image?: string;
  price?: string;
  rating?: number;
  provider: string;
  url: string;
}

interface ProcessingStep {
  id: string;
  title: string;
  status: "pending" | "processing" | "completed";
  details?: string;
}

export default function ChatPage({ params }: ChatPageProps) {
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<TaskStep[]>([]);
  const [isThinking, setIsThinking] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [showResearch, setShowResearch] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  const initializeMockChatHistory = () => {
    const mockHistory: ChatMessage[] = [
      // 1. User message - completed (normal state)
      {
        id: "1",
        type: "user",
        content:
          "I want to transition from marketing to data science. What should I do?",
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        status: "completed",
      },
      // 2. AI message - completed (normal response)
      {
        id: "2",
        type: "ai",
        content:
          "Transitioning from marketing to data science is an excellent career move! Your marketing background actually provides valuable context for understanding business problems that data science can solve.",
        timestamp: new Date(Date.now() - 3590000),
        status: "completed",
      },
      {
        id: "3",
        type: "user",
        content: "What programming languages should I focus on first?",
        timestamp: new Date(Date.now() - 3000000), // 50 minutes ago
        status: "completed",
      },
      {
        id: "4",
        type: "ai",
        content:
          "For your transition to data science, I recommend starting with Python as your primary language. It's beginner-friendly and has excellent libraries for data analysis like pandas, numpy, and scikit-learn. SQL is equally important for database queries. Once comfortable with Python, consider R for statistical analysis.",
        timestamp: new Date(Date.now() - 2990000),
        status: "completed",
      },
      {
        id: "5",
        type: "user",
        content: "Can you help me create a learning roadmap?",
        timestamp: new Date(Date.now() - 2400000), // 40 minutes ago
        status: "completed",
      },
      {
        id: "6",
        type: "ai",
        content:
          "I'll create a comprehensive 6-month learning roadmap tailored to your marketing background and data science goals.",
        timestamp: new Date(Date.now() - 2390000),
        status: "completed",
        metadata: {
          sources: [
            {
              id: "1",
              title: "Data Science Career Guide 2024",
              url: "#",
              domain: "kaggle.com",
              verified: true,
              citationNumber: 1,
            },
            {
              id: "2",
              title: "Marketing to Data Science Transition",
              url: "#",
              domain: "towardsdatascience.com",
              verified: true,
              citationNumber: 2,
            },
            {
              id: "3",
              title: "Python Learning Path",
              url: "#",
              domain: "python.org",
              verified: true,
              citationNumber: 3,
            },
          ],
          recommendations: [
            {
              id: "1",
              title: "Python for Data Science Bootcamp",
              description:
                "Comprehensive course covering Python, pandas, and machine learning basics",
              type: "course",
              price: "$199",
              rating: 4.8,
              provider: "DataCamp",
              url: "#",
            },
            {
              id: "2",
              title: "Google Data Analytics Certificate",
              description:
                "Industry-recognized certificate program with hands-on projects",
              type: "course",
              price: "$49/month",
              rating: 4.7,
              provider: "Google",
              url: "#",
            },
          ],
        },
      },
      {
        id: "7",
        type: "user",
        content: "How long does it typically take to make this career change?",
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        status: "completed",
      },
      {
        id: "8",
        type: "ai",
        content:
          "With your marketing background, you can realistically transition to data science in 6-12 months with dedicated study. Your existing business acumen is valuable - you understand customer behavior, campaign performance metrics, and business objectives. Focus on technical skills (Python, SQL, statistics) while leveraging your domain knowledge.",
        timestamp: new Date(Date.now() - 1790000),
        status: "completed",
      },
      {
        id: "9",
        type: "user",
        content: "What entry-level positions should I target?",
        timestamp: new Date(Date.now() - 1200000), // 20 minutes ago
        status: "completed",
      },
      {
        id: "10",
        type: "ai",
        content:
          "Perfect question! Given your marketing background, target these entry-level roles:",
        timestamp: new Date(Date.now() - 1190000),
        status: "completed",
        metadata: {
          recommendations: [
            {
              id: "1",
              title: "Marketing Data Analyst",
              description:
                "Analyze campaign performance, customer segments, and ROI metrics",
              type: "job",
              price: "$55,000-75,000",
              rating: 4.5,
              provider: "Various Companies",
              url: "#",
            },
            {
              id: "2",
              title: "Business Intelligence Analyst",
              description:
                "Create dashboards and reports for business decision-making",
              type: "job",
              price: "$60,000-80,000",
              rating: 4.6,
              provider: "Various Companies",
              url: "#",
            },
            {
              id: "3",
              title: "Junior Data Scientist",
              description:
                "Entry-level position focusing on predictive modeling and analysis",
              type: "job",
              price: "$65,000-85,000",
              rating: 4.7,
              provider: "Tech Companies",
              url: "#",
            },
          ],
        },
      },
      {
        id: "11",
        type: "user",
        content:
          "This is very helpful! Can you recommend some practice projects?",
        timestamp: new Date(Date.now() - 600000), // 10 minutes ago
        status: "completed",
      },
      {
        id: "12",
        type: "ai",
        content:
          "Absolutely! Here are project ideas that bridge your marketing experience with data science skills:\n\n1. **Customer Segmentation Analysis** - Use clustering algorithms on customer data to identify distinct groups for targeted marketing\n\n2. **A/B Testing Analysis** - Analyze marketing campaign performance using statistical testing\n\n3. **Churn Prediction Model** - Build a machine learning model to predict customer churn\n\n4. **Social Media Sentiment Analysis** - Analyze brand mentions and sentiment using NLP techniques\n\n5. **Sales Forecasting** - Create predictive models for sales trends using historical data\n\nStart with projects using publicly available datasets from Kaggle or your own marketing data (if available).",
        timestamp: new Date(Date.now() - 590000),
        status: "completed",
      },
      // 13. User message - sending state (demonstrates pending)
      {
        id: "13",
        type: "user",
        content: "Can you help me create a portfolio website?",
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        status: "sending",
      },
      // 14. System message - connection status
      {
        id: "14",
        type: "system",
        content: "Connection restored. Your message is being processed.",
        timestamp: new Date(Date.now() - 290000),
        status: "completed",
      },
      // 15. AI message - processing with steps
      {
        id: "15",
        type: "ai",
        content: "Let me create a comprehensive portfolio plan for you...",
        timestamp: new Date(Date.now() - 280000),
        status: "processing",
        metadata: {
          processingSteps: [
            {
              id: "1",
              title: "Analyzing portfolio best practices",
              status: "completed",
            },
            {
              id: "2",
              title: "Researching design trends",
              status: "processing",
            },
            {
              id: "3",
              title: "Creating project showcase recommendations",
              status: "pending",
            },
          ],
        },
      },
      // 16. User message - error state (failed to send)
      {
        id: "16",
        type: "user",
        content: "What about networking strategies?",
        timestamp: new Date(Date.now() - 120000), // 2 minutes ago
        status: "error",
      },
      // 17. AI message - error state (failed to process)
      {
        id: "17",
        type: "ai",
        content:
          "I apologize, but I encountered an error while processing your request. This might be due to high server load or a temporary connectivity issue.",
        timestamp: new Date(Date.now() - 60000), // 1 minute ago
        status: "error",
      },
    ];

    setMessages(mockHistory);
    setIsThinking(false);
  };

  const initializeChat = (userPrompt: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: "1",
      type: "user",
      content: userPrompt,
      timestamp: new Date(),
      status: "completed",
    };

    setMessages([userMessage]);

    // Simulate AI processing with research steps
    setTimeout(() => {
      setIsThinking(false);
      simulateResearchProcess();
    }, 1000);
  };

  const simulateResearchProcess = () => {
    setShowResearch(true);
    const steps: ProcessingStep[] = [
      {
        id: "1",
        title: "Analyzing your career requirements",
        status: "completed",
      },
      {
        id: "2",
        title: "Researching current market trends",
        status: "completed",
      },
      {
        id: "3",
        title: "Finding relevant opportunities and resources",
        status: "processing",
      },
      {
        id: "4",
        title: "Compiling personalized recommendations",
        status: "pending",
      },
    ];

    setProcessingSteps(steps);

    // Simulate step-by-step completion
    setTimeout(() => {
      setProcessingSteps((prev) =>
        prev.map((step) =>
          step.id === "3" ? { ...step, status: "completed" } : step,
        ),
      );
      setTimeout(() => {
        setProcessingSteps((prev) =>
          prev.map((step) =>
            step.id === "4" ? { ...step, status: "completed" } : step,
          ),
        );
        generateAIResponse();
      }, 1500);
    }, 2000);
  };

  const generateAIResponse = () => {
    const aiMessage: ChatMessage = {
      id: "2",
      type: "ai",
      content:
        "I've analyzed your career development needs and created a comprehensive action plan tailored to your goals.",
      timestamp: new Date(),
      status: "completed",
      metadata: {
        sources: [
          {
            id: "1",
            title: "LinkedIn Career Insights 2024",
            url: "#",
            domain: "linkedin.com",
            verified: true,
            citationNumber: 1,
          },
          {
            id: "2",
            title: "Indeed Salary Trends Report",
            url: "#",
            domain: "indeed.com",
            verified: true,
            citationNumber: 2,
          },
          {
            id: "3",
            title: "Glassdoor Skills Analysis",
            url: "#",
            domain: "glassdoor.com",
            verified: true,
            citationNumber: 3,
          },
        ],
        tasks: tasks.length > 0 ? tasks : generateMockTasks(),
        recommendations: generateMockRecommendations(),
      },
    };

    setMessages((prev) => [...prev, aiMessage]);
    if (tasks.length === 0) {
      generateTasks();
    }
  };

  const generateMockRecommendations = (): Recommendation[] => {
    return [
      {
        id: "1",
        title: "Project Management Professional (PMP) Certification",
        description:
          "Industry-recognized certification for project management excellence",
        type: "course",
        price: "$2,000-3,000",
        rating: 4.8,
        provider: "Project Management Institute",
        url: "#",
      },
      {
        id: "2",
        title: "Senior Software Engineer - Tech Startup",
        description:
          "Lead engineering role with equity and growth opportunities",
        type: "job",
        price: "$120,000-150,000",
        rating: 4.6,
        provider: "TechStartup Inc.",
        url: "#",
      },
      {
        id: "3",
        title: "Professional Network Meetup",
        description: "Monthly networking event for tech professionals",
        type: "network",
        provider: "Tech Network Thailand",
        url: "#",
      },
    ];
  };

  const generateMockTasks = (): TaskStep[] => {
    return [
      {
        id: "1",
        title: "Analyze current career situation and goals",
        description: "Understanding your background and aspirations",
        status: "in_progress",
        expanded: true,
        steps: [
          "Review your current position and responsibilities",
          "Identify career strengths and areas for improvement",
          "Define short-term and long-term career objectives",
          "Assess market opportunities in your field",
        ],
      },
      {
        id: "2",
        title: "Develop personalized career strategy",
        description: "Creating actionable steps for career advancement",
        status: "pending",
        expanded: false,
        steps: [
          "Create customized skill development roadmap",
          "Design networking and relationship building plan",
          "Establish timeline with measurable milestones",
          "Identify potential mentors and industry connections",
        ],
      },
    ];
  };

  const generateTasks = () => {
    // Enhanced task generation with more detailed career guidance
    const mockTasks: TaskStep[] = [
      {
        id: "1",
        title: "Analyze current career situation and goals",
        description: "Understanding your background and aspirations",
        status: "in_progress",
        expanded: true,
        steps: [
          "Review your current position and responsibilities",
          "Identify career strengths and areas for improvement",
          "Define short-term and long-term career objectives",
          "Assess market opportunities in your field",
        ],
      },
      {
        id: "2",
        title: "Develop personalized career strategy",
        description: "Creating actionable steps for career advancement",
        status: "pending",
        expanded: false,
        steps: [
          "Create customized skill development roadmap",
          "Design networking and relationship building plan",
          "Establish timeline with measurable milestones",
          "Identify potential mentors and industry connections",
        ],
      },
      {
        id: "3",
        title: "Implement career enhancement tools",
        description: "Practical resources and templates for success",
        status: "pending",
        expanded: false,
        steps: [
          "Optimize resume with industry-specific keywords",
          "Develop compelling LinkedIn profile and online presence",
          "Create portfolio showcasing key achievements",
          "Prepare interview scripts and practice scenarios",
        ],
      },
      {
        id: "4",
        title: "Monitor progress and adjust strategy",
        description: "Ongoing support and strategy refinement",
        status: "pending",
        expanded: false,
        steps: [
          "Track application success rates and feedback",
          "Monitor industry trends and skill demands",
          "Regular check-ins with mentors and network",
          "Adjust strategy based on market feedback",
        ],
      },
    ];

    setTasks(mockTasks);
  };

  const handleSendMessage = () => {
    if (!currentInput.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: currentInput,
      timestamp: new Date(),
      status: "completed",
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setCurrentInput("");

    // Simulate AI response - alternating between simple and complex responses
    setTimeout(() => {
      const isSimpleResponse = Math.random() > 0.5;

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: isSimpleResponse
          ? "Based on current industry trends, I recommend focusing on cloud computing skills like AWS or Azure, as they're in high demand. Many companies are transitioning to cloud infrastructure, creating excellent career opportunities."
          : "I'll help you with that. Let me analyze your request and provide personalized recommendations.",
        timestamp: new Date(),
        status: "completed",
        metadata: isSimpleResponse
          ? undefined
          : {
              recommendations: generateMockRecommendations().slice(0, 2),
            },
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1500);
  };

  const retryMessage = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, status: "sending" as const } : msg,
      ),
    );

    // Simulate retry
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: "completed" as const } : msg,
        ),
      );
    }, 1500);
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "course":
        return BookOpen;
      case "job":
        return Target;
      case "skill":
        return TrendingUp;
      case "network":
        return Users;
      case "tool":
        return Lightbulb;
      default:
        return BookOpen;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case "course":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "job":
        return "bg-green-100 text-green-700 border-green-200";
      case "skill":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "network":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "tool":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, expanded: !task.expanded } : task,
      ),
    );
  };

  useEffect(() => {
    const urlPrompt = searchParams.get("prompt");
    if (urlPrompt) {
      initializeChat(urlPrompt);
    } else {
      // Load mock chat history if no prompt
      initializeMockChatHistory();
    }
  }, [searchParams]);

  const statusColors = {
    pending: "bg-gray-100 text-gray-600",
    in_progress: "bg-primary-100 text-primary-700",
    completed: "bg-green-100 text-green-600",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-4">
        <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
          <span className="text-white text-sm font-bold">C</span>
        </div>

        <div className="flex flex-col space-y-3">
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
            <Menu className="w-5 h-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
            <Search className="w-5 h-5 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 bg-green-100"
          >
            <Clock className="w-5 h-5 text-green-600" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
            <Heart className="w-5 h-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
            <Archive className="w-5 h-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
            <Settings className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Chat Content */}
        <div className="flex-1 px-6 pt-24 pb-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Empty State */}
            {messages.length === 0 && !isThinking && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                  <Bot className="w-10 h-10 text-primary-600" />
                </div>
                <div className="text-center space-y-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Start Your Career Journey
                  </h2>
                  <p className="text-gray-600 max-w-md">
                    Ask me anything about career development, skills, job
                    opportunities, or professional growth
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full px-4">
                  {[
                    "Help me transition to data science",
                    "Review my resume for tech roles",
                    "Create a learning roadmap for AI",
                    "What skills are in-demand for 2025?",
                  ].map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => setCurrentInput(prompt)}
                      className="text-left justify-start h-auto py-3 px-4 hover:bg-primary-50 hover:border-primary-300"
                    >
                      <span className="text-sm text-gray-700">{prompt}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="space-y-6 mb-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user"
                      ? "justify-end"
                      : message.type === "system"
                        ? "justify-center"
                        : "justify-start"
                  }`}
                >
                  {message.type === "user" ? (
                    <div className="max-w-3xl relative">
                      <div className="bg-primary-100 text-black rounded-l-2xl rounded-tl-2xl rounded-br-md p-4 shadow-sm">
                        <div className="flex items-center gap-2">
                          <p className="text-gray-800">{message.content}</p>
                          {message.status === "sending" && (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-500 flex-shrink-0" />
                          )}
                          {message.status === "error" && (
                            <button
                              type="button"
                              onClick={() => retryMessage(message.id)}
                              className="flex-shrink-0"
                              title="Failed to send. Click to retry."
                            >
                              <AlertCircle className="w-4 h-4 text-red-500 hover:text-red-600" />
                            </button>
                          )}
                        </div>
                      </div>
                      {message.status === "error" && (
                        <div className="text-xs text-red-600 mt-1 text-right">
                          Failed to send. Click icon to retry.
                        </div>
                      )}
                    </div>
                  ) : message.type === "system" ? (
                    <div className="max-w-md">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 shadow-sm">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <p className="text-sm text-blue-800">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-4xl w-full">
                      <div className="flex items-center gap-2 mb-3">
                        <Bot className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-600 font-medium">
                          ChanceDee AI Assistant
                        </span>
                        {message.status === "processing" && (
                          <span className="text-xs text-blue-600 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Processing...
                          </span>
                        )}
                        {message.status === "error" && (
                          <span className="text-xs text-red-600 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Error
                          </span>
                        )}
                      </div>

                      <div className="prose prose-gray max-w-none">
                        <div className="text-gray-800 text-base leading-relaxed whitespace-pre-line">
                          {message.content}
                        </div>
                      </div>

                      {/* Error State with Retry */}
                      {message.status === "error" && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm text-red-800">
                                Failed to process your request. This may be due
                                to high server load or connectivity issues.
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => retryMessage(message.id)}
                                className="mt-2 border-red-300 text-red-700 hover:bg-red-50"
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Retry
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Research Process Visualization */}
                      {(showResearch || message.metadata?.processingSteps) &&
                        (processingSteps.length > 0 ||
                          message.metadata?.processingSteps) && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-2 mb-3">
                              <BarChart3 className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Research Process
                              </span>
                            </div>
                            <div className="space-y-2">
                              {(
                                message.metadata?.processingSteps ||
                                processingSteps
                              ).map((step) => (
                                <div
                                  key={step.id}
                                  className="flex items-center gap-3"
                                >
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                      step.status === "completed"
                                        ? "bg-green-100"
                                        : step.status === "processing"
                                          ? "bg-blue-100"
                                          : "bg-gray-100"
                                    }`}
                                  >
                                    {step.status === "completed" && (
                                      <CheckCircle className="w-3 h-3 text-green-600" />
                                    )}
                                    {step.status === "processing" && (
                                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                                    )}
                                  </div>
                                  <span
                                    className={`text-sm ${
                                      step.status === "completed"
                                        ? "text-gray-700"
                                        : step.status === "processing"
                                          ? "text-blue-600"
                                          : "text-gray-400"
                                    }`}
                                  >
                                    {step.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Source Citations */}
                      {message.metadata?.sources &&
                        message.metadata.sources.length > 0 && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <ExternalLink className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-700">
                                Researched {message.metadata.sources.length}{" "}
                                sources from{" "}
                                {
                                  new Set(
                                    message.metadata.sources.map(
                                      (s) => s.domain,
                                    ),
                                  ).size
                                }{" "}
                                websites
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {message.metadata.sources.map((source) => (
                                <a
                                  key={source.id}
                                  href={source.url}
                                  className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border hover:bg-gray-50"
                                >
                                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium">
                                    {source.citationNumber}
                                  </span>
                                  <span className="text-gray-600">
                                    {source.domain}
                                  </span>
                                  {source.verified && (
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                  )}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Recommendations */}
                      {message.metadata?.recommendations &&
                        message.metadata.recommendations.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                              Personalized Recommendations
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {message.metadata.recommendations.map((rec) => {
                                const IconComponent = getRecommendationIcon(
                                  rec.type,
                                );
                                return (
                                  <div
                                    key={rec.id}
                                    className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${getRecommendationColor(rec.type)}`}
                                      >
                                        <IconComponent className="w-4 h-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h5 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                                          {rec.title}
                                        </h5>
                                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                          {rec.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs text-gray-500">
                                            {rec.provider}
                                          </span>
                                          {rec.price && (
                                            <span className="text-xs font-medium text-green-600">
                                              {rec.price}
                                            </span>
                                          )}
                                        </div>
                                        {rec.rating && (
                                          <div className="flex items-center gap-1 mt-1">
                                            <div className="flex">
                                              {[...Array(5)].map((_, i) => (
                                                <div
                                                  key={i}
                                                  className={`w-2 h-2 rounded-full ${
                                                    i < Math.floor(rec.rating!)
                                                      ? "bg-yellow-400"
                                                      : "bg-gray-200"
                                                  }`}
                                                />
                                              ))}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                              {rec.rating}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ))}

              {/* Thinking State */}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="max-w-4xl w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-600 font-medium">
                        ChanceDee AI Assistant
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                      <span className="text-base text-gray-600 italic">
                        Analyzing your career needs and creating a personalized
                        action plan...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Agent Mode Task Plan - Only show if we have tasks */}
            {!isThinking && tasks.length > 0 && (
              <Card className="mb-8 border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-blue-600 font-medium">
                      Agent Mode Active
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 border-green-200"
                    >
                      Career Planning
                    </Badge>
                  </div>

                  <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Personalized Career Development Plan
                  </h1>

                  {/* Task List */}
                  <div className="space-y-4">
                    {tasks.map((task, index) => (
                      <div
                        key={task.id}
                        className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-all"
                      >
                        <div
                          className="p-4 cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleTask(task.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${statusColors[task.status]} border-2 border-white shadow-sm`}
                              >
                                {task.status === "completed" ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {task.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {task.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {task.status === "in_progress" && (
                                <div className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                  <span className="text-xs font-medium text-blue-700">
                                    In Progress
                                  </span>
                                </div>
                              )}
                              {task.status === "completed" && (
                                <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                  <span className="text-xs font-medium text-green-700">
                                    Completed
                                  </span>
                                </div>
                              )}
                              {task.expanded ? (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Task Steps */}
                        {task.expanded && (
                          <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-blue-50">
                            <ul className="space-y-3">
                              {task.steps.map((step, stepIndex) => (
                                <li
                                  key={stepIndex}
                                  className="flex items-start gap-3 text-sm"
                                >
                                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-medium text-blue-600">
                                      {stepIndex + 1}
                                    </span>
                                  </div>
                                  <span className="text-gray-700 leading-relaxed">
                                    {step}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">
                        Plan ready for implementation
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                        Customize Plan
                      </Button>
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center gap-2 shadow-lg">
                        <Play className="w-4 h-4" />
                        Start Implementation
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            {messages.length > 0 && (
              <div className="flex items-center justify-center gap-3 mb-8">
                <Button variant="ghost" size="sm">
                  <Heart className="w-4 h-4 mr-2 text-gray-600" />
                  <span className="text-sm text-gray-700">Save</span>
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4 mr-2 text-gray-600" />
                  <span className="text-sm text-gray-700">Share</span>
                </Button>
                <Button variant="ghost" size="sm">
                  <Archive className="w-4 h-4 mr-2 text-gray-600" />
                  <span className="text-sm text-gray-700">Archive</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Input */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask about your career development, skills, or job opportunities..."
                className="w-full h-24 resize-none border-0 outline-none text-lg placeholder-gray-400 bg-transparent"
              />

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer">
                          <Bot className="w-5 h-5 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            Agent mode
                          </span>
                          <div className="w-10 h-6 rounded-full p-1 cursor-pointer transition-colors bg-primary">
                            <div className="w-4 h-4 bg-white rounded-full transition-transform translate-x-4" />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Agent mode creates multi-step action plans with
                          research and recommendations
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="flex items-center gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Button
                            variant="outline"
                            className="w-10 h-10 rounded-full hover:bg-gray-50 border-gray-300 flex items-center justify-center p-0"
                            onClick={() => {
                              // Simulate upload
                              setUploadStatus("uploading");
                              setTimeout(() => {
                                setUploadStatus("success");
                                setTimeout(() => setUploadStatus("idle"), 2000);
                              }, 1500);
                            }}
                          >
                            <Upload className="w-5 h-5 text-gray-600" />
                          </Button>
                          {uploadStatus === "uploading" && (
                            <Loader2 className="w-4 h-4 animate-spin absolute -top-1 -right-1 text-blue-600" />
                          )}
                          {uploadStatus === "success" && (
                            <CheckCircle className="w-4 h-4 text-green-600 absolute -top-1 -right-1 bg-white rounded-full" />
                          )}
                          {uploadStatus === "error" && (
                            <XCircle className="w-4 h-4 text-red-600 absolute -top-1 -right-1 bg-white rounded-full" />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload resume (PDF, DOCX, PNG, JPG - max 10MB)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentInput.trim()}
                    className="bg-primary hover:bg-primary-hover text-white w-10 h-10 rounded-full disabled:opacity-50 flex items-center justify-center p-0"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
