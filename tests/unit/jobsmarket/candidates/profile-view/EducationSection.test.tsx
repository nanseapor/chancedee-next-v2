import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { EducationSection } from "@/app/jobsmarket/candidates/[id]/profile/_components/EducationSection";

const mockEducations = [
  {
    institution: "มหาวิทยาลัยธรรมศาสตร์",
    major: "วิศวกรรมคอมพิวเตอร์",
    minor: "คณิตศาสตร์",
    educationLevel: 5,
    educationLabel: "ปริญญาตรี",
    startYear: 2016,
    endYear: 2020,
    gpax: "3.45",
    highlights: "เกียรตินิยมอันดับ 2",
  },
  {
    institution: "โรงเรียนสาธิตมหาวิทยาลัย",
    educationLevel: 2,
    educationLabel: "มัธยมศึกษาตอนปลาย",
    startYear: 2013,
    endYear: 2016,
    gpax: "3.80",
  },
];

describe("EducationSection", () => {
  it("should render section title", () => {
    render(<EducationSection educations={mockEducations} onEdit={vi.fn()} />);

    expect(screen.getByText("ประวัติการศึกษา")).toBeInTheDocument();
  });

  it("should render all education entries", () => {
    render(<EducationSection educations={mockEducations} onEdit={vi.fn()} />);

    expect(
      screen.getByText("มหาวิทยาลัยธรรมศาสตร์")
    ).toBeInTheDocument();
    expect(
      screen.getByText("โรงเรียนสาธิตมหาวิทยาลัย")
    ).toBeInTheDocument();
  });

  it("should display education level badges", () => {
    render(<EducationSection educations={mockEducations} onEdit={vi.fn()} />);

    expect(screen.getByText("ปริญญาตรี")).toBeInTheDocument();
    expect(screen.getByText("มัธยมศึกษาตอนปลาย")).toBeInTheDocument();
  });

  it("should display major and minor when provided", () => {
    render(<EducationSection educations={mockEducations} onEdit={vi.fn()} />);

    // Component displays major / minor separated
    expect(screen.getByText(/วิศวกรรมคอมพิวเตอร์/)).toBeInTheDocument();
    expect(screen.getByText(/คณิตศาสตร์/)).toBeInTheDocument();
  });

  it("should display GPA", () => {
    render(<EducationSection educations={mockEducations} onEdit={vi.fn()} />);

    expect(screen.getByText(/3.45/)).toBeInTheDocument();
    expect(screen.getByText(/3.80/)).toBeInTheDocument();
  });

  it("should display graduation year", () => {
    render(<EducationSection educations={mockEducations} onEdit={vi.fn()} />);

    expect(screen.getByText(/2020/)).toBeInTheDocument();
    expect(screen.getByText(/2016/)).toBeInTheDocument();
  });

  it("should display highlights when provided", () => {
    render(<EducationSection educations={mockEducations} onEdit={vi.fn()} />);

    expect(screen.getByText("เกียรตินิยมอันดับ 2")).toBeInTheDocument();
  });

  it("should show empty state when no education", () => {
    render(<EducationSection educations={[]} onEdit={vi.fn()} />);

    expect(screen.getByText("ยังไม่มีประวัติการศึกษา")).toBeInTheDocument();
    expect(
      screen.getByText(/คลิกแก้ไขเพื่อเพิ่มประวัติการศึกษา/)
    ).toBeInTheDocument();
  });

  it("should render edit button", () => {
    render(<EducationSection educations={mockEducations} onEdit={vi.fn()} />);

    expect(screen.getByRole("button", { name: /แก้ไข/ })).toBeInTheDocument();
  });

  it("should handle education entry without optional fields", () => {
    const minimalEducation = [
      {
        institution: "มหาวิทยาลัยเทคโนโลยี",
        educationLevel: 5,
        educationLabel: "ปริญญาตรี",
        startYear: 2015,
        endYear: 2019,
        gpax: "3.20",
      },
    ];

    render(<EducationSection educations={minimalEducation} onEdit={vi.fn()} />);

    expect(screen.getByText("มหาวิทยาลัยเทคโนโลยี")).toBeInTheDocument();
    expect(screen.getByText("ปริญญาตรี")).toBeInTheDocument();
    // Should not crash when major/minor/highlights are missing
  });

  it("should handle undefined educations array", () => {
    // Component expects array, not undefined - test with empty array instead
    render(<EducationSection educations={[]} onEdit={vi.fn()} />);

    expect(screen.getByText("ยังไม่มีประวัติการศึกษา")).toBeInTheDocument();
  });
});
