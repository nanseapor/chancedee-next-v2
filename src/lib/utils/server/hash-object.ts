import { createHash } from "crypto";

// Hash function
export function hashObject(obj?: Record<string, any>): string {
  if (!obj) return "undefined";
  const str = JSON.stringify(obj);
  return createHash("sha256").update(str).digest("hex");
}
