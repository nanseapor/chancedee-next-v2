# ADM-R10: Platform Notifications

**Document ID:** ADM-R10  
**Version:** 1.0  
**Status:** Complete  
**Created:** 2025-12-11  
**Route:** `/platform/notifications`  
**Parent:** ADM-R00 (Cross-Cutting Specifications)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-11 | Initial creation with UI State Machine |

---

## Cross-References

| Topic | Reference |
|-------|-----------|
| Shell Layout | ADM-R00 Section 2 |
| Permissions | ADM-R00 Section 3 |
| List Page State Machine | ADM-R00 Section 7.2 |
| Action Modal State Machine | ADM-R00 Section 7.4 |
| Platform Notifications Schema | ADM-R00 Section 9.4 |
| Notification Actions | ADM-R00 Section 10.4 |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route ID | ADM-R10 |
| Route Path | `/platform/notifications` |
| Shell | Platform Admin Shell |
| Purpose | Platform-wide announcements and notifications |
| Min Admin Level | staff |
| Feature Flag | `bulkNotifications` (ADM-R08) |
| UI Spec | `07-platform-admin-routes.md` Section 8.8 (NEW) |

---

## 2. Feature Flag Dependency

This route requires the `bulkNotifications` feature flag to be enabled in System Settings.

```typescript
// Feature check
const { features } = useSystemSettings();

if (!features.bulkNotifications) {
  return <FeatureDisabled feature="Platform Notifications" />;
}
```

---

## 3. Feature Mapping

| Feature ID | Feature Name | Coverage |
|------------|--------------|----------|
| ADMIN-029 | Get Notifications List | Full |
| ADMIN-030 | Get Notification Details | Full |
| ADMIN-031 | Edit Notification | Full |
| ADMIN-032 | Send Notification | Full |
| NOTIF-NEW-001 | Schedule Notification | Full |
| NOTIF-NEW-002 | Audience Targeting | Full |
| NOTIF-NEW-003 | Multi-Channel Delivery | Full |

---

## 4. Page Layout

### 4.1 List Page

```
+------------------------------------------------------------------+
| Platform Notifications                        [+ New Notification]|
+------------------------------------------------------------------+
| Tabs: [All] [Draft] [Scheduled (2)] [Sent]                       |
+------------------------------------------------------------------+
| Notification Cards                                                |
| +--------------------------------------------------------------+ |
| | [SCHEDULED] Welcome 2025!                                     | |
| | To: All Users | Channels: Push, In-App                       | |
| | Scheduled: Jan 1, 2025 00:00 | Recipients: 5,234              | |
| | [Edit] [Send Now] [Cancel]                                    | |
| +--------------------------------------------------------------+ |
| +--------------------------------------------------------------+ |
| | [SENT] System Maintenance Notice                              | |
| | To: All Users | Channels: Push, Email                        | |
| | Sent: Dec 10, 2024 14:00 | Delivered: 4,890/5,000 (97.8%)    | |
| | [View Stats]                                                  | |
| +--------------------------------------------------------------+ |
| +--------------------------------------------------------------+ |
| | [DRAFT] Holiday Promotion                                     | |
| | To: Candidates Only | Channels: Push, In-App, Email          | |
| | Last edited: Dec 11, 2024                                     | |
| | [Edit] [Schedule] [Delete]                                    | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
| [< Prev] Page 1 of 3 [Next >]                                    |
+------------------------------------------------------------------+
```

### 4.2 Create/Edit Page

```
+------------------------------------------------------------------+
| [< Back] New Notification                                         |
+------------------------------------------------------------------+
| Content                                                           |
| Title:    [                                              ]       |
| Message:  [                                              ]       |
|           [                                              ]       |
| Image:    [Choose File] (optional)                               |
| Link:     [                                    ] (optional)       |
+------------------------------------------------------------------+
| Audience                                                          |
| Target:   ( ) All Users  ( ) By Role  ( ) Custom Segment         |
|                                                                  |
| [Role Selection / Segment Builder shown based on target]         |
|                                                                  |
| Estimated Recipients: 5,234                                       |
+------------------------------------------------------------------+
| Delivery                                                          |
| Channels: [x] Push  [x] In-App  [ ] Email                        |
| Schedule: ( ) Send Now  ( ) Schedule for Later                   |
|           [Date Picker] [Time Picker]                            |
| Spread:   [ ] Distribute over [2] hours                          |
+------------------------------------------------------------------+
| [Save Draft] [Preview] [Schedule / Send]                          |
+------------------------------------------------------------------+
```

---

## 5. Data Contract

### 5.1 Read Operations

| Data | Source | Method |
|------|--------|--------|
| Notification List | `getPlatformNotifications(filters)` | SWR |
| Notification Detail | `getPlatformNotification(id)` | SWR |
| Recipient Count | `getNotificationRecipientCount(audience)` | Real-time |

### 5.2 Platform Notification Shape

```typescript
interface PlatformNotification {
  uid: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  title: string;
  message: string;
  imageUrl?: string;
  actionUrl?: string;
  audience: {
    type: 'all' | 'role' | 'segment';
    roles?: ('candidate' | 'company')[];
    segmentQuery?: {
      filters: Record<string, any>;
      estimatedCount?: number;
    };
  };
  recipientCount: number;
  channels: ('push' | 'in_app' | 'email')[];
  scheduledAt?: number;
  distributionTime?: string;
  sentAt?: number;
  status: NotificationStatus;
  deliveryStats?: DeliveryStats;
}

type NotificationStatus = 
  | 'draft' 
  | 'scheduled' 
  | 'sending' 
  | 'sent' 
  | 'cancelled' 
  | 'failed';

interface DeliveryStats {
  push: { sent: number; delivered: number; failed: number };
  email: { sent: number; opened: number; bounced: number };
  inApp: { created: number; read: number };
}
```

### 5.3 Write Operations

| Operation | Server Action | Side Effects |
|-----------|---------------|--------------|
| Create | `createPlatformNotification(data)` | Calculate recipients |
| Update | `updatePlatformNotification(id, data)` | Recalculate if audience changed |
| Delete | `deletePlatformNotification(id)` | Only if draft |
| Send Now | `sendPlatformNotificationNow(id)` | Start delivery |
| Cancel | `cancelPlatformNotification(id)` | Stop if scheduled/sending |

---

## 6. State Contract

### 6.1 SWR Keys

```typescript
['admin', 'notifications', 'list', { status, page }]
['admin', 'notifications', 'detail', notificationId]
['admin', 'notifications', 'recipient-count', audience]
```

### 6.2 Local State

```typescript
interface NotificationListState {
  activeTab: 'all' | 'draft' | 'scheduled' | 'sent';
  page: number;
  selectedNotification: string | null;
}

interface NotificationFormState {
  title: string;
  message: string;
  imageUrl?: string;
  actionUrl?: string;
  audienceType: 'all' | 'role' | 'segment';
  selectedRoles: ('candidate' | 'company')[];
  segmentFilters: Record<string, any>;
  channels: {
    push: boolean;
    inApp: boolean;
    email: boolean;
  };
  scheduleType: 'now' | 'later';
  scheduledAt?: Date;
  distributionHours?: number;
  recipientCount: number;
  isCalculating: boolean;
}
```

---

## 7. UI State Machine

### 7.1 Notifications List Page State Machine

Extends ADM-R00 Section 7.2 (Shared List Page State Machine).

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `FEATURE_DISABLED` | `DISABLED` | !features.bulkNotifications | showDisabledMessage() |
| `LOADING` | `FEATURE_ENABLED` | `LOADING` | features.bulkNotifications | fetchNotifications() |
| `LOADING` | `DATA_LOADED` | `READY` | always | setNotifications(items) |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `READY` | `TAB_CHANGE` | `LOADING` | always | setActiveTab(tab), refetch() |
| `READY` | `NEW_CLICK` | - | always | router.push('/platform/notifications/new') |
| `READY` | `CARD_CLICK` | - | always | router.push(`/platform/notifications/${id}`) |
| `READY` | `EDIT_CLICK` | - | status === 'draft' | router.push(`/platform/notifications/${id}/edit`) |
| `READY` | `SEND_NOW_CLICK` | `CONFIRM_SEND` | status === 'scheduled' | openConfirmDialog() |
| `READY` | `CANCEL_CLICK` | `CONFIRM_CANCEL` | status in ['scheduled', 'sending'] | openConfirmDialog() |
| `READY` | `DELETE_CLICK` | `CONFIRM_DELETE` | status === 'draft' | openConfirmDialog() |
| `CONFIRM_SEND` | `CONFIRM` | `PROCESSING` | always | sendNotificationNow(id) |
| `CONFIRM_SEND` | `CANCEL` | `READY` | always | closeDialog() |
| `CONFIRM_CANCEL` | `CONFIRM` | `PROCESSING` | always | cancelNotification(id) |
| `CONFIRM_CANCEL` | `CANCEL` | `READY` | always | closeDialog() |
| `CONFIRM_DELETE` | `CONFIRM` | `PROCESSING` | always | deleteNotification(id) |
| `CONFIRM_DELETE` | `CANCEL` | `READY` | always | closeDialog() |
| `PROCESSING` | `SUCCESS` | `READY` | always | toast.success(), refetch() |
| `PROCESSING` | `ERROR` | `READY` | always | toast.error(err) |
| `ERROR` | `RETRY` | `LOADING` | always | refetch() |
| `DISABLED` | - | - | always | - |

### 7.2 Notification Card State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `IDLE` | `HOVER` | `HOVERED` | always | showActions() |
| `HOVERED` | `LEAVE` | `IDLE` | always | hideActions() |
| `IDLE` | `CLICK` | - | always | navigateToDetail(id) |

### 7.3 Create/Edit Form State Machine

**States:** `LOADING`, `EDITING`, `CALCULATING`, `PREVIEWING`, `SAVING`, `SCHEDULING`, `SENDING`, `ERROR`

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `EDITING` | isEdit && data | populateForm(data) |
| `LOADING` | `INIT_NEW` | `EDITING` | !isEdit | initEmptyForm() |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `EDITING` | `FIELD_CHANGE` | `EDITING` | always | updateField(name, value) |
| `EDITING` | `AUDIENCE_CHANGE` | `CALCULATING` | always | setAudience(type), calculateRecipients() |
| `EDITING` | `SEGMENT_CHANGE` | `CALCULATING` | always | updateSegment(filters), calculateRecipients() |
| `CALCULATING` | `COUNT_RECEIVED` | `EDITING` | always | setRecipientCount(count) |
| `CALCULATING` | `COUNT_ERROR` | `EDITING` | always | setRecipientCount(0), showError() |
| `EDITING` | `PREVIEW` | `PREVIEWING` | form.isValid | showPreview() |
| `EDITING` | `PREVIEW` | `EDITING` | !form.isValid | highlightErrors() |
| `PREVIEWING` | `CLOSE_PREVIEW` | `EDITING` | always | hidePreview() |
| `PREVIEWING` | `CONFIRM_SEND` | `SENDING` | scheduleType === 'now' | sendNow() |
| `PREVIEWING` | `CONFIRM_SCHEDULE` | `SCHEDULING` | scheduleType === 'later' | schedule() |
| `EDITING` | `SAVE_DRAFT` | `SAVING` | title && message | saveDraft() |
| `SAVING` | `SUCCESS` | - | always | toast.success(), router.push('/platform/notifications') |
| `SAVING` | `ERROR` | `EDITING` | always | toast.error(err) |
| `SCHEDULING` | `SUCCESS` | - | always | toast.success(), router.push('/platform/notifications') |
| `SCHEDULING` | `ERROR` | `EDITING` | always | toast.error(err) |
| `SENDING` | `SUCCESS` | - | always | toast.success(), router.push('/platform/notifications') |
| `SENDING` | `ERROR` | `EDITING` | always | toast.error(err) |
| `ERROR` | `RETRY` | `LOADING` | always | refetch() |

### 7.4 Audience Selector State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `ALL_USERS` | `SELECT_ROLE` | `BY_ROLE` | always | setAudienceType('role') |
| `ALL_USERS` | `SELECT_SEGMENT` | `SEGMENT_BUILDER` | always | setAudienceType('segment') |
| `BY_ROLE` | `TOGGLE_ROLE` | `BY_ROLE` | always | toggleRole(role), recalculate() |
| `BY_ROLE` | `SELECT_ALL` | `ALL_USERS` | always | setAudienceType('all') |
| `BY_ROLE` | `SELECT_SEGMENT` | `SEGMENT_BUILDER` | always | setAudienceType('segment') |
| `SEGMENT_BUILDER` | `ADD_FILTER` | `SEGMENT_BUILDER` | always | addFilter(field, op, value), recalculate() |
| `SEGMENT_BUILDER` | `REMOVE_FILTER` | `SEGMENT_BUILDER` | always | removeFilter(index), recalculate() |
| `SEGMENT_BUILDER` | `CLEAR_FILTERS` | `SEGMENT_BUILDER` | always | clearFilters(), recalculate() |
| `SEGMENT_BUILDER` | `SELECT_ALL` | `ALL_USERS` | always | setAudienceType('all') |
| `SEGMENT_BUILDER` | `SELECT_ROLE` | `BY_ROLE` | always | setAudienceType('role') |

### 7.5 Channel Selector State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `IDLE` | `TOGGLE_PUSH` | `IDLE` | always | toggleChannel('push') |
| `IDLE` | `TOGGLE_IN_APP` | `IDLE` | always | toggleChannel('in_app') |
| `IDLE` | `TOGGLE_EMAIL` | `IDLE` | always | toggleChannel('email') |
| `IDLE` | `VALIDATE` | `IDLE` | channels.length > 0 | clearError() |
| `IDLE` | `VALIDATE` | `ERROR` | channels.length === 0 | showError('Select at least one channel') |

### 7.6 Schedule Selector State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `SEND_NOW` | `SELECT_SCHEDULE` | `SCHEDULE_LATER` | always | showDatePicker() |
| `SCHEDULE_LATER` | `SELECT_NOW` | `SEND_NOW` | always | clearSchedule() |
| `SCHEDULE_LATER` | `DATE_CHANGE` | `SCHEDULE_LATER` | always | setDate(date) |
| `SCHEDULE_LATER` | `TIME_CHANGE` | `SCHEDULE_LATER` | always | setTime(time) |
| `SCHEDULE_LATER` | `DISTRIBUTION_TOGGLE` | `SCHEDULE_LATER` | always | toggleDistribution() |
| `SCHEDULE_LATER` | `DISTRIBUTION_HOURS_CHANGE` | `SCHEDULE_LATER` | always | setDistributionHours(hours) |
| `SCHEDULE_LATER` | `VALIDATE` | `SCHEDULE_LATER` | date > now | clearError() |
| `SCHEDULE_LATER` | `VALIDATE` | `ERROR` | date <= now | showError('Must be future date') |

### 7.7 Preview Modal State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `CLOSED` | `OPEN` | `OPEN` | always | generatePreview(form) |
| `OPEN` | `CLOSE` | `CLOSED` | always | - |
| `OPEN` | `CONFIRM` | - | always | emitConfirm(), close() |
| `OPEN` | `EDIT` | `CLOSED` | always | - |

---

## 8. Audience Segment Filters

| Filter | Field | Operators |
|--------|-------|-----------|
| Province | address.province | equals, in |
| Last Active | lastActive | after, before, range |
| Registration Date | createdAt | after, before, range |
| Verified | isVerified | equals |
| Has Applied | applicationCount | gt, gte, lt, lte |
| Has Posted | jobCount | gt, gte, lt, lte |

---

## 9. Channel Delivery

| Channel | Delivery Method | Tracking |
|---------|-----------------|----------|
| Push | FCM (Firebase Cloud Messaging) | Delivered, Failed |
| In-App | web_messages collection | Created, Read |
| Email | SendGrid | Sent, Opened, Bounced |

---

## 10. Status Flow

```
draft ─────────────────┬─────────────────> scheduled
   │                   │                       │
   │ [delete]          │ [send now]            │ [cancel]
   │                   │                       │
   v                   v                       v
(deleted)           sending ────────────> cancelled
                       │
                       │ [complete]
                       │
                       v
              ┌────────┴────────┐
              │                 │
              v                 v
            sent             failed
```

---

## 11. Implementation Checklist

### Phase 1: List Page
- [ ] Create notifications list page
- [ ] Implement feature flag check
- [ ] Create notification card component
- [ ] Add status badges
- [ ] Implement tab filtering

### Phase 2: Create/Edit Form
- [ ] Create form page
- [ ] Implement content fields
- [ ] Create audience selector
- [ ] Create segment builder
- [ ] Add channel toggles
- [ ] Implement schedule picker

### Phase 3: Recipient Calculation
- [ ] Implement real-time count API
- [ ] Show loading state
- [ ] Cache recent calculations

### Phase 4: Preview & Send
- [ ] Create preview modal
- [ ] Show sample notification
- [ ] Implement send/schedule actions
- [ ] Add confirmation dialogs

### Phase 5: Delivery Stats
- [ ] Create stats display
- [ ] Show per-channel metrics
- [ ] Add progress indicators

---

## 12. Files to Create

| File | Purpose |
|------|---------|
| `src/app/(platform)/platform/notifications/page.tsx` | List page |
| `src/app/(platform)/platform/notifications/new/page.tsx` | Create page |
| `src/app/(platform)/platform/notifications/[id]/page.tsx` | Detail page |
| `src/app/(platform)/platform/notifications/[id]/edit/page.tsx` | Edit page |
| `src/domains/admin/components/notifications/NotificationList.tsx` | List |
| `src/domains/admin/components/notifications/NotificationCard.tsx` | Card |
| `src/domains/admin/components/notifications/StatusBadge.tsx` | Status |
| `src/domains/admin/components/notifications/NotificationForm.tsx` | Form |
| `src/domains/admin/components/notifications/ContentFields.tsx` | Content |
| `src/domains/admin/components/notifications/AudienceSelector.tsx` | Audience |
| `src/domains/admin/components/notifications/SegmentBuilder.tsx` | Segment |
| `src/domains/admin/components/notifications/ChannelSelector.tsx` | Channels |
| `src/domains/admin/components/notifications/ScheduleSelector.tsx` | Schedule |
| `src/domains/admin/components/notifications/RecipientCounter.tsx` | Count |
| `src/domains/admin/components/notifications/PreviewModal.tsx` | Preview |
| `src/domains/admin/components/notifications/DeliveryStats.tsx` | Stats |
| `src/domains/admin/components/notifications/FeatureDisabled.tsx` | Disabled |
| `src/domains/admin/hooks/usePlatformNotifications.ts` | List hook |
| `src/domains/admin/hooks/useNotificationForm.ts` | Form hook |
| `src/domains/admin/hooks/useRecipientCount.ts` | Count hook |

---

*End of ADM-R10 Platform Notifications RIS v1.0*
