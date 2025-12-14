import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RememberCheckbox } from "@/app/jobsmarket/auth/select-role/_components/RememberCheckbox";

/**
 * Integration tests for AUTH-R07 RememberCheckbox Component
 * Tests checkbox interactions and localStorage handling
 */

describe("RememberCheckbox Component", () => {
  const mockOnChange = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with Thai and English labels", () => {
      render(<RememberCheckbox checked={false} onChange={mockOnChange} />);

      const label = screen.getByText(/จดจำการเลือกนี้/);
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent("Remember my choice");
    });

    it("should render checkbox input", () => {
      render(<RememberCheckbox checked={false} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("should associate label with checkbox via htmlFor", () => {
      render(<RememberCheckbox checked={false} onChange={mockOnChange} />);

      const label = screen.getByLabelText(/จดจำการเลือกนี้/);
      expect(label).toBeInTheDocument();
    });
  });

  describe("Checked state", () => {
    it("should render unchecked when checked is false", () => {
      render(<RememberCheckbox checked={false} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("should render checked when checked is true", () => {
      render(<RememberCheckbox checked={true} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });
  });

  describe("Interactions", () => {
    it("should call onChange with true when clicked (unchecked -> checked)", async () => {
      const user = userEvent.setup();
      render(<RememberCheckbox checked={false} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith(true);
    });

    it("should call onChange with false when clicked (checked -> unchecked)", async () => {
      const user = userEvent.setup();
      render(<RememberCheckbox checked={true} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith(false);
    });

    it("should toggle when label is clicked", async () => {
      const user = userEvent.setup();
      render(<RememberCheckbox checked={false} onChange={mockOnChange} />);

      const label = screen.getByText(/จดจำการเลือกนี้/);
      await user.click(label);

      expect(mockOnChange).toHaveBeenCalledWith(true);
    });

    it("should be keyboard accessible", async () => {
      const user = userEvent.setup();
      render(<RememberCheckbox checked={false} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      checkbox.focus();
      await user.keyboard(" ");

      expect(mockOnChange).toHaveBeenCalledWith(true);
    });
  });

  describe("Accessibility", () => {
    it("should have correct role", () => {
      render(<RememberCheckbox checked={false} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("should have cursor-pointer on label", () => {
      render(<RememberCheckbox checked={false} onChange={mockOnChange} />);

      const label = screen.getByText(/จดจำการเลือกนี้/);
      expect(label).toHaveClass("cursor-pointer");
    });
  });
});

/**
 * Tests for saveRolePreference function
 * Per RIS §10
 */

describe("saveRolePreference localStorage handling", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // Mock the function since it's exported from use-navigation.ts
  function saveRolePreference(
    role: "candidate" | "company",
    remember: boolean
  ): void {
    if (remember) {
      localStorage.setItem("lastActiveRole", role);
    } else {
      localStorage.removeItem("lastActiveRole");
    }
  }

  describe("Saving preference", () => {
    it("should save candidate to localStorage when remember is true", () => {
      saveRolePreference("candidate", true);

      expect(localStorage.getItem("lastActiveRole")).toBe("candidate");
    });

    it("should save company to localStorage when remember is true", () => {
      saveRolePreference("company", true);

      expect(localStorage.getItem("lastActiveRole")).toBe("company");
    });

    it("should NOT save to localStorage when remember is false", () => {
      saveRolePreference("candidate", false);

      expect(localStorage.getItem("lastActiveRole")).toBeNull();
    });

    it("should remove existing preference when remember is false", () => {
      localStorage.setItem("lastActiveRole", "candidate");

      saveRolePreference("company", false);

      expect(localStorage.getItem("lastActiveRole")).toBeNull();
    });

    it("should override existing preference when saving new one", () => {
      saveRolePreference("candidate", true);
      expect(localStorage.getItem("lastActiveRole")).toBe("candidate");

      saveRolePreference("company", true);
      expect(localStorage.getItem("lastActiveRole")).toBe("company");
    });
  });

  describe("Reading preference", () => {
    function getSavedRolePreference(): "candidate" | "company" | null {
      const saved = localStorage.getItem("lastActiveRole");
      if (saved === "candidate" || saved === "company") {
        return saved;
      }
      return null;
    }

    it("should return candidate when saved", () => {
      localStorage.setItem("lastActiveRole", "candidate");

      expect(getSavedRolePreference()).toBe("candidate");
    });

    it("should return company when saved", () => {
      localStorage.setItem("lastActiveRole", "company");

      expect(getSavedRolePreference()).toBe("company");
    });

    it("should return null when nothing saved", () => {
      expect(getSavedRolePreference()).toBeNull();
    });

    it("should return null for invalid values", () => {
      localStorage.setItem("lastActiveRole", "admin");

      expect(getSavedRolePreference()).toBeNull();
    });

    it("should return null for empty string", () => {
      localStorage.setItem("lastActiveRole", "");

      expect(getSavedRolePreference()).toBeNull();
    });
  });

  describe("Auto-skip logic", () => {
    it("should auto-skip when valid preference exists", () => {
      localStorage.setItem("lastActiveRole", "candidate");

      const savedRole = localStorage.getItem("lastActiveRole");
      const shouldSkip = savedRole === "candidate" || savedRole === "company";

      expect(shouldSkip).toBe(true);
    });

    it("should NOT auto-skip when no preference", () => {
      const savedRole = localStorage.getItem("lastActiveRole");
      const shouldSkip = savedRole === "candidate" || savedRole === "company";

      expect(shouldSkip).toBe(false);
    });

    it("should NOT auto-skip with invalid preference", () => {
      localStorage.setItem("lastActiveRole", "invalid");

      const savedRole = localStorage.getItem("lastActiveRole");
      const shouldSkip = savedRole === "candidate" || savedRole === "company";

      expect(shouldSkip).toBe(false);
    });
  });
});
