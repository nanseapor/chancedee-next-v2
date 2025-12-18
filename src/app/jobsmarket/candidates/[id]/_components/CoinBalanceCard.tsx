"use client";

import { useState } from "react";

import { EarnMoreModal } from "./EarnMoreModal";

/**
 * Coin Balance Card Component
 * Per CAND-R01 RIS §3.2.3
 *
 * Features:
 * - Display current coin balance
 * - "Earn More" CTA → opens modal
 * - Loading and error states
 */

export interface CoinBalanceCardProps {
  balance: number;
  isLoading?: boolean;
  error?: Error;
}

export function CoinBalanceCard({
  balance,
  isLoading = false,
  error,
}: CoinBalanceCardProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              ยอดเหรียญของคุณ
            </h2>
            <p className="text-sm text-gray-500">Your Coin Balance</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-amber-600"
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

        {/* Balance Display */}
        <div className="mb-4">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              <span className="text-sm text-gray-500">กำลังโหลด...</span>
            </div>
          ) : error ? (
            <div className="text-sm text-red-600">
              ไม่สามารถโหลดยอดเหรียญได้
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">
                {balance.toLocaleString()}
              </span>
              <span className="text-lg text-gray-500">เหรียญ</span>
            </div>
          )}
        </div>

        {/* Earn More CTA */}
        <button
          onClick={() => setShowModal(true)}
          disabled={isLoading || !!error}
          className="w-full px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          วิธีหาเหรียญเพิ่ม
        </button>
      </div>

      {/* Earn More Modal */}
      {showModal && <EarnMoreModal onClose={() => setShowModal(false)} />}
    </>
  );
}
