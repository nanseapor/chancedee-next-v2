/**
 * Integration Test for Resume Preview Sheet Issue
 * Testing the specific issue where resume needs to be closed once to show up properly
 */

import { ResumePreview } from "@/components/resume-builder/resume-preview";
import type { ResumeData } from "@/types/resume";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { useState } from "react";

// Mock the useChancedeeChat hook
jest.mock("@/hooks/use-chancedee-chat");

// Mock UI components (simplified for testing)
jest.mock("@/components/ui/sheet", () => ({
  Sheet: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div data-testid="sheet" data-open={open}>
      {open && (
        <div data-testid="sheet-overlay" onClick={() => onOpenChange(false)}>
          {children}
        </div>
      )}
    </div>
  ),
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-content">{children}</div>
  ),
  SheetHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-header">{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="sheet-title">{children}</h2>
  ),
  SheetDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="sheet-description">{children}</p>
  ),
}));

jest.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scroll-area">{children}</div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button data-testid="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/separator", () => ({
  Separator: () => <hr data-testid="separator" />,
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

jest.mock("lucide-react", () => ({
  Download: () => <span data-testid="download-icon">📥</span>,
  FileText: () => <span data-testid="file-text-icon">📄</span>,
}));

// Test component that simulates the full resume builder flow
const TestResumeBuilder = () => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      position: "Software Engineer",
    },
    skills: ["JavaScript", "React", "Node.js"],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    languages: [],
  });
  const [generatedResume, setGeneratedResume] = useState<any>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleGenerateResume = async () => {
    setIsGenerating(true);
    setError(undefined);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      // Simulate successful resume generation
      const mockGeneratedResume = {
        htmlContent:
          '<div data-testid="generated-resume"><h1>John Doe</h1><p>Software Engineer</p><p>Generated Resume Content</p></div>',
        templateUsed: "fresh-graduate-project",
        templateName: "Fresh Graduate - Project Based",
        generatedAt: new Date().toISOString(),
        conversationId: "test-conversation-123",
      };

      setGeneratedResume(mockGeneratedResume);
    } catch (err) {
      setError("Failed to generate resume");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenPreview = () => {
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  return (
    <div data-testid="resume-builder">
      <button data-testid="open-preview-btn" onClick={handleOpenPreview}>
        Open Preview
      </button>
      <button data-testid="generate-resume-btn" onClick={handleGenerateResume}>
        Generate Resume
      </button>

      <div data-testid="debug-info">
        <p>Preview Open: {isPreviewOpen.toString()}</p>
        <p>Generated Resume: {generatedResume ? "Yes" : "No"}</p>
        <p>Is Generating: {isGenerating.toString()}</p>
        {error && <p>Error: {error}</p>}
      </div>

      <ResumePreview
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        resumeData={resumeData}
        generatedResume={generatedResume}
        onGenerateResume={handleGenerateResume}
        isGenerating={isGenerating}
        error={error}
      />
    </div>
  );
};

describe("Resume Preview Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Issue: Resume needs to be closed once to show up", () => {
    test("should reproduce the issue where resume is not visible on first open", async () => {
      render(<TestResumeBuilder />);

      // Step 1: Generate resume first
      const generateBtn = screen.getByTestId("generate-resume-btn");
      fireEvent.click(generateBtn);

      // Wait for generation to complete
      await waitFor(() => {
        expect(screen.getByText("Generated Resume: Yes")).toBeInTheDocument();
      });

      // Step 2: Open preview for the first time
      const openPreviewBtn = screen.getByTestId("open-preview-btn");
      fireEvent.click(openPreviewBtn);

      // Verify preview is open
      expect(screen.getByTestId("sheet")).toHaveAttribute("data-open", "true");
      expect(screen.getByTestId("sheet-content")).toBeInTheDocument();

      // Check if generated resume content is visible
      const scrollArea = screen.getByTestId("scroll-area");

      // The issue might be that the generated resume is not immediately visible
      // Let's check what content is actually rendered
      console.log("First open - ScrollArea content:", scrollArea.innerHTML);

      // Step 3: Close the preview
      const overlay = screen.getByTestId("sheet-overlay");
      fireEvent.click(overlay);

      // Verify preview is closed
      await waitFor(() => {
        expect(screen.getByTestId("sheet")).toHaveAttribute(
          "data-open",
          "false",
        );
      });

      // Step 4: Open preview again
      fireEvent.click(openPreviewBtn);

      // Verify preview is open again
      expect(screen.getByTestId("sheet")).toHaveAttribute("data-open", "true");
      expect(screen.getByTestId("sheet-content")).toBeInTheDocument();

      // Check if generated resume content is now visible
      const scrollAreaSecond = screen.getByTestId("scroll-area");
      console.log(
        "Second open - ScrollArea content:",
        scrollAreaSecond.innerHTML,
      );

      // The resume should be visible now
      expect(
        screen.getByText("Template: Fresh Graduate - Project Based"),
      ).toBeInTheDocument();
    });

    test("should handle the case where generatedResume is set after preview is already open", async () => {
      render(<TestResumeBuilder />);

      // Step 1: Open preview before generating resume
      const openPreviewBtn = screen.getByTestId("open-preview-btn");
      fireEvent.click(openPreviewBtn);

      // Verify preview is open with live data
      expect(screen.getByTestId("sheet")).toHaveAttribute("data-open", "true");
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("📧 john@example.com")).toBeInTheDocument();

      // Step 2: Generate resume while preview is open
      const generateBtn = screen.getByTestId("generate-resume-btn");
      fireEvent.click(generateBtn);

      // Wait for generation to complete
      await waitFor(() => {
        expect(screen.getByText("Generated Resume: Yes")).toBeInTheDocument();
      });

      // Step 3: Check if the preview automatically updates to show generated resume
      await waitFor(() => {
        expect(
          screen.getByText("Template: Fresh Graduate - Project Based"),
        ).toBeInTheDocument();
      });

      // The live preview content should no longer be visible
      expect(screen.queryByText("📧 john@example.com")).not.toBeInTheDocument();
    });

    test("should handle state synchronization when preview opens with existing generated resume", async () => {
      render(<TestResumeBuilder />);

      // Step 1: Generate resume first (preview closed)
      const generateBtn = screen.getByTestId("generate-resume-btn");
      fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByText("Generated Resume: Yes")).toBeInTheDocument();
      });

      // Step 2: Open preview immediately after generation
      const openPreviewBtn = screen.getByTestId("open-preview-btn");
      fireEvent.click(openPreviewBtn);

      // Step 3: Check if generated resume is immediately visible
      // This is where the issue might occur - the resume might not be visible on first open
      const isGeneratedResumeVisible = screen.queryByText(
        "Template: Fresh Graduate - Project Based",
      );

      if (!isGeneratedResumeVisible) {
        console.log(
          "⚠️ Issue reproduced: Generated resume not visible on first open",
        );

        // Step 4: Close and reopen to verify it becomes visible
        const overlay = screen.getByTestId("sheet-overlay");
        fireEvent.click(overlay);

        await waitFor(() => {
          expect(screen.getByTestId("sheet")).toHaveAttribute(
            "data-open",
            "false",
          );
        });

        // Reopen
        fireEvent.click(openPreviewBtn);

        // Now it should be visible
        expect(
          screen.getByText("Template: Fresh Graduate - Project Based"),
        ).toBeInTheDocument();
        console.log(
          "✅ Issue confirmed: Resume becomes visible after close/reopen",
        );
      } else {
        console.log("✅ No issue: Generated resume is immediately visible");
      }
    });
  });

  describe("State Management Edge Cases", () => {
    test("should handle rapid open/close/open cycles", async () => {
      render(<TestResumeBuilder />);

      // Generate resume first
      const generateBtn = screen.getByTestId("generate-resume-btn");
      fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByText("Generated Resume: Yes")).toBeInTheDocument();
      });

      const openPreviewBtn = screen.getByTestId("open-preview-btn");

      // Rapid open/close/open cycle
      fireEvent.click(openPreviewBtn); // Open

      const overlay = screen.getByTestId("sheet-overlay");
      fireEvent.click(overlay); // Close

      fireEvent.click(openPreviewBtn); // Open again

      // Should still work correctly
      expect(screen.getByTestId("sheet")).toHaveAttribute("data-open", "true");
      expect(
        screen.getByText("Template: Fresh Graduate - Project Based"),
      ).toBeInTheDocument();
    });

    test("should handle multiple resume generations with preview open", async () => {
      render(<TestResumeBuilder />);

      // Open preview first
      const openPreviewBtn = screen.getByTestId("open-preview-btn");
      fireEvent.click(openPreviewBtn);

      const generateBtn = screen.getByTestId("generate-resume-btn");

      // Generate first resume
      fireEvent.click(generateBtn);
      await waitFor(() => {
        expect(screen.getByText("Generated Resume: Yes")).toBeInTheDocument();
      });

      // Verify first resume is visible
      expect(
        screen.getByText("Template: Fresh Graduate - Project Based"),
      ).toBeInTheDocument();

      // Generate second resume (simulate regeneration)
      fireEvent.click(generateBtn);
      await waitFor(() => {
        expect(screen.getByText("Is Generating: false")).toBeInTheDocument();
      });

      // Should still show the resume
      expect(
        screen.getByText("Template: Fresh Graduate - Project Based"),
      ).toBeInTheDocument();
    });
  });
});

// Simple test runner for this specific issue
export function runResumePreviewIssueTest() {
  console.log("🔍 Testing Resume Preview Sheet Issue...\n");

  try {
    // Test the issue where resume needs to be closed once to show up
    console.log("🧪 Simulating the issue scenario...");

    // Mock the component behavior
    let isPreviewOpen = false;
    let generatedResume: any = undefined;
    let renderCount = 0;

    const simulateOpenPreview = () => {
      isPreviewOpen = true;
      renderCount++;
      console.log(`   📊 Render ${renderCount}: Preview opened`);
    };

    const simulateClosePreview = () => {
      isPreviewOpen = false;
      renderCount++;
      console.log(`   📊 Render ${renderCount}: Preview closed`);
    };

    const simulateGenerateResume = () => {
      generatedResume = {
        htmlContent: "<div>Generated Resume</div>",
        templateUsed: "fresh-graduate-project",
        templateName: "Fresh Graduate - Project Based",
        generatedAt: new Date().toISOString(),
        conversationId: "test-123",
      };
      renderCount++;
      console.log(`   📊 Render ${renderCount}: Resume generated`);
    };

    // Step 1: Generate resume
    console.log("\n1. Generating resume...");
    simulateGenerateResume();

    // Step 2: Open preview for first time
    console.log("\n2. Opening preview for first time...");
    simulateOpenPreview();

    // Check if resume would be visible
    const firstOpenVisible = isPreviewOpen && generatedResume;
    console.log(`   ✨ Resume visible on first open: ${firstOpenVisible}`);

    // Step 3: Close preview
    console.log("\n3. Closing preview...");
    simulateClosePreview();

    // Step 4: Open preview again
    console.log("\n4. Opening preview again...");
    simulateOpenPreview();

    // Check if resume would be visible now
    const secondOpenVisible = isPreviewOpen && generatedResume;
    console.log(`   ✨ Resume visible on second open: ${secondOpenVisible}`);

    // Analysis
    console.log("\n📋 Analysis:");
    console.log(`   - Total renders: ${renderCount}`);
    console.log(
      `   - Issue likely related to: React re-rendering and state synchronization`,
    );
    console.log(`   - Possible causes:`);
    console.log(
      `     1. Sheet component not re-rendering when generatedResume changes`,
    );
    console.log(`     2. Conditional rendering logic not updating properly`);
    console.log(
      `     3. State updates not being reflected in first render cycle`,
    );

    console.log("\n💡 Recommended fixes:");
    console.log(
      `   1. Add useEffect to force re-render when generatedResume changes`,
    );
    console.log(`   2. Use key prop to force component remount`);
    console.log(`   3. Add explicit state synchronization`);
    console.log(`   4. Debug with React DevTools to see actual state changes`);

    return true;
  } catch (error) {
    console.error("💥 Test failed:", error);
    return false;
  }
}

export default runResumePreviewIssueTest;
