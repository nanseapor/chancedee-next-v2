"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Building2, Shield, Settings, ChevronDown, Check } from "lucide-react";

/**
 * Role Switcher Component
 * Per Section 2.10 of 01-navigation-shells.md
 *
 * Allows multi-role users to switch between contexts:
 * - Candidate role
 * - Company roles (can have multiple)
 * - Platform admin role
 *
 * Only shown if user has multiple roles
 */

export interface Role {
  type: "candidate" | "company" | "admin";
  id?: string; // Company ID for company roles
  name: string; // Display name
  isCurrent?: boolean;
}

export interface RoleSwitcherProps {
  /** List of available roles for the user */
  roles: Role[];
  /** Current active role */
  currentRole: Role;
  /** Handler when role is switched */
  onRoleSwitch: (role: Role) => void;
  /** Settings link href */
  settingsHref?: string;
  /** Additional className */
  className?: string;
}

export function RoleSwitcher({
  roles,
  currentRole,
  onRoleSwitch,
  settingsHref = "/jobsmarket/auth/settings?tab=account",
  className = "",
}: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Don't render if user has only one role
  if (roles.length <= 1) {
    return null;
  }

  const getRoleIcon = (type: Role["type"]) => {
    switch (type) {
      case "candidate":
        return <User className="w-4 h-4" />;
      case "company":
        return <Building2 className="w-4 h-4" />;
      case "admin":
        return <Shield className="w-4 h-4" />;
    }
  };

  const handleRoleClick = (role: Role) => {
    setIsOpen(false);
    if (role.type !== currentRole.type || role.id !== currentRole.id) {
      onRoleSwitch(role);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="สลับบทบาท"
      >
        {getRoleIcon(currentRole.type)}
        <span className="hidden md:inline">{currentRole.name}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {/* Role Options */}
            <div className="max-h-64 overflow-y-auto">
              {roles.map((role, index) => {
                const isCurrent =
                  role.type === currentRole.type &&
                  (!role.id || role.id === currentRole.id);

                // Group separator before admin role
                const showDividerBefore =
                  role.type === "admin" &&
                  index > 0 &&
                  roles[index - 1]?.type !== "admin";

                return (
                  <div key={`${role.type}-${role.id || "default"}`}>
                    {showDividerBefore && (
                      <div className="my-1 border-t border-gray-100" />
                    )}
                    <button
                      onClick={() => handleRoleClick(role)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2 text-sm
                        ${isCurrent ? "bg-teal-50 text-teal-700" : "text-gray-700 hover:bg-gray-50"}
                      `}
                    >
                      {/* Check Mark (current role) */}
                      <div className="w-4 h-4 flex items-center justify-center">
                        {isCurrent && <Check className="w-4 h-4 text-teal-600" />}
                      </div>

                      {/* Role Icon */}
                      {getRoleIcon(role.type)}

                      {/* Role Name */}
                      <span className="flex-1 text-left truncate">{role.name}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <div className="my-1 border-t border-gray-100" />

            {/* Manage Account Link */}
            <Link
              href={settingsHref}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <div className="w-4 h-4" /> {/* Spacer for alignment */}
              <Settings className="w-4 h-4" />
              <span>จัดการบัญชี</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
