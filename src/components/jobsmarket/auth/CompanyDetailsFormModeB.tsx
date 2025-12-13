/**
 * Company Details Form - Mode B (Join Existing Company)
 * Per AUTH-R02 Implementation Plan Section 3.1
 * Per BLS-01 §3.2 Company Mode B - Search and select existing company
 *
 * Step 2 for company Mode B: Search for company and upload name card
 */

"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Search, Upload, X, Building2 } from "lucide-react";
import {
  companySearchQueryAtom,
  companySearchResultsAtom,
  selectedCompanyAtom,
  type CompanySearchResult,
} from "@/store/jobsmarket/register-atoms";

export interface CompanyDetailsFormModeBProps {
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string;
  /** Callback when company search is triggered */
  onSearchCompany: (query: string) => Promise<CompanySearchResult[]>;
  /** Callback when form is submitted */
  onSubmit: (data: { companyId: string; nameCardFile: File }) => Promise<void>;
  /** Callback to go back */
  onBack?: () => void;
  /** Optional class name */
  className?: string;
}

/**
 * Company Details Form - Mode B
 * Search existing company + upload name card
 */
export function CompanyDetailsFormModeB({
  isLoading = false,
  error,
  onSearchCompany,
  onSubmit,
  onBack,
  className = "",
}: CompanyDetailsFormModeBProps) {
  const [searchQuery, setSearchQuery] = useAtom(companySearchQueryAtom);
  const [searchResults, setSearchResults] = useAtom(companySearchResultsAtom);
  const [selectedCompany, setSelectedCompany] = useAtom(selectedCompanyAtom);
  const [nameCardFile, setNameCardFile] = useState<File | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setValidationError("กรุณากรอกชื่อบริษัทที่ต้องการค้นหา");
      return;
    }

    setIsSearching(true);
    setValidationError("");

    try {
      const results = await onSearchCompany(searchQuery);
      setSearchResults(results);

      if (results.length === 0) {
        setValidationError("ไม่พบบริษัทที่ค้นหา กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      console.error("Company search error:", err);
      setValidationError("เกิดข้อผิดพลาดในการค้นหา");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCompany = (company: CompanySearchResult) => {
    setSelectedCompany(company);
    setValidationError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max per Section 14)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setValidationError("ไฟล์มีขนาดใหญ่เกิน 5MB");
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setValidationError("รองรับเฉพาะไฟล์ JPG, PNG เท่านั้น");
      return;
    }

    setValidationError("");
    setNameCardFile(file);
  };

  const handleRemoveFile = () => {
    setNameCardFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!selectedCompany) {
      setValidationError("กรุณาเลือกบริษัทที่ต้องการเข้าร่วม");
      return;
    }

    if (!nameCardFile) {
      setValidationError("กรุณาอัพโหลดนามบัตร");
      return;
    }

    await onSubmit({
      companyId: selectedCompany.uid,
      nameCardFile,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Title */}
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold">เข้าร่วมบริษัท</h2>
        <p className="text-sm text-gray-600">
          ค้นหาบริษัทที่คุณต้องการเข้าร่วมและอัพโหลดนามบัตร
        </p>
      </div>

      {/* Company Search */}
      {!selectedCompany && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-search">ค้นหาบริษัท</Label>
            <div className="flex gap-2">
              <Input
                id="company-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ชื่อบริษัท หรือเลขประจำตัวผู้เสียภาษี"
                disabled={isSearching || isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleSearch}
                disabled={isSearching || isLoading}
              >
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? "กำลังค้นหา..." : "ค้นหา"}
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <Label>ผลการค้นหา ({searchResults.length})</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map((company) => (
                  <Card
                    key={company.uid}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleSelectCompany(company)}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      {company.companyLogo ? (
                        <img
                          src={company.companyLogo}
                          alt={company.companyName}
                          className="h-12 w-12 rounded object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{company.companyName}</h3>
                        {company.companyNameEn && (
                          <p className="text-sm text-gray-600">
                            {company.companyNameEn}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">{company.industry}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Company */}
      {selectedCompany && (
        <div className="space-y-2">
          <Label>บริษัทที่เลือก</Label>
          <Card className="border-primary">
            <CardContent className="flex items-center gap-4 p-4">
              {selectedCompany.companyLogo ? (
                <img
                  src={selectedCompany.companyLogo}
                  alt={selectedCompany.companyName}
                  className="h-16 w-16 rounded object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded bg-gray-200 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {selectedCompany.companyName}
                </h3>
                {selectedCompany.companyNameEn && (
                  <p className="text-sm text-gray-600">
                    {selectedCompany.companyNameEn}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {selectedCompany.industry}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCompany(null)}
                disabled={isLoading}
              >
                เปลี่ยน
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Name Card Upload */}
      {selectedCompany && (
        <div className="space-y-2">
          <Label htmlFor="namecard">
            นามบัตร <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-gray-500 mb-2">
            อัพโหลดนามบัตรของคุณเพื่อยืนยันว่าคุณเป็นพนักงานของบริษัทนี้ (JPG, PNG
            สูงสุด 5MB)
          </p>

          {!nameCardFile ? (
            <label
              htmlFor="namecard-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">คลิกเพื่ออัพโหลดนามบัตร</p>
                <p className="text-xs text-gray-400">JPG, PNG (สูงสุด 5MB)</p>
              </div>
              <input
                id="namecard-upload"
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </label>
          ) : (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">{nameCardFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(nameCardFile.size / 1024 / 1024).toFixed(2)} MB
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
      )}

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
          disabled={!selectedCompany || !nameCardFile || isLoading}
          className="flex-1"
        >
          {isLoading ? "กำลังส่งคำขอ..." : "ส่งคำขอเข้าร่วม"}
        </Button>
      </div>
    </form>
  );
}
