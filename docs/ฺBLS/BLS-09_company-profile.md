# BLS-09: Company Profile Stage

**Stage:** Company Profile  
**Version:** 1.0  
**Last Updated:** 2025-12-11  
**Actions Count:** 5

---

## Stage Overview

The Company Profile Stage handles company identity management including profile editing, media uploads, location management, and configuration settings.

### Stage Boundaries

| Aspect | Scope |
|--------|-------|
| **Enters from** | Company Dashboard, Settings navigation |
| **Flows to** | BLS-07 Job Management (uses config defaults), BLS-02 Discovery (public profile) |
| **Primary Actors** | Company Admin, Company HR Manager |
| **Data Sources** | `company_information`, `addresses` |

### Actions in This Stage

| Action ID | Action Name | Trigger | Primary Collection |
|-----------|-------------|---------|-------------------|
| BLS-09-01 | editCompanyProfile | Profile tab | `company_information` |
| BLS-09-02 | uploadCompanyMedia | Logo/cover/gallery | Firebase Storage |
| BLS-09-03 | manageCompanyLocations | Location CRUD | `addresses` |
| BLS-09-04 | updateCompanyConfig | Config tab | `company_information` |
| BLS-09-05 | viewCompanyAnalytics | Analytics tab | Aggregation |

### Settings Route Structure

**Route:** `/companies/[id]/dashboard/settings`

| Tab | URL Param | Actions | Access |
|-----|-----------|---------|--------|
| Profile | `?tab=profile` (default) | BLS-09-01, BLS-09-02, BLS-09-03 | Admin, HR Manager |
| Config | `?tab=config` | BLS-09-04 | Admin, HR Manager |
| Analytics | `?tab=analytics` | BLS-09-05 | All company members |

---

## BLS-09-01: editCompanyProfile

### Description
Edit company profile information including basic info, description, and social links.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R03_settings_RIS.md | Section 4, 7 | Profile tab spec |
| features_companies.md | COMP-011 | Edit Company Profile |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect to login |
| 2 | Company role | `navBarAtom === 'company'` | Redirect to home |
| 3 | Admin or HR Manager | Role check | Read-only view |
| 4 | Company approved | `status === 'approved'` | Show pending message |

### Inputs
| Field | Type | Required | Validation | Default |
|-------|------|----------|------------|---------|
| companyName | string | Yes | 1-200 chars | - |
| companyNameEn | string | No | max 200 chars | '' |
| industry | string | No | Valid enum | null |
| companySize | string | No | 'S' \| 'M' \| 'L' | null |
| foundedYear | number | No | 1800 - current year | null |
| description | string | No | max 5000 chars, rich text | '' |
| website | string | No | Valid URL | '' |
| facebook | string | No | Valid URL | '' |
| linkedin | string | No | Valid URL | '' |

### Company Size Options
| Value | Thai Label | Description |
|-------|------------|-------------|
| `S` | ขนาดเล็ก | 1-50 employees |
| `M` | ขนาดกลาง | 51-200 employees |
| `L` | ขนาดใหญ่ | 200+ employees |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `company_information` | companyId | Profile fields | Admin/HR |

**SWR Cache:**
| Key | Action |
|-----|--------|
| `company-${companyId}` | Invalidate on save |

### Server Action
```typescript
interface CompanyProfileInput {
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

async function updateCompanyProfile(
  companyId: string, 
  data: CompanyProfileInput
): Promise<ActionResult>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Dirty form | Unsaved indicator | "มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก" |
| Saving | Button loading | Spinner |
| Success | Toast | "บันทึกโปรไฟล์สำเร็จ" |
| Validation error | Inline errors | Field-level messages |
| Navigation with unsaved | Modal | "มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการออกหรือไม่?" |

---

## BLS-09-02: uploadCompanyMedia

### Description
Upload company logo, cover photo, and gallery images.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R03_settings_RIS.md | Section 4.2, 7.2 | Media upload |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect |
| 2 | Admin or HR Manager | Role check | Hide upload buttons |
| 3 | File valid | Type/size check | Show error |

### Upload Types

**Logo:**
| Property | Value |
|----------|-------|
| Max Size | 5MB |
| Formats | JPG, PNG |
| Recommended | Square, min 200×200px |
| Storage Path | `companies/{id}/logo/{timestamp}` |
| Firestore Field | `profile_photo` |

**Cover Photo:**
| Property | Value |
|----------|-------|
| Max Size | 10MB |
| Formats | JPG, PNG, WebP |
| Recommended | 1200×300px |
| Storage Path | `companies/{id}/cover/{timestamp}` |
| Firestore Field | `cover_photo` |

**Gallery:**
| Property | Value |
|----------|-------|
| Max Size | 5MB per image |
| Formats | JPG, PNG |
| Max Count | 10 images |
| Storage Path | `companies/{id}/gallery/{timestamp}_{filename}` |
| Firestore Field | `gallery[]` (array) |

### State Changes

**Firebase Storage:**
| Operation | Path | Condition |
|-----------|------|-----------|
| Upload | Type-specific path | Valid file |
| Delete | Previous file path | When replacing |

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `company_information` | companyId | `profile_photo` | Logo upload |
| Update | `company_information` | companyId | `cover_photo` | Cover upload |
| Update (array union) | `company_information` | companyId | `gallery[]` | Gallery add |
| Update (array remove) | `company_information` | companyId | `gallery[]` | Gallery remove |

### Server Actions
```typescript
async function uploadCompanyLogo(
  companyId: string, 
  file: File
): Promise<ActionResult<{ url: string }>>;

async function uploadCompanyCover(
  companyId: string, 
  file: File
): Promise<ActionResult<{ url: string }>>;

async function addGalleryPhoto(
  companyId: string, 
  file: File
): Promise<ActionResult<{ url: string }>>;

async function removeGalleryPhoto(
  companyId: string, 
  photoUrl: string
): Promise<ActionResult>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Selecting file | Preview | Show before upload |
| Uploading | Progress bar | 0-100% |
| Success | Image update | New image shown |
| Invalid type | Error toast | "รองรับไฟล์ JPG, PNG เท่านั้น" |
| Too large | Error toast | "ไฟล์ใหญ่เกิน {limit}MB" |
| Gallery full | Error toast | "อัปโหลดได้สูงสุด 10 รูป" |
| Delete confirm | Modal | "ลบรูปภาพนี้?" |

---

## BLS-09-03: manageCompanyLocations

### Description
Add, edit, and remove company office locations.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R03_settings_RIS.md | Section 4.2, 7.3 | Location CRUD |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect |
| 2 | Admin or HR Manager | Role check | Read-only list |

### Location Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| addressLine1 | string | Yes | Non-empty |
| addressLine2 | string | No | - |
| province | string | Yes | Valid province from master |
| district | string | Yes | Valid district for province |
| subDistrict | string | No | Valid sub-district |
| postalCode | string | Yes | 5 digits |
| isPrimary | boolean | No | Only one primary allowed |

### Business Rules
| Rule | Description |
|------|-------------|
| One primary | Only one location can be `isPrimary: true` |
| Auto-primary | First location added becomes primary |
| Primary transfer | Setting new primary auto-clears old primary |
| Delete restriction | Cannot delete if only one location AND it's primary |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Create | `addresses` | Auto-generated | Location fields + `company_id` | Add |
| Update | `addresses` | locationId | Changed fields | Edit |
| Delete | `addresses` | locationId | - | Remove |
| Update | `addresses` | Previous primary ID | `is_primary: false` | New primary set |

**SWR Cache:**
| Key | Action |
|-----|--------|
| `company-addresses-${companyId}` | Invalidate on any change |

### Server Actions
```typescript
interface AddressInput {
  address_line1: string;
  address_line2?: string;
  province: string;
  district: string;
  sub_district?: string;
  postal_code: string;
  is_primary?: boolean;
}

async function addCompanyAddress(
  companyId: string, 
  address: AddressInput
): Promise<ActionResult<{ addressId: string }>>;

async function updateCompanyAddress(
  addressId: string, 
  address: Partial<AddressInput>
): Promise<ActionResult>;

async function removeCompanyAddress(
  addressId: string
): Promise<ActionResult>;

async function setPrimaryAddress(
  companyId: string,
  addressId: string
): Promise<ActionResult>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Adding | Modal form | Location form appears |
| Editing | Modal form | Pre-filled form |
| Saving | Button loading | Spinner |
| Add success | Toast + list update | "เพิ่มที่อยู่สำเร็จ" |
| Edit success | Toast + list update | "บันทึกที่อยู่แล้ว" |
| Delete confirm | Modal | "ลบที่อยู่นี้?" |
| Delete success | Toast + list update | "ลบที่อยู่แล้ว" |
| Cannot delete | Error toast | "ไม่สามารถลบที่อยู่หลักได้" |

---

## BLS-09-04: updateCompanyConfig

### Description
Update company configuration including default job settings and notification preferences.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R03_settings_RIS.md | Section 4.4, 7.5 | Config tab |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect |
| 2 | Admin or HR Manager | Role check | Hide config tab |

### Job Default Settings
| Field | Type | Description | Default |
|-------|------|-------------|---------|
| defaultLocation | string | Province for new jobs | null |
| defaultJobType | string | Employment type | 'full-time' |
| autoCloseDays | number | Days until auto-close (0=never) | 30 |

### Notification Preferences
| Field | Type | Description | Default |
|-------|------|-------------|---------|
| notifyNewApplication | boolean | Email on new application | true |
| dailySummaryEnabled | boolean | Daily summary email | false |
| dailySummaryTime | string | HH:mm for summary | '09:00' |
| interviewReminderHours | number | Hours before interview reminder | 24 |

### Config Schema
```typescript
interface CompanyConfig {
  job_defaults: {
    default_location?: string;      // Province
    default_job_type?: string;      // 'full-time' | 'part-time' | 'contract' | 'internship'
    auto_close_days?: number;       // 0 = never auto-close, otherwise 1-365
  };
  notifications: {
    notify_new_application: boolean;
    daily_summary_enabled: boolean;
    daily_summary_time?: string;    // HH:mm format
    interview_reminder_hours: number; // 1-72
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

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `company_information` | companyId | `config` object | Always |

**SWR Cache:**
| Key | Action |
|-----|--------|
| `company-${companyId}` | Invalidate |

### Server Action
```typescript
async function updateCompanyConfig(
  companyId: string, 
  config: Partial<CompanyConfig>
): Promise<ActionResult>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Toggle change | Optimistic update | Instant |
| Number/select change | Debounced save (500ms) | Saving indicator |
| Success | Toast | "บันทึกการตั้งค่าแล้ว" |
| Error | Revert + toast | "บันทึกไม่สำเร็จ" |

### Impact on Other Features
| Setting | Affects | How |
|---------|---------|-----|
| defaultLocation | BLS-07 createJob | Pre-populates location field |
| defaultJobType | BLS-07 createJob | Pre-populates job type |
| autoCloseDays | Job lifecycle | Auto-closes published jobs |
| notifyNewApplication | BLS-03 submitApplication | Triggers email to company |
| interviewReminderHours | BLS-05 scheduleInterview | Triggers reminder notification |

---

## BLS-09-05: viewCompanyAnalytics

### Description
View hiring analytics including funnel metrics, job performance, and source attribution.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R03_settings_RIS.md | Section 4.5, 7.6 | Analytics tab |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect |
| 2 | Company member | Any company role | Access denied |

### Analytics Data Structure
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
    conversion_rate: number;    // (applications / views) * 100
    avg_time_to_hire?: number;  // days
  }>;
  
  // Source Attribution
  source_attribution: Array<{
    source: 'direct' | 'search' | 'referral' | 'social';
    count: number;
    percentage: number;
  }>;
  
  // Time range
  date_range: {
    start: Date;
    end: Date;
  };
}
```

### Visualizations
| Metric | Chart Type | Description |
|--------|------------|-------------|
| Hiring Funnel | Funnel chart | Jobs → Views → Apps → Interviews → Hires |
| Job Performance | Table | Sortable by views, applications, conversion |
| Source Attribution | Pie/Donut chart | Traffic source breakdown |
| Trend | Line chart | Applications over time (optional) |

### State Changes

**SWR Cache (Read-only):**
| Key Pattern | Data Shape | Config |
|-------------|------------|--------|
| `company-analytics-${companyId}` | `CompanyAnalytics` | `refreshInterval: 300000` (5 min) |

### Server Action
```typescript
interface AnalyticsDateRange {
  start: Date;
  end: Date;
}

async function fetchCompanyAnalytics(
  companyId: string,
  dateRange?: AnalyticsDateRange
): Promise<CompanyAnalytics>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Loading | Skeleton | Chart placeholders |
| No data | Empty state | "ยังไม่มีข้อมูลสถิติ" |
| Date filter change | Refresh | Updated charts |
| Error | Error state | Retry button |

### Date Range Options
| Option | Thai Label | Range |
|--------|------------|-------|
| 7d | 7 วันที่ผ่านมา | Last 7 days |
| 30d | 30 วันที่ผ่านมา | Last 30 days |
| 90d | 90 วันที่ผ่านมา | Last 90 days |
| custom | กำหนดเอง | Date picker |

---

## Stage Integration Points

### Entry Points (from other stages)
| Source Stage | Source Action | Entry Action | Trigger |
|--------------|---------------|--------------|---------|
| Any (Company Shell) | Sidebar navigation | editCompanyProfile | Settings link |
| BLS-07 Job Management | Job list | viewCompanyAnalytics | Analytics link |

### Exit Points (to other stages)
| Exit Action | Target Stage | Target Action | Trigger |
|-------------|--------------|---------------|---------|
| updateCompanyConfig | BLS-07 | createJob | Job defaults used |
| editCompanyProfile | BLS-02 | viewCompanyProfile | Public profile updated |

### Cross-Stage Dependencies
| This Stage Action | Affects Stage | Effect |
|-------------------|---------------|--------|
| updateCompanyConfig (job defaults) | BLS-07 Job Management | Pre-populates job creation form |
| updateCompanyConfig (notifications) | BLS-03, BLS-05 | Controls notification triggers |
| editCompanyProfile | BLS-02 Discovery | Updates public company profile |

---

## Permissions Matrix

| Action | Company Admin | HR Manager | Recruiter | Candidate |
|--------|---------------|------------|-----------|-----------|
| editCompanyProfile | ✓ Write | ✓ Write | Read only | ✗ |
| uploadCompanyMedia | ✓ | ✓ | ✗ | ✗ |
| manageCompanyLocations | ✓ Write | ✓ Write | Read only | ✗ |
| updateCompanyConfig | ✓ | ✓ | ✗ | ✗ |
| viewCompanyAnalytics | ✓ | ✓ | ✓ | ✗ |

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| COMP-R03_settings_RIS.md | Company settings page specification |
| features_companies.md | Company feature definitions (COMP-011) |
| data-entities_company-information.md | Company schema |
| data-entities_addresses.md | Address schema |
| BLS-00_cross-cutting.md | Account management actions (password, deletion) |
| BLS-07_job-management.md | Uses config defaults for job creation |
| BLS-02_discovery.md | Public company profile display |

---

*End of BLS-09 Company Profile Stage*
