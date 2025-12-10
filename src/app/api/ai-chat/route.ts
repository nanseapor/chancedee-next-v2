import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, userPrompt, conversationHistory, resumeData } =
      await request.json();

    // For now, return a simple response
    // TODO: Replace with actual AI service call (OpenAI, Anthropic, etc.)

    // Simple logic to determine response based on conversation length
    const userMessageCount = conversationHistory.split("user:").length - 1;

    let response = "";

    if (userMessageCount === 1) {
      response =
        "ขอบคุณสำหรับข้อมูลครับ! ต่อไปช่วยเล่าเกี่ยวกับประสบการณ์การทำงานของคุณหน่อยได้ไหม? เช่น ตำแหน่งงาน บริษัท และระยะเวลาที่ทำงาน";
    } else if (userMessageCount === 2) {
      response =
        "ประสบการณ์ที่น่าสนใจมากเลยครับ! ช่วยเล่าเพิ่มเติมเกี่ยวกับการศึกษาของคุณได้ไหม? เช่น ปริญญาที่จบ สถาบัน และปีที่จบ";
    } else if (userMessageCount === 3) {
      response =
        "เยี่ยมมากครับ! สุดท้ายแล้ว ช่วยบอกทักษะพิเศษหรือความสามารถที่คุณมีได้ไหม? เช่น ภาษาโปรแกรม ภาษาต่างประเทศ หรือทักษะอื่นๆ";
    } else {
      response =
        'ข้อมูลครบถ้วนแล้วครับ! คุณสามารถกดปุ่ม "Preview Resume" เพื่อดู Resume แบบง่ายๆ หรือเลือก Template และกด "สร้าง Resume" เพื่อสร้าง Resume แบบสมบูรณ์ได้เลย\n\nหากต้องการแก้ไขหรือเพิ่มเติมข้อมูลใดๆ สามารถบอกผมได้เสมอครับ';
    }

    return NextResponse.json({
      success: true,
      response: response,
    });
  } catch (error) {
    console.error("AI Chat API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "ขออภัยครับ เกิดข้อผิดพลาดในการตอบกลับ",
        response: "ขออภัยครับ เกิดข้อผิดพลาดในการตอบกลับ กรุณาลองใหม่อีกครั้ง",
      },
      { status: 500 },
    );
  }
}

// TODO: Integrate with actual AI service
// Example implementations:

/*
// OpenAI Integration
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ],
  max_tokens: 500,
  temperature: 0.7,
});

response = completion.choices[0]?.message?.content || 'ขออภัยครับ ไม่สามารถตอบกลับได้';
*/

/*
// Anthropic Claude Integration
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const message = await anthropic.messages.create({
  model: 'claude-3-sonnet-20240229',
  max_tokens: 500,
  system: systemPrompt,
  messages: [
    { role: 'user', content: userPrompt }
  ],
});

response = message.content[0]?.text || 'ขออภัยครับ ไม่สามารถตอบกลับได้';
*/
