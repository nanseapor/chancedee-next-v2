"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Earn More Coins Modal
 * Per CAND-R01 RIS §3.2.3
 *
 * Shows ways to earn coins with coin amounts and icons
 */

export interface EarnMoreModalProps {
  onClose: () => void;
}

interface EarnMethod {
  icon: string;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  coins: number;
}

const EARN_METHODS: EarnMethod[] = [
  {
    icon: "✓",
    titleTh: "กรอกโปรไฟล์ให้สมบูรณ์",
    titleEn: "Complete Your Profile",
    descriptionTh: "กรอกข้อมูลโปรไฟล์ให้ครบถ้วน 100%",
    coins: 100,
  },
  {
    icon: "📝",
    titleTh: "สมัครงาน",
    titleEn: "Apply for Jobs",
    descriptionTh: "สมัครงานแต่ละตำแหน่ง",
    coins: 10,
  },
  {
    icon: "🎯",
    titleTh: "ผ่านการสัมภาษณ์",
    titleEn: "Complete Interview",
    descriptionTh: "เข้าร่วมการสัมภาษณ์งาน",
    coins: 50,
  },
  {
    icon: "🏆",
    titleTh: "ได้รับการจ้างงาน",
    titleEn: "Get Hired",
    descriptionTh: "ได้รับข้อเสนอและเริ่มงาน",
    coins: 500,
  },
  {
    icon: "⭐",
    titleTh: "รีวิวบริษัท",
    titleEn: "Review Company",
    descriptionTh: "เขียนรีวิวประสบการณ์การทำงาน",
    coins: 20,
  },
];

export function EarnMoreModal({ onClose }: EarnMoreModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                วิธีหาเหรียญเพิ่ม
              </h3>
              <p className="text-sm text-gray-500">How to Earn More Coins</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Info Banner */}
          <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              ใช้เหรียญเพื่อปลดล็อกฟีเจอร์พิเศษ เช่น การดูโปรไฟล์บริษัท
              ข้อมูลเงินเดือน และคำแนะนำจากผู้เชี่ยวชาญ
            </p>
          </div>

          {/* Earn Methods List */}
          <div className="space-y-3 mb-6">
            {EARN_METHODS.map((method, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-2xl flex-shrink-0">
                  {method.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {method.titleTh}
                  </p>
                  <p className="text-xs text-gray-500">{method.titleEn}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {method.descriptionTh}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-lg font-bold text-amber-600">
                    +{method.coins}
                  </span>
                  <svg
                    className="w-5 h-5 text-amber-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Close Button */}
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            ปิด
          </Button>
        </div>
      </div>
    </div>
  );
}
