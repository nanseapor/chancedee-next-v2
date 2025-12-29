/**
 * Unit Tests: COMP-R07 Job Detail Types
 * Tests for type validators and helper functions
 */

import { describe, it, expect } from "vitest";
import {
  STATUS_ACTIONS,
  isActionAvailable,
  canEditJob,
  canDeleteJob,
  type JobStatus,
} from "@/types/jobsmarket/job-detail.types";

describe("Job Detail Types", () => {
  describe("STATUS_ACTIONS matrix", () => {
    it("should have correct actions for draft status", () => {
      expect(STATUS_ACTIONS.draft).toEqual([
        "publish",
        "close",
        "delete",
        "duplicate",
      ]);
      expect(STATUS_ACTIONS.draft).toHaveLength(4);
    });

    it("should have correct actions for ontimer status", () => {
      expect(STATUS_ACTIONS.ontimer).toEqual([
        "activate_now",
        "cancel_schedule",
        "close",
        "duplicate",
      ]);
      expect(STATUS_ACTIONS.ontimer).toHaveLength(4);
    });

    it("should have correct actions for published status", () => {
      expect(STATUS_ACTIONS.published).toEqual([
        "unpublish",
        "close",
        "duplicate",
      ]);
      expect(STATUS_ACTIONS.published).toHaveLength(3);
    });

    it("should have correct actions for unpublished status", () => {
      expect(STATUS_ACTIONS.unpublished).toEqual([
        "publish",
        "close",
        "duplicate",
      ]);
      expect(STATUS_ACTIONS.unpublished).toHaveLength(3);
    });

    it("should have only duplicate action for closed status", () => {
      expect(STATUS_ACTIONS.closed).toEqual(["duplicate"]);
      expect(STATUS_ACTIONS.closed).toHaveLength(1);
    });

    it("should have all job statuses defined", () => {
      const statuses: JobStatus[] = [
        "draft",
        "ontimer",
        "published",
        "unpublished",
        "closed",
      ];
      statuses.forEach((status) => {
        expect(STATUS_ACTIONS[status]).toBeDefined();
        expect(Array.isArray(STATUS_ACTIONS[status])).toBe(true);
      });
    });
  });

  describe("isActionAvailable", () => {
    it("should return true for available action", () => {
      expect(isActionAvailable("draft", "publish")).toBe(true);
      expect(isActionAvailable("draft", "delete")).toBe(true);
      expect(isActionAvailable("published", "unpublish")).toBe(true);
      expect(isActionAvailable("closed", "duplicate")).toBe(true);
    });

    it("should return false for unavailable action", () => {
      expect(isActionAvailable("draft", "unpublish")).toBe(false);
      expect(isActionAvailable("published", "publish")).toBe(false);
      expect(isActionAvailable("closed", "delete")).toBe(false);
      expect(isActionAvailable("closed", "edit")).toBe(false);
    });

    it("should return false for invalid status", () => {
      // @ts-expect-error Testing invalid status
      expect(isActionAvailable("invalid", "publish")).toBe(false);
    });

    it("should handle empty action string", () => {
      expect(isActionAvailable("draft", "")).toBe(false);
    });
  });

  describe("canEditJob", () => {
    it("should return true for editable statuses", () => {
      expect(canEditJob("draft")).toBe(true);
      expect(canEditJob("ontimer")).toBe(true);
      expect(canEditJob("published")).toBe(true);
      expect(canEditJob("unpublished")).toBe(true);
    });

    it("should return false for closed status", () => {
      expect(canEditJob("closed")).toBe(false);
    });
  });

  describe("canDeleteJob", () => {
    it("should return true for draft with 0 applications", () => {
      expect(canDeleteJob("draft", 0)).toBe(true);
    });

    it("should return false for draft with applications", () => {
      expect(canDeleteJob("draft", 1)).toBe(false);
      expect(canDeleteJob("draft", 5)).toBe(false);
      expect(canDeleteJob("draft", 100)).toBe(false);
    });

    it("should return false for non-draft statuses even with 0 applications", () => {
      expect(canDeleteJob("ontimer", 0)).toBe(false);
      expect(canDeleteJob("published", 0)).toBe(false);
      expect(canDeleteJob("unpublished", 0)).toBe(false);
      expect(canDeleteJob("closed", 0)).toBe(false);
    });

    it("should return false for non-draft statuses with applications", () => {
      expect(canDeleteJob("published", 5)).toBe(false);
      expect(canDeleteJob("closed", 10)).toBe(false);
    });
  });
});
