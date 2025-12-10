# ChanceDee Message UI System

A comprehensive, production-ready message UI component system for chat interfaces, built with TypeScript, Tailwind CSS, and Framer Motion.

## 📁 Structure

```
src/components/messages/
├── shared/                          # Shared components
│   ├── bot-avatar.tsx              # Bot avatar with gradient
│   ├── user-avatar.tsx             # User avatar with icon
│   └── typing-dots.tsx             # Animated typing indicator
├── text-message.tsx                # 1. Simple text messages
├── quick-reply-message.tsx         # 2. Quick reply buttons
├── auth-message.tsx                # 3. Login/Register prompt
├── personal-info-form-message.tsx  # 4. Personal info form
├── education-form-message.tsx      # 5. Education form
├── work-experience-form-message.tsx # 6. Work experience form
├── rich-card-message.tsx           # 7. Rich media card
├── list-message.tsx                # 8. Selectable list
├── progress-message.tsx            # 9. Progress indicator
├── resume-preview-message.tsx      # 10. Resume preview
├── confirmation-message.tsx        # 11. Data confirmation
├── typing-indicator-message.tsx    # 12. Typing animation
├── error-message.tsx               # 13. Error display
├── pdpa-consent-message.tsx        # 14. PDPA consent form
├── highest-education-input-message.tsx # 15. Education input
├── message-renderer.tsx            # Universal message renderer
├── index.ts                        # Exports
└── README.md                       # This file
```

## 🚀 Quick Start

### Basic Usage

```tsx
import { MessageRenderer } from "@/components/messages";
import type { ChatMessage } from "@/types/ai-message.types";

const messages: ChatMessage[] = [
  {
    id: "1",
    type: "text",
    sender: "bot",
    timestamp: Date.now(),
    content: "สวัสดีครับ! ยินดีต้อนรับ"
  },
  {
    id: "2",
    type: "quick_reply",
    sender: "bot",
    timestamp: Date.now(),
    content: "คุณต้องการความช่วยเหลืออะไรครับ?",
    options: [
      { id: "1", label: "สร้าง Resume", icon: "📄", value: "resume" },
      { id: "2", label: "ปรึกษาอาชีพ", icon: "💼", value: "career" }
    ],
    onSelect: (value) => console.log(value)
  }
];

function ChatInterface() {
  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <MessageRenderer key={message.id} message={message} />
      ))}
    </div>
  );
}
```

## 📋 Message Types

### 1. Text Message
Simple text communication between bot and user.

```tsx
const textMessage: TextMessage = {
  id: "1",
  type: "text",
  sender: "bot", // or "user"
  timestamp: Date.now(),
  content: "สวัสดีครับ! มีอะไรให้ผมช่วยไหมครับ?"
};
```

### 2. Quick Reply Message
Text with quick action buttons.

```tsx
const quickReplyMessage: QuickReplyMessage = {
  id: "2",
  type: "quick_reply",
  sender: "bot",
  timestamp: Date.now(),
  content: "เลือกบริการที่คุณสนใจ",
  options: [
    { id: "1", label: "สร้าง Resume", icon: "📄", value: "resume" },
    { id: "2", label: "ปรึกษาอาชีพ", icon: "💼", value: "career" }
  ],
  onSelect: (value) => handleSelection(value)
};
```

### 3. Authentication Message
Login/Register prompt.

```tsx
const authMessage: AuthMessage = {
  id: "3",
  type: "auth",
  sender: "bot",
  timestamp: Date.now(),
  title: "เข้าสู่ระบบ",
  description: "กรุณาเข้าสู่ระบบเพื่อใช้งานฟีเจอร์นี้",
  onLogin: () => router.push("/auth/login"),
  onRegister: () => router.push("/auth/register")
};
```

### 4. Personal Info Form
Collects user's basic information.

```tsx
const personalInfoMessage: PersonalInfoFormMessage = {
  id: "4",
  type: "personal_info_form",
  sender: "bot",
  timestamp: Date.now(),
  title: "ข้อมูลส่วนตัว",
  subtitle: "กรอกข้อมูลพื้นฐานของคุณ",
  data: { fullName: "", email: "", phone: "" },
  onSubmit: (data) => console.log(data),
  onSkip: () => console.log("Skipped")
};
```

### 5. Education Form
Collects education history.

```tsx
const educationMessage: EducationFormMessage = {
  id: "5",
  type: "education_form",
  sender: "bot",
  timestamp: Date.now(),
  title: "ประวัติการศึกษา",
  educationLevelOptions: [
    { value: 1, label: "มัธยมศึกษา" },
    { value: 2, label: "ปริญญาตรี" }
  ],
  onSubmit: (data) => console.log(data)
};
```

### 6. Work Experience Form
Collects work history.

```tsx
const workMessage: WorkExperienceFormMessage = {
  id: "6",
  type: "work_experience_form",
  sender: "bot",
  timestamp: Date.now(),
  title: "ประสบการณ์ทำงาน",
  onSubmit: (data) => console.log(data)
};
```

### 7. Rich Card Message
Card with image and action button.

```tsx
const richCardMessage: RichCardMessage = {
  id: "7",
  type: "rich_card",
  sender: "bot",
  timestamp: Date.now(),
  title: "Modern Resume Template",
  description: "เทมเพลต resume สมัยใหม่",
  imageEmoji: "📄",
  buttonLabel: "ดูตัวอย่าง",
  onAction: () => console.log("View template")
};
```

### 8. List Message
Selectable list of items.

```tsx
const listMessage: ListMessage = {
  id: "8",
  type: "list",
  sender: "bot",
  timestamp: Date.now(),
  title: "เลือก Resume Template",
  items: [
    {
      id: "1",
      title: "Modern Professional",
      subtitle: "เหมาะสำหรับสาย Corporate",
      icon: "📄",
      value: "modern"
    }
  ],
  onSelect: (value) => console.log(value)
};
```

### 9. Progress Message
Shows progress through steps.

```tsx
const progressMessage: ProgressMessage = {
  id: "9",
  type: "progress",
  sender: "bot",
  timestamp: Date.now(),
  title: "สร้าง Resume: 3/5 เสร็จสิ้น",
  currentStepIndex: 2,
  totalSteps: 5,
  steps: [
    { id: "1", label: "ข้อมูลส่วนตัว", status: "completed" },
    { id: "2", label: "การศึกษา", status: "completed" },
    { id: "3", label: "ประสบการณ์", status: "current" },
    { id: "4", label: "ทักษะ", status: "pending" },
    { id: "5", label: "ตรวจสอบ", status: "pending" }
  ]
};
```

### 10. Resume Preview Message
Shows resume preview with download option.

```tsx
const resumeMessage: ResumePreviewMessage = {
  id: "10",
  type: "resume_preview",
  sender: "bot",
  timestamp: Date.now(),
  title: "Resume ของคุณ",
  subtitle: "สำเร็จแล้ว • 2 หน้า",
  pageCount: 2,
  onDownload: () => console.log("Download"),
  onEdit: () => console.log("Edit")
};
```

### 11. Confirmation Message
Confirms collected data.

```tsx
const confirmationMessage: ConfirmationMessage = {
  id: "11",
  type: "confirmation",
  sender: "bot",
  timestamp: Date.now(),
  title: "กรุณายืนยันข้อมูล",
  data: {
    "ชื่อ": "สมชาย ใจดี",
    "อีเมล": "somchai@example.com",
    "เบอร์โทร": "081-234-5678"
  },
  onConfirm: () => console.log("Confirmed"),
  onEdit: () => console.log("Edit")
};
```

### 12. Typing Indicator Message
Shows bot is typing.

```tsx
const typingMessage: TypingIndicatorMessage = {
  id: "12",
  type: "typing",
  sender: "bot",
  timestamp: Date.now()
};
```

### 13. Error Message
Displays error with retry option.

```tsx
const errorMessage: ErrorMessage = {
  id: "13",
  type: "error",
  sender: "bot",
  timestamp: Date.now(),
  title: "เกิดข้อผิดพลาด",
  message: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
  onRetry: () => console.log("Retry")
};
```

### 14. PDPA Consent Message
Collects PDPA consent.

```tsx
const pdpaMessage: PDPAConsentMessage = {
  id: "14",
  type: "pdpa_consent",
  sender: "bot",
  timestamp: Date.now(),
  title: "นโยบายความเป็นส่วนตัว (PDPA)",
  subtitle: "เราให้ความสำคัญกับความเป็นส่วนตัวของคุณ",
  content: "<p>ChanceDee จะเก็บรวบรวม...</p>",
  consentText: "ข้าพเจ้ายินยอมให้ ChanceDee...",
  linkUrl: "/privacy-policy",
  linkText: "อ่านเพิ่มเติม",
  onSubmit: () => console.log("Accepted")
};
```

### 15. Highest Education Input Message
Simple education level input.

```tsx
const educationInputMessage: HighestEducationInputMessage = {
  id: "15",
  type: "highest_education_input",
  sender: "bot",
  timestamp: Date.now(),
  title: "การศึกษาสูงสุด",
  subtitle: "เพื่อให้คำแนะนำที่เหมาะสมกับคุณ",
  educationLevelOptions: [
    { value: "bachelor", label: "ปริญญาตรี" },
    { value: "master", label: "ปริญญาโท" }
  ],
  onSubmit: (data) => console.log(data)
};
```

## 🎨 Design Features

### Colors
- **Primary Orange (#DB6726)**: Completion actions, achievements
- **Secondary Teal (#284450)**: Ongoing actions, standard interactions
- **Gradients**: Smooth transitions for premium feel

### Dark Mode Support
All components support dark mode automatically via Tailwind's `dark:` classes.

```tsx
// Dark mode is handled automatically
<MessageRenderer message={message} />
```

### Animations
- Powered by Framer Motion
- Smooth entrance animations (fade + slide)
- Staggered list animations
- Typing indicator animation
- Hover effects and transitions

```tsx
// Disable animations if needed
<MessageRenderer message={message} isAnimated={false} />
```

## 🔧 Advanced Usage

### Chat Container Example

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { MessageRenderer } from "@/components/messages";
import type { ChatMessage } from "@/types/ai-message.types";

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Messages Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.map((message) => (
          <MessageRenderer key={message.id} message={message} />
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {/* Your input component */}
      </div>
    </div>
  );
}
```

### Custom Message Component

```tsx
// You can also use individual components directly
import { TextMessageComponent } from "@/components/messages";

function CustomChat() {
  return (
    <TextMessageComponent
      message={{
        id: "1",
        type: "text",
        sender: "bot",
        timestamp: Date.now(),
        content: "Custom usage"
      }}
      isAnimated={true}
    />
  );
}
```

## 🎯 Best Practices

1. **Always provide unique IDs**: Each message needs a unique `id` for React keys
2. **Use timestamps**: Include `timestamp` for proper message ordering
3. **Handle callbacks**: Provide `onSubmit`, `onSelect`, etc. handlers for interactive messages
4. **Type safety**: Leverage TypeScript for type-safe message construction
5. **Accessibility**: Components include proper ARIA labels and keyboard navigation
6. **Performance**: Use `isAnimated={false}` for long message lists if needed

## 📱 Responsive Design

All components are mobile-first and fully responsive:
- 320px - 768px: Mobile optimized
- 768px+: Desktop enhanced
- Touch-friendly tap targets
- Adaptive layouts

## 🌍 Internationalization

Currently optimized for Thai language (ภาษาไทย):
- Thai labels and placeholders
- Buddhist calendar support ready
- Right-to-left (RTL) support can be added

## 🔐 Data Privacy

- PDPA consent component included
- No data sent without user consent
- Forms validate before submission
- Sensitive data handling via callbacks

## 🧪 Testing

```tsx
import { render, screen } from "@testing-library/react";
import { MessageRenderer } from "@/components/messages";

test("renders text message", () => {
  render(
    <MessageRenderer
      message={{
        id: "1",
        type: "text",
        sender: "bot",
        timestamp: Date.now(),
        content: "Hello"
      }}
    />
  );
  expect(screen.getByText("Hello")).toBeInTheDocument();
});
```

## 🤝 Contributing

When adding new message types:
1. Add type definition in `src/types/ai-message.types.ts`
2. Create component in `src/components/messages/`
3. Add to `MessageRenderer` switch statement
4. Export in `index.ts`
5. Update this README

## 📄 License

Part of ChanceDee project - Private/Proprietary

## 🔗 Related Files

- **Types**: `src/types/ai-message.types.ts`
- **Reference**: `docs/references/message-types-showcase.html`
- **Example**: `src/components/fab-chat/fab-chat-persona-stepper.tsx`

---

Built with ❤️ by ChanceDee Team
