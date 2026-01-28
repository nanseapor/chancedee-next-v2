import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "การตั้งค่าคุกกี้ | Chancedee Jobs",
  description: "จัดการการตั้งค่าคุกกี้และความเป็นส่วนตัวของคุณ",
};

export default function CookieSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <div className="h-10 w-10 text-secondary-600 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              การตั้งค่าคุกกี้
            </h1>
            <p className="mt-2 text-gray-600">
              จัดการการตั้งค่าคุกกี้และความเป็นส่วนตัวของคุณ
            </p>
          </div>

          {/* Placeholder content */}
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    คุกกี้ที่จำเป็น
                  </h3>
                  <p className="text-sm text-gray-500">
                    จำเป็นสำหรับการทำงานของเว็บไซต์
                  </p>
                </div>
                <span className="text-sm text-gray-400">เปิดใช้งานเสมอ</span>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    คุกกี้วิเคราะห์
                  </h3>
                  <p className="text-sm text-gray-500">
                    ช่วยให้เราเข้าใจการใช้งานเว็บไซต์
                  </p>
                </div>
                <div className="text-sm text-gray-400">กำลังพัฒนา</div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    คุกกี้การตลาด
                  </h3>
                  <p className="text-sm text-gray-500">
                    ใช้สำหรับการโฆษณาที่ตรงกับความสนใจ
                  </p>
                </div>
                <div className="text-sm text-gray-400">กำลังพัฒนา</div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-500">
              กำลังพัฒนา - Cookie consent management placeholder
            </p>
            <p className="mt-1 text-xs text-gray-400">
              TODO: Implement PRIVACY-R01 Cookie Settings
            </p>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <Link
              href="/"
              className="text-sm text-secondary-600 hover:text-secondary-800"
            >
              กลับหน้าหลัก
            </Link>
            <Link
              href="/legal/cookies-policy"
              className="text-sm text-secondary-600 hover:text-secondary-800"
            >
              นโยบายคุกกี้
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
