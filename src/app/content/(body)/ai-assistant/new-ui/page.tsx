"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Bot, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CareerPrompt {
  id: string;
  image: string;
  badge: string;
  title: string;
  description: string;
  badgeType: "career" | "analysis" | "planning";
}

const careerPrompts: CareerPrompt[] = [
  {
    id: "1",
    image: "",
    badge: "Career Planning",
    title: "Resume Review & Enhancement",
    description:
      '"Please review my resume and provide detailed feedback on structure, content, and formatting. Suggest improvements to make it more appealing to employers in my field."',
    badgeType: "career",
  },
  {
    id: "2",
    image: "",
    badge: "Interview Prep",
    title: "Mock Interview Practice",
    description:
      '"Help me practice for my upcoming job interview. Ask me common interview questions for a [job title] position and provide feedback on my responses."',
    badgeType: "career",
  },
  {
    id: "3",
    image: "",
    badge: "Career Path",
    title: "Career Transition Planning",
    description:
      '"I want to transition from [current role] to [target role]. Help me create a step-by-step plan including skills to develop, networking strategies, and timeline."',
    badgeType: "planning",
  },
  {
    id: "4",
    image: "",
    badge: "Skill Development",
    title: "Skills Gap Analysis",
    description:
      '"Analyze the skills required for my target job versus my current abilities. Create a personalized learning plan to bridge any gaps."',
    badgeType: "analysis",
  },
  {
    id: "5",
    image: "",
    badge: "Salary Negotiation",
    title: "Compensation Strategy",
    description:
      '"Help me research market salary rates for my position and create a strategy for negotiating my compensation during my next review or job offer."',
    badgeType: "planning",
  },
  {
    id: "6",
    image: "",
    badge: "Industry Trends",
    title: "Market Analysis",
    description:
      '"Provide insights on current trends and future outlook in [your industry]. What skills and roles are becoming more valuable?"',
    badgeType: "analysis",
  },
  {
    id: "7",
    image: "",
    badge: "Networking",
    title: "Professional Networking Plan",
    description:
      '"Create a networking strategy to help me connect with professionals in my target industry. Include specific platforms, events, and outreach templates."',
    badgeType: "planning",
  },
  {
    id: "8",
    image: "",
    badge: "Job Search",
    title: "Application Strategy",
    description:
      '"Help me develop an effective job search strategy including where to look, how to tailor applications, and follow-up best practices."',
    badgeType: "career",
  },
];

export default function AIAssistantPage() {
  const [searchValue, setSearchValue] = useState("");
  const [isAgentMode, setIsAgentMode] = useState(true);
  const router = useRouter();

  // Mock function to generate chat ID
  const generateChatId = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const handleSubmit = () => {
    if (searchValue.trim()) {
      const chatId = generateChatId();
      router.push(
        `/ai-assistant/c/${chatId}?prompt=${encodeURIComponent(searchValue)}`,
      );
    }
  };

  const handlePromptClick = (prompt: CareerPrompt) => {
    setSearchValue(prompt.description.replace(/"/g, ""));
  };

  const badgeColors = {
    career: "bg-blue-100 text-blue-700 border-blue-200",
    analysis: "bg-green-100 text-green-700 border-green-200",
    planning: "bg-purple-100 text-purple-700 border-purple-200",
  };

  return (
    <div className="min-h-screen bg-white relative z-0">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8 relative z-0">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
            ChanceDee
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-8 max-w-4xl mx-auto">
            All career guidance in one ask, smart mentoring with AI
          </h2>

          {/* Search Interface */}
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
              <textarea
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Describe your career needs..."
                className="w-full h-24 resize-none border-0 outline-none text-lg placeholder-gray-400 bg-transparent"
              />

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Bot className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">Agent mode</span>
                    <div
                      className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                        isAgentMode ? "bg-primary" : "bg-gray-300"
                      }`}
                      onClick={() => setIsAgentMode(!isAgentMode)}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          isAgentMode ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="w-10 h-10 rounded-full hover:bg-gray-50 border-gray-300 flex items-center justify-center p-0"
                  >
                    <Upload className="w-5 h-5 text-gray-600" />
                  </Button>

                  <Button
                    onClick={handleSubmit}
                    disabled={!searchValue.trim()}
                    className="bg-primary hover:bg-primary-hover text-white w-10 h-10 rounded-full disabled:opacity-50 flex items-center justify-center p-0"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Career Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {careerPrompts.map((prompt) => (
            <Card
              key={prompt.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] bg-white border border-gray-200"
              onClick={() => handlePromptClick(prompt)}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <div className="text-6xl">💼</div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-4 h-4 text-blue-600" />
                  <Badge
                    variant="secondary"
                    className={`text-xs px-2 py-1 ${badgeColors[prompt.badgeType]}`}
                  >
                    {prompt.badge}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3 leading-tight">
                  {prompt.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                  {prompt.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-4">
              Trusted by career professionals
            </p>
            <div className="flex items-center justify-center gap-8">
              <div className="w-20 h-8 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs text-gray-500">Partner 1</span>
              </div>
              <div className="w-20 h-8 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs text-gray-500">Partner 2</span>
              </div>
              <div className="w-20 h-8 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs text-gray-500">Partner 3</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900">
              Terms of Use
            </a>
            <a href="#" className="hover:text-gray-900">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-900">
              About ChanceDee
            </a>
            <a href="#" className="hover:text-gray-900">
              Contact
            </a>
            <a href="#" className="hover:text-gray-900">
              Help Center
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
