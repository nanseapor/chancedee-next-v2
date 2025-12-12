import { type NextRequest, NextResponse } from "next/server";

// Mock AI responses
const mockResponses = [
  "ขอบคุณสำหรับคำถามครับ! นี่เป็นการตอบกลับจาก AI Assistant แบบจำลอง",
  "น่าสนใจมากครับ! ผมเข้าใจในสิ่งที่คุณถาม นี่คือคำตอบจากระบบจำลอง",
  "ครับ ผมได้รับข้อความของคุณแล้ว นี่เป็นการตอบกลับแบบสถิตจากระบบทดสอบ",
  "เยี่ยมมากครับ! ขณะนี้เป็นการตอบกลับจากระบบจำลอง AI Assistant",
  "ขอบคุณที่ใช้บริการครับ นี่คือคำตอบจากระบบทดสอบ AI",
];

const helpfulResponses: Record<string, string> = {
  สวัสดี: "สวัสดีครับ! ยินดีที่ได้รู้จักครับ มีอะไรให้ช่วยเหลือไหมครับ?",
  ขอบคุณ: "ยินดีครับ! ผมพร้อมช่วยเหลือคุณเสมอ",
  ลาก่อน: "ลาก่อนครับ! หวังว่าจะได้พบกันใหม่ ขอให้มีความสุขครับ",
  hello: "Hello! How can I help you today?",
  help: "ผมสามารถช่วยเหลือคุณได้หลายเรื่อง เช่น:\n• ตอบคำถามทั่วไป\n• ให้คำแนะนำ\n• แชทธรรมดา\n• และอื่นๆ อีกมากมาย\n\nลองถามอะไরได้เลยครับ!",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // Add a delay to simulate thinking
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000),
    );

    const userMessage = message.toLowerCase().trim();

    // Check for specific responses
    let response: string = "";
    const matchedResponse = Object.entries(helpfulResponses).find(([key]) =>
      userMessage.includes(key),
    );

    if (matchedResponse) {
      response = matchedResponse[1];
    } else if (userMessage.includes("ชื่อ") || userMessage.includes("name")) {
      response = "ผมชื่อ AI Assistant ครับ เป็น AI ที่พร้อมช่วยเหลือคุณในเรื่องต่างๆ";
    } else if (userMessage.includes("เวลา") || userMessage.includes("time")) {
      const currentTime = new Date().toLocaleTimeString("th-TH");
      response = `ตอนนี้เวลา ${currentTime} ครับ`;
    } else if (userMessage.includes("วันที่") || userMessage.includes("date")) {
      const currentDate = new Date().toLocaleDateString("th-TH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      response = `วันนี้เป็น${currentDate} ครับ`;
    } else {
      // Use random mock response
      response =
        mockResponses[Math.floor(Math.random() * mockResponses.length)] || "ขอโทษครับ ผมไม่เข้าใจคำถามของคุณ";
    }

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
      conversationLength: conversationHistory
        ? conversationHistory.length + 1
        : 1,
    });
  } catch (error) {
    console.error("AI Assistant API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
