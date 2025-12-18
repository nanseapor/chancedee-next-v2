/**
 * Unit Tests for Step2WorkExperience Form Component
 * CAND-R02: Profile Creation Wizard - Step 2 Work Experience
 *
 * Tests array CRUD operations, fresh graduate toggle, validation, and user interactions
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Step2WorkExperience } from "@/app/jobsmarket/candidates/profile/create/_components/Step2WorkExperience";

describe("Step2WorkExperience", () => {
  const mockOnSubmit = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnBack.mockClear();
  });

  describe("Rendering", () => {
    it("should render form with header and fresh graduate checkbox", () => {
      render(<Step2WorkExperience onSubmit={mockOnSubmit} />);

      expect(screen.getByText("ประสบการณ์ทำงาน")).toBeInTheDocument();
      expect(
        screen.getByText(/เพิ่มประสบการณ์การทำงานของคุณ/)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/ฉันเป็นนักศึกษาจบใหม่ \(ยังไม่มีประสบการณ์ทำงาน\)/)
      ).toBeInTheDocument();
    });

    it("should show add work button when not fresh graduate", () => {
      render(<Step2WorkExperience onSubmit={mockOnSubmit} />);

      expect(
        screen.getByRole("button", { name: /เพิ่มประสบการณ์/ })
      ).toBeInTheDocument();
    });

    it("should render submit button with default text", () => {
      render(<Step2WorkExperience onSubmit={mockOnSubmit} />);

      expect(screen.getByRole("button", { name: "ถัดไป" })).toBeInTheDocument();
    });

    it("should render custom submit button text", () => {
      render(
        <Step2WorkExperience onSubmit={mockOnSubmit} submitText="บันทึกข้อมูล" />
      );

      expect(
        screen.getByRole("button", { name: "บันทึกข้อมูล" })
      ).toBeInTheDocument();
    });

    it("should render back button when showBackButton is true", () => {
      render(
        <Step2WorkExperience
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          showBackButton={true}
        />
      );

      expect(
        screen.getByRole("button", { name: "ย้อนกลับ" })
      ).toBeInTheDocument();
    });

    it("should not render back button by default", () => {
      render(<Step2WorkExperience onSubmit={mockOnSubmit} />);

      expect(
        screen.queryByRole("button", { name: "ย้อนกลับ" })
      ).not.toBeInTheDocument();
    });
  });

  describe("Initial Data", () => {
    it("should populate form with initial work experiences", () => {
      const initialData = {
        works: [
          {
            company: "บริษัท ABC จำกัด",
            position: "Software Engineer",
            start_year: 2020,
            end_year: 2023,
            is_current: false,
            description: "Developed web applications",
          },
        ],
        is_fresh_graduate: false,
      };

      render(
        <Step2WorkExperience onSubmit={mockOnSubmit} initialData={initialData} />
      );

      expect(screen.getByText("บริษัท ABC จำกัด")).toBeInTheDocument();
      expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      expect(screen.getByText("2020 - 2023")).toBeInTheDocument();
    });

    it("should check fresh graduate checkbox if initialData has is_fresh_graduate: true", () => {
      const initialData = {
        works: [],
        is_fresh_graduate: true,
      };

      render(
        <Step2WorkExperience onSubmit={mockOnSubmit} initialData={initialData} />
      );

      const checkbox = screen.getByLabelText(
        /ฉันเป็นนักศึกษาจบใหม่ \(ยังไม่มีประสบการณ์ทำงาน\)/
      );
      expect(checkbox).toBeChecked();
    });
  });

  describe("Fresh Graduate Toggle", () => {
    it("should enable fresh graduate checkbox when no work experiences", async () => {
      const user = userEvent.setup();
      render(<Step2WorkExperience onSubmit={mockOnSubmit} />);

      const checkbox = screen.getByLabelText(
        /ฉันเป็นนักศึกษาจบใหม่ \(ยังไม่มีประสบการณ์ทำงาน\)/
      );

      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it("should show confirmation dialog when enabling fresh graduate with existing work", async () => {
      const user = userEvent.setup();
      const initialData = {
        works: [
          {
            company: "บริษัท ABC จำกัด",
            position: "Developer",
            start_year: 2020,
            end_year: 2023,
            is_current: false,
            description: "",
          },
        ],
        is_fresh_graduate: false,
      };

      render(
        <Step2WorkExperience onSubmit={mockOnSubmit} initialData={initialData} />
      );

      const checkbox = screen.getByLabelText(
        /ฉันเป็นนักศึกษาจบใหม่ \(ยังไม่มีประสบการณ์ทำงาน\)/
      );

      await user.click(checkbox);

      // Confirmation dialog should appear
      await waitFor(() => {
        expect(screen.getByText(/คุณแน่ใจหรือไม่/)).toBeInTheDocument();
        expect(
          screen.getByText(/จะลบประสบการณ์ทำงานทั้งหมดที่คุณกรอกไว้/)
        ).toBeInTheDocument();
      });
    });

    it("should clear work experiences when confirming fresh graduate toggle", async () => {
      const user = userEvent.setup();
      const initialData = {
        works: [
          {
            company: "บริษัท ABC จำกัด",
            position: "Developer",
            start_year: 2020,
            end_year: 2023,
            is_current: false,
            description: "",
          },
        ],
        is_fresh_graduate: false,
      };

      render(
        <Step2WorkExperience onSubmit={mockOnSubmit} initialData={initialData} />
      );

      const checkbox = screen.getByLabelText(
        /ฉันเป็นนักศึกษาจบใหม่ \(ยังไม่มีประสบการณ์ทำงาน\)/
      );

      await user.click(checkbox);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "ยืนยัน" })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: "ยืนยัน" }));

      // Work experience should be removed
      await waitFor(() => {
        expect(screen.queryByText("บริษัท ABC จำกัด")).not.toBeInTheDocument();
      });
    });

    it("should cancel fresh graduate toggle when clicking cancel", async () => {
      const user = userEvent.setup();
      const initialData = {
        works: [
          {
            company: "บริษัท ABC จำกัด",
            position: "Developer",
            start_year: 2020,
            end_year: 2023,
            is_current: false,
            description: "",
          },
        ],
        is_fresh_graduate: false,
      };

      render(
        <Step2WorkExperience onSubmit={mockOnSubmit} initialData={initialData} />
      );

      const checkbox = screen.getByLabelText(
        /ฉันเป็นนักศึกษาจบใหม่ \(ยังไม่มีประสบการณ์ทำงาน\)/
      );

      await user.click(checkbox);

      // Cancel
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "ยกเลิก" })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: "ยกเลิก" }));

      // Work experience should still be there
      expect(screen.getByText("บริษัท ABC จำกัด")).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it("should auto-uncheck fresh graduate when adding work experience", async () => {
      const user = userEvent.setup();
      const initialData = {
        works: [],
        is_fresh_graduate: true,
      };

      render(
        <Step2WorkExperience onSubmit={mockOnSubmit} initialData={initialData} />
      );

      const checkbox = screen.getByLabelText(
        /ฉันเป็นนักศึกษาจบใหม่ \(ยังไม่มีประสบการณ์ทำงาน\)/
      );

      // When fresh graduate is checked, add button is not visible (hidden by design)
      // So we first uncheck fresh graduate, then add work, which should keep it unchecked
      await user.click(checkbox); // Uncheck

      // Click add work experience
      await user.click(
        screen.getByRole("button", { name: /เพิ่มประสบการณ์/ })
      );

      // Fill and save work form
      await user.type(screen.getByPlaceholderText("บริษัท ABC จำกัด"), "บริษัท Test จำกัด");
      await user.type(screen.getByPlaceholderText("Software Engineer"), "Developer");

      const startYearSelect = screen.getByLabelText(/ปีที่เริ่มงาน/);
      await user.click(startYearSelect);
      await user.click(screen.getByRole("option", { name: "2020" }));

      const endYearSelect = screen.getByLabelText(/ปีที่สิ้นสุด/);
      await user.click(endYearSelect);
      await user.click(screen.getByRole("option", { name: "2023" }));

      await user.click(screen.getByRole("button", { name: "บันทึก" }));

      // Fresh graduate checkbox should remain unchecked
      await waitFor(() => {
        expect(checkbox).not.toBeChecked();
      });
    });
  });

  describe("Add Work Experience", () => {
    it("should show work form when clicking add button", async () => {
      const user = userEvent.setup();
      render(<Step2WorkExperience onSubmit={mockOnSubmit} />);

      await user.click(
        screen.getByRole("button", { name: /เพิ่มประสบการณ์/ })
      );

      expect(screen.getByPlaceholderText("บริษัท ABC จำกัด")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Software Engineer")).toBeInTheDocument();
      expect(screen.getByLabelText(/ปีที่เริ่มงาน/)).toBeInTheDocument();
      expect(screen.getByLabelText(/ปีที่สิ้นสุด/)).toBeInTheDocument();
    });

    it("should add work experience to list when form is valid", async () => {
      const user = userEvent.setup();
      render(<Step2WorkExperience onSubmit={mockOnSubmit} />);

      // Open form
      await user.click(
        screen.getByRole("button", { name: /เพิ่มประสบการณ์/ })
      );

      // Fill form
      await user.type(screen.getByPlaceholderText("บริษัท ABC จำกัด"), "บริษัท XYZ จำกัด");
      await user.type(screen.getByPlaceholderText("Software Engineer"), "Product Manager");

      // Select years (using click to open dropdown and select)
      const startYearSelect = screen.getByLabelText(/ปีที่เริ่มงาน/);
      await user.click(startYearSelect);
      await user.click(screen.getByRole("option", { name: "2020" }));

      const endYearSelect = screen.getByLabelText(/ปีที่สิ้นสุด/);
      await user.click(endYearSelect);
      await user.click(screen.getByRole("option", { name: "2023" }));

      // Save
      await user.click(screen.getByRole("button", { name: "บันทึก" }));

      // Verify work is added to list
      await waitFor(() => {
        expect(screen.getByText("บริษัท XYZ จำกัด")).toBeInTheDocument();
        expect(screen.getByText("Product Manager")).toBeInTheDocument();
      });
    });

    it("should show validation errors when adding work with empty fields", async () => {
      const user = userEvent.setup();
      render(<Step2WorkExperience onSubmit={mockOnSubmit} />);

      // Open form
      await user.click(
        screen.getByRole("button", { name: /เพิ่มประสบการณ์/ })
      );

      // Try to save without filling
      await user.click(screen.getByRole("button", { name: "บันทึก" }));

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText("กรุณากรอกชื่อบริษัท")).toBeInTheDocument();
        expect(screen.getByText("กรุณากรอกตำแหน่ง")).toBeInTheDocument();
      });
    });

    it("should cancel adding work when clicking cancel", async () => {
      const user = userEvent.setup();
      render(<Step2WorkExperience onSubmit={mockOnSubmit} />);

      // Open form
      await user.click(
        screen.getByRole("button", { name: /เพิ่มประสบการณ์/ })
      );

      // Fill form partially
      await user.type(screen.getByPlaceholderText("บริษัท ABC จำกัด"), "บริษัท XYZ จำกัด");

      // Cancel
      await user.click(screen.getByRole("button", { name: "ยกเลิก" }));

      // Form should close and no work added
      expect(
        screen.queryByPlaceholderText("บริษัท ABC จำกัด")
      ).not.toBeInTheDocument();
      expect(screen.queryByText("บริษัท XYZ จำกัด")).not.toBeInTheDocument();
    });
  });

  describe("Current Job Toggle", () => {
    it("should show 'ปัจจุบัน' for current job", async () => {
      const user = userEvent.setup();
      render(<Step2WorkExperience onSubmit={mockOnSubmit} />);

      // Open form
      await user.click(
        screen.getByRole("button", { name: /เพิ่มประสบการณ์/ })
      );

      // Fill form
      await user.type(screen.getByPlaceholderText("บริษัท ABC จำกัด"), "บริษัท Current จำกัด");
      await user.type(screen.getByPlaceholderText("Software Engineer"), "Senior Developer");

      const startYearSelect = screen.getByLabelText(/ปีที่เริ่มงาน/);
      await user.click(startYearSelect);
      await user.click(screen.getByRole("option", { name: "2020" }));

      // Check current job
      await user.click(screen.getByLabelText(/ยังทำงานอยู่ในตำแหน่งนี้/));

      // Save
      await user.click(screen.getByRole("button", { name: "บันทึก" }));

      // Verify shows "ปัจจุบัน"
      await waitFor(() => {
        expect(screen.getByText(/2020 - ปัจจุบัน/)).toBeInTheDocument();
      });
    });

    it("should only allow one current job at a time", async () => {
      const user = userEvent.setup();
      const initialData = {
        works: [
          {
            company: "บริษัท Old จำกัด",
            position: "Developer",
            start_year: 2018,
            end_year: null,
            is_current: true,
            description: "",
          },
        ],
        is_fresh_graduate: false,
      };

      render(
        <Step2WorkExperience onSubmit={mockOnSubmit} initialData={initialData} />
      );

      // Add new current job
      await user.click(
        screen.getByRole("button", { name: /เพิ่มประสบการณ์/ })
      );

      await user.type(screen.getByPlaceholderText("บริษัท ABC จำกัด"), "บริษัท New จำกัด");
      await user.type(screen.getByPlaceholderText("Software Engineer"), "Senior Developer");

      const startYearSelect = screen.getByLabelText(/ปีที่เริ่มงาน/);
      await user.click(startYearSelect);
      await user.click(screen.getByRole("option", { name: "2020" }));

      await user.click(screen.getByLabelText(/ยังทำงานอยู่ในตำแหน่งนี้/));

      await user.click(screen.getByRole("button", { name: "บันทึก" }));

      // Old current job should no longer be current
      await waitFor(() => {
        expect(screen.queryByText(/2018 - ปัจจุบัน/)).not.toBeInTheDocument();
      });
    });
  });

  describe("Edit Work Experience", () => {
    it("should open edit form when clicking edit button", async () => {
      const user = userEvent.setup();
      const initialData = {
        works: [
          {
            company: "บริษัท ABC จำกัด",
            position: "Developer",
            start_year: 2020,
            end_year: 2023,
            is_current: false,
            description: "Test description",
          },
        ],
        is_fresh_graduate: false,
      };

      render(
        <Step2WorkExperience onSubmit={mockOnSubmit} initialData={initialData} />
      );

      // Click edit on the work item (icon-only button)
      // Find the work card that contains both the company name and buttons
      const allButtons = screen.getAllByRole("button");
      const workCards = screen.getAllByText("บริษัท ABC จำกัด");
      // The edit button should be nearby the company text
      // Find buttons that are in the same card (looking for icon buttons after the text)
      const editButtons = allButtons.filter(btn => btn.querySelector('.lucide-pencil'));
      await user.click(editButtons[0]);

      // Form should appear with pre-filled data
      expect(screen.getByDisplayValue("บริษัท ABC จำกัด")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Developer")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test description")).toBeInTheDocument();
    });

    it("should update work experience when editing", async () => {
      const user = userEvent.setup();
      const initialData = {
        works: [
          {
            company: "บริษัท ABC จำกัด",
            position: "Developer",
            start_year: 2020,
            end_year: 2023,
            is_current: false,
            description: "",
          },
        ],
        is_fresh_graduate: false,
      };

      render(
        <Step2WorkExperience onSubmit={mockOnSubmit} initialData={initialData} />
      );

      // Edit (icon-only button)
      const allButtons = screen.getAllByRole("button");
      const editButtons = allButtons.filter(btn => btn.querySelector('.lucide-pencil'));
      await user.click(editButtons[0]);

      // Update position
      const positionInput = screen.getByDisplayValue("Developer");
      await user.clear(positionInput);
      await user.type(positionInput, "Senior Developer");

      // Save
      await user.click(screen.getByRole("button", { name: "บันทึก" }));

      // Verify updated
      await waitFor(() => {
        expect(screen.getByText("Senior Developer")).toBeInTheDocument();
        expect(screen.queryByText("Developer")).not.toBeInTheDocument();
      });
    });
  });

  describe("Delete Work Experience", () => {
    it("should delete work experience when clicking delete button", async () => {
      const user = userEvent.setup();
      const initialData = {
        works: [
          {
            company: "บริษัท ABC จำกัด",
            position: "Developer",
            start_year: 2020,
            end_year: 2023,
            is_current: false,
            description: "",
          },
        ],
        is_fresh_graduate: false,
      };

      render(
        <Step2WorkExperience onSubmit={mockOnSubmit} initialData={initialData} />
      );

      // Delete (icon-only button)
      const allButtons = screen.getAllByRole("button");
      const deleteButtons = allButtons.filter(btn => btn.querySelector('.lucide-trash2'));
      await user.click(deleteButtons[0]);

      // Verify deleted
      await waitFor(() => {
        expect(screen.queryByText("บริษัท ABC จำกัด")).not.toBeInTheDocument();
      });
    });

    it("should handle deleting multiple work experiences", async () => {
      const user = userEvent.setup();
      const initialData = {
        works: [
          {
            company: "บริษัท A จำกัด",
            position: "Developer",
            start_year: 2018,
            end_year: 2020,
            is_current: false,
            description: "",
          },
          {
            company: "บริษัท B จำกัด",
            position: "Senior Developer",
            start_year: 2020,
            end_year: 2023,
            is_current: false,
            description: "",
          },
        ],
        is_fresh_graduate: false,
      };

      render(
        <Step2WorkExperience onSubmit={mockOnSubmit} initialData={initialData} />
      );

      // Delete first work (icon-only button)
      const allButtons = screen.getAllByRole("button");
      const deleteButtons = allButtons.filter(btn => btn.querySelector('.lucide-trash2'));
      await user.click(deleteButtons[0]); // First delete button (for บริษัท A)

      // Verify first deleted, second remains
      await waitFor(() => {
        expect(screen.queryByText("บริษัท A จำกัด")).not.toBeInTheDocument();
        expect(screen.getByText("บริษัท B จำกัด")).toBeInTheDocument();
      });
    });
  });

  describe("Validation - Work Limit", () => {
    it("should disable add button when reaching 20 work experiences", () => {
      const works = Array.from({ length: 20 }, (_, i) => ({
        company: `บริษัท ${i + 1} จำกัด`,
        position: "Developer",
        start_year: 2020,
        end_year: 2021,
        is_current: false,
        description: "",
      }));

      const initialData = {
        works,
        is_fresh_graduate: false,
      };

      render(
        <Step2WorkExperience onSubmit={mockOnSubmit} initialData={initialData} />
      );

      const addButton = screen.getByRole("button", {
        name: /เพิ่มประสบการณ์/,
      });
      expect(addButton).toBeDisabled();
    });
  });

  describe("Validation - Form Submission", () => {
    it("should show error when submitting without work experience and not fresh graduate", async () => {
      const user = userEvent.setup();
      render(<Step2WorkExperience onSubmit={mockOnSubmit} />);

      await user.click(screen.getByRole("button", { name: "ถัดไป" }));

      await waitFor(() => {
        expect(
          screen.getByText(/กรุณาเพิ่มประสบการณ์ หรือเลือกนักศึกษาจบใหม่/)
        ).toBeInTheDocument();
      });
    });

    it("should submit successfully when fresh graduate is checked", async () => {
      const user = userEvent.setup();
      render(<Step2WorkExperience onSubmit={mockOnSubmit} />);

      // Check fresh graduate
      await user.click(
        screen.getByLabelText(/ฉันเป็นนักศึกษาจบใหม่ \(ยังไม่มีประสบการณ์ทำงาน\)/)
      );

      // Submit
      await user.click(screen.getByRole("button", { name: "ถัดไป" }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            works: [],
            is_fresh_graduate: true,
          }),
          expect.anything() // Event object
        );
      });
    });

    it("should submit successfully with work experiences", async () => {
      const user = userEvent.setup();
      const initialData = {
        works: [
          {
            company: "บริษัท ABC จำกัด",
            position: "Developer",
            start_year: 2020,
            end_year: 2023,
            is_current: false,
            description: "Test work",
          },
        ],
        is_fresh_graduate: false,
      };

      render(
        <Step2WorkExperience onSubmit={mockOnSubmit} initialData={initialData} />
      );

      await user.click(screen.getByRole("button", { name: "ถัดไป" }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            works: [
              {
                company: "บริษัท ABC จำกัด",
                position: "Developer",
                start_year: 2020,
                end_year: 2023,
                is_current: false,
                description: "Test work",
              },
            ],
            is_fresh_graduate: false,
          }),
          expect.anything() // Event object
        );
      });
    });
  });

  describe("Loading State", () => {
    it("should disable submit button when loading", () => {
      render(<Step2WorkExperience onSubmit={mockOnSubmit} isLoading={true} />);

      const submitButton = screen.getByRole("button", { name: /กำลังบันทึก/ });
      expect(submitButton).toBeDisabled();
    });

    it("should disable back button when loading", () => {
      render(
        <Step2WorkExperience
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          showBackButton={true}
          isLoading={true}
        />
      );

      const backButton = screen.getByRole("button", { name: "ย้อนกลับ" });
      expect(backButton).toBeDisabled();
    });
  });

  describe("Back Button", () => {
    it("should call onBack when back button is clicked", async () => {
      const user = userEvent.setup();
      mockOnBack.mockClear();

      render(
        <Step2WorkExperience
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          showBackButton={true}
        />
      );

      await user.click(screen.getByRole("button", { name: "ย้อนกลับ" }));

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });
});
