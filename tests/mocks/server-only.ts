/**
 * Mock for 'server-only' package in test environment
 *
 * The 'server-only' package is used by Next.js to ensure server code
 * doesn't get imported in client components. In test environments,
 * we need to mock it to avoid import errors.
 */

// Empty export - this package only throws errors in browser environments
export {};
