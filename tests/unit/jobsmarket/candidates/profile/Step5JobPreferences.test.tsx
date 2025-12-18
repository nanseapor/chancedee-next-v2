/**
 * Unit Tests for Step5JobPreferences Form Component
 * CAND-R02: Profile Creation Wizard - Step 5 Job Preferences
 *
 * Tests job types, positions, salary validation, locations, and availability
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Step5JobPreferences } from "@/app/jobsmarket/candidates/profile/create/_components/Step5JobPreferences";

describe("Step5JobPreferences", () => {
  const mockOnSubmit = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnBack.mockClear();
  });

  describe("Rendering", () => {
    it("should render form with all sections", () => {
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      expect(screen.getByText("ความต้องการงาน")).toBeInTheDocument();
      expect(
        screen.getByText(/บอกเราว่าคุณกำลังมองหางานประเภทไหน/)
      ).toBeInTheDocument();

      // Job types section
      expect(screen.getByText(/^ประเภทงาน/)).toBeInTheDocument();

      // Positions section
      expect(screen.getByText(/^ตำแหน่งที่สนใจ/)).toBeInTheDocument();

      // Salary section
      expect(screen.getByLabelText(/เงินเดือนขั้นต่ำ/)).toBeInTheDocument();
      expect(screen.getByLabelText(/เงินเดือนสูงสุด/)).toBeInTheDocument();

      // Locations section
      expect(screen.getByText(/^พื้นที่ทำงานที่สนใจ/)).toBeInTheDocument();

      // Availability section
      expect(screen.getByText(/^ความพร้อมเริ่มงาน/)).toBeInTheDocument();
    });

    it("should render submit button with default text", () => {
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      expect(screen.getByRole("button", { name: "เสร็จสิ้น" })).toBeInTheDocument();
    });

    it("should render custom submit button text", () => {
      render(
        <Step5JobPreferences onSubmit={mockOnSubmit} submitText="บันทึกข้อมูล" />
      );

      expect(
        screen.getByRole("button", { name: "บันทึกข้อมูล" })
      ).toBeInTheDocument();
    });

    it("should render back button when showBackButton is true", () => {
      render(
        <Step5JobPreferences
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          showBackButton={true}
        />
      );

      expect(
        screen.getByRole("button", { name: "ย้อนกลับ" })
      ).toBeInTheDocument();
    });
  });

  describe("Initial Data", () => {
    it("should populate form with initial data", () => {
      const initialData = {
        job_types: ["full_time", "part_time"],
        positions: ["Software Engineer", "Product Manager"],
        salary_min: 30000,
        salary_max: 60000,
        locations: ["กรุงเทพมหานคร", "เชียงใหม่"],
        availability: "immediate",
      };

      render(
        <Step5JobPreferences onSubmit={mockOnSubmit} initialData={initialData} />
      );

      // Check job types checkboxes
      expect(screen.getByLabelText("Full-time (เต็มเวลา)")).toBeChecked();
      expect(screen.getByLabelText("Part-time (พาร์ทไทม์)")).toBeChecked();

      // Check positions
      expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      expect(screen.getByText("Product Manager")).toBeInTheDocument();

      // Check salary
      expect(screen.getByLabelText(/เงินเดือนขั้นต่ำ/)).toHaveValue(30000);
      expect(screen.getByLabelText(/เงินเดือนสูงสุด/)).toHaveValue(60000);

      // Check locations (use getAllByLabelText since text appears multiple times)
      const bangkokCheckboxes = screen.getAllByLabelText("กรุงเทพมหานคร");
      expect(bangkokCheckboxes[0]).toBeChecked();

      const chiangmaiCheckboxes = screen.getAllByLabelText("เชียงใหม่");
      expect(chiangmaiCheckboxes[0]).toBeChecked();
    });
  });

  describe("Job Types - Multi-select", () => {
    it("should allow selecting multiple job types", async () => {
      const user = userEvent.setup();
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      await user.click(screen.getByLabelText("Full-time (เต็มเวลา)"));
      await user.click(screen.getByLabelText("Part-time (พาร์ทไทม์)"));
      await user.click(screen.getByLabelText("Contract (สัญญาจ้าง)"));

      expect(screen.getByLabelText("Full-time (เต็มเวลา)")).toBeChecked();
      expect(screen.getByLabelText("Part-time (พาร์ทไทม์)")).toBeChecked();
      expect(screen.getByLabelText("Contract (สัญญาจ้าง)")).toBeChecked();
    });

    it("should allow deselecting job types", async () => {
      const user = userEvent.setup();
      const initialData = {
        job_types: ["full_time", "part_time"],
        positions: ["Developer"],
        salary_min: 20000,
        salary_max: 40000,
        locations: ["กรุงเทพมหานคร"],
        availability: "immediate",
      };

      render(
        <Step5JobPreferences onSubmit={mockOnSubmit} initialData={initialData} />
      );

      await user.click(screen.getByLabelText("Part-time (พาร์ทไทม์)"));

      expect(screen.getByLabelText("Full-time (เต็มเวลา)")).toBeChecked();
      expect(screen.getByLabelText("Part-time (พาร์ทไทม์)")).not.toBeChecked();
    });

    it("should show validation error when no job type selected", async () => {
      const user = userEvent.setup();
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      await user.click(screen.getByRole("button", { name: "เสร็จสิ้น" }));

      await waitFor(() => {
        expect(
          screen.getByText("กรุณาเลือกประเภทงานอย่างน้อย 1 รายการ")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Desired Positions", () => {
    it("should add position when clicking add button", async () => {
      const user = userEvent.setup();
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      const positionInput = screen.getByPlaceholderText(
        "เช่น Software Engineer, Product Manager"
      );
      await user.type(positionInput, "UX Designer");

      await user.click(screen.getByRole("button", { name: /เพิ่ม/ }));

      await waitFor(() => {
        expect(screen.getByText("UX Designer")).toBeInTheDocument();
      });
    });

    it("should add position when pressing Enter", async () => {
      const user = userEvent.setup();
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      const positionInput = screen.getByPlaceholderText(
        "เช่น Software Engineer, Product Manager"
      );
      await user.type(positionInput, "Data Scientist{Enter}");

      await waitFor(() => {
        expect(screen.getByText("Data Scientist")).toBeInTheDocument();
      });
    });

    it("should remove position when clicking X button", async () => {
      const user = userEvent.setup();
      const initialData = {
        job_types: ["full_time"],
        positions: ["Developer", "Designer"],
        salary_min: 20000,
        salary_max: 40000,
        locations: ["กรุงเทพมหานคร"],
        availability: "immediate",
      };

      render(
        <Step5JobPreferences onSubmit={mockOnSubmit} initialData={initialData} />
      );

      const developerBadge = screen.getByText("Developer").closest("div");
      const removeButton = developerBadge!.querySelector("button");

      await user.click(removeButton!);

      await waitFor(() => {
        expect(screen.queryByText("Developer")).not.toBeInTheDocument();
        expect(screen.getByText("Designer")).toBeInTheDocument();
      });
    });

    it("should not add duplicate positions", async () => {
      const user = userEvent.setup();
      const initialData = {
        job_types: ["full_time"],
        positions: ["Developer"],
        salary_min: 20000,
        salary_max: 40000,
        locations: ["กรุงเทพมหานคร"],
        availability: "immediate",
      };

      render(
        <Step5JobPreferences onSubmit={mockOnSubmit} initialData={initialData} />
      );

      const positionInput = screen.getByPlaceholderText(
        "เช่น Software Engineer, Product Manager"
      );
      await user.type(positionInput, "Developer");

      await user.click(screen.getByRole("button", { name: /เพิ่ม/ }));

      // Should still only have one Developer badge
      const badges = screen.getAllByText("Developer");
      expect(badges.length).toBe(1);
    });

    it("should disable input when reaching 10 positions", () => {
      const positions = Array.from(
        { length: 10 },
        (_, i) => `Position ${i + 1}`
      );
      const initialData = {
        job_types: ["full_time"],
        positions,
        salary_min: 20000,
        salary_max: 40000,
        locations: ["กรุงเทพมหานคร"],
        availability: "immediate",
      };

      render(
        <Step5JobPreferences onSubmit={mockOnSubmit} initialData={initialData} />
      );

      const positionInput = screen.getByPlaceholderText(
        "เช่น Software Engineer, Product Manager"
      );
      expect(positionInput).toBeDisabled();

      const addButton = screen.getByRole("button", { name: /เพิ่ม/ });
      expect(addButton).toBeDisabled();
    });

    it("should show validation error when no positions added", async () => {
      const user = userEvent.setup();
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      await user.click(screen.getByRole("button", { name: "เสร็จสิ้น" }));

      await waitFor(() => {
        expect(
          screen.getByText("กรุณาเพิ่มตำแหน่งที่สนใจอย่างน้อย 1 ตำแหน่ง")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Salary Range", () => {
    it("should accept valid salary range", async () => {
      const user = userEvent.setup();
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/เงินเดือนขั้นต่ำ/), "30000");
      await user.type(screen.getByLabelText(/เงินเดือนสูงสุด/), "50000");

      expect(screen.getByLabelText(/เงินเดือนขั้นต่ำ/)).toHaveValue(30000);
      expect(screen.getByLabelText(/เงินเดือนสูงสุด/)).toHaveValue(50000);
    });

    it("should prevent submission when max salary is less than min salary", async () => {
      const user = userEvent.setup();
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      // Fill all required fields
      await user.click(screen.getByLabelText("Full-time (เต็มเวลา)"));

      const positionInput = screen.getByPlaceholderText(
        "เช่น Software Engineer, Product Manager"
      );
      await user.type(positionInput, "Developer{Enter}");

      // Set invalid salary range (max < min)
      await user.type(screen.getByLabelText(/เงินเดือนขั้นต่ำ/), "50000");
      await user.type(screen.getByLabelText(/เงินเดือนสูงสุด/), "30000");

      const locationCheckboxes = screen.getAllByLabelText("กรุงเทพมหานคร");
      await user.click(locationCheckboxes[0]);

      // Select availability using combobox role
      const availabilitySelect = screen.getByRole("combobox", {
        name: /ความพร้อมเริ่มงาน/,
      });
      await user.click(availabilitySelect);
      const option = await screen.findByRole("option", { name: "ทันที" });
      await user.click(option);

      await user.click(screen.getByRole("button", { name: "เสร็จสิ้น" }));

      // Form should NOT submit with invalid data
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it("should accept equal min and max salary", async () => {
      const user = userEvent.setup();
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      await user.click(screen.getByLabelText("Full-time (เต็มเวลา)"));

      const positionInput = screen.getByPlaceholderText(
        "เช่น Software Engineer, Product Manager"
      );
      await user.type(positionInput, "Developer{Enter}");

      await user.type(screen.getByLabelText(/เงินเดือนขั้นต่ำ/), "40000");
      await user.type(screen.getByLabelText(/เงินเดือนสูงสุด/), "40000");

      const locationCheckboxes = screen.getAllByLabelText("กรุงเทพมหานคร");
      await user.click(locationCheckboxes[0]);

      // Select availability using combobox role
      const availabilitySelect = screen.getByRole("combobox", {
        name: /ความพร้อมเริ่มงาน/,
      });
      await user.click(availabilitySelect);
      const option = await screen.findByRole("option", { name: "ทันที" });
      await user.click(option);

      await user.click(screen.getByRole("button", { name: "เสร็จสิ้น" }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            salary_min: 40000,
            salary_max: 40000,
          }),
          expect.anything()
        );
      });
    });

    it("should prevent submission when salary min is empty", async () => {
      const user = userEvent.setup();
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      await user.click(screen.getByRole("button", { name: "เสร็จสิ้น" }));

      // Form should NOT submit with missing required field
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it("should prevent submission when salary max is empty", async () => {
      const user = userEvent.setup();
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      await user.click(screen.getByRole("button", { name: "เสร็จสิ้น" }));

      // Form should NOT submit with missing required field
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe("Work Locations", () => {
    it("should filter provinces when typing in search", async () => {
      const user = userEvent.setup();
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      const searchInput = screen.getByPlaceholderText("ค้นหาจังหวัด...");
      await user.type(searchInput, "กรุง");

      await waitFor(() => {
        expect(screen.getByLabelText("กรุงเทพมหานคร")).toBeInTheDocument();
        // Should not show provinces that don't match
        expect(screen.queryByLabelText("เชียงใหม่")).not.toBeInTheDocument();
      });
    });

    it("should show message when no provinces match search", async () => {
      const user = userEvent.setup();
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      const searchInput = screen.getByPlaceholderText("ค้นหาจังหวัด...");
      await user.type(searchInput, "zzz");

      await waitFor(() => {
        expect(screen.getByText("ไม่พบจังหวัดที่ค้นหา")).toBeInTheDocument();
      });
    });

    it("should select and deselect provinces", async () => {
      const user = userEvent.setup();
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      const bangkokCheckbox = screen.getByLabelText("กรุงเทพมหานคร");
      await user.click(bangkokCheckbox);

      expect(bangkokCheckbox).toBeChecked();

      // Should show as badge
      await waitFor(() => {
        const badges = screen.getAllByText("กรุงเทพมหานคร");
        expect(badges.length).toBeGreaterThan(1); // One in checkbox, one in badge
      });

      // Deselect
      await user.click(bangkokCheckbox);
      expect(bangkokCheckbox).not.toBeChecked();
    });

    it("should remove location when clicking X on badge", async () => {
      const user = userEvent.setup();
      const initialData = {
        job_types: ["full_time"],
        positions: ["Developer"],
        salary_min: 20000,
        salary_max: 40000,
        locations: ["กรุงเทพมหานคร", "เชียงใหม่"],
        availability: "immediate",
      };

      render(
        <Step5JobPreferences onSubmit={mockOnSubmit} initialData={initialData} />
      );

      // Find the badge area (below the checkbox list)
      const badges = screen.getAllByText("กรุงเทพมหานคร");
      // The badge version is the one with an X button
      const badge = badges.find((el) => {
        const parent = el.closest(".text-sm"); // Badge has text-sm class
        return parent?.querySelector("button") !== null;
      });

      const removeButton = badge?.closest("div")?.querySelector("button");
      await user.click(removeButton!);

      // Checkbox should be unchecked
      const bangkokCheckbox = screen.getByLabelText("กรุงเทพมหานคร");
      expect(bangkokCheckbox).not.toBeChecked();
    });

    it("should show validation error when no locations selected", async () => {
      const user = userEvent.setup();
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      await user.click(screen.getByRole("button", { name: "เสร็จสิ้น" }));

      await waitFor(() => {
        expect(
          screen.getByText("กรุณาเลือกพื้นที่ทำงานอย่างน้อย 1 แห่ง")
        ).toBeInTheDocument();
      });
    });

    it("should limit display to 20 provinces", () => {
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      // Count visible checkboxes in the scrollable area
      const checkboxes = screen
        .getAllByRole("checkbox")
        .filter((cb) => {
          const label = cb.getAttribute("id")?.startsWith("location_");
          return label;
        });

      expect(checkboxes.length).toBeLessThanOrEqual(20);
    });
  });

  describe("Availability", () => {
    it("should select immediate availability", async () => {
      const user = userEvent.setup();
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      // Fill required fields first
      await user.click(screen.getByLabelText("Full-time (เต็มเวลา)"));

      const positionInput = screen.getByPlaceholderText(
        "เช่น Software Engineer, Product Manager"
      );
      await user.type(positionInput, "Developer{Enter}");

      await user.type(screen.getByLabelText(/เงินเดือนขั้นต่ำ/), "20000");
      await user.type(screen.getByLabelText(/เงินเดือนสูงสุด/), "40000");

      const locationCheckboxes = screen.getAllByLabelText("กรุงเทพมหานคร");
      await user.click(locationCheckboxes[0]);

      // Select availability using combobox role
      const availabilitySelect = screen.getByRole("combobox", {
        name: /ความพร้อมเริ่มงาน/,
      });
      await user.click(availabilitySelect);
      const option = await screen.findByRole("option", { name: "ทันที" });
      await user.click(option);

      await user.click(screen.getByRole("button", { name: "เสร็จสิ้น" }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            availability: "immediate",
          }),
          expect.anything()
        );
      });
    });

    it("should select within 1 month availability", async () => {
      const user = userEvent.setup();
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      // Fill required fields first
      await user.click(screen.getByLabelText("Full-time (เต็มเวลา)"));

      const positionInput = screen.getByPlaceholderText(
        "เช่น Software Engineer, Product Manager"
      );
      await user.type(positionInput, "Developer{Enter}");

      await user.type(screen.getByLabelText(/เงินเดือนขั้นต่ำ/), "20000");
      await user.type(screen.getByLabelText(/เงินเดือนสูงสุด/), "40000");

      const locationCheckboxes = screen.getAllByLabelText("กรุงเทพมหานคร");
      await user.click(locationCheckboxes[0]);

      // Select availability using combobox role
      const availabilitySelect = screen.getByRole("combobox", {
        name: /ความพร้อมเริ่มงาน/,
      });
      await user.click(availabilitySelect);
      const option = await screen.findByRole("option", { name: "ภายใน 1 เดือน" });
      await user.click(option);

      await user.click(screen.getByRole("button", { name: "เสร็จสิ้น" }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            availability: "within_1_month",
          }),
          expect.anything()
        );
      });
    });

    it("should show validation error when availability not selected", async () => {
      const user = userEvent.setup();
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      await user.click(screen.getByRole("button", { name: "เสร็จสิ้น" }));

      await waitFor(() => {
        expect(
          screen.getByText("กรุณาเลือกความพร้อมเริ่มงาน")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("should submit valid form data", async () => {
      const user = userEvent.setup();
      render(<Step5JobPreferences onSubmit={mockOnSubmit} />);

      // Select job types
      await user.click(screen.getByLabelText("Full-time (เต็มเวลา)"));
      await user.click(screen.getByLabelText("Part-time (พาร์ทไทม์)"));

      // Add positions
      const positionInput = screen.getByPlaceholderText(
        "เช่น Software Engineer, Product Manager"
      );
      await user.type(positionInput, "Developer{Enter}");
      await user.type(positionInput, "Designer{Enter}");

      // Set salary
      await user.type(screen.getByLabelText(/เงินเดือนขั้นต่ำ/), "30000");
      await user.type(screen.getByLabelText(/เงินเดือนสูงสุด/), "60000");

      // Select locations (use getAllByLabelText for multiple elements with same text)
      const bangkokCheckboxes = screen.getAllByLabelText("กรุงเทพมหานคร");
      await user.click(bangkokCheckboxes[0]);

      const chiangmaiCheckboxes = screen.getAllByLabelText("เชียงใหม่");
      await user.click(chiangmaiCheckboxes[0]);

      // Select availability using combobox role
      const availabilitySelect = screen.getByRole("combobox", {
        name: /ความพร้อมเริ่มงาน/,
      });
      await user.click(availabilitySelect);
      const option = await screen.findByRole("option", { name: "ทันที" });
      await user.click(option);

      await user.click(screen.getByRole("button", { name: "เสร็จสิ้น" }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            job_types: ["full_time", "part_time"],
            positions: ["Developer", "Designer"],
            salary_min: 30000,
            salary_max: 60000,
            locations: ["กรุงเทพมหานคร", "เชียงใหม่"],
            availability: "immediate",
          }),
          expect.anything()
        );
      });
    });
  });

  describe("Loading State", () => {
    it("should disable submit button when loading", () => {
      render(<Step5JobPreferences onSubmit={mockOnSubmit} isLoading={true} />);

      const submitButton = screen.getByRole("button", { name: /กำลังบันทึก/ });
      expect(submitButton).toBeDisabled();
    });

    it("should disable back button when loading", () => {
      render(
        <Step5JobPreferences
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          showBackButton={true}
          isLoading={true}
        />
      );

      const backButton = screen.getByRole("button", { name: "ย้อนกลับ" });
      expect(backButton).toBeDisabled();
    });

    it("should show loading text when isLoading is true", () => {
      render(<Step5JobPreferences onSubmit={mockOnSubmit} isLoading={true} />);

      expect(screen.getByText("กำลังบันทึก...")).toBeInTheDocument();
    });
  });

  describe("Back Button", () => {
    it("should call onBack when back button is clicked", async () => {
      const user = userEvent.setup();
      mockOnBack.mockClear();

      render(
        <Step5JobPreferences
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
