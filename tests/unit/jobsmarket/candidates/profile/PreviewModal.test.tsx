/**
 * Unit tests for PreviewModal component
 * CAND-R02 Batch 3E
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PreviewModal } from "@/app/jobsmarket/candidates/[id]/profile/_components/PreviewModal";
import type { FirebaseCandidateData } from "@/types/candidate.types";

// Mock dependencies
vi.mock("@/lib/jobsmarket/hooks/use-pdf-export", () => ({
  usePdfExport: () => ({
    exportPdf: vi.fn(),
    isGenerating: false,
    error: null,
  }),
}));

describe("PreviewModal", () => {
  const mockCandidate: FirebaseCandidateData = {
    uid: "test-uid-123",
    firstnameTH: "สมชาย",
    lastnameTH: "ใจดี",
    nicknameTH: "ชาย",
    email: "somchai@example.com",
    phone: "0812345678",
    birthdate: 946684800, // 2000-01-01
    gender: "male",
    works: [
      {
        company: "บริษัท ABC จำกัด",
        jobTitle: "Software Engineer",
        startYear: 2020,
        endYear: 2023,
        isCurrent: false,
        isNewGraduate: false,
        startMonth: 1,
        salary: 50000,
        note: "Developed web applications",
      },
    ],
    educations: [
      {
        institution: "มหาวิทยาลัยธรรมศาสตร์",
        major: "วิศวกรรมคอมพิวเตอร์",
        educationLevel: 6,
        educationLabel: "ปริญญาตรี",
        endYear: 2020,
        gpax: "3.50",
      },
    ],
    skills: [
      {
        skillName: "JavaScript",
        expertiseLevel: "advanced",
        isCertified: false,
      },
      {
        skillName: "React",
        expertiseLevel: "intermediate",
        isCertified: true,
      },
    ],
    languages: [
      {
        languageName: "ไทย",
        languageLevel: "เชี่ยวชาญ",
      },
      {
        languageName: "English",
        languageLevel: "ดี",
      },
    ],
    aboutMe: "ผมเป็นคนขยัน มีความรับผิดชอบสูง และชอบเรียนรู้สิ่งใหม่ๆ",
    isActive: true,
    isSearchable: true,
    createdAt: 0,
    updatedAt: 0,
  };

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    candidate: mockCandidate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render modal when open is true", () => {
    render(<PreviewModal {...defaultProps} />);

    expect(screen.getByText("ตัวอย่างโปรไฟล์")).toBeInTheDocument();
    expect(
      screen.getByText("ดูตัวอย่างโปรไฟล์ของคุณก่อนส่งออกเป็น PDF")
    ).toBeInTheDocument();
  });

  it("should not render modal when open is false", () => {
    render(<PreviewModal {...defaultProps} open={false} />);

    expect(screen.queryByText("ตัวอย่างโปรไฟล์")).not.toBeInTheDocument();
  });

  it("should display personal information", () => {
    render(<PreviewModal {...defaultProps} />);

    expect(screen.getByText("ข้อมูลส่วนตัว")).toBeInTheDocument();
    expect(screen.getByText(/สมชาย ใจดี/)).toBeInTheDocument();
    expect(screen.getByText(mockCandidate.email!)).toBeInTheDocument();
    expect(screen.getByText(mockCandidate.phone!)).toBeInTheDocument();
  });

  it("should display work experience", () => {
    render(<PreviewModal {...defaultProps} />);

    expect(screen.getByText("ประสบการณ์ทำงาน")).toBeInTheDocument();
    expect(screen.getByText(/Software Engineer/)).toBeInTheDocument();
    expect(screen.getByText(/บริษัท ABC จำกัด/)).toBeInTheDocument();
  });

  it("should display education history", () => {
    render(<PreviewModal {...defaultProps} />);

    expect(screen.getByText("ประวัติการศึกษา")).toBeInTheDocument();
    expect(screen.getByText(/ปริญญาตรี/)).toBeInTheDocument();
    expect(screen.getByText(/มหาวิทยาลัยธรรมศาสตร์/)).toBeInTheDocument();
    expect(screen.getByText(/วิศวกรรมคอมพิวเตอร์/)).toBeInTheDocument();
  });

  it("should display skills", () => {
    render(<PreviewModal {...defaultProps} />);

    expect(screen.getByText("ทักษะ")).toBeInTheDocument();
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("should display languages", () => {
    render(<PreviewModal {...defaultProps} />);

    expect(screen.getByText("ภาษา")).toBeInTheDocument();
    expect(screen.getByText(/ไทย/)).toBeInTheDocument();
    expect(screen.getByText(/English/)).toBeInTheDocument();
  });

  it("should display about me section", () => {
    render(<PreviewModal {...defaultProps} />);

    expect(screen.getByText("เกี่ยวกับตัวฉัน")).toBeInTheDocument();
    expect(screen.getByText(mockCandidate.aboutMe!)).toBeInTheDocument();
  });

  it("should show download PDF button", () => {
    render(<PreviewModal {...defaultProps} />);

    const downloadButton = screen.getByRole("button", { name: /ดาวน์โหลด PDF/i });
    expect(downloadButton).toBeInTheDocument();
  });

  it("should call onOpenChange when close button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = vi.fn();

    render(<PreviewModal {...defaultProps} onOpenChange={mockOnOpenChange} />);

    // Get all close buttons and click the first one (the custom one in our component)
    const closeButtons = screen.getAllByRole("button", { name: /close/i });
    await user.click(closeButtons[0]);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("should handle candidate with minimal data", () => {
    const minimalCandidate: FirebaseCandidateData = {
      uid: "test-uid",
      firstnameTH: "Test",
      lastnameTH: "User",
      isActive: true,
      isSearchable: false,
      createdAt: 0,
      updatedAt: 0,
    };

    render(<PreviewModal {...defaultProps} candidate={minimalCandidate} />);

    // Should render without crashing
    expect(screen.getByText("ตัวอย่างโปรไฟล์")).toBeInTheDocument();
    expect(screen.getByText(/Test User/)).toBeInTheDocument();
  });

  it("should not display sections with no data", () => {
    const minimalCandidate: FirebaseCandidateData = {
      uid: "test-uid",
      firstnameTH: "Test",
      lastnameTH: "User",
      isActive: true,
      isSearchable: false,
      createdAt: 0,
      updatedAt: 0,
    };

    render(<PreviewModal {...defaultProps} candidate={minimalCandidate} />);

    // These sections should not appear
    expect(screen.queryByText("ประสบการณ์ทำงาน")).not.toBeInTheDocument();
    expect(screen.queryByText("ทักษะ")).not.toBeInTheDocument();
    expect(screen.queryByText("เกี่ยวกับตัวฉัน")).not.toBeInTheDocument();
  });
});
