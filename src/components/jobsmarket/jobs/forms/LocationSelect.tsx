"use client";

import { useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import provincesData from "@/data/provinces.json";
import districtsData from "@/data/districts.json";

export type WorkModel = "onsite" | "hybrid" | "remote";

export interface LocationSelectProps {
  workModel?: WorkModel;
  provinceId?: number;
  districtId?: number;
  onWorkModelChange: (model: WorkModel) => void;
  onProvinceChange: (id: number, name: string) => void;
  onDistrictChange: (id: number, name: string) => void;
  errors?: {
    workModel?: string;
    province?: string;
    district?: string;
  };
}

/**
 * Location selection component
 * Work model selector with cascading province/district dropdowns
 */
export function LocationSelect({
  workModel,
  provinceId,
  districtId,
  onWorkModelChange,
  onProvinceChange,
  onDistrictChange,
  errors,
}: LocationSelectProps) {
  // Filter districts by selected province
  const availableDistricts = useMemo(() => {
    if (!provinceId) return [];
    return districtsData.filter((d) => d.province_id === provinceId);
  }, [provinceId]);

  // Clear district when province changes
  useEffect(() => {
    if (provinceId && districtId) {
      const districtExists = availableDistricts.some((d) => d.id === districtId);
      if (!districtExists) {
        // District is no longer valid for new province
        onDistrictChange(0, "");
      }
    }
  }, [provinceId, districtId, availableDistricts, onDistrictChange]);

  const showLocationFields = workModel === "onsite" || workModel === "hybrid";

  return (
    <div className="space-y-6">
      {/* Work Model */}
      <div className="space-y-3">
        <Label className={errors?.workModel ? "text-red-600" : ""}>
          รูปแบบการทำงาน <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={workModel}
          onValueChange={(value: string) => onWorkModelChange(value as WorkModel)}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="onsite" id="onsite" />
            <Label htmlFor="onsite" className="font-normal cursor-pointer">
              ทำงานที่สำนักงาน (Onsite)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hybrid" id="hybrid" />
            <Label htmlFor="hybrid" className="font-normal cursor-pointer">
              ทำงานแบบผสมผสาน (Hybrid)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="remote" id="remote" />
            <Label htmlFor="remote" className="font-normal cursor-pointer">
              ทำงานที่บ้าน (Remote)
            </Label>
          </div>
        </RadioGroup>
        {errors?.workModel && (
          <p className="text-sm text-red-600">{errors.workModel}</p>
        )}
      </div>

      {/* Province & District - Only show for onsite/hybrid */}
      {showLocationFields && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Province */}
          <div className="space-y-2">
            <Label
              htmlFor="province"
              className={errors?.province ? "text-red-600" : ""}
            >
              จังหวัด <span className="text-red-500">*</span>
            </Label>
            <Select
              value={provinceId?.toString()}
              onValueChange={(value) => {
                const id = parseInt(value);
                const province = provincesData.find((p) => p.id === id);
                if (province) {
                  onProvinceChange(id, province.name_th);
                }
              }}
            >
              <SelectTrigger
                id="province"
                className={errors?.province ? "border-red-500 bg-red-50" : ""}
              >
                <SelectValue placeholder="เลือกจังหวัด" />
              </SelectTrigger>
              <SelectContent>
                {provincesData.map((province) => (
                  <SelectItem key={province.id} value={province.id.toString()}>
                    {province.name_th}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.province && (
              <p className="text-sm text-red-600">{errors.province}</p>
            )}
          </div>

          {/* District */}
          <div className="space-y-2">
            <Label htmlFor="district">
              เขต/อำเภอ{" "}
              <span className="text-xs text-gray-500">(ไม่บังคับ)</span>
            </Label>
            <Select
              value={districtId?.toString()}
              onValueChange={(value) => {
                const id = parseInt(value);
                const district = districtsData.find((d) => d.id === id);
                if (district) {
                  onDistrictChange(id, district.name_th);
                }
              }}
              disabled={!provinceId || availableDistricts.length === 0}
            >
              <SelectTrigger id="district">
                <SelectValue
                  placeholder={
                    !provinceId
                      ? "เลือกจังหวัดก่อน"
                      : availableDistricts.length === 0
                        ? "ไม่มีข้อมูลเขต/อำเภอ"
                        : "เลือกเขต/อำเภอ"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableDistricts.map((district) => (
                  <SelectItem key={district.id} value={district.id.toString()}>
                    {district.name_th}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
