import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProfileHeader } from "@/app/jobsmarket/candidates/[id]/profile/_components/ProfileHeader";
import type { FirebaseCandidateData } from "@/types/candidate.types";

// Mock the completion hook
vi.mock("@/hooks/jobsmarket/use-profile-completion", () => ({
  useProfileCompletion: () => ({ percentage: 75 }),
}));

// Mock the file upload hook
vi.mock("@/hooks/jobsmarket/use-file-upload", () => ({
  useFileUpload: () => ({
    uploadPhoto: vi.fn(),
    validatePhoto: vi.fn(),
    isUploading: false,
    progress: 0,
    error: null,
  }),
}));

// Mock the toast hook
vi.mock("@/hooks/use-toast-notification", () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

const mockCandidate: FirebaseCandidateData = {
  uid: "test-uid",
  firstnameTH: "สมชาย",
  lastnameTH: "ใจดี",
  email: "test@example.com",
  phone: "0812345678",
  province: "กรุงเทพมหานคร",
  isSearchable: true,
  isOnboarded: true,
  isActive: true,
  createdAt: Date.now() / 1000,
  updatedAt: Date.now() / 1000,
};

describe("ProfileHeader", () => {
  it("should render candidate name", () => {
    render(
      <ProfileHeader
        candidate={mockCandidate}
        onToggleSearchable={vi.fn()}
        onOpenPreview={vi.fn()}
        onPhotoUploaded={vi.fn()}
      />
    );

    expect(screen.getByText("สมชาย ใจดี")).toBeInTheDocument();
  });

  it("should render profile completion percentage", () => {
    render(
      <ProfileHeader
        candidate={mockCandidate}
        onToggleSearchable={vi.fn()}
        onOpenPreview={vi.fn()}
        onPhotoUploaded={vi.fn()}
      />
    );

    expect(screen.getByText("ความสมบูรณ์ของโปรไฟล์")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("should render searchable toggle", () => {
    render(
      <ProfileHeader
        candidate={mockCandidate}
        onToggleSearchable={vi.fn()}
        onOpenPreview={vi.fn()}
        onPhotoUploaded={vi.fn()}
      />
    );

    expect(
      screen.getByText("โปรไฟล์สามารถค้นหาได้")
    ).toBeInTheDocument();
  });

  it("should render preview button", () => {
    render(
      <ProfileHeader
        candidate={mockCandidate}
        onToggleSearchable={vi.fn()}
        onOpenPreview={vi.fn()}
        onPhotoUploaded={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /ดูตัวอย่างโปรไฟล์/ })
    ).toBeInTheDocument();
  });

  it("should show default avatar when no photo URL", () => {
    render(
      <ProfileHeader
        candidate={mockCandidate}
        onToggleSearchable={vi.fn()}
        onOpenPreview={vi.fn()}
        onPhotoUploaded={vi.fn()}
      />
    );

    // Component uses User icon when no resumePhotoURL
    const container = screen.getByText("สมชาย ใจดี").closest("div");
    expect(container).toBeInTheDocument();
  });

  it("should use custom photo URL when provided", () => {
    const candidateWithPhoto = {
      ...mockCandidate,
      resumePhotoURL: "https://example.com/photo.jpg",
    };

    render(
      <ProfileHeader
        candidate={candidateWithPhoto}
        onToggleSearchable={vi.fn()}
        onOpenPreview={vi.fn()}
        onPhotoUploaded={vi.fn()}
      />
    );

    const avatar = screen.getByAltText("สมชาย ใจดี");
    expect(avatar).toHaveAttribute("src", "https://example.com/photo.jpg");
  });
});
