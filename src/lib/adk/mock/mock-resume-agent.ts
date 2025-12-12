import type {
  AdkResponse,
  AdkContext,
  AdkTextMessage,
  AdkFormMessage,
  AdkConfirmationMessage,
  AdkProgressMessage,
  ResumeSectionType,
} from "@/types/adk";

/**
 * Mock Resume Creation Agent for development
 * Simulates progressive resume data collection
 */
export class MockResumeAgent {
  private readonly sections: ResumeSectionType[] = [
    "personal_info",
    "education",
    "work_experience",
    "skills",
  ];

  private async simulateDelay(): Promise<void> {
    await new Promise((resolve) =>
      setTimeout(resolve, 600 + Math.random() * 600)
    );
  }

  async chat(
    message: string,
    context: AdkContext,
    formData?: unknown
  ): Promise<AdkResponse> {
    await this.simulateDelay();

    const progress = context.progress || {
      completedSections: [],
      currentSection: undefined,
    };

    const isFirstMessage = !context.messageHistory || context.messageHistory.length === 0;

    // If user just submitted form data
    if (formData) {
      return this.handleFormSubmission(formData, progress);
    }

    // First message from resume agent
    if (isFirstMessage) {
      return this.createWelcomeResponse(context);
    }

    // Determine next section to collect
    return this.getNextSection(progress);
  }

  private createWelcomeResponse(context: AdkContext): AdkResponse {
    const consultingContext = context.consultingContext;
    const hasContext = consultingContext?.summary;

    const greeting: AdkTextMessage = {
      type: "text",
      content: hasContext
        ? `สวัสดีครับ! ผมชื่อ 'ผู้ช่วยดี' 👋\n\nผมได้รับข้อมูลจาก 'ครูดี' แล้วนะครับ:\n"${consultingContext.summary}"\n\nผมจะช่วยคุณสร้างเรซูเม่ที่สมบูรณ์และเหมาะสมสำหรับสมัครงานครับ`
        : "สวัสดีครับ! ผมชื่อ 'ผู้ช่วยดี' 👋\n\nผมจะช่วยคุณสร้างเรซูเม่ที่สมบูรณ์และดูมืออาชีพครับ",
    };

    const progress: AdkProgressMessage = {
      type: "progress",
      title: "ความคืบหน้า",
      steps: [
        { id: "personal", label: "ข้อมูลส่วนตัว", status: "current" },
        { id: "education", label: "การศึกษา", status: "pending" },
        { id: "work", label: "ประสบการณ์", status: "pending" },
        { id: "skills", label: "ทักษะ", status: "pending" },
      ],
      currentStepIndex: 0,
      totalSteps: 4,
    };

    const form: AdkFormMessage = {
      type: "form",
      formType: "personal_info",
      title: "เริ่มจากข้อมูลส่วนตัวกันก่อนนะครับ",
      subtitle: "ขั้นตอนที่ 1/4",
    };

    return {
      success: true,
      messages: [greeting, progress, form],
      tokenUsage: {
        inputTokens: 20,
        outputTokens: 120,
        totalTokens: 140,
      },
    };
  }

  private handleFormSubmission(
    formData: unknown,
    progress: { completedSections: string[]; currentSection?: string }
  ): AdkResponse {
    const currentSectionIndex = this.sections.findIndex(
      (s) => !progress.completedSections.includes(s)
    );

    if (currentSectionIndex === -1) {
      // All sections completed
      return this.createConfirmationResponse(progress);
    }

    const currentSection = this.sections[currentSectionIndex]!;

    // Validate form data (mock validation)
    const validation = this.validateFormData(currentSection, formData);
    if (!validation.valid) {
      return {
        success: false,
        messages: [
          {
            type: "error",
            title: "ข้อมูลไม่ครบถ้วน",
            message: validation.error || "กรุณากรอกข้อมูลให้ครบถ้วน",
          },
        ],
      };
    }

    // Mark section as completed
    const updatedProgress = {
      completedSections: [...progress.completedSections, currentSection],
      currentSection: undefined,
    };

    // Check if more sections remain
    const nextSectionIndex = currentSectionIndex + 1;
    if (nextSectionIndex < this.sections.length) {
      return this.getNextSection(updatedProgress);
    }

    // All done, show confirmation
    return this.createConfirmationResponse(updatedProgress);
  }

  private getNextSection(progress: {
    completedSections: string[];
    currentSection?: string;
  }): AdkResponse {
    const nextSection = this.sections.find(
      (s) => !progress.completedSections.includes(s)
    );

    if (!nextSection) {
      return this.createConfirmationResponse(progress);
    }

    const sectionIndex = this.sections.indexOf(nextSection);
    const completedCount = progress.completedSections.length;

    const successMessage: AdkTextMessage = {
      type: "text",
      content: completedCount > 0
        ? `✅ บันทึกข้อมูลเรียบร้อยแล้วครับ!\n\nต่อไปมาดูส่วนถัดไปกันครับ`
        : "มาเริ่มกันเลยครับ",
    };

    const progressMessage: AdkProgressMessage = {
      type: "progress",
      title: "ความคืบหน้า",
      steps: this.sections.map((s, idx) => ({
        id: s,
        label: this.getSectionLabel(s),
        status:
          idx < sectionIndex
            ? "completed"
            : idx === sectionIndex
              ? "current"
              : "pending",
      })),
      currentStepIndex: sectionIndex,
      totalSteps: this.sections.length,
    };

    const form: AdkFormMessage = {
      type: "form",
      formType: nextSection as any,
      title: `ข้อมูล${this.getSectionLabel(nextSection)}`,
      subtitle: `ขั้นตอนที่ ${sectionIndex + 1}/${this.sections.length}`,
    };

    return {
      success: true,
      messages: [successMessage, progressMessage, form],
      tokenUsage: {
        inputTokens: 15,
        outputTokens: 100,
        totalTokens: 115,
      },
    };
  }

  private createConfirmationResponse(progress: {
    completedSections: string[];
  }): AdkResponse {
    const message: AdkTextMessage = {
      type: "text",
      content:
        "🎉 ยอดเยี่ยม! เก็บข้อมูลครบทุกส่วนแล้วครับ\n\nมาดูสรุปข้อมูลทั้งหมดกันนะครับ ถ้าถูกต้องแล้วเราจะสร้าง PDF ให้เลยครับ",
    };

    const confirmation: AdkConfirmationMessage = {
      type: "confirmation",
      title: "ยืนยันข้อมูล",
      data: {
        "ข้อมูลส่วนตัว": "✓ เรียบร้อย",
        "การศึกษา": "✓ เรียบร้อย",
        "ประสบการณ์การทำงาน": "✓ เรียบร้อย",
        "ทักษะ": "✓ เรียบร้อย",
      },
    };

    return {
      success: true,
      messages: [message, confirmation],
      tokenUsage: {
        inputTokens: 10,
        outputTokens: 80,
        totalTokens: 90,
      },
    };
  }

  private validateFormData(
    section: string,
    data: unknown
  ): { valid: boolean; error?: string } {
    // Mock validation - always pass for now
    if (!data) {
      return { valid: false, error: "ไม่พบข้อมูลที่ส่งมา" };
    }

    // In real implementation, validate based on section type
    return { valid: true };
  }

  private getSectionLabel(section: string): string {
    const labels: Record<string, string> = {
      personal_info: "ส่วนตัว",
      education: "การศึกษา",
      work_experience: "ประสบการณ์",
      skills: "ทักษะ",
      languages: "ภาษา",
      licenses: "ใบอนุญาต",
      additional_info: "ข้อมูลเพิ่มเติม",
    };
    return labels[section] || section;
  }
}
