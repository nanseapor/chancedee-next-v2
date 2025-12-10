"use client";

import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ChatArea } from "@/components/resume-builder/chat-area";
import { ResumeBuilderErrorBoundary } from "@/components/resume-builder/error-boundary";
import { Header } from "@/components/resume-builder/header";
import { InputArea } from "@/components/resume-builder/input-area";
import { ResumePreview } from "@/components/resume-builder/resume-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirebaseAuth } from "@/hooks/use-auth";
import { useChancedeeChat } from "@/hooks/use-chancedee-chat";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ResumeBuilderAIPage() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const {
    messages,
    isLoading,
    isGenerating,
    resumeData,
    selectedTemplate,
    generatedResume,
    sendMessage,
    clearChat,
    selectTemplate,
    generateResume,
    error,
    // New properties from updated hook
    apiStatus,
    templates,
  } = useChancedeeChat();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl">AI Resume Assistant</CardTitle>
            </div>
            <p className="text-muted-foreground">
              เข้าสู่ระบบเพื่อใช้งาน AI Resume Assistant
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-col gap-3">
              <Link href="/auth/sign-in">
                <Button className="w-full flex items-center gap-2">
                  เข้าสู่ระบบ
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button variant="outline" className="w-full">
                  สมัครสมาชิก
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ResumeBuilderErrorBoundary>
      <div className="flex h-screen flex-col bg-muted">
        <Header
          onPreviewToggle={() => setIsPreviewOpen(true)}
          selectedTemplate={selectedTemplate}
          onTemplateSelect={selectTemplate}
          apiStatus={apiStatus}
          templates={templates}
        />

        <ChatArea messages={messages} isTyping={isLoading} />

        <InputArea
          onSendMessage={sendMessage}
          onClearChat={clearChat}
          disabled={isLoading || isGenerating}
          allowFileUpload={true}
        />

        <ResumePreview
          key={generatedResume?.conversationId || "preview"}
          isOpen={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          resumeData={resumeData}
          generatedResume={generatedResume}
          onGenerateResume={generateResume}
          isGenerating={isGenerating}
          error={error}
        />
      </div>
    </ResumeBuilderErrorBoundary>
  );
}
