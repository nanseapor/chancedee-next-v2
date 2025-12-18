/**
 * Unit Tests for Step4Skills Form Component
 * CAND-R02: Profile Creation Wizard - Step 4 Skills & Languages
 *
 * Tests autocomplete, tag management, skill/language limits, and validation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Step4Skills } from "@/app/jobsmarket/candidates/profile/create/_components/Step4Skills";

describe("Step4Skills", () => {
  const mockOnSubmit = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnBack.mockClear();
  });

  describe("Rendering", () => {
    it("should render form with skills and languages sections", () => {
      render(<Step4Skills onSubmit={mockOnSubmit} />);

      expect(screen.getByText("ทักษะและภาษา")).toBeInTheDocument();
      expect(
        screen.getByText(/เพิ่มทักษะและความสามารถทางภาษาของคุณ/)
      ).toBeInTheDocument();

      // Skills section (heading has required asterisk, so match with role)
      expect(screen.getByRole("heading", { name: /ทักษะและภาษา/ })).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("พิมพ์เพื่อค้นหาหรือเพิ่มทักษะ...")
      ).toBeInTheDocument();

      // Languages section
      expect(screen.getByText("ภาษา (ถ้ามี)")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("พิมพ์เพื่อค้นหาหรือเพิ่มภาษา...")
      ).toBeInTheDocument();
    });

    it("should render submit button with default text", () => {
      render(<Step4Skills onSubmit={mockOnSubmit} />);

      expect(screen.getByRole("button", { name: "ถัดไป" })).toBeInTheDocument();
    });

    it("should render custom submit button text", () => {
      render(<Step4Skills onSubmit={mockOnSubmit} submitText="บันทึกข้อมูล" />);

      expect(
        screen.getByRole("button", { name: "บันทึกข้อมูล" })
      ).toBeInTheDocument();
    });

    it("should render back button when showBackButton is true", () => {
      render(
        <Step4Skills
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
    it("should populate form with initial skills", () => {
      const initialData = {
        skills: ["JavaScript", "TypeScript", "React"],
        languages: [],
      };

      render(<Step4Skills onSubmit={mockOnSubmit} initialData={initialData} />);

      expect(screen.getByText("JavaScript")).toBeInTheDocument();
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
      expect(screen.getByText("React")).toBeInTheDocument();
    });

    it("should populate form with initial languages", () => {
      const initialData = {
        skills: ["JavaScript"],
        languages: [
          { name: "ไทย", level: "native" },
          { name: "English", level: "fluent" },
        ],
      };

      render(<Step4Skills onSubmit={mockOnSubmit} initialData={initialData} />);

      expect(screen.getByText("ไทย")).toBeInTheDocument();
      expect(screen.getByText("English")).toBeInTheDocument();
      // Proficiency levels appear in both dropdown and displayed languages
      expect(screen.getAllByText("เจ้าของภาษา").length).toBeGreaterThan(0);
      expect(screen.getAllByText("คล่องแคล่ว").length).toBeGreaterThan(0);
    });
  });

  describe("Skills - Add/Remove", () => {
    it("should add skill when clicking add button", async () => {
      const user = userEvent.setup();
      render(<Step4Skills onSubmit={mockOnSubmit} />);

      const skillInput = screen.getByPlaceholderText(
        "พิมพ์เพื่อค้นหาหรือเพิ่มทักษะ..."
      );
      await user.type(skillInput, "Python");

      await user.click(
        screen.getAllByRole("button", { name: /เพิ่ม/ })[0] // First "Add" button is for skills
      );

      await waitFor(() => {
        expect(screen.getByText("Python")).toBeInTheDocument();
      });
    });

    it("should add skill when pressing Enter", async () => {
      const user = userEvent.setup();
      render(<Step4Skills onSubmit={mockOnSubmit} />);

      const skillInput = screen.getByPlaceholderText(
        "พิมพ์เพื่อค้นหาหรือเพิ่มทักษะ..."
      );
      await user.type(skillInput, "Java{Enter}");

      await waitFor(() => {
        expect(screen.getByText("Java")).toBeInTheDocument();
      });
    });

    it("should show autocomplete suggestions when typing", async () => {
      const user = userEvent.setup();
      render(<Step4Skills onSubmit={mockOnSubmit} />);

      const skillInput = screen.getByPlaceholderText(
        "พิมพ์เพื่อค้นหาหรือเพิ่มทักษะ..."
      );
      await user.type(skillInput, "Java");

      await waitFor(() => {
        expect(screen.getByText("JavaScript")).toBeInTheDocument();
        expect(screen.getByText("Java")).toBeInTheDocument();
      });
    });

    it("should add skill from autocomplete when clicking suggestion", async () => {
      const user = userEvent.setup();
      render(<Step4Skills onSubmit={mockOnSubmit} />);

      const skillInput = screen.getByPlaceholderText(
        "พิมพ์เพื่อค้นหาหรือเพิ่มทักษะ..."
      );
      await user.type(skillInput, "Java");

      await waitFor(() => {
        expect(screen.getByText("JavaScript")).toBeInTheDocument();
      });

      await user.click(screen.getByText("JavaScript"));

      await waitFor(() => {
        // Should be a badge now, not in the dropdown
        const badges = screen.getAllByText("JavaScript");
        expect(badges.length).toBeGreaterThan(0);
      });
    });

    it("should remove skill when clicking X button", async () => {
      const user = userEvent.setup();
      const initialData = {
        skills: ["Python", "Java"],
        languages: [],
      };

      render(<Step4Skills onSubmit={mockOnSubmit} initialData={initialData} />);

      // Find the badge with Python
      const pythonBadge = screen.getByText("Python").closest("div");
      const removeButton = pythonBadge!.querySelector("button");

      await user.click(removeButton!);

      await waitFor(() => {
        expect(screen.queryByText("Python")).not.toBeInTheDocument();
        expect(screen.getByText("Java")).toBeInTheDocument();
      });
    });

    it("should not add duplicate skills", async () => {
      const user = userEvent.setup();
      const initialData = {
        skills: ["JavaScript"],
        languages: [],
      };

      render(<Step4Skills onSubmit={mockOnSubmit} initialData={initialData} />);

      const skillInput = screen.getByPlaceholderText(
        "พิมพ์เพื่อค้นหาหรือเพิ่มทักษะ..."
      );
      await user.type(skillInput, "JavaScript");

      await user.click(screen.getAllByRole("button", { name: /เพิ่ม/ })[0]);

      // Input should NOT be cleared because duplicate was not added
      expect(skillInput).toHaveValue("JavaScript");

      // Should still only have one JavaScript badge (not 2)
      // Filter to only count badges (which have the rounded-full class)
      const badges = screen.getAllByText("JavaScript").filter((el) => {
        return el.closest(".inline-flex.items-center.rounded-full") !== null;
      });
      expect(badges.length).toBe(1);
    });

    it("should clear input after adding skill", async () => {
      const user = userEvent.setup();
      render(<Step4Skills onSubmit={mockOnSubmit} />);

      const skillInput = screen.getByPlaceholderText(
        "พิมพ์เพื่อค้นหาหรือเพิ่มทักษะ..."
      );
      await user.type(skillInput, "Python");

      await user.click(screen.getAllByRole("button", { name: /เพิ่ม/ })[0]);

      await waitFor(() => {
        expect(skillInput).toHaveValue("");
      });
    });
  });

  describe("Skills - Limits", () => {
    it("should disable add button when reaching 50 skills", () => {
      const skills = Array.from({ length: 50 }, (_, i) => `Skill ${i + 1}`);
      const initialData = {
        skills,
        languages: [],
      };

      render(<Step4Skills onSubmit={mockOnSubmit} initialData={initialData} />);

      const skillInput = screen.getByPlaceholderText(
        "พิมพ์เพื่อค้นหาหรือเพิ่มทักษะ..."
      );
      expect(skillInput).toBeDisabled();

      const addButton = screen.getAllByRole("button", { name: /เพิ่ม/ })[0];
      expect(addButton).toBeDisabled();
    });

    it("should show validation error when submitting without skills", async () => {
      const user = userEvent.setup();
      render(<Step4Skills onSubmit={mockOnSubmit} />);

      await user.click(screen.getByRole("button", { name: "ถัดไป" }));

      await waitFor(() => {
        expect(
          screen.getByText("กรุณาเพิ่มอย่างน้อย 1 ทักษะ")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Languages - Add/Remove", () => {
    it("should add language with proficiency level", async () => {
      const user = userEvent.setup();
      const initialData = {
        skills: ["JavaScript"], // Need at least 1 skill to submit
        languages: [],
      };

      render(<Step4Skills onSubmit={mockOnSubmit} initialData={initialData} />);

      const languageInput = screen.getByPlaceholderText(
        "พิมพ์เพื่อค้นหาหรือเพิ่มภาษา..."
      );
      await user.type(languageInput, "English");

      // Select proficiency level
      const levelSelect = screen.getByRole("combobox");
      await user.click(levelSelect);
      await user.click(screen.getByRole("option", { name: "คล่องแคล่ว" }));

      // Add language
      await user.click(screen.getAllByRole("button", { name: /เพิ่ม/ })[1]);

      await waitFor(() => {
        // Check that language name appears with font-medium class (displayed language)
        const languageName = screen.getByText("English");
        expect(languageName.className).toContain("font-medium");
      });
    });

    it("should show autocomplete for languages", async () => {
      const user = userEvent.setup();
      render(<Step4Skills onSubmit={mockOnSubmit} />);

      const languageInput = screen.getByPlaceholderText(
        "พิมพ์เพื่อค้นหาหรือเพิ่มภาษา..."
      );
      await user.type(languageInput, "Eng");

      await waitFor(() => {
        expect(screen.getByText("English")).toBeInTheDocument();
      });
    });

    it("should remove language when clicking X button", async () => {
      const user = userEvent.setup();
      const initialData = {
        skills: ["JavaScript"],
        languages: [
          { name: "ไทย", level: "native" },
          { name: "English", level: "fluent" },
        ],
      };

      render(<Step4Skills onSubmit={mockOnSubmit} initialData={initialData} />);

      // Find all X buttons (skills have X buttons too, but languages come after)
      const allRemoveButtons = screen.getAllByRole("button").filter((btn) => {
        // X button has SVG with class containing "lucide-x"
        const svg = btn.querySelector("svg");
        return svg?.className.baseVal?.includes("lucide-x");
      });

      // Remove buttons: 1 for JavaScript skill, then 2 for languages (ไทย and English)
      // The English remove button should be the last one
      const englishRemoveButton = allRemoveButtons[allRemoveButtons.length - 1];

      await user.click(englishRemoveButton);

      await waitFor(() => {
        // English should not appear as a displayed language (font-medium class)
        const englishElements = screen.queryAllByText("English").filter((el) =>
          el.className.includes("font-medium")
        );
        expect(englishElements.length).toBe(0);
      });

      // Thai should still be there
      expect(screen.getByText("ไทย")).toBeInTheDocument();
    });

    it("should not add language without proficiency level", async () => {
      const user = userEvent.setup();
      render(<Step4Skills onSubmit={mockOnSubmit} />);

      const languageInput = screen.getByPlaceholderText(
        "พิมพ์เพื่อค้นหาหรือเพิ่มภาษา..."
      );
      await user.type(languageInput, "English");

      // Try to add without selecting level
      const addButton = screen.getAllByRole("button", { name: /เพิ่ม/ })[1];
      expect(addButton).toBeDisabled();
    });

    it("should not add duplicate languages", async () => {
      const user = userEvent.setup();
      const initialData = {
        skills: ["JavaScript"],
        languages: [{ name: "English", level: "fluent" }],
      };

      render(<Step4Skills onSubmit={mockOnSubmit} initialData={initialData} />);

      const languageInput = screen.getByPlaceholderText(
        "พิมพ์เพื่อค้นหาหรือเพิ่มภาษา..."
      );
      await user.type(languageInput, "English");

      const levelSelect = screen.getByRole("combobox");
      await user.click(levelSelect);
      await user.click(screen.getByRole("option", { name: "พื้นฐาน" }));

      await user.click(screen.getAllByRole("button", { name: /เพิ่ม/ })[1]);

      // Input should NOT be cleared because duplicate was not added
      expect(languageInput).toHaveValue("English");

      // Count only displayed languages (font-medium class on language name)
      const displayedLanguages = screen.getAllByText("English").filter((el) => {
        return el.className.includes("font-medium");
      });
      expect(displayedLanguages.length).toBe(1);
    });

    it("should clear inputs after adding language", async () => {
      const user = userEvent.setup();
      const initialData = {
        skills: ["JavaScript"],
        languages: [],
      };

      render(<Step4Skills onSubmit={mockOnSubmit} initialData={initialData} />);

      const languageInput = screen.getByPlaceholderText(
        "พิมพ์เพื่อค้นหาหรือเพิ่มภาษา..."
      );
      await user.type(languageInput, "English");

      const levelSelect = screen.getByRole("combobox");
      await user.click(levelSelect);
      await user.click(screen.getByRole("option", { name: "คล่องแคล่ว" }));

      await user.click(screen.getAllByRole("button", { name: /เพิ่ม/ })[1]);

      await waitFor(() => {
        expect(languageInput).toHaveValue("");
      });
    });
  });

  describe("Languages - Limits", () => {
    it("should disable add button when reaching 10 languages", () => {
      const languages = Array.from({ length: 10 }, (_, i) => ({
        name: `Language ${i + 1}`,
        level: "fluent",
      }));
      const initialData = {
        skills: ["JavaScript"],
        languages,
      };

      render(<Step4Skills onSubmit={mockOnSubmit} initialData={initialData} />);

      const languageInput = screen.getByPlaceholderText(
        "พิมพ์เพื่อค้นหาหรือเพิ่มภาษา..."
      );
      expect(languageInput).toBeDisabled();

      const addButton = screen.getAllByRole("button", { name: /เพิ่ม/ })[1];
      expect(addButton).toBeDisabled();
    });
  });

  describe("Language Proficiency Levels", () => {
    it("should support basic proficiency level", async () => {
      const user = userEvent.setup();
      const initialData = {
        skills: ["JavaScript"],
        languages: [],
      };

      render(<Step4Skills onSubmit={mockOnSubmit} initialData={initialData} />);

      const languageInput = screen.getByPlaceholderText(
        "พิมพ์เพื่อค้นหาหรือเพิ่มภาษา..."
      );
      await user.type(languageInput, "French");

      const levelSelect = screen.getByRole("combobox");
      await user.click(levelSelect);
      await user.click(screen.getByRole("option", { name: "พื้นฐาน" }));

      await user.click(screen.getAllByRole("button", { name: /เพิ่ม/ })[1]);

      await waitFor(() => {
        // Check that language name appears with font-medium class
        const frenchName = screen.getByText("French");
        expect(frenchName.className).toContain("font-medium");
      });
    });

    it("should support conversational proficiency level", async () => {
      const user = userEvent.setup();
      const initialData = {
        skills: ["JavaScript"],
        languages: [],
      };

      render(<Step4Skills onSubmit={mockOnSubmit} initialData={initialData} />);

      const languageInput = screen.getByPlaceholderText(
        "พิมพ์เพื่อค้นหาหรือเพิ่มภาษา..."
      );
      await user.type(languageInput, "Spanish");

      const levelSelect = screen.getByRole("combobox");
      await user.click(levelSelect);
      await user.click(screen.getByRole("option", { name: "สนทนาได้" }));

      await user.click(screen.getAllByRole("button", { name: /เพิ่ม/ })[1]);

      await waitFor(() => {
        // Check that language name appears with font-medium class
        const spanishName = screen.getByText("Spanish");
        expect(spanishName.className).toContain("font-medium");
      });
    });

    it("should support native proficiency level", async () => {
      const user = userEvent.setup();
      const initialData = {
        skills: ["JavaScript"],
        languages: [],
      };

      render(<Step4Skills onSubmit={mockOnSubmit} initialData={initialData} />);

      const languageInput = screen.getByPlaceholderText(
        "พิมพ์เพื่อค้นหาหรือเพิ่มภาษา..."
      );
      await user.type(languageInput, "ไทย");

      const levelSelect = screen.getByRole("combobox");
      await user.click(levelSelect);
      await user.click(screen.getByRole("option", { name: "เจ้าของภาษา" }));

      await user.click(screen.getAllByRole("button", { name: /เพิ่ม/ })[1]);

      await waitFor(() => {
        // Check that language name appears with font-medium class
        const thaiName = screen.getByText("ไทย");
        expect(thaiName.className).toContain("font-medium");
      });
    });
  });

  describe("Form Submission", () => {
    it("should submit with skills only (languages optional)", async () => {
      const user = userEvent.setup();
      const initialData = {
        skills: ["JavaScript", "React"],
        languages: [],
      };

      render(<Step4Skills onSubmit={mockOnSubmit} initialData={initialData} />);

      await user.click(screen.getByRole("button", { name: "ถัดไป" }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            skills: ["JavaScript", "React"],
            languages: [],
          }),
          expect.anything()
        );
      });
    });

    it("should submit with skills and languages", async () => {
      const user = userEvent.setup();
      const initialData = {
        skills: ["JavaScript", "TypeScript"],
        languages: [
          { name: "ไทย", level: "native" },
          { name: "English", level: "fluent" },
        ],
      };

      render(<Step4Skills onSubmit={mockOnSubmit} initialData={initialData} />);

      await user.click(screen.getByRole("button", { name: "ถัดไป" }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            skills: ["JavaScript", "TypeScript"],
            languages: [
              { name: "ไทย", level: "native" },
              { name: "English", level: "fluent" },
            ],
          }),
          expect.anything()
        );
      });
    });
  });

  describe("Loading State", () => {
    it("should disable submit button when loading", () => {
      render(<Step4Skills onSubmit={mockOnSubmit} isLoading={true} />);

      const submitButton = screen.getByRole("button", { name: /กำลังบันทึก/ });
      expect(submitButton).toBeDisabled();
    });

    it("should disable back button when loading", () => {
      render(
        <Step4Skills
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
      render(<Step4Skills onSubmit={mockOnSubmit} isLoading={true} />);

      expect(screen.getByText("กำลังบันทึก...")).toBeInTheDocument();
    });
  });

  describe("Back Button", () => {
    it("should call onBack when back button is clicked", async () => {
      const user = userEvent.setup();
      mockOnBack.mockClear();

      render(
        <Step4Skills
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
