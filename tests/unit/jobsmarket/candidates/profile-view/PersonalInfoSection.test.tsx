import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PersonalInfoSection } from "@/app/jobsmarket/candidates/[id]/profile/_components/PersonalInfoSection";
import type { FirebaseCandidateData } from "@/types/candidate.types";

const mockCandidate: FirebaseCandidateData = {
  uid: "test-uid",
  firstnameTH: "สมชาย",
  lastnameTH: "ใจดี",
  nicknameTH: "ชาย",
  email: "somchai@example.com",
  phone: "0812345678",
  birthdate: new Date("1990-05-15").getTime() / 1000,
  province: "กรุงเทพมหานคร",
  district: "บางกอกน้อย",
  addressLine1: "123 ถนนพระราม 7",
  postCode: "10700",
  isSearchable: true,
  isOnboarded: true,
  isActive: true,
  createdAt: Date.now() / 1000,
  updatedAt: Date.now() / 1000,
};

describe("PersonalInfoSection", () => {
  it("should render section title", () => {
    render(<PersonalInfoSection candidate={mockCandidate} onEdit={vi.fn()} />);

    expect(screen.getByText("ข้อมูลส่วนตัว")).toBeInTheDocument();
  });

  it("should render Thai name", () => {
    render(<PersonalInfoSection candidate={mockCandidate} onEdit={vi.fn()} />);

    expect(screen.getByText("สมชาย ใจดี")).toBeInTheDocument();
  });

  it("should render nickname when provided", () => {
    render(<PersonalInfoSection candidate={mockCandidate} onEdit={vi.fn()} />);

    expect(screen.getByText("ชาย")).toBeInTheDocument();
  });

  it("should render email", () => {
    render(<PersonalInfoSection candidate={mockCandidate} onEdit={vi.fn()} />);

    expect(screen.getByText("somchai@example.com")).toBeInTheDocument();
  });

  it("should render phone number", () => {
    render(<PersonalInfoSection candidate={mockCandidate} onEdit={vi.fn()} />);

    expect(screen.getByText("0812345678")).toBeInTheDocument();
  });

  it("should format birthdate correctly", () => {
    render(<PersonalInfoSection candidate={mockCandidate} onEdit={vi.fn()} />);

    // Component shows birthdate with age in parentheses
    expect(screen.getByText(/15\/05\/1990/)).toBeInTheDocument();
  });

  it("should calculate and display age", () => {
    render(<PersonalInfoSection candidate={mockCandidate} onEdit={vi.fn()} />);

    // Age should be calculated from 1990
    const ageText = screen.getByText(/ปี/);
    expect(ageText).toBeInTheDocument();
  });

  it("should render address", () => {
    render(<PersonalInfoSection candidate={mockCandidate} onEdit={vi.fn()} />);

    expect(screen.getByText(/123 ถนนพระราม 7/)).toBeInTheDocument();
    expect(screen.getByText(/บางกอกน้อย/)).toBeInTheDocument();
    expect(screen.getByText(/กรุงเทพมหานคร/)).toBeInTheDocument();
    expect(screen.getByText(/10700/)).toBeInTheDocument();
  });

  it("should render edit button", () => {
    render(<PersonalInfoSection candidate={mockCandidate} onEdit={vi.fn()} />);

    expect(screen.getByRole("button", { name: /แก้ไข/ })).toBeInTheDocument();
  });

  it("should handle missing optional fields", () => {
    const minimalCandidate: FirebaseCandidateData = {
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

    render(
      <PersonalInfoSection candidate={minimalCandidate} onEdit={vi.fn()} />
    );

    // Should still render required fields
    expect(screen.getByText("สมชาย ใจดี")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();

    // Optional fields should not cause errors
    expect(screen.queryByText("ชื่อเล่น")).not.toBeInTheDocument();
  });
});
