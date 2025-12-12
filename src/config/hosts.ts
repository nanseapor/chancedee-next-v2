/**
 * Host configuration for different environments
 * These URLs are used across the application for navigation and links
 */

/**
 * Content site URL (www.chancedee.com)
 * Accessible in both server and client components
 */
export const CONTENT_HOST = process.env.NEXT_PUBLIC_CONTENT_HOST || "https://www.chancedee.com";

/**
 * Jobs market site URL (jobs.chancedee.com)
 * Accessible in both server and client components
 */
export const JOBS_HOST = process.env.NEXT_PUBLIC_JOBS_HOST || "https://jobs.chancedee.com";
