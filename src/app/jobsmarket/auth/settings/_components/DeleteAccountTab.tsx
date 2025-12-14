"use client";

import { useState } from "react";
import { useFirebaseAuth } from "@/hooks/use-auth";
import { webUserDataPropsGetById } from "@/lib/database/actions/user-data-props";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getCompanyAdminCount } from "@/domains/companies/services/server/actions/jobsmarket/admin-utils";
import { webDeleteRequestCreate } from "@/lib/database/actions/delete";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertTriangle,
  Upload,
  X,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast-notification";

const PHONE_REGEX_THAI = /^(0[689]{1}[0-9]{8})$/;

const DeleteRequestFormSchema = z.object({
  firstNameTh: z.string().min(1, "กรุณากรอกชื่อ"),
  lastNameTh: z.string().min(1, "กรุณากรอกนามสกุล"),
  phoneNumber: z
    .string()
    .regex(PHONE_REGEX_THAI, "รูปแบบเบอร์โทรไม่ถูกต้อง"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  confirmUnderstand: z.boolean().refine((val) => val === true, {
    message: "กรุณายืนยันว่าคุณเข้าใจ",
  }),
});

type DeleteRequestFormValues = z.infer<typeof DeleteRequestFormSchema>;

export function DeleteAccountTab() {
  const router = useRouter();
  const { user: firebaseUser } = useFirebaseAuth();
  const { addToast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user data
  const { data: userData } = useSWR(
    firebaseUser?.uid ? ["user-data", firebaseUser.uid] : null,
    ([, uid]) => webUserDataPropsGetById(uid)
  );

  // Check if user is a company admin
  const isCompanyAdmin =
    userData?.info?.roles?.includes("admin") &&
    userData?.info?.roles?.includes("company");

  // Check if user is sole admin
  const { data: canDelete, isLoading: isCheckingAdmin } = useSWR(
    isCompanyAdmin && userData?.info?.companyId
      ? ["can-delete", userData.uid]
      : null,
    async () => {
      if (!userData?.info?.companyId) return true; // Allow delete if no company
      const count = await getCompanyAdminCount(userData.info.companyId);
      return count > 1;
    }
  );

  const form = useForm<DeleteRequestFormValues>({
    resolver: zodResolver(DeleteRequestFormSchema),
    defaultValues: {
      firstNameTh: "",
      lastNameTh: "",
      phoneNumber: "",
      email: firebaseUser?.email || "",
      confirmUnderstand: false,
    },
  });

  // Handle file selection
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidType = ["image/jpeg", "image/png", "application/pdf"].includes(
        file.type
      );
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isValidType) {
        addToast(`ไฟล์ ${file.name} ไม่ใช่ JPG, PNG หรือ PDF`, "error");
        return false;
      }

      if (!isValidSize) {
        addToast(`ไฟล์ ${file.name} มีขนาดเกิน 5MB`, "error");
        return false;
      }

      return true;
    });

    setUploadedFiles((prev) => [...prev, ...validFiles]);
  }

  // Remove uploaded file
  function removeFile(index: number) {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // Handle form submission
  async function onSubmit(values: DeleteRequestFormValues) {
    if (!firebaseUser?.uid) return;

    if (uploadedFiles.length === 0) {
      addToast("กรุณาอัปโหลดสำเนาบัตรประชาชนหรือเอกสารยืนยันตัวตน", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Upload files to Firebase Storage and get URLs
      // For now, we'll use placeholder URLs
      const fileUrls = uploadedFiles.map(
        (file) => `placeholder-url-${file.name}`
      );

      // Generate document code
      const documentCode = `DEL-${Date.now()}-${firebaseUser.uid.slice(0, 6)}`;

      // Create delete request
      await webDeleteRequestCreate(
        {
          documentCode,
          firstNameTH: values.firstNameTh,
          lastNameTH: values.lastNameTh,
          phoneNumber: values.phoneNumber,
          email: values.email,
          status: "pending",
          attachedFiles: fileUrls,
        },
        firebaseUser.uid
      );

      addToast("ส่งคำขอเรียบร้อยแล้ว เราจะตรวจสอบคำขอของคุณภายใน 7 วันทำการ", "success");

      // Redirect to status page or dashboard
      router.push("/jobsmarket/dashboard");
    } catch (error) {
      console.error("Delete request error:", error);
      addToast("ไม่สามารถส่งคำขอได้ กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // TODO: Fetch company name from company_information collection using userData?.info?.companyId
  const companyName = "บริษัทของคุณ";

  // Show loading while checking admin status
  if (isCompanyAdmin && isCheckingAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">ลบบัญชี</h3>
          <p className="text-sm text-muted-foreground">Delete Account</p>
        </div>
        <p className="text-sm text-muted-foreground">กำลังตรวจสอบ...</p>
      </div>
    );
  }

  // Show blocking message if user is sole admin
  if (isCompanyAdmin && canDelete === false) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">ลบบัญชี</h3>
          <p className="text-sm text-muted-foreground">Delete Account</p>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg">ไม่สามารถลบบัญชีได้</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>
              คุณเป็นผู้ดูแลระบบคนเดียวของบริษัท <strong>{companyName}</strong>
            </p>
            <p className="text-sm">
              กรุณาแต่งตั้งผู้ดูแลระบบคนอื่นก่อนลบบัญชี
            </p>
            <p className="text-xs text-muted-foreground">
              You are the sole administrator of {companyName}. Please assign
              another administrator before deleting your account.
            </p>
            <div className="pt-2">
              <Button variant="outline" onClick={() => router.push("/jobsmarket/company/team")}>
                ไปที่การจัดการทีม
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show normal delete form
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">ลบบัญชี</h3>
        <p className="text-sm text-muted-foreground">Delete Account</p>
      </div>

      {/* Warning Alert */}
      <Alert>
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>คำเตือน</AlertTitle>
        <AlertDescription className="space-y-2">
          <p className="font-medium">การลบบัญชีจะ:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>ลบข้อมูลส่วนตัวทั้งหมดของคุณ</li>
            <li>ยกเลิกใบสมัครงานทั้งหมดที่ยังดำเนินการอยู่</li>
            <li>ลบประวัติการสนทนาทั้งหมด</li>
            <li>ไม่สามารถกู้คืนได้หลังจาก 30 วัน</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Delete Request Form */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h4 className="text-base font-medium">ข้อมูลสำหรับยืนยันตัวตน</h4>
            <p className="text-sm text-muted-foreground">
              Identity Verification Information
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* First Name */}
              <FormField
                control={form.control}
                name="firstNameTh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      ชื่อ (ภาษาไทย) <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="กรอกชื่อ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="lastNameTh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      นามสกุล (ภาษาไทย){" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="กรอกนามสกุล" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      เบอร์โทรศัพท์ <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="0812345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      อีเมล <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File Upload */}
              <div className="space-y-3">
                <Label>
                  เอกสารยืนยันตัวตน <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  อัปโหลดสำเนาบัตรประชาชนหรือเอกสารยืนยันตัวตน
                </p>

                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <Label
                      htmlFor="file-upload"
                      className="cursor-pointer text-primary hover:underline"
                    >
                      เลือกไฟล์
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    รองรับไฟล์: JPG, PNG, PDF (สูงสุด 5MB ต่อไฟล์)
                  </p>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirmation Checkbox */}
              <FormField
                control={form.control}
                name="confirmUnderstand"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        ฉันเข้าใจว่าการลบบัญชีไม่สามารถย้อนกลับได้หลังจาก 30 วัน
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        I understand that account deletion cannot be reversed
                        after 30 days
                      </p>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "กำลังส่ง..." : "ส่งคำขอลบบัญชี"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
}
