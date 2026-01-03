import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getRoomDetails } from "@/lib/database/actions/chat-messages";

// Mock dependencies
vi.mock("@/lib/firebase/admin-auth", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/database/repositories/chat-repository", () => ({
  chatRepository: {
    getById: vi.fn(),
  },
}));

vi.mock("@/lib/database/actions/candidate-information", () => ({
  webCandidateInformationGetById: vi.fn(),
}));

vi.mock("@/lib/database/actions/company-information", () => ({
  webCompanyInformationGetById: vi.fn(),
}));

vi.mock("@/lib/database/actions/job-interviews", () => ({
  webJobInterviewGetByFilter: vi.fn(),
}));

import { getSessionUser } from "@/lib/firebase/admin-auth";
import { chatRepository } from "@/lib/database/repositories/chat-repository";
import { webCandidateInformationGetById } from "@/lib/database/actions/candidate-information";
import { webCompanyInformationGetById } from "@/lib/database/actions/company-information";
import { webJobInterviewGetByFilter } from "@/lib/database/actions/job-interviews";

describe("getRoomDetails", () => {
  const mockSessionUser = {
    uid: "user-123",
    candidateId: "candidate-123",
    companyId: null,
  };

  const mockRoom = {
    id: "room-123",
    candidateId: "candidate-123",
    companyId: "company-456",
    candidateName: "Test Candidate",
    companyName: "Test Company",
    lastMessage: "Hello there",
    lastupdate: Date.now(),
    jobId: "job-789",
  };

  const mockCompanyInfo = {
    uid: "company-456",
    companyName: "Test Company Ltd.",
    profilePhoto: "https://example.com/company-photo.jpg",
    industry: "Technology",
  };

  const mockCandidateInfo = {
    uid: "candidate-123",
    firstnameTH: "สมชาย",
    lastnameTH: "ใจดี",
    resumePhotoURL: "https://example.com/candidate-photo.jpg",
    email: "somchai@example.com",
  };

  const mockInterview = {
    uid: "interview-001",
    roomId: "room-123",
    jobId: "job-789",
    candidateId: "candidate-123",
    companyId: "company-456",
    appointment: Date.now() + 86400000, // Tomorrow
    channel: "online",
    status: "pending",
    isCancel: false,
    isAccepted: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionUser).mockResolvedValue(mockSessionUser);
    vi.mocked(chatRepository.getById).mockResolvedValue(mockRoom);
    vi.mocked(webCompanyInformationGetById).mockResolvedValue(mockCompanyInfo);
    vi.mocked(webCandidateInformationGetById).mockResolvedValue(mockCandidateInfo);
    vi.mocked(webJobInterviewGetByFilter).mockResolvedValue([mockInterview]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return room metadata", async () => {
    const result = await getRoomDetails({
      roomId: "room-123",
    });

    expect(result.room).toEqual(
      expect.objectContaining({
        id: "room-123",
        candidateId: "candidate-123",
        companyId: "company-456",
      })
    );
  });

  it("should return other party info for candidate viewing", async () => {
    // User is candidate, so other party is company
    const result = await getRoomDetails({
      roomId: "room-123",
    });

    expect(result.otherParty).toEqual(
      expect.objectContaining({
        id: "company-456",
        name: "Test Company Ltd.",
        photo: "https://example.com/company-photo.jpg",
        role: "company",
      })
    );
  });

  it("should return other party info for company viewing", async () => {
    // User is company
    vi.mocked(getSessionUser).mockResolvedValue({
      uid: "user-456",
      candidateId: null,
      companyId: "company-456",
    });

    const result = await getRoomDetails({
      roomId: "room-123",
    });

    expect(result.otherParty).toEqual(
      expect.objectContaining({
        id: "candidate-123",
        name: "สมชาย ใจดี",
        photo: "https://example.com/candidate-photo.jpg",
        role: "candidate",
      })
    );
  });

  it("should return interview if exists", async () => {
    const result = await getRoomDetails({
      roomId: "room-123",
    });

    expect(result.interview).toEqual(
      expect.objectContaining({
        uid: "interview-001",
        appointment: expect.any(Number),
        channel: "online",
        status: "pending",
      })
    );
  });

  it("should return null interview if none exists", async () => {
    vi.mocked(webJobInterviewGetByFilter).mockResolvedValue([]);

    const result = await getRoomDetails({
      roomId: "room-123",
    });

    expect(result.interview).toBeNull();
  });

  it("should throw ROOM_NOT_FOUND for invalid roomId", async () => {
    vi.mocked(chatRepository.getById).mockResolvedValue(null);

    await expect(
      getRoomDetails({
        roomId: "invalid-room",
      })
    ).rejects.toThrow("ROOM_NOT_FOUND");
  });

  it("should throw NOT_PARTICIPANT if user not in room", async () => {
    vi.mocked(chatRepository.getById).mockResolvedValue({
      ...mockRoom,
      candidateId: "other-candidate",
      companyId: "other-company",
    });

    await expect(
      getRoomDetails({
        roomId: "room-123",
      })
    ).rejects.toThrow("NOT_PARTICIPANT");
  });

  it("should throw UNAUTHORIZED when no session", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    await expect(
      getRoomDetails({
        roomId: "room-123",
      })
    ).rejects.toThrow("UNAUTHORIZED");
  });

  it("should include current user role in response", async () => {
    const result = await getRoomDetails({
      roomId: "room-123",
    });

    expect(result.currentUser).toEqual(
      expect.objectContaining({
        id: "user-123",
        role: "candidate",
      })
    );
  });

  it("should include job context if available", async () => {
    const result = await getRoomDetails({
      roomId: "room-123",
    });

    expect(result.jobId).toBe("job-789");
  });
});
