/**
 * Company Details Form - Mode A (Create New Company)
 * Per AUTH-R02 Implementation Plan Section 3.1
 * Per BLS-01 §3.2 Company Mode A - Company information collection
 *
 * Step 2 for company Mode A: Collect company details and upload document
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Upload, X } from "lucide-react";

export interface CompanyDetailsFormModeAProps {
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string;
  /** Callback when form is submitted */
  onSubmit: (data: CompanyFormData) => Promise<void>;
  /** Callback to go back */
  onBack?: () => void;
  /** Optional class name */
  className?: string;
}

export interface CompanyFormData {
  companyName: string;
  companyNameEn?: string;
  taxId: string;
  industry: string;
  employeeCount: string;
  address: string;
  province: string;
  district: string;
  postalCode: string;
  phone: string;
  website?: string;
  description: string;
  documentFile: File; // Required: company registration document
}

/**
 * Company Details Form - Mode A
 * Collects all company information and requires document upload
 */
export function CompanyDetailsFormModeA({
  isLoading = false,
  error,
  onSubmit,
  onBack,
  className = "",
}: CompanyDetailsFormModeAProps) {
  // Form fields
  const [companyName, setCompanyName] = useState("");
  const [companyNameEn, setCompanyNameEn] = useState("");
  const [taxId, setTaxId] = useState("");
  const [industry, setIndustry] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max per Section 14)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setValidationError("ไฟล์มีขนาดใหญ่เกิน 10MB");
      return;
    }

    // Validate file type
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setValidationError("รองรับเฉพาะไฟล์ PDF, JPG, PNG เท่านั้น");
      return;
    }

    setValidationError("");
    setDocumentFile(file);
  };

  const handleRemoveFile = () => {
    setDocumentFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validate required fields
    if (!companyName.trim()) {
      setValidationError("กรุณากรอกชื่อบริษัท");
      return;
    }

    if (!taxId.trim() || !/^\d{13}$/.test(taxId)) {
      setValidationError("กรุณากรอกเลขประจำตัวผู้เสียภาษี 13 หลัก");
      return;
    }

    if (!industry) {
      setValidationError("กรุณาเลือกประเภทธุรกิจ");
      return;
    }

    if (!documentFile) {
      setValidationError("กรุณาอัพโหลดเอกสารยืนยันบริษัท");
      return;
    }

    // Submit form data
    await onSubmit({
      companyName,
      companyNameEn,
      taxId,
      industry,
      employeeCount,
      address,
      province,
      district,
      postalCode,
      phone,
      website,
      description,
      documentFile,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Title */}
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold">ข้อมูลบริษัท</h2>
        <p className="text-sm text-gray-600">
          กรุณากรอกข้อมูลบริษัทของคุณให้ครบถ้วน
        </p>
      </div>

      {/* Company Name (Thai) */}
      <div className="space-y-2">
        <Label htmlFor="company-name">
          ชื่อบริษัท (ภาษาไทย) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="company-name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="บริษัท ตัวอย่าง จำกัด"
          disabled={isLoading}
          required
        />
      </div>

      {/* Company Name (English) */}
      <div className="space-y-2">
        <Label htmlFor="company-name-en">ชื่อบริษัท (ภาษาอังกฤษ)</Label>
        <Input
          id="company-name-en"
          value={companyNameEn}
          onChange={(e) => setCompanyNameEn(e.target.value)}
          placeholder="Example Company Ltd."
          disabled={isLoading}
        />
      </div>

      {/* Tax ID */}
      <div className="space-y-2">
        <Label htmlFor="tax-id">
          เลขประจำตัวผู้เสียภาษี (13 หลัก) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="tax-id"
          value={taxId}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            if (value.length <= 13) setTaxId(value);
          }}
          placeholder="0000000000000"
          disabled={isLoading}
          required
          maxLength={13}
        />
      </div>

      {/* Industry */}
      <div className="space-y-2">
        <Label htmlFor="industry">
          ประเภทธุรกิจ <span className="text-red-500">*</span>
        </Label>
        <Select value={industry} onValueChange={setIndustry} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="เลือกประเภทธุรกิจ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technology">เทคโนโลยีและไอที</SelectItem>
            <SelectItem value="finance">การเงินและธนาคาร</SelectItem>
            <SelectItem value="retail">ค้าปลีกและการขาย</SelectItem>
            <SelectItem value="manufacturing">การผลิตและอุตสาหกรรม</SelectItem>
            <SelectItem value="healthcare">สุขภาพและการแพทย์</SelectItem>
            <SelectItem value="education">การศึกษา</SelectItem>
            <SelectItem value="hospitality">โรงแรมและการท่องเที่ยว</SelectItem>
            <SelectItem value="construction">ก่อสร้าง</SelectItem>
            <SelectItem value="other">อื่นๆ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employee Count */}
      <div className="space-y-2">
        <Label htmlFor="employee-count">จำนวนพนักงาน</Label>
        <Select value={employeeCount} onValueChange={setEmployeeCount} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="เลือกจำนวนพนักงาน" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-10">1-10 คน</SelectItem>
            <SelectItem value="11-50">11-50 คน</SelectItem>
            <SelectItem value="51-200">51-200 คน</SelectItem>
            <SelectItem value="201-500">201-500 คน</SelectItem>
            <SelectItem value="501+">501+ คน</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">ที่อยู่บริษัท</Label>
        <Textarea
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="เลขที่, ถนน, ตำบล/แขวง"
          disabled={isLoading}
          rows={2}
        />
      </div>

      {/* Province & District */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="province">จังหวัด</Label>
          <Input
            id="province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            placeholder="กรุงเทพมหานคร"
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="district">เขต/อำเภอ</Label>
          <Input
            id="district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="ปทุมวัน"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Postal Code & Phone */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postal-code">รหัสไปรษณีย์</Label>
          <Input
            id="postal-code"
            value={postalCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 5) setPostalCode(value);
            }}
            placeholder="10330"
            disabled={isLoading}
            maxLength={5}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="02-123-4567"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Website */}
      <div className="space-y-2">
        <Label htmlFor="website">เว็บไซต์บริษัท</Label>
        <Input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://www.example.com"
          disabled={isLoading}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">รายละเอียดบริษัท</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="แนะนำบริษัทของคุณ..."
          disabled={isLoading}
          rows={4}
        />
      </div>

      {/* Document Upload */}
      <div className="space-y-2">
        <Label htmlFor="document">
          เอกสารยืนยันบริษัท <span className="text-red-500">*</span>
        </Label>
        <p className="text-xs text-gray-500 mb-2">
          อัพโหลดหนังสือรับรองบริษัท หรือเอกสารที่แสดงการจดทะเบียนบริษัท (PDF, JPG,
          PNG สูงสุด 10MB)
        </p>

        {!documentFile ? (
          <label
            htmlFor="document-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">คลิกเพื่ออัพโหลดไฟล์</p>
              <p className="text-xs text-gray-400">PDF, JPG, PNG (สูงสุด 10MB)</p>
            </div>
            <input
              id="document-upload"
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </label>
        ) : (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium">{documentFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {(validationError || error) && (
        <div className="flex items-center gap-2 text-sm text-red-600 p-3 bg-red-50 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span>{validationError || error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="flex-1"
          >
            ← ย้อนกลับ
          </Button>
        )}
        <Button
          type="submit"
          disabled={!companyName || !taxId || !industry || !documentFile || isLoading}
          className="flex-1"
        >
          {isLoading ? "กำลังส่งคำขอ..." : "ส่งคำขอลงทะเบียน"}
        </Button>
      </div>
    </form>
  );
}
