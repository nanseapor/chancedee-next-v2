/**
 * Authentication helpers for Playwright tests
 *
 * Provides utilities for signing in/out users during E2E tests.
 */

import { Page, expect } from "@playwright/test";

/**
 * Sign in using custom token (programmatic sign-in)
 *
 * This method uses Firebase's signInWithCustomToken to authenticate
 * without requiring the user to enter credentials through the UI.
 *
 * NOTE: This requires a special route at /jobsmarket/auth/token-login
 * that accepts a token query parameter and calls signInWithCustomToken.
 *
 * @example
 * const candidate = await createTestCandidate();
 * await signInWithCustomToken(page, candidate.customToken);
 * await page.goto('/jobsmarket/candidates/dashboard');
 */
export async function signInWithCustomToken(page: Page, customToken: string, redirectUrl?: string) {
  // Build URL with optional redirect parameter
  const tokenLoginUrl = redirectUrl
    ? `/jobsmarket/auth/token-login?token=${encodeURIComponent(customToken)}&redirect=${encodeURIComponent(redirectUrl)}`
    : `/jobsmarket/auth/token-login?token=${encodeURIComponent(customToken)}`;

  // Navigate to the token login route with the custom token
  await page.goto(tokenLoginUrl);

  // Wait for authentication to complete - either redirect away from token-login
  // or navigate to any jobsmarket or platform page that isn't auth-related
  await page.waitForURL(
    (url) => {
      const path = url.pathname;
      // Should have left the token-login page
      if (path.includes("/auth/token-login")) return false;
      // Should be on a jobsmarket or platform page
      return path.startsWith("/jobsmarket") || path.startsWith("/platform");
    },
    { timeout: 15000 }
  );

  // Give a moment for auth state to propagate
  await page.waitForTimeout(500);
}

/**
 * Sign in using email/password through the login UI
 *
 * @example
 * const candidate = await createTestCandidate();
 * await signInWithCredentials(page, candidate.email, candidate.password);
 */
export async function signInWithCredentials(
  page: Page,
  email: string,
  password: string
) {
  await page.goto("/jobsmarket/auth/login");

  // Fill in email
  await page.getByLabel("อีเมล").fill(email);

  // Fill in password
  await page.getByPlaceholder("กรอกรหัสผ่าน").fill(password);

  // Accept terms and privacy policy (required for login)
  const termsCheckbox = page.getByRole("checkbox", { name: /ยอมรับ.*ข้อกำหนด/i });
  if (await termsCheckbox.isVisible()) {
    await termsCheckbox.check();
  }

  // Click login button (use exact match to avoid matching "เข้าสู่ระบบด้วย Google")
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();

  // Wait for redirect to dashboard/home
  await page.waitForURL(/\/(candidates|companies|dashboard|chat)/, {
    timeout: 15000,
  });
}

/**
 * Sign out current user
 *
 * @example
 * await signOut(page);
 * await expect(page).toHaveURL('/jobsmarket/auth/login');
 */
export async function signOut(page: Page) {
  // Try to find and click the settings/profile menu
  const settingsLink = page.getByRole("link", { name: /ตั้งค่า|settings/i });

  if (await settingsLink.isVisible()) {
    await settingsLink.click();
    await page.waitForTimeout(500);
  }

  // Click logout button
  const logoutButton = page.getByRole("button", { name: /ออกจากระบบ|logout/i });

  if (await logoutButton.isVisible()) {
    await logoutButton.click();

    // Wait for redirect to login page
    await page.waitForURL(/\/auth\/login/, { timeout: 10000 });
  } else {
    // Alternative: Navigate directly to logout route
    await page.goto("/jobsmarket/auth/logout");
    await page.waitForURL(/\/auth\/login/, { timeout: 10000 });
  }
}

/**
 * Check if user is currently logged in
 *
 * @example
 * const isLoggedIn = await isAuthenticated(page);
 * expect(isLoggedIn).toBe(true);
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  // Check for auth-related elements or cookies
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find((c) => c.name === "__session");
  return !!sessionCookie;
}

/**
 * Navigate to a protected route and verify authentication
 *
 * @example
 * await navigateAuthenticated(page, '/jobsmarket/candidates/1234/dashboard');
 */
export async function navigateAuthenticated(page: Page, url: string) {
  await page.goto(url);

  // If redirected to login, we're not authenticated
  const currentUrl = page.url();
  if (currentUrl.includes("/auth/login")) {
    throw new Error(`Not authenticated: redirected to login from ${url}`);
  }
}

/**
 * Wait for auth state to be ready
 * Useful after token-based sign-in
 */
export async function waitForAuthReady(page: Page, timeout = 5000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "__session");

    if (sessionCookie) {
      return true;
    }

    await page.waitForTimeout(100);
  }

  throw new Error("Auth state not ready within timeout");
}

/**
 * Sign in as a test candidate and navigate to their dashboard
 *
 * @example
 * const candidate = await createTestCandidate({ withCompleteProfile: true });
 * await signInAsCandidate(page, candidate);
 * // Now on candidate dashboard
 */
export async function signInAsCandidate(
  page: Page,
  candidate: { customToken: string; candidateId: string }
) {
  await signInWithCustomToken(page, candidate.customToken);

  // Wait a bit longer for session cookie to propagate
  await page.waitForTimeout(1000);

  await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/dashboard`);

  // Give more time for auth state to stabilize - retry if redirected to login
  try {
    await expect(page).toHaveURL(new RegExp(`/candidates/${candidate.candidateId}`), { timeout: 10000 });
  } catch {
    // If redirected to login, try signing in again
    await signInWithCustomToken(page, candidate.customToken);
    await page.waitForTimeout(1000);
    await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/dashboard`);
    await expect(page).toHaveURL(new RegExp(`/candidates/${candidate.candidateId}`));
  }
}

/**
 * Sign in as a test company and navigate to their dashboard
 *
 * @example
 * const company = await createTestCompany();
 * await signInAsCompany(page, company);
 * // Now on company dashboard
 */
export async function signInAsCompany(
  page: Page,
  company: { customToken: string; companyId: string }
) {
  await signInWithCustomToken(page, company.customToken);

  // Wait a bit longer for session cookie to propagate
  await page.waitForTimeout(1000);

  await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard`);

  // Give more time for auth state to stabilize - retry if redirected to login
  try {
    await expect(page).toHaveURL(new RegExp(`/companies/${company.companyId}`), { timeout: 10000 });
  } catch {
    // If redirected to login, try signing in again
    await signInWithCustomToken(page, company.customToken);
    await page.waitForTimeout(1000);
    await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard`);
    await expect(page).toHaveURL(new RegExp(`/companies/${company.companyId}`));
  }
}

/**
 * Sign in using email/password (alias for signInWithCredentials)
 *
 * This is a convenience alias used by wallet and other E2E tests.
 *
 * @example
 * const candidate = await CandidateVariants.complete();
 * await loginAsTestUser(page, candidate.email, candidate.password);
 */
export async function loginAsTestUser(
  page: Page,
  email: string,
  password: string
) {
  return signInWithCredentials(page, email, password);
}
