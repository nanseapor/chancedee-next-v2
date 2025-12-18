# CAND-R02 Batch 3C: Profile Mode Implementation Plan

## Overview

**Task:** Implement profile view mode for existing users (`isOnboarded: true`)
**Route:** `/candidates/[id]/profile`
**RIS Reference:** CAND-R02 §6.1 (Profile Mode), Appendix A
**Scope:** View-only sections with Edit buttons (Edit drawers in Batch 3D)

---

## Current State

**Completed (Batch 3A & 3B):**
- ✅ Onboarding wizard (5 steps) at `/candidates/profile/create`
- ✅ 173 unit tests (100% passing)
- ✅ All wizard step components (Step1-Step5)
- ✅ Form validation with React Hook Form + Zod

**Existing:**
- Stub page at `src/app/jobsmarket/candidates/[id]/profile/page.tsx`
- Wizard components can be referenced for data display patterns
- Type definitions in `src/types/candidate.types.ts`

---

## Target State

**Profile View Mode Components:**
1. ProfileViewClient (container)
2. ProfileHeader (avatar, name, completion %, searchable toggle, preview button)
3. PersonalInfoSection (view only)
4. WorkExperienceSection (view only, array display)
5. EducationSection (view only, array display)
6. SkillsSection (view only, tags display)
7. JobPreferencesSection (view only, summary)
8. DocumentsSection (view only, file list)

Each section shows:
- Data in read-only format
- "Edit" button (will open drawer in Batch 3D)
- Empty state if no data

---

## Implementation Strategy

### Phase 1: Container & Layout

**File:** `src/app/jobsmarket/candidates/[id]/profile/page.tsx`

Replace stub with:
```typescript
// Server component
- Check auth (owner-only access)
- Fetch candidate data via webCandidateGetPersonalInfo(uid)
- Fetch preferences via getCandidatePreference(uid)
- Render ProfileViewClient with data
```

**File:** `src/app/jobsmarket/candidates/[id]/profile/_components/ProfileViewClient.tsx`

```typescript
"use client"
- Receive initialData props
- Manage page mode state (viewing/editing)
- Render ProfileHeader
- Render all view sections in scrollable container
```

### Phase 2: Profile Header

**File:** `src/app/jobsmarket/candidates/[id]/profile/_components/ProfileHeader.tsx`

```typescript
"use client"
Display:
- Avatar (with edit button icon overlay on hover)
- Full name (Thai)
- Profile completion percentage with progress bar
- Searchable toggle switch (โปรไฟล์สามารถค้นหาได้)
- Preview button (ดูตัวอย่างโปรไฟล์)
- Export button (ส่งออก PDF)

Props:
- candidate: CandidateProfile
- onToggleSearchable: (value: boolean) => void
- onOpenPreview: () => void
```

### Phase 3: Personal Info Section

**File:** `src/app/jobsmarket/candidates/[id]/profile/_components/PersonalInfoSection.tsx`

```typescript
"use client"
Display:
- Section title: "ข้อมูลส่วนตัว"
- Edit button (top-right)
- Fields (read-only):
  - ชื่อ-นามสกุล (Thai)
  - ชื่อ-นามสกุล (English) [optional]
  - ชื่อเล่น [optional]
  - อีเมล
  - เบอร์โทรศัพท์
  - วันเกิด (format: DD/MM/YYYY, age in years)
  - ที่อยู่ (province, district, sub-district, postal code)

Props:
- candidate: CandidateProfile
- onEdit: () => void
```

### Phase 4: Work Experience Section

**File:** `src/app/jobsmarket/candidates/[id]/profile/_components/WorkExperienceSection.tsx`

```typescript
"use client"
Display:
- Section title: "ประสบการณ์ทำงาน"
- Edit button (top-right)
- Array of work entries (timeline format):
  - Company name
  - Position
  - Duration (MM/YYYY - MM/YYYY or "ปัจจุบัน")
  - Years/months calculation
  - Note [if exists]
- Fresh graduate badge (if applicable)
- Empty state: "ยังไม่มีประสบการณ์ทำงาน"

Props:
- works: WorkExperience[]
- isFreshGraduate: boolean
- onEdit: () => void
```

### Phase 5: Education Section

**File:** `src/app/jobsmarket/candidates/[id]/profile/_components/EducationSection.tsx`

```typescript
"use client"
Display:
- Section title: "ประวัติการศึกษา"
- Edit button (top-right)
- Array of education entries:
  - Level (Thai label)
  - Institution
  - Faculty/Major
  - Graduation year
  - GPA [if exists]
  - Highlights [if exists]
- Empty state: "ยังไม่มีประวัติการศึกษา"

Props:
- educations: Education[]
- onEdit: () => void
```

### Phase 6: Skills Section

**File:** `src/app/jobsmarket/candidates/[id]/profile/_components/SkillsSection.tsx`

```typescript
"use client"
Display:
- Section title: "ทักษะและภาษา"
- Edit button (top-right)
- Skills subsection:
  - Skill tags (name + level badge if exists)
- Languages subsection:
  - Language entries (name + level)
  - Certificate info [if exists]
- Empty state: "ยังไม่มีทักษะ"

Props:
- skills: Skill[]
- languages: Language[]
- onEdit: () => void
```

### Phase 7: Job Preferences Section

**File:** `src/app/jobsmarket/candidates/[id]/profile/_components/JobPreferencesSection.tsx`

```typescript
"use client"
Display:
- Section title: "ความต้องการงาน"
- Edit button (top-right)
- Job types (badges)
- Positions (list)
- Salary range (formatted with commas)
- Locations (badges)
- Availability (Thai label)
- Work mode [if exists]
- Empty state: "ยังไม่ได้ตั้งค่าความต้องการงาน"

Props:
- preference: JobPreference | null
- onEdit: () => void
```

### Phase 8: Documents Section

**File:** `src/app/jobsmarket/candidates/[id]/profile/_components/DocumentsSection.tsx`

```typescript
"use client"
Display:
- Section title: "เอกสารแนบ"
- Upload button (top-right)
- File list:
  - File name
  - File size
  - Upload date
  - Download button
  - Delete button (owner only)
- Empty state: "ยังไม่มีเอกสารแนบ"

Props:
- documents: Document[]
- onUpload: () => void
- onDelete: (docId: string) => void
```

---

## Component Structure

```
/candidates/[id]/profile/
├── page.tsx (Server Component)
│   ├── Auth check
│   ├── Data fetching
│   └── Render ProfileViewClient
│
└── _components/
    ├── ProfileViewClient.tsx (Client Container)
    │   ├── Page mode state management
    │   ├── ProfileHeader
    │   └── Sections container
    │
    ├── ProfileHeader.tsx
    │   ├── Avatar with edit
    │   ├── Name display
    │   ├── Completion progress
    │   ├── Searchable toggle
    │   └── Preview/Export buttons
    │
    ├── PersonalInfoSection.tsx
    ├── WorkExperienceSection.tsx
    ├── EducationSection.tsx
    ├── SkillsSection.tsx
    ├── JobPreferencesSection.tsx
    └── DocumentsSection.tsx
```

---

## Data Flow

```
Server Component (page.tsx)
    ↓
Fetch candidate_information (webCandidateGetPersonalInfo)
Fetch candidate_preference (getCandidatePreference)
    ↓
Pass to ProfileViewClient as initialData
    ↓
ProfileViewClient distributes to sections
    ↓
Each section:
    - Displays data in read-only format
    - Has Edit button (handler passed via props)
    - Shows empty state if no data
```

---

## Styling Guidelines

**Tailwind Classes:**
- Container: `max-w-4xl mx-auto px-4 py-8`
- Section card: `bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6`
- Section title: `text-xl font-semibold text-gray-900 mb-4`
- Edit button: `text-sm text-blue-600 hover:text-blue-700 font-medium`
- Empty state: `text-gray-500 text-center py-8 italic`
- Badge: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`

**Icons:**
- Edit: `lucide-react` Pencil
- Upload: Upload
- Download: Download
- Delete: Trash2
- Preview: Eye

---

## Empty States

Each section needs empty state handling:

| Section | Empty State Message |
|---------|---------------------|
| Personal Info | (Should always have data after onboarding) |
| Work Experience | "ยังไม่มีประสบการณ์ทำงาน" + "คลิกแก้ไขเพื่อเพิ่มประสบการณ์" |
| Education | "ยังไม่มีประวัติการศึกษา" |
| Skills | "ยังไม่มีทักษะ" |
| Job Preferences | "ยังไม่ได้ตั้งค่าความต้องการงาน" |
| Documents | "ยังไม่มีเอกสารแนบ" + "คลิกอัปโหลดเพื่อเพิ่มเอกสาร" |

---

## Event Handlers (Stub for Batch 3D)

For Batch 3C, all edit/upload/delete handlers will just log to console:

```typescript
const handleEditPersonalInfo = () => {
  console.log("Edit Personal Info - drawer in Batch 3D");
};

const handleEditWorkExperience = () => {
  console.log("Edit Work Experience - drawer in Batch 3D");
};

// ... etc
```

---

## Testing Strategy

**Unit Tests:** `tests/unit/jobsmarket/candidates/profile-view/`

For each section component:
1. Renders with data correctly
2. Shows empty state when no data
3. Edit button calls handler
4. All fields display correct values
5. Formats dates/numbers correctly

**Test Structure:**
```typescript
describe("PersonalInfoSection", () => {
  it("should render all fields with data", () => {
    // Test all fields visible
  });

  it("should format birthdate correctly", () => {
    // Test date formatting
  });

  it("should call onEdit when edit button clicked", () => {
    // Test button handler
  });
});
```

---

## Acceptance Criteria

- [ ] Profile page loads at `/candidates/[id]/profile`
- [ ] All 7 sections display correctly with sample data
- [ ] Empty states shown when sections have no data
- [ ] Profile completion percentage calculated correctly
- [ ] Searchable toggle updates state (console log for now)
- [ ] All Edit buttons call stub handlers (console log)
- [ ] Preview/Export buttons call stub handlers
- [ ] Page is responsive (mobile/tablet/desktop)
- [ ] All unit tests pass
- [ ] Build passes (Gate 1)
- [ ] Lint passes (Gate 2)
- [ ] Dev server starts and route loads (Gate 3)
- [ ] Test suite passes (Gate 4)

---

## Quality Gates

### Gate 1: Build
```bash
npm run build
```
Expected: ✅ No TypeScript errors, build succeeds

### Gate 2: Lint
```bash
npm run lint
```
Expected: ✅ No errors (warnings OK)

### Gate 3: Dev Server
```bash
npm run dev
```
Then visit: `http://localhost:3000/jobsmarket/candidates/[test-uid]/profile`
Expected: ✅ Page loads, shows profile sections

### Gate 4: Tests
```bash
npm run test:unit -- tests/unit/jobsmarket/candidates/profile-view/
```
Expected: ✅ All tests pass

---

## Implementation Order

1. **Container Setup** (ProfileViewClient)
2. **ProfileHeader** (most visible component)
3. **PersonalInfoSection** (always has data)
4. **WorkExperienceSection** (complex: arrays, timeline)
5. **EducationSection** (similar to work)
6. **SkillsSection** (tags display)
7. **JobPreferencesSection** (summary format)
8. **DocumentsSection** (file list)
9. **Unit Tests** (parallel with implementation)
10. **Quality Gates** (final verification)

---

## Files to Create

```
src/app/jobsmarket/candidates/[id]/profile/
├── page.tsx (REPLACE stub)
└── _components/
    ├── ProfileViewClient.tsx (NEW)
    ├── ProfileHeader.tsx (NEW)
    ├── PersonalInfoSection.tsx (NEW)
    ├── WorkExperienceSection.tsx (NEW)
    ├── EducationSection.tsx (NEW)
    ├── SkillsSection.tsx (NEW)
    ├── JobPreferencesSection.tsx (NEW)
    └── DocumentsSection.tsx (NEW)

tests/unit/jobsmarket/candidates/profile-view/
├── ProfileHeader.test.tsx (NEW)
├── PersonalInfoSection.test.tsx (NEW)
├── WorkExperienceSection.test.tsx (NEW)
├── EducationSection.test.tsx (NEW)
├── SkillsSection.test.tsx (NEW)
├── JobPreferencesSection.test.tsx (NEW)
└── DocumentsSection.test.tsx (NEW)
```

---

## Dependencies to Install

None required - all dependencies already installed from Batch 3A/3B:
- ✅ React Hook Form
- ✅ Zod
- ✅ lucide-react
- ✅ shadcn/ui components
- ✅ Tailwind CSS

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Data fetching fails | Show error state, retry button |
| Missing candidate data | Redirect to onboarding wizard |
| Profile completion calc wrong | Reference Appendix C formula |
| Mobile responsive issues | Test on multiple viewports |

---

## Next Steps (Batch 3D)

After completing Batch 3C:
- Implement edit drawers for each section
- Wire up real handlers instead of stubs
- Add dirty state detection
- Add discard confirmation modal
- Implement save operations with server actions

---

**Status:** Ready for implementation
**Estimated Components:** 8
**Estimated Tests:** ~50-70
**Target Completion:** End of session
