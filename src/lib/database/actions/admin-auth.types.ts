/**
 * Admin Authentication Types
 * Extracted from admin-auth.ts for Next.js 15+ compatibility
 * "use server" files can only export async functions
 */

export interface AdminUser {
  userId: string;
  email: string;
  name?: string;
  roles: string[];
}
