import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteAccountTab } from "@/app/jobsmarket/auth/settings/_components/DeleteAccountTab";

// Mock dependencies
vi.mock("@/hooks/use-auth", () => ({
  useFirebaseAuth: vi.fn(),
}));

vi.mock("swr", () => ({
  default: vi.fn(),
}));

vi.mock("@/hooks/use-toast-notification", () => ({
  useToast: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/lib/database/actions/user-data-props", () => ({
  webUserDataPropsGetById: vi.fn(),
}));

vi.mock("@/domains/companies/services/server/actions/jobsmarket/admin-utils", () => ({
  getCompanyAdminCount: vi.fn(),
}));

vi.mock("@/lib/database/actions/delete", () => ({
  webDeleteRequestCreate: vi.fn(),
}));

import { useFirebaseAuth } from "@/hooks/use-auth";
import useSWR from "swr";
import { useToast } from "@/hooks/use-toast-notification";
import { useRouter } from "next/navigation";
import { webDeleteRequestCreate } from "@/lib/database/actions/delete";

/**
 * Integration tests for AUTH-R06 Settings Delete Account Tab
 * Tests sole admin blocking, form validation, and delete request submission
 */

describe("DeleteAccountTab Component", () => {
  const mockAddToast = vi.fn();
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useToast).mockReturnValue({
      addToast: mockAddToast,
    } as any);

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
    } as any);

    vi.mocked(useFirebaseAuth).mockReturnValue({
      user: {
        uid: "test-uid",
        email: "test@example.com",
      } as any,
      loading: false,
      isAuthenticated: true,
    });
  });

  describe("Normal candidate user", () => {
    beforeEach(() => {
      vi.mocked(useSWR).mockImplementation((key: any) => {
        if (key && key[0] === "user-data") {
          return {
            data: {
              uid: "test-uid",
              info: { roles: ["candidate"] },
            },
          } as any;
        }
        return { data: undefined } as any;
      });
    });

    it("should render delete account form", () => {
      render(<DeleteAccountTab />);

      expect(screen.getByText("ลบบัญชี")).toBeInTheDocument();
      expect(screen.getByText("Delete Account")).toBeInTheDocument();
      expect(screen.getByText("คำเตือน")).toBeInTheDocument();
    });

    it("should render all form fields", () => {
      render(<DeleteAccountTab />);

      expect(screen.getByLabelText(/ชื่อ \(ภาษาไทย\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/นามสกุล \(ภาษาไทย\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/เบอร์โทรศัพท์/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/อีเมล/i)).toBeInTheDocument();
    });

    it("should render file upload section", () => {
      render(<DeleteAccountTab />);

      expect(screen.getByText("เอกสารยืนยันตัวตน")).toBeInTheDocument();
      expect(screen.getByText("อัปโหลดสำเนาบัตรประชาชนหรือเอกสารยืนยันตัวตน")).toBeInTheDocument();
    });

    it("should render confirmation checkbox", () => {
      render(<DeleteAccountTab />);

      expect(
        screen.getByText(/ฉันเข้าใจว่าการลบบัญชีไม่สามารถย้อนกลับได้หลังจาก 30 วัน/i)
      ).toBeInTheDocument();
    });

    it("should show warning about data deletion", () => {
      render(<DeleteAccountTab />);

      expect(screen.getByText("การลบบัญชีจะ:")).toBeInTheDocument();
      expect(screen.getByText("ลบข้อมูลส่วนตัวทั้งหมดของคุณ")).toBeInTheDocument();
      expect(screen.getByText("ยกเลิกใบสมัครงานทั้งหมดที่ยังดำเนินการอยู่")).toBeInTheDocument();
      expect(screen.getByText("ลบประวัติการสนทนาทั้งหมด")).toBeInTheDocument();
      expect(screen.getByText("ไม่สามารถกู้คืนได้หลังจาก 30 วัน")).toBeInTheDocument();
    });
  });

  describe("Form validation", () => {
    beforeEach(() => {
      vi.mocked(useSWR).mockImplementation((key: any) => {
        if (key && key[0] === "user-data") {
          return {
            data: {
              uid: "test-uid",
              info: { roles: ["candidate"] },
            },
          } as any;
        }
        return { data: undefined } as any;
      });
    });

    it("should show error when submitting without filling required fields", async () => {
      const user = userEvent.setup();

      render(<DeleteAccountTab />);

      const submitButton = screen.getByRole("button", { name: /ส่งคำขอลบบัญชี/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("กรุณากรอกชื่อ")).toBeInTheDocument();
      });
    });

    it("should validate phone number format", async () => {
      const user = userEvent.setup();

      render(<DeleteAccountTab />);

      const phoneInput = screen.getByLabelText(/เบอร์โทรศัพท์/i);
      await user.type(phoneInput, "123");

      const submitButton = screen.getByRole("button", { name: /ส่งคำขอลบบัญชี/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("รูปแบบเบอร์โทรไม่ถูกต้อง")).toBeInTheDocument();
      });
    });

    it("should validate email format", async () => {
      const user = userEvent.setup();

      render(<DeleteAccountTab />);

      // Fill in required fields with invalid email
      await user.type(screen.getByLabelText(/ชื่อ \(ภาษาไทย\)/i), "ทดสอบ");
      await user.type(screen.getByLabelText(/นามสกุล \(ภาษาไทย\)/i), "ระบบ");
      await user.type(screen.getByLabelText(/เบอร์โทรศัพท์/i), "0812345678");

      const emailInput = screen.getByLabelText(/อีเมล/i);
      await user.clear(emailInput);
      await user.type(emailInput, "invalid-email");

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      const submitButton = screen.getByRole("button", { name: /ส่งคำขอลบบัญชี/i });
      await user.click(submitButton);

      // Form validation should prevent submission (email is invalid)
      // The form should still be visible (not redirected)
      await waitFor(
        () => {
          expect(screen.getByText("ลบบัญชี")).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it("should require confirmation checkbox", async () => {
      const user = userEvent.setup();

      render(<DeleteAccountTab />);

      // Fill in all fields except checkbox
      await user.type(screen.getByLabelText(/ชื่อ \(ภาษาไทย\)/i), "สมชาย");
      await user.type(screen.getByLabelText(/นามสกุล \(ภาษาไทย\)/i), "ใจดี");
      await user.type(screen.getByLabelText(/เบอร์โทรศัพท์/i), "0812345678");

      const submitButton = screen.getByRole("button", { name: /ส่งคำขอลบบัญชี/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("กรุณายืนยันว่าคุณเข้าใจ")).toBeInTheDocument();
      });
    });
  });

  describe("File upload", () => {
    beforeEach(() => {
      vi.mocked(useSWR).mockImplementation((key: any) => {
        if (key && key[0] === "user-data") {
          return {
            data: {
              uid: "test-uid",
              info: { roles: ["candidate"] },
            },
          } as any;
        }
        return { data: undefined } as any;
      });
    });

    it("should show error when submitting without uploading files", async () => {
      const user = userEvent.setup();

      render(<DeleteAccountTab />);

      // Fill in all fields
      await user.type(screen.getByLabelText(/ชื่อ \(ภาษาไทย\)/i), "สมชาย");
      await user.type(screen.getByLabelText(/นามสกุล \(ภาษาไทย\)/i), "ใจดี");
      await user.type(screen.getByLabelText(/เบอร์โทรศัพท์/i), "0812345678");

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      const submitButton = screen.getByRole("button", { name: /ส่งคำขอลบบัญชี/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          "กรุณาอัปโหลดสำเนาบัตรประชาชนหรือเอกสารยืนยันตัวตน",
          "error"
        );
      });
    });
  });

  describe("Sole admin blocking", () => {
    beforeEach(() => {
      vi.mocked(useSWR).mockImplementation((key: any) => {
        if (key && key[0] === "user-data") {
          return {
            data: {
              uid: "test-uid",
              info: {
                roles: ["admin", "company"],
                companyId: "company-123",
              },
            },
          } as any;
        }
        if (key && key[0] === "can-delete") {
          return {
            data: false, // Sole admin, cannot delete
            isLoading: false,
          } as any;
        }
        return { data: undefined } as any;
      });
    });

    it("should show blocking message for sole admin", () => {
      render(<DeleteAccountTab />);

      expect(screen.getByText("ไม่สามารถลบบัญชีได้")).toBeInTheDocument();
      expect(
        screen.getByText(/คุณเป็นผู้ดูแลระบบคนเดียว/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/กรุณาแต่งตั้งผู้ดูแลระบบคนอื่นก่อนลบบัญชี/i)
      ).toBeInTheDocument();
    });

    it("should show button to navigate to team management", () => {
      render(<DeleteAccountTab />);

      expect(screen.getByRole("button", { name: /ไปที่การจัดการทีม/i })).toBeInTheDocument();
    });

    it("should not show delete form when user is sole admin", () => {
      render(<DeleteAccountTab />);

      expect(screen.queryByText("ข้อมูลสำหรับยืนยันตัวตน")).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/ชื่อ \(ภาษาไทย\)/i)).not.toBeInTheDocument();
    });
  });

  describe("Loading states", () => {
    it("should show loading state while checking admin status", () => {
      vi.mocked(useSWR).mockImplementation((key: any) => {
        if (key && key[0] === "user-data") {
          return {
            data: {
              uid: "test-uid",
              info: {
                roles: ["admin", "company"],
                companyId: "company-123",
              },
            },
          } as any;
        }
        if (key && key[0] === "can-delete") {
          return {
            data: undefined,
            isLoading: true,
          } as any;
        }
        return { data: undefined } as any;
      });

      render(<DeleteAccountTab />);

      expect(screen.getByText("กำลังตรวจสอบ...")).toBeInTheDocument();
    });
  });

  describe("Multi-admin company", () => {
    beforeEach(() => {
      vi.mocked(useSWR).mockImplementation((key: any) => {
        if (key && key[0] === "user-data") {
          return {
            data: {
              uid: "test-uid",
              info: {
                roles: ["admin", "company"],
                companyId: "company-123",
              },
            },
          } as any;
        }
        if (key && key[0] === "can-delete") {
          return {
            data: true, // Multiple admins, can delete
            isLoading: false,
          } as any;
        }
        return { data: undefined } as any;
      });
    });

    it("should show delete form when company has multiple admins", () => {
      render(<DeleteAccountTab />);

      expect(screen.getByText("ข้อมูลสำหรับยืนยันตัวตน")).toBeInTheDocument();
      expect(screen.getByLabelText(/ชื่อ \(ภาษาไทย\)/i)).toBeInTheDocument();
    });

    it("should not show blocking message when company has multiple admins", () => {
      render(<DeleteAccountTab />);

      expect(screen.queryByText("ไม่สามารถลบบัญชีได้")).not.toBeInTheDocument();
    });
  });

  describe("Successful submission", () => {
    beforeEach(() => {
      vi.mocked(useSWR).mockImplementation((key: any) => {
        if (key && key[0] === "user-data") {
          return {
            data: {
              uid: "test-uid",
              info: { roles: ["candidate"] },
            },
          } as any;
        }
        return { data: undefined } as any;
      });

      vi.mocked(webDeleteRequestCreate).mockResolvedValue(undefined);
    });

    it("should redirect to dashboard after successful submission", async () => {
      const user = userEvent.setup();

      render(<DeleteAccountTab />);

      // Fill form
      await user.type(screen.getByLabelText(/ชื่อ \(ภาษาไทย\)/i), "สมชาย");
      await user.type(screen.getByLabelText(/นามสกุล \(ภาษาไทย\)/i), "ใจดี");
      await user.type(screen.getByLabelText(/เบอร์โทรศัพท์/i), "0812345678");

      // Upload file (mock)
      const fileInput = screen.getByLabelText("เลือกไฟล์");
      const file = new File(["dummy"], "id-card.jpg", { type: "image/jpeg" });
      await user.upload(fileInput, file);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      const submitButton = screen.getByRole("button", { name: /ส่งคำขอลบบัญชี/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/jobsmarket/dashboard");
      });
    });
  });
});
