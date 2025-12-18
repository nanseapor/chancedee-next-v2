import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { WorkExperienceSection } from "@/app/jobsmarket/candidates/[id]/profile/_components/WorkExperienceSection";

const mockWorkExperience = [
  {
    company: "บริษัท ABC จำกัด",
    jobTitle: "Software Engineer",
    startMonth: 1,
    startYear: 2020,
    endMonth: 12,
    endYear: 2022,
    isCurrent: false,
    isNewGraduate: false,
    salary: 50000,
  },
  {
    company: "บริษัท XYZ จำกัด",
    jobTitle: "Senior Developer",
    startMonth: 1,
    startYear: 2023,
    isCurrent: true,
    isNewGraduate: false,
    salary: 80000,
    note: "Leading team of 5 developers",
  },
];

describe("WorkExperienceSection", () => {
  it("should render section title", () => {
    render(
      <WorkExperienceSection
        works={mockWorkExperience}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText("ประสบการณ์ทำงาน")).toBeInTheDocument();
  });

  it("should render all work entries", () => {
    render(
      <WorkExperienceSection
        works={mockWorkExperience}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText("บริษัท ABC จำกัด")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("บริษัท XYZ จำกัด")).toBeInTheDocument();
    expect(screen.getByText("Senior Developer")).toBeInTheDocument();
  });

  it("should display current position correctly", () => {
    render(
      <WorkExperienceSection
        works={mockWorkExperience}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText(/ปัจจุบัน/)).toBeInTheDocument();
  });

  it("should format duration for completed positions", () => {
    render(
      <WorkExperienceSection
        works={mockWorkExperience}
        onEdit={vi.fn()}
      />
    );

    // First job: 01/2020 - 12/2022
    expect(screen.getByText(/01\/2020 - 12\/2022/)).toBeInTheDocument();
  });

  it("should display note when provided", () => {
    render(
      <WorkExperienceSection
        works={mockWorkExperience}
        onEdit={vi.fn()}
      />
    );

    expect(
      screen.getByText("Leading team of 5 developers")
    ).toBeInTheDocument();
  });

  it("should show empty state when no work experience", () => {
    render(
      <WorkExperienceSection
        works={[]}
        onEdit={vi.fn()}
      />
    );

    expect(
      screen.getByText("ยังไม่มีประสบการณ์ทำงาน")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/คลิกแก้ไขเพื่อเพิ่มประสบการณ์/)
    ).toBeInTheDocument();
  });

  it("should render edit button", () => {
    render(
      <WorkExperienceSection
        works={mockWorkExperience}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /แก้ไข/ })).toBeInTheDocument();
  });
});
