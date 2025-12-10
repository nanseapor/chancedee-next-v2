import type {
  AdkResponse,
  AdkContext,
  AdkTextMessage,
  AdkQuickReplyMessage,
  AdkHandoffMessage,
} from "@/types/adk";

/**
 * Mock Consulting Agent for development
 * Simulates career consultation conversations
 */
export class MockConsultingAgent {
  private async simulateDelay(): Promise<void> {
    // Simulate network/processing delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));
  }

  async chat(
    message: string,
    context: AdkContext
  ): Promise<AdkResponse> {
    await this.simulateDelay();

    const messageHistory = context.messageHistory || [];
    const isFirstMessage = messageHistory.length === 0;

    // Simple keyword-based responses
    const lowerMessage = message.toLowerCase();

    // First interaction
    if (isFirstMessage) {
      return this.createWelcomeResponse();
    }

    // Career-related keywords
    if (
      lowerMessage.includes("หางาน") ||
      lowerMessage.includes("สมัครงาน") ||
      lowerMessage.includes("job") ||
      lowerMessage.includes("ตำแหน่ง")
    ) {
      return this.createJobSearchResponse();
    }

    // Resume-related keywords
    if (
      lowerMessage.includes("resume") ||
      lowerMessage.includes("เรซูเม่") ||
      lowerMessage.includes("cv")
    ) {
      return this.createResumeOfferResponse();
    }

    // Career change keywords
    if (
      lowerMessage.includes("เปลี่ยนงาน") ||
      lowerMessage.includes("เปลี่ยนสาย") ||
      lowerMessage.includes("career change")
    ) {
      return this.createCareerChangeResponse();
    }

    // Positive responses
    if (
      lowerMessage.includes("ใช่") ||
      lowerMessage.includes("yes") ||
      lowerMessage.includes("ได้") ||
      lowerMessage.includes("ครับ") ||
      lowerMessage.includes("ค่ะ")
    ) {
      return this.createResumeHandoffResponse();
    }

    // Default response
    return this.createDefaultResponse(message);
  }

  private createWelcomeResponse(): AdkResponse {
    const welcomeMessage: AdkTextMessage = {
      type: "text",
      content:
        "สวัสดีครับ! ผมชื่อ 'ครูดี' เป็นที่ปรึกษาด้านอาชีพของ ChanceDee 👋\n\n" +
        "ผมพร้อมช่วยคุณเรื่อง:\n" +
        "• คำแนะนำการหางาน\n" +
        "• การเปลี่ยนสายงาน\n" +
        "• การพัฒนาทักษะ\n" +
        "• การสร้างเรซูเม่\n\n" +
        "วันนี้มีอะไรให้ผมช่วยครับ?",
    };

    const quickReply: AdkQuickReplyMessage = {
      type: "quick_reply",
      content: "คุณสนใจปรึกษาเรื่องอะไรครับ?",
      options: [
        {
          id: "1",
          label: "หางานใหม่",
          icon: "💼",
          value: "หางานใหม่",
        },
        {
          id: "2",
          label: "เปลี่ยนสายงาน",
          icon: "🔄",
          value: "เปลี่ยนสายงาน",
        },
        {
          id: "3",
          label: "สร้างเรซูเม่",
          icon: "📄",
          value: "สร้างเรซูเม่",
        },
      ],
    };

    return {
      success: true,
      messages: [welcomeMessage, quickReply],
      tokenUsage: {
        inputTokens: 10,
        outputTokens: 150,
        totalTokens: 160,
      },
    };
  }

  private createJobSearchResponse(): AdkResponse {
    const message: AdkTextMessage = {
      type: "text",
      content:
        "เข้าใจครับ คุณกำลังมองหางานใหม่อยู่ 🎯\n\n" +
        "ขอถามเพิ่มหน่อยนะครับ:\n" +
        "• ตอนนี้คุณทำงานอยู่ไหมครับ?\n" +
        "• สนใจงานในสายอะไรครับ?\n" +
        "• มีประสบการณ์กี่ปีครับ?",
    };

    return {
      success: true,
      messages: [message],
      tokenUsage: {
        inputTokens: 20,
        outputTokens: 80,
        totalTokens: 100,
      },
    };
  }

  private createCareerChangeResponse(): AdkResponse {
    const message: AdkTextMessage = {
      type: "text",
      content:
        "การเปลี่ยนสายงานเป็นการตัดสินใจที่สำคัญเลยครับ 🤔\n\n" +
        "ผมมีคำแนะนำดังนี้:\n" +
        "1. วิเคราะห์ทักษะที่มีว่าโอนย้ายได้หรือไม่\n" +
        "2. ศึกษาตลาดงานในสายที่สนใจ\n" +
        "3. เตรียมพอร์ตโฟลิโอหรือโปรเจกต์ตัวอย่าง\n\n" +
        "คุณมีสายงานที่สนใจอยู่แล้วหรือยังครับ?",
    };

    return {
      success: true,
      messages: [message],
      tokenUsage: {
        inputTokens: 15,
        outputTokens: 100,
        totalTokens: 115,
      },
    };
  }

  private createResumeOfferResponse(): AdkResponse {
    const message: AdkTextMessage = {
      type: "text",
      content:
        "เยี่ยมเลยครับ! การมีเรซูเม่ที่ดีจะช่วยเพิ่มโอกาสในการได้งานมากขึ้นเลยครับ 📝\n\n" +
        "ผมสามารถช่วยคุณสร้างเรซูเม่มืออาชีพได้เลยนะครับ\n\n" +
        "คุณต้องการให้ผมช่วยสร้างเรซูเม่ไหมครับ?",
    };

    const quickReply: AdkQuickReplyMessage = {
      type: "quick_reply",
      content: "เริ่มสร้างเรซูเม่เลยไหมครับ?",
      options: [
        {
          id: "1",
          label: "เริ่มเลย",
          icon: "✅",
          value: "ใช่",
        },
        {
          id: "2",
          label: "ปรึกษาก่อน",
          icon: "💬",
          value: "ไม่",
        },
      ],
    };

    return {
      success: true,
      messages: [message, quickReply],
      tokenUsage: {
        inputTokens: 12,
        outputTokens: 90,
        totalTokens: 102,
      },
    };
  }

  private createResumeHandoffResponse(): AdkResponse {
    const message: AdkTextMessage = {
      type: "text",
      content:
        "ดีมากครับ! ผมจะส่งต่อให้ 'ผู้ช่วยดี' ซึ่งเป็นผู้เชี่ยวชาญด้านการสร้างเรซูเม่ มาช่วยคุณนะครับ 🎉\n\n" +
        "เขาจะถามข้อมูลที่จำเป็นและช่วยสร้างเรซูเม่ที่สมบูรณ์ให้คุณครับ",
    };

    const handoff: AdkHandoffMessage = {
      type: "handoff",
      fromAgent: "consulting",
      toAgent: "resume-creation",
      context:
        "ผู้ใช้ต้องการสร้างเรซูเม่เพื่อสมัครงาน แนะนำให้เริ่มจากข้อมูลพื้นฐานและประสบการณ์",
    };

    return {
      success: true,
      messages: [message, handoff],
      tokenUsage: {
        inputTokens: 8,
        outputTokens: 75,
        totalTokens: 83,
      },
    };
  }

  private createDefaultResponse(userMessage: string): AdkResponse {
    const message: AdkTextMessage = {
      type: "text",
      content: `[MOCK] ขอบคุณที่บอกครับ: "${userMessage}"\n\nผมพร้อมให้คำแนะนำเกี่ยวกับการทำงานและอาชีพครับ มีอะไรให้ช่วยอีกไหมครับ?`,
    };

    return {
      success: true,
      messages: [message],
      tokenUsage: {
        inputTokens: 10,
        outputTokens: 40,
        totalTokens: 50,
      },
    };
  }
}
