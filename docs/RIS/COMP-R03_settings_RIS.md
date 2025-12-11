# RIS: /companies/[id]/dashboard/settings

**Route ID:** COMP-R03  
**Version:** 1.0  
**Status:** Draft  
**Created:** 2025-12-09  
**Last Updated:** 2025-12-09

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-09 | Initial RIS creation with three tabs (Profile, Config, Analytics) |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route Path | `/companies/[id]/dashboard/settings` |
| Route ID | COMP-R03 |
| Shell | Company Shell |
| Purpose | Company profile editing, configuration, and analytics |
| Complexity | High |
| Phase | 1b (Company Setup) |
| UI Spec | `05-company-routes.md` Section 6.9 |

### Tab Configuration

| Tab ID | Thai Label | English | URL Param | Default | Access |
|--------|------------|---------|-----------|---------|--------|
| `profile` | โปรไฟล์บริษัท | Company Profile | `?tab=profile` | ✓ | Admin, HR Manager |
| `config` | การตั้งค่า | Configuration | `?tab=config` | | Admin, HR Manager |
| `analytics` | สถิติ | Analytics | `?tab=analytics` | | All company members |

### Access Control Matrix

| Role | Profile Tab | Config Tab | Analytics Tab |
|------|-------------|------------|---------------|
| Company Admin | Read/Write | Read/Write | Read |
| HR Manager | Read/Write | Read/Write | Read |
| Recruiter | Read | Read | Read |
| Pending Member | — | — | — |

---

## 2. Domain Classification

### Primary Domain: Company

- **Owns:** Company profile management, configuration settings
- **Mutations:**
  - Update company profile (COMP-011)
  - Upload company logo
  - Upload company cover photo
  - Manage company gallery
  - Update default job settings (new)
  - Update notification preferences (new)

### Secondary Domains

| Domain | Role | Access |
|--------|------|--------|
| Jobs | Default settings for new postings | Write: default location, job type, auto-close days |
| Notifications | Company notification preferences | Write: email/push toggles for company events |
| Auth | Context and session | Read: user role verification |

### Global Domains

| Domain | Requirement |
|--------|-------------|
| Auth | User must be authenticated with company role |
| Chat | Available via Company Shell FAB |
| Notifications | Available via Company Shell bell icon |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Coverage | Tab | Notes |
|------------|--------------|----------|-----|-------|
| COMP-011 | Edit Company Profile | Full | Profile | Logo, cover, info, description, links, locations, gallery |

### New Features (This Route Introduces)

| Feature | Description | Tab | Priority |
|---------|-------------|-----|----------|
| Default Job Settings | Pre-populate job posting fields | Config | P1 |
| Company Notifications | Email/push toggles for company events | Config | P1 |
| Hiring Analytics | Funnel metrics, job performance | Analytics | P2 |

### Related Features (Other Routes)

| Feature | Route | Relationship |
|---------|-------|--------------|
| Account Settings (AUTH-R06) | `/auth/settings` | Settings link from Company Shell |
| Team Management (COMP-R02) | `/companies/[id]/dashboard/team` | Admin can access from sidebar |
| Job Creation | `/companies/[id]/dashboard/jobs/new` | Uses default settings from Config tab |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Collection | Fields | Condition | SWR Key |
|------|------------|--------|-----------|---------|
| Company Profile | `company_information` | All profile fields | `uid === companyId` | `company-${companyId}` |
| Company Addresses | `addresses` | All | `companyId` filter | `company-addresses-${companyId}` |
| Company Gallery | `company_information` | `gallery` array | Embedded | Via company SWR |
| Company Config | `company_information` | `config` object | Embedded | Via company SWR |
| Analytics Data | Aggregation | Computed metrics | Read-only | `company-analytics-${companyId}` |
| User Role | `user_accounts` | `roles`, `company_id` | Authenticated | `user-data-${uid}` |

### 4.2 Write Operations

| Action | Collection | Fields | Server Action | Trigger |
|--------|------------|--------|---------------|---------|
| Update Profile | `company_information` | `company_name`, `company_name_en`, `industry`, `company_size`, `founded_year`, `description` | `updateCompanyProfile()` | Profile tab save |
| Upload Logo | Firebase Storage + `company_information` | `profile_photo` | `uploadCompanyLogo()` | Logo upload |
| Upload Cover | Firebase Storage + `company_information` | `cover_photo` | `uploadCompanyCover()` | Cover upload |
| Update Links | `company_information` | `website`, `facebook`, `linkedin` | `updateCompanyProfile()` | Profile tab save |
| Add Location | `addresses` | New document | `addCompanyAddress()` | Location add |
| Remove Location | `addresses` | Delete document | `removeCompanyAddress()` | Location remove |
| Upload Gallery | Firebase Storage + `company_information` | `gallery` array | `addGalleryPhoto()` | Gallery upload |
| Remove Gallery Photo | `company_information` | `gallery` array | `removeGalleryPhoto()` | Gallery remove |
| Update Job Defaults | `company_information` | `config.job_defaults` | `updateCompanyConfig()` | Config tab save |
| Update Notifications | `company_information` | `config.notifications` | `updateCompanyNotifications()` | Config tab toggle |

### 4.3 Company Profile Schema (Profile Tab)

```typescript
interface CompanyProfile {
  // Basic Info
  uid: string;                    // Company ID
  company_name: string;           // Thai name (required)
  company_name_en?: string;       // English name
  industry?: string;              // Industry dropdown
  company_size?: 'S' | 'M' | 'L'; // Size enum
  founded_year?: number;          // Year number
  
  // Media
  profile_photo?: string;         // Logo URL (max 5MB, JPG/PNG)
  cover_photo?: string;           // Cover URL (1200×300 recommended)
  gallery?: string[];             // Photo URLs (max 10)
  
  // Description
  description?: string;           // Rich text HTML
  
  // Links
  website?: string;               // URL validated
  facebook?: string;              // URL validated
  linkedin?: string;              // URL validated
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  is_active: boolean;
}

interface CompanyAddress {
  uid: string;
  company_id: string;
  address_line1: string;
  address_line2?: string;
  province: string;
  district: string;
  sub_district?: string;
  postal_code: string;
  is_primary: boolean;
}
```

### 4.4 Company Config Schema (Config Tab)

```typescript
interface CompanyConfig {
  job_defaults: {
    default_location?: string;      // Province
    default_job_type?: string;      // Full-time, Part-time, etc.
    auto_close_days?: number;       // 0 = never auto-close
  };
  notifications: {
    notify_new_application: boolean;
    daily_summary_enabled: boolean;
    daily_summary_time?: string;    // HH:mm format
    interview_reminder_hours: number;
  };
}

// Default values for new companies
const DEFAULT_COMPANY_CONFIG: CompanyConfig = {
  job_defaults: {
    default_location: undefined,
    default_job_type: 'full-time',
    auto_close_days: 30,
  },
  notifications: {
    notify_new_application: true,
    daily_summary_enabled: false,
    daily_summary_time: '09:00',
    interview_reminder_hours: 24,
  },
};
```

### 4.5 Analytics Data Structure (Analytics Tab)

```typescript
interface CompanyAnalytics {
  // Hiring Funnel
  funnel: {
    jobs_posted: number;
    total_views: number;
    total_applications: number;
    total_interviews: number;
    total_hires: number;
  };
  
  // Per-Job Performance
  job_performance: Array<{
    job_id: string;
    job_title: string;
    views: number;
    applications: number;
    conversion_rate: number;    // applications / views
    avg_time_to_hire?: number;  // days
  }>;
  
  // Source Attribution
  source_attribution: Array<{
    source: string;             // 'direct' | 'search' | 'referral' | 'social'
    count: number;
    percentage: number;
  }>;
  
  // Time range
  date_range: {
    start: string;              // ISO date
    end: string;                // ISO date
  };
}
```

---

## 5. State Contract

### 5.1 Atoms

| Atom | Type | R/W | Purpose |
|------|------|-----|---------|
| `userAtom` | `userDataProps \| null` | R | Get user data, roles, company_id |
| `activeRoleAtom` | `'company' \| ...` | R | Verify company context |
| `companyAtom` | `CompanyProfile \| null` | R/W | Current company data |
| `editCompanyAtom` | `CompanyProfile \| null` | R/W | Draft state during editing |

### 5.2 Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useFirebaseAuth` | `{ user, loading }` | Auth state |
| `useCompanyProfile` | `{ company, isLoading, mutate }` | Company data with SWR |
| `useCompanyProfileForm` | `{ form, onSubmit, isSubmitting }` | React Hook Form integration |
| `useCompanyConfig` | `{ config, updateConfig }` | Config tab state |
| `useCompanyAnalytics` | `{ analytics, dateRange, setDateRange }` | Analytics data |
| `useImageUpload` | `{ upload, progress, error }` | File upload state |

### 5.3 SWR Keys

| Key | Data | Invalidate On |
|-----|------|---------------|
| `company-${companyId}` | Company profile | Profile save, logo/cover upload |
| `company-addresses-${companyId}` | Company addresses | Add/remove location |
| `company-analytics-${companyId}` | Analytics data | Date range change (refetch) |

### 5.4 Local Component State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `activeTab` | `TabId` | From URL or `'profile'` | Current tab selection |
| `isDirty` | `boolean` | `false` | Form has unsaved changes |
| `uploadProgress` | `Record<string, number>` | `{}` | Per-file upload progress |
| `showUnsavedDialog` | `boolean` | `false` | Unsaved changes warning |
| `analyticsDateRange` | `DateRange` | Last 30 days | Analytics filter |

---

## 6. UI State Machine

### 6.1 Page State Automaton

```
┌──────────────────────────────────────────────────────────────────┐
│                        PAGE STATES                                │
└──────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────┐
                    │    INITIALIZING     │
                    │   (check auth)      │
                    └─────────┬───────────┘
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
           ▼                  ▼                  ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   UNAUTHORIZED  │  │  ACCESS_DENIED  │  │     LOADING     │
│ → /auth/login   │  │  (wrong role)   │  │  (fetch data)   │
└─────────────────┘  └─────────────────┘  └────────┬────────┘
                                                   │
                              ┌────────────────────┼────────────────────┐
                              │                    │                    │
                              ▼                    ▼                    ▼
                     ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
                     │      ERROR      │  │      IDLE       │  │    TAB_ACTIVE   │
                     │  (fetch failed) │  │  (data ready)   │  │  (tab content)  │
                     └────────┬────────┘  └────────┬────────┘  └────────┬────────┘
                              │                    │                    │
                              │                    └────────┬───────────┘
                              │                             │
                              ▼                             ▼
                     ┌─────────────────┐           ┌─────────────────┐
                     │      RETRY      │           │      DIRTY      │
                     │  (retry fetch)  │           │ (unsaved changes)│
                     └─────────────────┘           └─────────────────┘
```

#### 6.1.1 Page State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `INITIALIZING` | `NO_SESSION` | `UNAUTHORIZED` | sessionState !== 'valid' | router.replace('/auth/login') |
| `INITIALIZING` | `WRONG_ROLE` | `ACCESS_DENIED` | !roles.includes('company') | Show access denied message |
| `INITIALIZING` | `NO_PERMISSION` | `ACCESS_DENIED` | !canAccessSettings(role) | Show permission error |
| `INITIALIZING` | `AUTH_OK` | `LOADING` | Valid session + permission | Start data fetch |
| `LOADING` | `DATA_LOADED` | `IDLE` | - | Initialize form with data |
| `LOADING` | `FETCH_ERROR` | `ERROR` | - | Set error message |
| `ERROR` | `RETRY` | `LOADING` | - | Clear error, refetch |
| `IDLE` | `TAB_CHANGE` | `TAB_ACTIVE` | !isDirty | setActiveTab(), update URL |
| `IDLE` | `TAB_CHANGE` | `IDLE` | isDirty | Show unsaved dialog |
| `IDLE` | `FORM_CHANGE` | `DIRTY` | - | Enable save button |
| `TAB_ACTIVE` | `FORM_CHANGE` | `DIRTY` | - | Enable save button |
| `TAB_ACTIVE` | `TAB_CHANGE` | `TAB_ACTIVE` | !isDirty | setActiveTab() |
| `DIRTY` | `SAVE_CLICK` | `VALIDATING` | - | Validate form |
| `DIRTY` | `DISCARD` | `IDLE` | User confirms | Reset form to saved state |
| `DIRTY` | `TAB_CHANGE` | `DIRTY` | - | Show unsaved dialog |
| `VALIDATING` | `VALID` | `SUBMITTING` | Form passes validation | - |
| `VALIDATING` | `INVALID` | `DIRTY` | Form fails validation | Show validation errors |
| `SUBMITTING` | `SUCCESS` | `IDLE` | - | Toast success, invalidate SWR |
| `SUBMITTING` | `ERROR` | `DIRTY` | - | Toast error, keep form state |

### 6.2 Tab State Machine

```
[profile] ◄──?tab=profile──►
    │                      │
    ├──?tab=config────────► [config]
    │                      │
    └──?tab=analytics─────► [analytics] (read-only)
```

#### 6.2.1 Tab Navigation Transition Table

| Current Tab | Event | Next Tab | Guard | Side Effects |
|-------------|-------|----------|-------|--------------|
| `profile` | `NAV_CONFIG` | `config` | !isDirty | Update URL ?tab=config |
| `profile` | `NAV_CONFIG` | `profile` | isDirty | Show unsaved dialog |
| `profile` | `NAV_ANALYTICS` | `analytics` | !isDirty | Update URL ?tab=analytics |
| `config` | `NAV_PROFILE` | `profile` | !isDirty | Update URL ?tab=profile |
| `config` | `NAV_ANALYTICS` | `analytics` | !isDirty | Update URL ?tab=analytics |
| `analytics` | `NAV_PROFILE` | `profile` | - | Update URL (no dirty check - read-only) |
| `analytics` | `NAV_CONFIG` | `config` | - | Update URL |

### 6.3 Entity State Automaton (Company Profile)

| Entity | Current State | Event | Next State | Actor | Side Effects |
|--------|---------------|-------|------------|-------|--------------|
| Company | `approved` | `UPDATE_PROFILE` | `approved` | Admin/HR | Update company_information |
| Company | `approved` | `SUSPEND` | `suspended` | Platform Admin | Unpublish jobs, notify |
| Company | `suspended` | `REACTIVATE` | `approved` | Platform Admin | Set is_active=true |
| CompanyLogo | `none` | `UPLOAD` | `uploading` | Admin/HR | Start file upload |
| CompanyLogo | `uploaded` | `UPLOAD` | `uploading` | Admin/HR | Replace existing |
| CompanyLogo | `uploading` | `SUCCESS` | `uploaded` | System | Update profile_photo URL |
| CompanyLogo | `uploading` | `FAIL` | `error` | System | Show error toast |
| CompanyLogo | `error` | `RETRY` | `uploading` | Admin/HR | Retry upload |
| CompanyCover | `none` | `UPLOAD` | `uploading` | Admin/HR | Start file upload |
| CompanyCover | `uploading` | `SUCCESS` | `uploaded` | System | Update cover_photo URL |
| CompanyCover | `uploading` | `FAIL` | `error` | System | Show error toast |
| GalleryPhoto | `none` | `ADD` | `uploading` | Admin/HR | count < 10 |
| GalleryPhoto | `uploading` | `SUCCESS` | `uploaded` | System | Append to gallery array |
| GalleryPhoto | `uploaded` | `REMOVE` | `removing` | Admin/HR | Confirm delete |
| GalleryPhoto | `removing` | `SUCCESS` | `removed` | System | Remove from gallery array |
| Location | `none` | `ADD` | `adding` | Admin/HR | Open location form |
| Location | `adding` | `SAVE` | `saved` | Admin/HR | Create address document |
| Location | `saved` | `EDIT` | `editing` | Admin/HR | Open edit form |
| Location | `editing` | `SAVE` | `saved` | Admin/HR | Update address document |
| Location | `saved` | `REMOVE` | `removing` | Admin/HR | Confirm delete |
| Location | `removing` | `CONFIRM` | `removed` | Admin/HR | Delete address document |

### 6.4 Component State Automaton

| Component | Current State | Event | Next State | Condition |
|-----------|---------------|-------|------------|-----------|
| `ProfileForm` | `idle` | `INPUT` | `dirty` | Any field change |
| `ProfileForm` | `dirty` | `SUBMIT` | `validating` | - |
| `ProfileForm` | `validating` | `VALID` | `submitting` | All fields valid |
| `ProfileForm` | `validating` | `INVALID` | `dirty` | Validation errors |
| `ProfileForm` | `submitting` | `SUCCESS` | `idle` | - |
| `ProfileForm` | `submitting` | `ERROR` | `dirty` | - |
| `ImageUploader` | `idle` | `FILE_SELECT` | `validating` | - |
| `ImageUploader` | `validating` | `VALID` | `uploading` | Size ≤ 5MB, type OK |
| `ImageUploader` | `validating` | `INVALID` | `error` | Size/type check fail |
| `ImageUploader` | `uploading` | `PROGRESS` | `uploading` | Update progress % |
| `ImageUploader` | `uploading` | `SUCCESS` | `idle` | Clear preview |
| `ImageUploader` | `uploading` | `CANCEL` | `idle` | Abort upload |
| `ImageUploader` | `uploading` | `FAIL` | `error` | - |
| `ImageUploader` | `error` | `RETRY` | `validating` | Same file |
| `ImageUploader` | `error` | `CLEAR` | `idle` | Clear selection |
| `LocationList` | `idle` | `ADD_CLICK` | `adding` | - |
| `LocationList` | `adding` | `SAVE` | `idle` | Valid address |
| `LocationList` | `adding` | `CANCEL` | `idle` | - |
| `LocationList` | `idle` | `EDIT_CLICK` | `editing` | Select location |
| `LocationList` | `editing` | `SAVE` | `idle` | Valid address |
| `LocationList` | `editing` | `CANCEL` | `idle` | - |
| `LocationList` | `idle` | `REMOVE_CLICK` | `confirming` | - |
| `LocationList` | `confirming` | `CONFIRM` | `removing` | - |
| `LocationList` | `confirming` | `CANCEL` | `idle` | - |
| `LocationList` | `removing` | `SUCCESS` | `idle` | - |
| `GalleryGrid` | `idle` | `UPLOAD` | `uploading` | count < 10 |
| `GalleryGrid` | `idle` | `UPLOAD` | `idle` | count >= 10, show limit error |
| `GalleryGrid` | `uploading` | `SUCCESS` | `idle` | Append photo |
| `GalleryGrid` | `uploading` | `FAIL` | `error` | - |
| `GalleryGrid` | `idle` | `REMOVE` | `confirming` | - |
| `GalleryGrid` | `confirming` | `CONFIRM` | `idle` | Remove photo |
| `RichEditor` | `idle` | `CHANGE` | `dirty` | Content modified |
| `RichEditor` | `dirty` | `BLUR` | `dirty` | - |
| `RichEditor` | `dirty` | `SAVE` | `saving` | Parent form submit |
| `ConfigForm` | `idle` | `TOGGLE` | `saving` | Notification toggle |
| `ConfigForm` | `saving` | `SUCCESS` | `idle` | Update complete |
| `ConfigForm` | `saving` | `ERROR` | `idle` | Show error, rollback |
| `ConfigForm` | `idle` | `INPUT` | `dirty` | Job default change |
| `AnalyticsView` | `loading` | `DATA_LOADED` | `ready` | - |
| `AnalyticsView` | `ready` | `DATE_CHANGE` | `loading` | Refetch data |
| `AnalyticsView` | `loading` | `ERROR` | `error` | - |
| `AnalyticsView` | `error` | `RETRY` | `loading` | - |
| `UnsavedDialog` | `closed` | `OPEN` | `open` | isDirty && tab change |
| `UnsavedDialog` | `open` | `SAVE` | `closed` | Trigger save, then navigate |
| `UnsavedDialog` | `open` | `DISCARD` | `closed` | Reset form, navigate |
| `UnsavedDialog` | `open` | `CANCEL` | `closed` | Stay on current tab |

---

## 7. Component-Action Wiring

### 7.1 Profile Tab Components

| Component | User Action | State Change | Server Action | UI Feedback |
|-----------|-------------|--------------|---------------|-------------|
| LogoUploader | Click upload | `idle` → `validating` | - | Show file picker |
| LogoUploader | File selected | `validating` → `uploading` | `uploadCompanyLogo()` | Show progress bar |
| LogoUploader | Upload complete | `uploading` → `idle` | - | Update preview, toast |
| CoverUploader | Click upload | `idle` → `validating` | - | Show file picker |
| CoverUploader | File selected | `validating` → `uploading` | `uploadCompanyCover()` | Show progress bar |
| CompanyNameTH | Input change | `idle` → `dirty` | - | Enable save button |
| CompanyNameEN | Input change | `idle` → `dirty` | - | Enable save button |
| IndustrySelect | Selection change | `idle` → `dirty` | - | Enable save button |
| CompanySizeSelect | Selection change | `idle` → `dirty` | - | Enable save button |
| FoundedYearInput | Input change | `idle` → `dirty` | - | Enable save button |
| DescriptionEditor | Content change | `idle` → `dirty` | - | Enable save button |
| WebsiteInput | Input change | `idle` → `dirty` | - | Validate URL format |
| FacebookInput | Input change | `idle` → `dirty` | - | Validate URL format |
| LinkedInInput | Input change | `idle` → `dirty` | - | Validate URL format |
| LocationList | Click add | `idle` → `adding` | - | Show add form |
| LocationList | Save location | `adding` → `idle` | `addCompanyAddress()` | Add to list, toast |
| LocationList | Remove location | `idle` → `confirming` | - | Show confirm dialog |
| LocationList | Confirm remove | `confirming` → `idle` | `removeCompanyAddress()` | Remove from list |
| GalleryGrid | Click add | `idle` → `uploading` | `addGalleryPhoto()` | Show upload progress |
| GalleryGrid | Click remove | `idle` → `confirming` | - | Show confirm dialog |
| GalleryGrid | Confirm remove | `confirming` → `idle` | `removeGalleryPhoto()` | Remove from grid |
| SaveButton | Click | `dirty` → `submitting` | `updateCompanyProfile()` | Disable button, show spinner |
| SaveButton | Success | `submitting` → `idle` | - | Toast success, re-enable |

### 7.2 Config Tab Components

| Component | User Action | State Change | Server Action | UI Feedback |
|-----------|-------------|--------------|---------------|-------------|
| DefaultLocationSelect | Selection change | `idle` → `dirty` | - | Enable save button |
| DefaultJobTypeSelect | Selection change | `idle` → `dirty` | - | Enable save button |
| AutoCloseDaysInput | Input change | `idle` → `dirty` | - | Enable save button |
| NewApplicationToggle | Toggle | `idle` → `saving` | `updateCompanyNotifications()` | Optimistic update |
| DailySummaryToggle | Toggle | `idle` → `saving` | `updateCompanyNotifications()` | Show time picker if on |
| DailySummaryTimePicker | Time change | `idle` → `saving` | `updateCompanyNotifications()` | Immediate save |
| InterviewReminderSelect | Selection change | `idle` → `saving` | `updateCompanyNotifications()` | Immediate save |
| ConfigSaveButton | Click | `dirty` → `submitting` | `updateCompanyConfig()` | Disable, show spinner |

### 7.3 Analytics Tab Components

| Component | User Action | State Change | Server Action | UI Feedback |
|-----------|-------------|--------------|---------------|-------------|
| DateRangeSelector | Range change | `ready` → `loading` | Fetch with params | Show loading state |
| HiringFunnelChart | Hover segment | - | - | Show tooltip |
| JobPerformanceTable | Click row | - | - | Navigate to job detail |
| SourceAttributionChart | Hover segment | - | - | Show percentage |
| ExportButton | Click | - | `exportAnalytics()` | Download CSV |

---

## 8. Error Handling

### 8.1 Error States by Tab

#### Profile Tab Errors

| Error | Display | Recovery |
|-------|---------|----------|
| Logo upload failed | Toast: "เกิดข้อผิดพลาด ลองใหม่" | Retry button in uploader |
| Logo wrong format | Toast: "รองรับ JPG, PNG" | Prevent upload, clear selection |
| Logo too large | Toast: "ไฟล์ใหญ่เกิน 5MB" | Prevent upload, clear selection |
| Cover upload failed | Toast: "อัพโหลดรูปปกไม่สำเร็จ" | Retry button |
| Cover wrong size | Warning: "แนะนำ 1200×300 พิกเซล" | Allow but warn |
| URL invalid | Inline error: "รูปแบบ URL ไม่ถูกต้อง" | Prevent save |
| Gallery limit | Toast: "อัพโหลดได้สูงสุด 10 รูป" | Disable upload button |
| Gallery upload failed | Toast + retry option | Per-photo retry |
| Location save failed | Toast: "บันทึกที่อยู่ไม่สำเร็จ" | Keep form open |
| Profile save failed | Toast: "บันทึกไม่สำเร็จ กรุณาลองใหม่" | Keep form state |
| Network error | Toast: "ไม่สามารถเชื่อมต่อได้" | Retry button |

#### Config Tab Errors

| Error | Display | Recovery |
|-------|---------|----------|
| Toggle save failed | Toast + rollback | Revert toggle state |
| Config save failed | Toast: "บันทึกไม่สำเร็จ" | Keep form dirty |

#### Analytics Tab Errors

| Error | Display | Recovery |
|-------|---------|----------|
| Data load failed | "ไม่สามารถโหลดข้อมูลได้" | Retry button |
| Analytics unavailable | Hide tab or show placeholder | Show "ข้อมูลยังไม่พร้อม" |
| Export failed | Toast: "ส่งออกไม่สำเร็จ" | Retry option |

### 8.2 Validation Errors (Profile Tab)

| Field | Validation | Error Message |
|-------|------------|---------------|
| `company_name` | Required | "กรุณาระบุชื่อบริษัท" |
| `company_name` | Max 200 chars | "ชื่อบริษัทยาวเกินไป" |
| `website` | URL format | "รูปแบบ URL ไม่ถูกต้อง" |
| `facebook` | URL format | "รูปแบบ URL ไม่ถูกต้อง" |
| `linkedin` | URL format | "รูปแบบ URL ไม่ถูกต้อง" |
| `founded_year` | 1800-current | "ปีไม่ถูกต้อง" |
| `profile_photo` | Size ≤ 5MB | "ไฟล์ใหญ่เกิน 5MB" |
| `profile_photo` | JPG/PNG | "รองรับ JPG, PNG" |
| `cover_photo` | Size ≤ 10MB | "ไฟล์ใหญ่เกิน 10MB" |
| `gallery` | Max 10 photos | "อัพโหลดได้สูงสุด 10 รูป" |
| `description` | Max 5000 chars | "คำอธิบายยาวเกินไป" |

### 8.3 Unsaved Changes Warning

| Trigger | Display | Actions |
|---------|---------|---------|
| Tab switch with dirty form | Dialog: "ต้องการบันทึกก่อนออก?" | บันทึก / ไม่บันทึก / ยกเลิก |
| Browser back with dirty form | Dialog | Same actions |
| Close tab/window with dirty form | Browser beforeunload | Browser default |

---

## 9. Implementation Checklist

### 9.1 Page Setup

- [ ] Create page component at `/companies/[id]/dashboard/settings/page.tsx`
- [ ] Add tab navigation with URL sync (`?tab=profile|config|analytics`)
- [ ] Implement permission check (Admin/HR for edit, all for analytics)
- [ ] Wire Company Shell with sidebar active state

### 9.2 Profile Tab

- [ ] LogoUploader component with drag-drop and preview
- [ ] CoverUploader component with aspect ratio guidance
- [ ] Company info form with Zod validation
- [ ] RichEditor component for description (TipTap recommended)
- [ ] LocationList with CRUD operations
- [ ] GalleryGrid with upload and reorder
- [ ] Form dirty state tracking
- [ ] Unsaved changes warning dialog

### 9.3 Config Tab

- [ ] DefaultJobSettings form section
- [ ] NotificationSettings with toggles
- [ ] Immediate save on toggle change
- [ ] Time picker for daily summary
- [ ] Hours selector for interview reminder

### 9.4 Analytics Tab

- [ ] HiringFunnelChart component (funnel visualization)
- [ ] JobPerformanceTable with sorting
- [ ] SourceAttributionChart (pie/donut)
- [ ] DateRangeSelector component
- [ ] Export to CSV function

### 9.5 State Management

- [ ] Wire `companyAtom` for company data
- [ ] Wire `editCompanyAtom` for draft state
- [ ] Wire `activeRoleAtom` for permission check
- [ ] Create `useCompanyConfig` hook
- [ ] Create `useCompanyAnalytics` hook with date range
- [ ] Create `useImageUpload` hook with progress tracking

### 9.6 Server Actions

- [ ] `updateCompanyProfile()` - Profile tab save
- [ ] `uploadCompanyLogo()` - Logo upload with Storage
- [ ] `uploadCompanyCover()` - Cover upload with Storage
- [ ] `addCompanyAddress()` - Add location
- [ ] `updateCompanyAddress()` - Edit location
- [ ] `removeCompanyAddress()` - Delete location
- [ ] `addGalleryPhoto()` - Gallery upload
- [ ] `removeGalleryPhoto()` - Gallery remove
- [ ] `updateCompanyConfig()` - Config tab save
- [ ] `updateCompanyNotifications()` - Notification toggles

### 9.7 Data Schema

- [ ] Add `config` field to `company_information` schema
- [ ] Create migration for existing companies (set defaults)
- [ ] Ensure `addresses` collection has company index

### 9.8 Integration

- [ ] Link from Company Shell sidebar
- [ ] Use default job settings in job creation flow
- [ ] Wire notification preferences to notification system

### 9.9 Testing

- [ ] Test: All 3 tabs render correctly
- [ ] Test: Permission-based tab access
- [ ] Test: Logo upload (valid/invalid file types)
- [ ] Test: Cover upload with size validation
- [ ] Test: Gallery max limit (10 photos)
- [ ] Test: Location CRUD operations
- [ ] Test: Rich editor content save
- [ ] Test: URL validation for links
- [ ] Test: Unsaved changes warning on tab switch
- [ ] Test: Config toggles with immediate save
- [ ] Test: Analytics date range filter
- [ ] Test: Tab persistence via URL
- [ ] Test: Back navigation

---

## 10. Decisions Log

| Decision | Chosen | Rationale | Date |
|----------|--------|-----------|------|
| Tab persistence | URL query param `?tab=` | Enables deep-linking, better back-button | 2025-12-09 |
| Profile tab default | `?tab=profile` | Most common use case | 2025-12-09 |
| Config notification saves | Immediate on toggle | Follows AUTH-R06 pattern, better UX | 2025-12-09 |
| Config job defaults saves | Form save button | Multiple fields, batch save | 2025-12-09 |
| Rich editor | TipTap | Active development, good Thai support | 2025-12-09 |
| Gallery limit | 10 photos | Balance between flexibility and storage | 2025-12-09 |
| Analytics data | Cached aggregations | Performance, not real-time critical | 2025-12-09 |
| Dirty state handling | Warn before tab switch | Prevent data loss | 2025-12-09 |
| Location storage | Separate `addresses` collection | Reusable, queryable | 2025-12-09 |
| Image upload | Firebase Storage | Existing infrastructure | 2025-12-09 |

---

## 11. System Constraints Reference

### Current Constraints

| Constraint | Detail |
|------------|--------|
| Single-company model | Users belong to ONE company |
| Company status | Must be `approved` to access settings |
| Role hierarchy | Admin > HR Manager > Recruiter |
| Gallery limit | Max 10 photos per company |
| Logo size | Max 5MB, JPG/PNG only |
| Cover size | Max 10MB, 1200×300 recommended |

### Permission Model

| Action | Admin | HR Manager | Recruiter |
|--------|-------|------------|-----------|
| Edit profile | ✓ | ✓ | ✗ |
| Edit config | ✓ | ✓ | ✗ |
| View analytics | ✓ | ✓ | ✓ |

---

## 12. Related Routes

| Route | Relationship |
|-------|--------------|
| `/companies/[id]/dashboard` | Parent dashboard, links to settings |
| `/companies/[id]/dashboard/team` | Team management, accessed from sidebar |
| `/companies/[id]/dashboard/jobs/new` | Uses default job settings from Config tab |
| `/auth/settings` | Account-level settings (linked from shell) |

---

## 13. Open Questions

| Question | Status | Notes |
|----------|--------|-------|
| Rich editor library | ⟳ Decision made: TipTap | Good Thai support |
| Analytics refresh interval | ⟳ Pending | Daily cache vs real-time |
| Gallery reordering | ⟳ Pending | Drag-drop or move buttons |

---

## Appendix A: TypeScript Types

```typescript
// Tab configuration
type TabId = 'profile' | 'config' | 'analytics';

interface TabConfig {
  id: TabId;
  labelTh: string;
  labelEn: string;
  icon: LucideIcon;
  permission: ('admin' | 'hr_manager' | 'recruiter')[];
}

const TAB_CONFIG: TabConfig[] = [
  { 
    id: 'profile', 
    labelTh: 'โปรไฟล์บริษัท', 
    labelEn: 'Profile', 
    icon: Building2,
    permission: ['admin', 'hr_manager']
  },
  { 
    id: 'config', 
    labelTh: 'การตั้งค่า', 
    labelEn: 'Configuration', 
    icon: Settings,
    permission: ['admin', 'hr_manager']
  },
  { 
    id: 'analytics', 
    labelTh: 'สถิติ', 
    labelEn: 'Analytics', 
    icon: BarChart3,
    permission: ['admin', 'hr_manager', 'recruiter']
  },
];

// Company profile form
interface CompanyProfileForm {
  company_name: string;
  company_name_en?: string;
  industry?: string;
  company_size?: 'S' | 'M' | 'L';
  founded_year?: number;
  description?: string;
  website?: string;
  facebook?: string;
  linkedin?: string;
}

// Location form
interface LocationForm {
  address_line1: string;
  address_line2?: string;
  province: string;
  district: string;
  sub_district?: string;
  postal_code: string;
  is_primary: boolean;
}

// Upload state
interface UploadState {
  status: 'idle' | 'validating' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  file?: File;
  preview?: string;
}

// Analytics filter
interface AnalyticsFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
}
```

---

## Appendix B: Component File Structure

```
src/
├── app/
│   └── companies/
│       └── [id]/
│           └── dashboard/
│               └── settings/
│                   └── page.tsx              # Main page component
├── components/
│   └── companies/
│       └── settings/
│           ├── SettingsTabs.tsx              # Tab navigation
│           ├── ProfileTab.tsx                # Profile tab content
│           ├── ConfigTab.tsx                 # Config tab content
│           ├── AnalyticsTab.tsx              # Analytics tab content
│           ├── LogoUploader.tsx              # Logo upload component
│           ├── CoverUploader.tsx             # Cover upload component
│           ├── GalleryGrid.tsx               # Gallery management
│           ├── LocationList.tsx              # Location CRUD
│           ├── LocationForm.tsx              # Location add/edit form
│           ├── CompanyInfoForm.tsx           # Basic info form
│           ├── CompanyLinksForm.tsx          # Links section
│           ├── DefaultJobSettings.tsx        # Config: job defaults
│           ├── NotificationSettings.tsx      # Config: notifications
│           ├── HiringFunnelChart.tsx         # Analytics: funnel
│           ├── JobPerformanceTable.tsx       # Analytics: table
│           ├── SourceAttributionChart.tsx    # Analytics: pie chart
│           └── UnsavedChangesDialog.tsx      # Warning dialog
├── domains/
│   └── companies/
│       ├── hooks/
│       │   ├── use-company-profile-form.ts   # Form hook
│       │   ├── use-company-config.ts         # Config state
│       │   ├── use-company-analytics.ts      # Analytics data
│       │   └── use-image-upload.ts           # Upload handling
│       └── services/
│           └── server/
│               └── actions/
│                   ├── company-profile.ts    # Profile actions
│                   ├── company-config.ts     # Config actions
│                   └── company-analytics.ts  # Analytics fetch
└── lib/
    └── validations/
        └── company-settings.ts               # Zod schemas
```

---

## Appendix C: Form Validation Schema

```typescript
import { z } from 'zod';

// Profile form schema
export const companyProfileSchema = z.object({
  company_name: z
    .string()
    .min(1, 'กรุณาระบุชื่อบริษัท')
    .max(200, 'ชื่อบริษัทยาวเกินไป'),
  company_name_en: z
    .string()
    .max(200, 'ชื่อบริษัทยาวเกินไป')
    .optional(),
  industry: z.string().optional(),
  company_size: z.enum(['S', 'M', 'L']).optional(),
  founded_year: z
    .number()
    .min(1800, 'ปีไม่ถูกต้อง')
    .max(new Date().getFullYear(), 'ปีไม่ถูกต้อง')
    .optional(),
  description: z
    .string()
    .max(5000, 'คำอธิบายยาวเกินไป')
    .optional(),
  website: z
    .string()
    .url('รูปแบบ URL ไม่ถูกต้อง')
    .optional()
    .or(z.literal('')),
  facebook: z
    .string()
    .url('รูปแบบ URL ไม่ถูกต้อง')
    .optional()
    .or(z.literal('')),
  linkedin: z
    .string()
    .url('รูปแบบ URL ไม่ถูกต้อง')
    .optional()
    .or(z.literal('')),
});

// Location form schema
export const locationSchema = z.object({
  address_line1: z.string().min(1, 'กรุณาระบุที่อยู่'),
  address_line2: z.string().optional(),
  province: z.string().min(1, 'กรุณาเลือกจังหวัด'),
  district: z.string().min(1, 'กรุณาเลือกเขต/อำเภอ'),
  sub_district: z.string().optional(),
  postal_code: z
    .string()
    .regex(/^\d{5}$/, 'รหัสไปรษณีย์ไม่ถูกต้อง'),
  is_primary: z.boolean().default(false),
});

// Config form schema
export const companyConfigSchema = z.object({
  job_defaults: z.object({
    default_location: z.string().optional(),
    default_job_type: z.string().optional(),
    auto_close_days: z.number().min(0).max(365).optional(),
  }),
  notifications: z.object({
    notify_new_application: z.boolean(),
    daily_summary_enabled: z.boolean(),
    daily_summary_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .optional(),
    interview_reminder_hours: z.number().min(1).max(72),
  }),
});

// File upload validation
export const logoUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'ไฟล์ใหญ่เกิน 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png'].includes(file.type),
      'รองรับ JPG, PNG'
    ),
});

export const coverUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'ไฟล์ใหญ่เกิน 10MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'รองรับ JPG, PNG, WebP'
    ),
});

export const galleryUploadSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .max(10, 'อัพโหลดได้สูงสุด 10 รูป')
    .refine(
      (files) => files.every((f) => f.size <= 5 * 1024 * 1024),
      'ไฟล์ใหญ่เกิน 5MB'
    ),
});

export type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;
export type LocationFormData = z.infer<typeof locationSchema>;
export type CompanyConfigFormData = z.infer<typeof companyConfigSchema>;
```

---

## Appendix D: Source References

| Section | Source |
|---------|--------|
| UI specification | `05-company-routes.md` Section 6.9 |
| Edit Company Profile (COMP-011) | `features_companies.md` lines 19, 439-441 |
| Company status enum | `data-entities__enums.md` lines 127-150 |
| Company size enum | `data-entities__enums.md` lines 154-168 |
| Company requests schema | `data-entities_company-requests.md` |
| Tabbed settings pattern | `AUTH-R06_settings_RIS.md` (quality reference) |
| useCompanyProfileForm hook | `state-inventory_hooks-domain.md` lines 262-266 |
| Company atoms | `state-inventory_atoms.md` lines 9, 219-223 |

---

*End of RIS: /companies/[id]/dashboard/settings (COMP-R03) v1.0*
