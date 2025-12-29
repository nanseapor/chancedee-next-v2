# Manual Test Checklist - JobsMarket

**Purpose:** Some features require manual verification because automated tests cannot fully verify external integrations (email delivery, SMS, payments, etc.)

**When to run:** Before each production release

---

## 1. Password Reset Flow (AUTH-R04)

**Why manual?** Automated tests cannot verify email delivery or click links in real emails.

**Prerequisites:**
- Access to test email inbox
- Test user account exists in Firebase
- Dev/staging environment running

### Main Flow Test

| Step | Action | Expected Result | Pass? | Notes |
|------|--------|-----------------|-------|-------|
| 1 | Navigate to `/jobsmarket/auth/reset` | Password reset form displays | ☐ | |
| 2 | Click "กลับไปหน้าเข้าสู่ระบบ" | Navigates to login page | ☐ | |
| 3 | Return to reset page | Form displays again | ☐ | |
| 4 | Enter test email: `________________` | Email accepted | ☐ | Record email used |
| 5 | Click "ส่งลิงก์รีเซ็ต" button | Shows "กำลังส่ง..." loading state | ☐ | Button should be disabled |
| 6 | Wait for response (5-10 sec) | Success message: "ส่งลิงก์แล้ว" | ☐ | Email should be displayed |
| 7 | Check success message details | Shows: "กรุณาตรวจสอบอีเมลของคุณ" | ☐ | |
| 8 | | Shows: "(อาจอยู่ในโฟลเดอร์สแปม)" | ☐ | |
| 9 | | Shows: "ไม่ได้รับอีเมล?" link | ☐ | |
| 10 | | Shows: "ส่งอีกครั้ง" button | ☐ | |
| 11 | Check email inbox (wait up to 5 min) | Password reset email received | ☐ | Check spam folder |
| 12 | Verify email sender | From: noreply@chancedee.com (or Firebase) | ☐ | |
| 13 | Verify email subject | Subject in Thai: "รีเซ็ตรหัสผ่าน" or similar | ☐ | |
| 14 | Verify email content | Contains reset link button/URL | ☐ | |
| 15 | Click reset link in email | Opens Firebase password reset page | ☐ | Should redirect to Firebase |
| 16 | Enter new password: `____________` | Password accepted | ☐ | Min 6 characters |
| 17 | Confirm new password (same) | Confirmation accepted | ☐ | |
| 18 | Submit new password | Success message shown | ☐ | |
| 19 | Navigate to login page | Login form displays | ☐ | |
| 20 | Try login with NEW password | Login successful | ☐ | |
| 21 | Logout | | ☐ | |
| 22 | Try login with OLD password | Login fails with error | ☐ | Error: "รหัสผ่านไม่ถูกต้อง" |

### Edge Cases & Error Handling

| Test Case | Steps | Expected Result | Pass? | Notes |
|-----------|-------|-----------------|-------|-------|
| **Empty email** | 1. Leave email blank<br>2. Try to submit | Submit button is disabled | ☐ | |
| **Invalid email format** | 1. Enter "not-an-email"<br>2. Blur field | Error: "รูปแบบอีเมลไม่ถูกต้อง" | ☐ | |
| **Non-existent email** | 1. Enter fake@notreal.xyz<br>2. Submit | Success message (security: don't reveal) | ☐ | Should NOT show "user not found" |
| **Rapid resend** | 1. Submit email<br>2. Click "ส่งอีกครั้ง" immediately | Shows loading, then success | ☐ | May hit rate limit (acceptable) |
| **Rate limiting** | 1. Submit 6+ times rapidly | Eventually shows rate limit error | ☐ | After ~5 requests |
| **Expired link** | 1. Use reset link >24h old | Error: "Link expired" or similar | ☐ | Firebase default: 1 hour |
| **Used link** | 1. Click same reset link twice | Error: "Link already used" | ☐ | 2nd click fails |
| **Network error** | 1. Disconnect network<br>2. Submit | Error message: "เชื่อมต่อไม่สำเร็จ" | ☐ | |

### Pre-fill from Login Page

| Step | Action | Expected Result | Pass? |
|------|--------|-----------------|-------|
| 1 | Go to login page `/jobsmarket/auth/login` | Login form displays | ☐ |
| 2 | Enter email "test@example.com" | Email filled | ☐ |
| 3 | Click "ลืมรหัสผ่าน?" link | Redirects to reset page | ☐ |
| 4 | Check email field | Email pre-filled: "test@example.com" | ☐ |

### Accessibility & UI

| Aspect | Check | Pass? | Notes |
|--------|-------|-------|-------|
| **Labels** | Email input has Thai label "อีเมล" | ☐ | |
| **ARIA** | Invalid email shows aria-invalid="true" | ☐ | Use DevTools |
| **Focus** | Tab order: Email → Submit → Back button | ☐ | |
| **Mobile** | Form usable on mobile (test on phone) | ☐ | |
| **Icons** | Lock icon visible in header | ☐ | |
| **Colors** | Error text is red, success is green | ☐ | |

---

## 2. Email Verification (If Applicable)

**Status:** Not yet implemented for JobsMarket

| Step | Action | Expected Result | Pass? |
|------|--------|-----------------|-------|
| 1 | Register new account | Registration successful | ☐ |
| 2 | Check for verification email | Email received within 5 min | ☐ |
| 3 | Click verification link | Account verified message | ☐ |
| 4 | Try to login | Login successful | ☐ |

---

## 3. OTP/SMS Verification (If Applicable)

**Status:** Implemented for candidate phone verification

| Step | Action | Expected Result | Pass? |
|------|--------|-----------------|-------|
| 1 | Enter phone number (Thai mobile) | Accepts 0812345678 format | ☐ |
| 2 | Submit | "OTP sent" message shown | ☐ |
| 3 | Check SMS on phone | OTP code received | ☐ |
| 4 | Enter OTP in form | OTP accepted | ☐ |
| 5 | Submit OTP | Verification successful | ☐ |

---

## Test Execution Log

| Date | Tester | Environment | Password Reset | Email Verify | OTP/SMS | Notes |
|------|--------|-------------|----------------|--------------|---------|-------|
| YYYY-MM-DD | Name | Dev/Staging/Prod | ☐ Pass / ☐ Fail | N/A | N/A | |
| | | | | | | |
| | | | | | | |

---

## Troubleshooting Guide

### Password Reset Email Not Received

**Symptom:** Success message shown but no email arrives

**Checklist:**
1. ☐ Check spam/junk folder
2. ☐ Wait up to 10 minutes (email delivery can be slow)
3. ☐ Verify test email is valid and accessible
4. ☐ Check Firebase Console → Authentication → Users (verify user exists)
5. ☐ Check Firebase Console → Authentication → Templates (verify template exists)
6. ☐ Check Firebase Console → Authentication → Settings → Authorized domains
7. ☐ Check browser console for errors
8. ☐ Check network tab for failed requests

**Common Causes:**
- **Domain not whitelisted:** Add domain in Firebase Console → Settings → Authorized domains
- **Email provider blocking:** Some providers (e.g., corporate email) block Firebase emails
- **Firebase quota exceeded:** Check Firebase usage limits
- **Test user doesn't exist:** Create user first or use existing user

### Reset Link Not Working

**Symptom:** Click link but get error or link doesn't open

**Checklist:**
1. ☐ Verify link hasn't expired (default: 1 hour, configurable)
2. ☐ Verify link hasn't been used already
3. ☐ Check link is complete (not truncated by email client)
4. ☐ Try copying full URL and pasting in browser
5. ☐ Check Firebase Console for errors

**Common Causes:**
- **Link expired:** Default Firebase timeout is 1 hour
- **Link already used:** Each link is single-use
- **Malformed link:** Email client may have broken the URL

### Rate Limiting Errors

**Symptom:** "Too many requests" or "TOO_MANY_ATTEMPTS_TRY_LATER" error

**Cause:** Firebase enforces rate limiting:
- ~5 password reset requests per hour per email
- ~10 requests per hour per IP address

**Solution:**
1. Wait 1 hour before retrying
2. Use different email address for testing
3. Use different device/IP for testing
4. Check Firebase Console → Authentication → Settings for limits

### Network Errors

**Symptom:** "เชื่อมต่อไม่สำเร็จ" or generic error

**Checklist:**
1. ☐ Check internet connection
2. ☐ Check if Firebase services are operational (status.firebase.google.com)
3. ☐ Check browser console for CORS or network errors
4. ☐ Try in different browser
5. ☐ Check firewall/VPN isn't blocking Firebase

---

## Test Coverage Summary

| Feature | Unit Tests | Integration Tests | E2E Tests | Manual Tests | Status |
|---------|------------|-------------------|-----------|--------------|--------|
| **Password Reset UI** | ✅ Validation | ⏭️ Skipped (sends real email) | ✅ Mocked requests | ✅ This checklist | Complete |
| **Email Delivery** | N/A | ⏭️ Skipped (can't verify) | N/A | ✅ This checklist | Manual only |
| **Reset Link Flow** | N/A | ⏭️ Skipped | N/A | ✅ This checklist | Manual only |

**Legend:**
- ✅ Tested and passing
- ⏭️ Skipped (requires manual verification)
- ❌ Failing
- N/A Not applicable

---

## Notes for Testers

### Best Practices

1. **Use dedicated test email:** Create a test email account you can access (e.g., Gmail with +tags: `yourtest+reset@gmail.com`)

2. **Document test data:** Record which email addresses you used and when

3. **Test on multiple browsers:** Chrome, Firefox, Safari, Edge

4. **Test on mobile:** Password reset is commonly used on mobile devices

5. **Test with real network conditions:** Throttle network in DevTools to simulate slow connections

### Known Limitations

- **Email delivery timing:** Can take 1-10 minutes depending on email provider
- **Rate limiting:** Avoid testing too rapidly (max 5 requests per hour per email)
- **Spam filters:** Some corporate email providers may block Firebase emails
- **Link expiration:** Firebase default is 1 hour, not configurable via client SDK

### Security Notes

- **Don't reveal user existence:** The UI should show success message even for non-existent emails (to prevent email enumeration attacks)
- **Rate limiting is intentional:** Protects against abuse
- **Single-use links:** Each reset link can only be used once (security feature)
- **Link expiration:** Links expire after 1 hour (security feature)

---

**Last Updated:** 2025-12-17
**Document Owner:** JobsMarket Development Team
**Related Tests:**
- Unit: `tests/unit/jobsmarket/auth/reset/password-reset-service.test.ts`
- E2E: `tests/e2e/jobsmarket/auth/reset.spec.ts`
- Integration (skipped): `tests/integration/jobsmarket/auth/reset/firebase-reset.test.ts`
