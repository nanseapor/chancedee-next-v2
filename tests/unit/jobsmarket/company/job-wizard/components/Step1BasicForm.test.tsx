import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Step1BasicForm } from "@/app/companies/[id]/dashboard/jobs/new/_components/Step1BasicForm";

describe("Step1BasicForm", () => {
  const defaultProps = {
    formData: {
      title: "",
      jobType: undefined,
      jobLevel: undefined,
      numberOfPosition: 1,
      hideSalary: false,
      skills: [],
      workModel: undefined,
    },
    errors: {},
    onFieldChange: vi.fn(),
  };

  describe("Rendering", () => {
    it("should render all required fields", () => {
      render(<Step1BasicForm {...defaultProps} />);

      expect(screen.getByLabelText(/ชื่อตำแหน่งงาน/)).toBeInTheDocument();
      expect(screen.getByLabelText(/ประเภทการจ้างงาน/)).toBeInTheDocument();
      expect(screen.getByLabelText(/ระดับตำแหน่ง/)).toBeInTheDocument();
      expect(screen.getByLabelText(/จำนวนตำแหน่งที่รับ/)).toBeInTheDocument();
    });

    it("should render optional fields", () => {
      render(<Step1BasicForm {...defaultProps} />);

      expect(screen.getByLabelText(/แผนก\/ฝ่าย/)).toBeInTheDocument();
      expect(screen.getByLabelText(/เงินเดือนต่ำสุด/)).toBeInTheDocument();
      expect(screen.getByLabelText(/เงินเดือนสูงสุด/)).toBeInTheDocument();
      expect(screen.getByLabelText(/ไม่แสดงเงินเดือน/)).toBeInTheDocument();
    });

    it("should display field errors", () => {
      const props = {
        ...defaultProps,
        errors: {
          title: "กรุณากรอกชื่อตำแหน่งงาน",
          jobType: "กรุณาเลือกประเภทการจ้างงาน",
        },
      };

      render(<Step1BasicForm {...props} />);

      expect(screen.getByText("กรุณากรอกชื่อตำแหน่งงาน")).toBeInTheDocument();
      expect(screen.getByText("กรุณาเลือกประเภทการจ้างงาน")).toBeInTheDocument();
    });
  });

  describe("Field Interactions", () => {
    it("should call onFieldChange when title changes", () => {
      const onFieldChange = vi.fn();
      render(<Step1BasicForm {...defaultProps} onFieldChange={onFieldChange} />);

      const titleInput = screen.getByLabelText(/ชื่อตำแหน่งงาน/);
      fireEvent.change(titleInput, { target: { value: "Frontend Developer" } });

      expect(onFieldChange).toHaveBeenCalledWith("title", "Frontend Developer");
    });

    it("should call onFieldChange when job type is selected", () => {
      const onFieldChange = vi.fn();
      render(<Step1BasicForm {...defaultProps} onFieldChange={onFieldChange} />);

      const jobTypeSelect = screen.getByLabelText(/ประเภทการจ้างงาน/);
      fireEvent.change(jobTypeSelect, { target: { value: "fulltime" } });

      expect(onFieldChange).toHaveBeenCalledWith("jobType", "fulltime");
    });

    it("should call onFieldChange when number of positions changes", () => {
      const onFieldChange = vi.fn();
      render(<Step1BasicForm {...defaultProps} onFieldChange={onFieldChange} />);

      const positionsInput = screen.getByLabelText(/จำนวนตำแหน่งที่รับ/);
      fireEvent.change(positionsInput, { target: { value: "3" } });

      expect(onFieldChange).toHaveBeenCalledWith("numberOfPosition", 3);
    });

    it("should toggle hide salary checkbox", () => {
      const onFieldChange = vi.fn();
      render(<Step1BasicForm {...defaultProps} onFieldChange={onFieldChange} />);

      const checkbox = screen.getByLabelText(/ไม่แสดงเงินเดือน/);
      fireEvent.click(checkbox);

      expect(onFieldChange).toHaveBeenCalledWith("hideSalary", true);
    });
  });

  describe("Salary Fields", () => {
    it("should disable salary inputs when hide salary is checked", () => {
      const props = {
        ...defaultProps,
        formData: {
          ...defaultProps.formData,
          hideSalary: true,
        },
      };

      render(<Step1BasicForm {...props} />);

      const minSalaryInput = screen.getByLabelText(/เงินเดือนต่ำสุด/) as HTMLInputElement;
      const maxSalaryInput = screen.getByLabelText(/เงินเดือนสูงสุด/) as HTMLInputElement;

      expect(minSalaryInput.disabled).toBe(true);
      expect(maxSalaryInput.disabled).toBe(true);
    });

    it("should enable salary inputs when hide salary is unchecked", () => {
      render(<Step1BasicForm {...defaultProps} />);

      const minSalaryInput = screen.getByLabelText(/เงินเดือนต่ำสุด/) as HTMLInputElement;
      const maxSalaryInput = screen.getByLabelText(/เงินเดือนสูงสุด/) as HTMLInputElement;

      expect(minSalaryInput.disabled).toBe(false);
      expect(maxSalaryInput.disabled).toBe(false);
    });

    it("should display salary range error", () => {
      const props = {
        ...defaultProps,
        errors: {
          salary: "เงินเดือนสูงสุดต้องมากกว่าต่ำสุด",
        },
      };

      render(<Step1BasicForm {...props} />);

      expect(screen.getByText("เงินเดือนสูงสุดต้องมากกว่าต่ำสุด")).toBeInTheDocument();
    });
  });

  describe("Pre-filled Data", () => {
    it("should display pre-filled form data", () => {
      const props = {
        ...defaultProps,
        formData: {
          ...defaultProps.formData,
          title: "Senior Developer",
          jobType: "fulltime" as const,
          jobLevel: "senior",
          numberOfPosition: 2,
          minSalary: 50000,
          maxSalary: 80000,
        },
      };

      render(<Step1BasicForm {...props} />);

      expect(screen.getByDisplayValue("Senior Developer")).toBeInTheDocument();
      expect(screen.getByDisplayValue("fulltime")).toBeInTheDocument();
      expect(screen.getByDisplayValue("senior")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2")).toBeInTheDocument();
      expect(screen.getByDisplayValue("50000")).toBeInTheDocument();
      expect(screen.getByDisplayValue("80000")).toBeInTheDocument();
    });
  });

  describe("Validation Feedback", () => {
    it("should show error styling on invalid fields", () => {
      const props = {
        ...defaultProps,
        errors: {
          title: "กรุณากรอกชื่อตำแหน่งงาน",
        },
      };

      render(<Step1BasicForm {...props} />);

      const titleInput = screen.getByLabelText(/ชื่อตำแหน่งงาน/);
      expect(titleInput).toHaveClass("border-red-500"); // Or your error class
    });

    it("should clear error when field is corrected", async () => {
      const onFieldChange = vi.fn();
      const { rerender } = render(
        <Step1BasicForm
          {...defaultProps}
          onFieldChange={onFieldChange}
          errors={{ title: "กรุณากรอกชื่อตำแหน่งงาน" }}
        />
      );

      const titleInput = screen.getByLabelText(/ชื่อตำแหน่งงาน/);
      fireEvent.change(titleInput, { target: { value: "Valid Title" } });

      // Re-render without error
      rerender(
        <Step1BasicForm {...defaultProps} onFieldChange={onFieldChange} errors={{}} />
      );

      await waitFor(() => {
        expect(screen.queryByText("กรุณากรอกชื่อตำแหน่งงาน")).not.toBeInTheDocument();
      });
    });
  });
});
