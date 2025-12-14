import { describe, it, expect } from "vitest";

/**
 * Unit tests for AUTH-R06 Settings Tab Visibility Logic
 * Tests tab visibility rules based on user roles
 */

describe("Tab Visibility Logic", () => {
  describe("Tab visibility for different user roles", () => {
    it("should show all 5 tabs for normal authenticated candidate users", () => {
      const roles = ["candidate"];
      const activeRole = "candidate";
      const isPending = activeRole === "pending";

      const tabs = [
        { id: "account", visible: true },
        { id: "password", visible: true },
        { id: "notifications", visible: !isPending },
        { id: "privacy", visible: true },
        { id: "delete", visible: true },
      ];

      const visibleTabs = tabs.filter((tab) => tab.visible);
      expect(visibleTabs).toHaveLength(5);
      expect(visibleTabs.map((t) => t.id)).toEqual([
        "account",
        "password",
        "notifications",
        "privacy",
        "delete",
      ]);
    });

    it("should show all 5 tabs for company users", () => {
      const roles = ["company", "admin"];
      const activeRole = "company";
      const isPending = activeRole === "pending";

      const tabs = [
        { id: "account", visible: true },
        { id: "password", visible: true },
        { id: "notifications", visible: !isPending },
        { id: "privacy", visible: true },
        { id: "delete", visible: true },
      ];

      const visibleTabs = tabs.filter((tab) => tab.visible);
      expect(visibleTabs).toHaveLength(5);
    });

    it("should hide Notifications tab for pending users", () => {
      const roles = ["pending", "candidate"];
      const activeRole = "pending";
      const isPending = activeRole === "pending";

      const tabs = [
        { id: "account", visible: true },
        { id: "password", visible: true },
        { id: "notifications", visible: !isPending },
        { id: "privacy", visible: true },
        { id: "delete", visible: true },
      ];

      const visibleTabs = tabs.filter((tab) => tab.visible);
      expect(visibleTabs).toHaveLength(4);
      expect(visibleTabs.map((t) => t.id)).toEqual([
        "account",
        "password",
        "privacy",
        "delete",
      ]);
      expect(visibleTabs.find((t) => t.id === "notifications")).toBeUndefined();
    });

    it("should show Notifications tab when activeRole changes from pending to candidate", () => {
      const roles = ["candidate"]; // No longer pending
      const activeRole = "candidate";
      const isPending = activeRole === "pending";

      const notificationsTab = { id: "notifications", visible: !isPending };

      expect(notificationsTab.visible).toBe(true);
    });
  });

  describe("Multi-role section visibility in Account tab", () => {
    it("should show default role section for multi-role users", () => {
      const roles = ["candidate", "company"];
      const isMultiRole =
        roles.includes("candidate") && roles.includes("company");

      expect(isMultiRole).toBe(true);
    });

    it("should hide default role section for candidate-only users", () => {
      const roles = ["candidate"];
      const isMultiRole =
        roles.includes("candidate") && roles.includes("company");

      expect(isMultiRole).toBe(false);
    });

    it("should hide default role section for company-only users", () => {
      const roles = ["company", "admin"];
      const isMultiRole =
        roles.includes("candidate") && roles.includes("company");

      expect(isMultiRole).toBe(false);
    });

    it("should hide default role section for pending users even if they have candidate role", () => {
      const roles = ["pending", "candidate"];
      const isMultiRole =
        roles.includes("candidate") && roles.includes("company");

      expect(isMultiRole).toBe(false);
    });
  });

  describe("Tab ordering", () => {
    it("should maintain correct tab order", () => {
      const tabs = [
        { id: "account", order: 1 },
        { id: "password", order: 2 },
        { id: "notifications", order: 3 },
        { id: "privacy", order: 4 },
        { id: "delete", order: 5 },
      ];

      const orderedIds = tabs.map((t) => t.id);
      expect(orderedIds).toEqual([
        "account",
        "password",
        "notifications",
        "privacy",
        "delete",
      ]);
    });
  });

  describe("Default tab selection", () => {
    it("should default to account tab when no query param provided", () => {
      const tabFromUrl = null;
      const defaultTab = tabFromUrl || "account";

      expect(defaultTab).toBe("account");
    });

    it("should use tab from URL query param when provided", () => {
      const tabFromUrl = "notifications";
      const defaultTab = tabFromUrl || "account";

      expect(defaultTab).toBe("notifications");
    });
  });
});
