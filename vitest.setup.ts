import "@testing-library/jest-dom";
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Mock environment variables
process.env.NEXT_PUBLIC_DIRECTUS_API_ENDPOINT = 'http://localhost:8055';
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-domain';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-bucket';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'test-sender';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id';
process.env.NEXT_PUBLIC_MEILI_SEARCH_HOST = 'http://localhost:7700';
process.env.NEXT_PUBLIC_MEILI_SEARCH_API_KEY = 'test-meili-key';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Extend Vitest matchers with jest-dom
expect.extend({});

// Add ResizeObserver polyfill for jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
