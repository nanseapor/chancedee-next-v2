# ADM-R08: System Settings

**Document ID:** ADM-R08  
**Version:** 2.0  
**Status:** Complete  
**Created:** 2025-12-11  
**Route:** `/platform/settings`  
**Parent:** ADM-R00 (Cross-Cutting Specifications)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-12-11 | Added Risk Score Threshold config, UI State Machine section |
| 1.0 | 2025-12-10 | Initial creation |

---

## Cross-References

| Topic | Reference |
|-------|-----------|
| Shell Layout | ADM-R00 Section 2 |
| Permissions | ADM-R00 Section 3 |
| Action Modal State Machine | ADM-R00 Section 7.4 |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route ID | ADM-R08 |
| Route Path | `/platform/settings` |
| Shell | Platform Admin Shell |
| Purpose | Platform configuration and master data |
| Min Admin Level | admin (System tab: super) |
| UI Spec | `07-platform-admin-routes.md` Section 8.10 |

---

## 2. Feature Mapping

| Feature ID | Feature Name | Coverage | Min Level |
|------------|--------------|----------|-----------|
| ADMIN-025 | View Master Data | Full | admin |
| ADMIN-026 | Add Master Data Item | Full | admin |
| ADMIN-027 | Update Master Data Item | Full | admin |
| ADMIN-028 | Delete Master Data Item | Full | admin |
| LOYALTY-001 | Configure Rewards | Full | admin |
| SYSTEM-001 | System Settings | Full | super |

---

## 3. Page Layout

```
+------------------------------------------------------------------+
| Settings                                                          |
+------------------------------------------------------------------+
| Tabs: [Master Data] [Loyalty] [System (Super)]                   |
+------------------------------------------------------------------+
| Tab Content Area                                                  |
|                                                                  |
| (varies by selected tab)                                         |
|                                                                  |
+------------------------------------------------------------------+
```

### 3.1 Master Data Tab

```
+------------------------------------------------------------------+
| Category: [Job Functions v]                    [+ Add New]        |
+------------------------------------------------------------------+
| Search: [                    ]                                    |
+------------------------------------------------------------------+
| Name (TH)      | Name (EN)      | Code   | Active | Actions     |
+------------------------------------------------------------------+
| IT             | IT             | IT001  | Yes    | [Edit] [Del]|
| Marketing      | Marketing      | MKT001 | Yes    | [Edit] [Del]|
| Accounting     | Accounting     | ACC001 | No     | [Edit] [Del]|
+------------------------------------------------------------------+
```

### 3.2 Loyalty Tab

```
+------------------------------------------------------------------+
| Points Configuration                                              |
+------------------------------------------------------------------+
| Points per application:          [    5    ] points               |
| Points per interview:            [   10    ] points               |
| Points per job offer:            [   50    ] points               |
| Points per company review:       [    5    ] points               |
| Exchange rate:                   [  100    ] points = 1 baht     |
+------------------------------------------------------------------+
| Rewards (Pockets)                            [+ Add Pocket]       |
+------------------------------------------------------------------+
| Name           | Points | Stock | Status | Actions               |
+------------------------------------------------------------------+
| 7-11 50 Baht   | 500    | 100   | Active | [Edit] [Del]         |
| Starbucks 100  | 1000   | 50    | Active | [Edit] [Del]         |
+------------------------------------------------------------------+
|                                        [Save Configuration]       |
+------------------------------------------------------------------+
```

### 3.3 System Tab (Super-Admin Only)

```
+------------------------------------------------------------------+
| System Settings                                    [Super Only]   |
+------------------------------------------------------------------+
| Risk Score Configuration                                          |
| Threshold for flagging companies:    [   50    ] (0-100)         |
| Info: Companies above threshold shown in "Flagged" tab           |
+------------------------------------------------------------------+
| Maintenance Mode                                                  |
| Status:                              [ OFF ] [ ON ]              |
| Message (when enabled):                                          |
| [System is under maintenance. Please try again later.          ] |
+------------------------------------------------------------------+
| Feature Flags                                                     |
| Auto content moderation:             [ OFF ] [ ON ]              |
| Bulk notifications:                  [ OFF ] [ ON ]              |
| Analytics export:                    [ OFF ] [ ON ]              |
+------------------------------------------------------------------+
|                                        [Save Settings]            |
+------------------------------------------------------------------+
```

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Source | Min Level |
|------|--------|-----------|
| Master Data | `getMasterData(category)` | admin |
| Loyalty Config | `getLoyaltyConfig()` | admin |
| Pockets | `getPockets()` | admin |
| System Settings | `getSystemSettings()` | super |

### 4.2 Master Data Shape

```typescript
interface MasterDataItem {
  uid: string;
  nameTh: string;
  nameEn: string;
  code: string;
  isActive: boolean;
  usageCount?: number;
  createdAt: number;
  updatedAt: number;
}
```

### 4.3 System Settings Shape

```typescript
interface SystemSettings {
  uid: 'admin_config';
  updatedBy: string;
  updatedAt: number;
  riskScoreThreshold: number;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  features: {
    autoContentModeration: boolean;
    bulkNotifications: boolean;
    analyticsExport: boolean;
  };
}
```

### 4.4 Write Operations

| Operation | Server Action | Min Level |
|-----------|---------------|-----------|
| Add Master Data | `addMasterDataItem(category, data)` | admin |
| Update Master Data | `updateMasterDataItem(id, data)` | admin |
| Delete Master Data | `deleteMasterDataItem(id)` | admin |
| Save Loyalty Config | `updateLoyaltyConfig(config)` | admin |
| Add Pocket | `addPocket(data)` | admin |
| Update Pocket | `updatePocket(id, data)` | admin |
| Delete Pocket | `deletePocket(id)` | admin |
| Save System Settings | `updateSystemSettings(settings)` | super |

---

## 5. State Contract

### 5.1 SWR Keys

```typescript
['admin', 'settings', 'master-data', category]
['admin', 'settings', 'loyalty']
['admin', 'settings', 'pockets']
['admin', 'settings', 'system']
```

### 5.2 Local State

```typescript
interface SettingsState {
  activeTab: 'master' | 'loyalty' | 'system';
  masterCategory: MasterDataCategory;
  editModal: { type: 'master' | 'pocket'; item: any } | null;
  hasUnsavedChanges: boolean;
  loyaltyForm: LoyaltyConfig;
  systemForm: SystemSettings;
}

type MasterDataCategory = 
  | 'job_functions' 
  | 'locations' 
  | 'industries' 
  | 'education' 
  | 'benefits';
```

---

## 6. UI State Machine

### 6.1 Settings Page State Machine

**States:** `LOADING`, `READY`, `EDITING`, `SAVING`, `ERROR`

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | always | setData(data) |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `READY` | `TAB_CHANGE` | `READY` | !hasUnsavedChanges | setActiveTab(tab) |
| `READY` | `TAB_CHANGE` | `CONFIRM_DISCARD` | hasUnsavedChanges | showDiscardDialog() |
| `CONFIRM_DISCARD` | `DISCARD` | `READY` | always | resetChanges(), setActiveTab(tab) |
| `CONFIRM_DISCARD` | `CANCEL` | `READY` | always | - |
| `READY` | `FORM_CHANGE` | `EDITING` | always | setHasUnsavedChanges(true) |
| `EDITING` | `SAVE` | `SAVING` | form.isValid | saveSettings() |
| `EDITING` | `SAVE` | `EDITING` | !form.isValid | showValidationErrors() |
| `EDITING` | `RESET` | `READY` | always | resetForm(), setHasUnsavedChanges(false) |
| `SAVING` | `SUCCESS` | `READY` | always | toast.success(), setHasUnsavedChanges(false) |
| `SAVING` | `ERROR` | `EDITING` | always | toast.error(err) |
| `ERROR` | `RETRY` | `LOADING` | always | refetch() |

### 6.2 Master Data Tab State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | always | setItems(items) |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `READY` | `CATEGORY_CHANGE` | `LOADING` | always | setCategory(cat), refetch() |
| `READY` | `SEARCH` | `READY` | always | filterItems(query) |
| `READY` | `ADD_CLICK` | `ADD_MODAL` | always | openAddModal() |
| `READY` | `EDIT_CLICK` | `EDIT_MODAL` | always | openEditModal(item) |
| `READY` | `DELETE_CLICK` | `DELETE_CONFIRM` | always | setTarget(item) |
| `ADD_MODAL` | `SUBMIT` | `SAVING` | form.isValid | addItem(data) |
| `ADD_MODAL` | `CANCEL` | `READY` | always | closeModal() |
| `EDIT_MODAL` | `SUBMIT` | `SAVING` | form.isValid | updateItem(id, data) |
| `EDIT_MODAL` | `CANCEL` | `READY` | always | closeModal() |
| `DELETE_CONFIRM` | `CONFIRM` | `DELETING` | usageCount === 0 | deleteItem(id) |
| `DELETE_CONFIRM` | `CONFIRM` | `DELETE_CONFIRM` | usageCount > 0 | showError('Item in use') |
| `DELETE_CONFIRM` | `CANCEL` | `READY` | always | - |
| `SAVING` | `SUCCESS` | `READY` | always | toast.success(), refetch(), closeModal() |
| `SAVING` | `ERROR` | Previous modal | always | toast.error(err) |
| `DELETING` | `SUCCESS` | `READY` | always | toast.success(), refetch() |
| `DELETING` | `ERROR` | `READY` | always | toast.error(err) |
| `ERROR` | `RETRY` | `LOADING` | always | refetch() |

### 6.3 Loyalty Tab State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | always | setConfig(config), setPockets(pockets) |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `READY` | `CONFIG_CHANGE` | `EDITING` | always | updateConfig(field, value), setHasChanges(true) |
| `READY` | `ADD_POCKET` | `POCKET_MODAL` | always | openPocketModal() |
| `READY` | `EDIT_POCKET` | `POCKET_MODAL` | always | openPocketModal(pocket) |
| `READY` | `DELETE_POCKET` | `DELETE_CONFIRM` | always | setTarget(pocket) |
| `EDITING` | `SAVE` | `SAVING` | config.isValid | saveConfig(config) |
| `EDITING` | `RESET` | `READY` | always | resetConfig(), setHasChanges(false) |
| `POCKET_MODAL` | `SUBMIT` | `SAVING_POCKET` | form.isValid | savePocket(data) |
| `POCKET_MODAL` | `CANCEL` | `READY` | always | closeModal() |
| `DELETE_CONFIRM` | `CONFIRM` | `DELETING` | always | deletePocket(id) |
| `DELETE_CONFIRM` | `CANCEL` | `READY` | always | - |
| `SAVING` | `SUCCESS` | `READY` | always | toast.success(), setHasChanges(false) |
| `SAVING` | `ERROR` | `EDITING` | always | toast.error(err) |
| `SAVING_POCKET` | `SUCCESS` | `READY` | always | toast.success(), refetchPockets() |
| `SAVING_POCKET` | `ERROR` | `POCKET_MODAL` | always | toast.error(err) |
| `DELETING` | `SUCCESS` | `READY` | always | toast.success(), refetchPockets() |
| `DELETING` | `ERROR` | `READY` | always | toast.error(err) |

### 6.4 System Tab State Machine (Super Only)

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | always | setSettings(settings) |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `LOADING` | `UNAUTHORIZED` | `BLOCKED` | adminLevel !== 'super' | - |
| `READY` | `THRESHOLD_CHANGE` | `EDITING` | value >= 0 && value <= 100 | setThreshold(value) |
| `READY` | `MAINTENANCE_TOGGLE` | `CONFIRM_MAINTENANCE` | toggling to ON | showMaintenanceWarning() |
| `READY` | `MAINTENANCE_TOGGLE` | `EDITING` | toggling to OFF | setMaintenance(false) |
| `CONFIRM_MAINTENANCE` | `CONFIRM` | `EDITING` | always | setMaintenance(true) |
| `CONFIRM_MAINTENANCE` | `CANCEL` | `READY` | always | - |
| `READY` | `FEATURE_TOGGLE` | `EDITING` | always | toggleFeature(feature) |
| `EDITING` | `SAVE` | `SAVING` | always | saveSystemSettings() |
| `EDITING` | `RESET` | `READY` | always | resetSettings() |
| `SAVING` | `SUCCESS` | `READY` | always | toast.success('Settings saved') |
| `SAVING` | `ERROR` | `EDITING` | always | toast.error(err) |

### 6.5 Add/Edit Item Modal State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `CLOSED` | `OPEN_ADD` | `OPEN` | always | initEmptyForm() |
| `CLOSED` | `OPEN_EDIT` | `OPEN` | always | initForm(item) |
| `OPEN` | `FIELD_CHANGE` | `OPEN` | always | updateField(name, value) |
| `OPEN` | `BLUR` | `VALIDATING` | always | validateField(name) |
| `VALIDATING` | `VALID` | `OPEN` | passes | clearError(name) |
| `VALIDATING` | `INVALID` | `OPEN` | fails | setError(name, err) |
| `OPEN` | `SUBMIT` | `SUBMITTING` | form.isValid | saveItem(data) |
| `OPEN` | `SUBMIT` | `OPEN` | !form.isValid | highlightErrors() |
| `OPEN` | `CANCEL` | `CLOSED` | always | resetForm() |
| `SUBMITTING` | `SUCCESS` | `CLOSED` | always | toast.success(), onSuccess() |
| `SUBMITTING` | `ERROR` | `OPEN` | always | toast.error(err) |

---

## 7. Master Data Categories

| Category | Collection | Fields |
|----------|------------|--------|
| Job Functions | `master_job_functions` | nameTh, nameEn, code, isActive |
| Locations | `master_locations` | nameTh, nameEn, code, province, isActive |
| Industries | `master_industries` | nameTh, nameEn, code, isActive |
| Education | `master_education` | nameTh, nameEn, code, level, isActive |
| Benefits | `master_benefits` | nameTh, nameEn, code, icon, isActive |

---

## 8. Validation Rules

### 8.1 Master Data

| Field | Rule |
|-------|------|
| nameTh | Required, max 100 chars |
| nameEn | Required, max 100 chars |
| code | Required, unique, alphanumeric |

### 8.2 Risk Threshold

| Field | Rule |
|-------|------|
| riskScoreThreshold | Integer, 0-100 |

### 8.3 Loyalty Points

| Field | Rule |
|-------|------|
| All point values | Integer, >= 0 |
| Exchange rate | Integer, > 0 |

---

## 9. Implementation Checklist

### Phase 1: Master Data Tab
- [ ] Create settings page with tabs
- [ ] Implement category selector
- [ ] Create master data list
- [ ] Implement add/edit modal
- [ ] Add delete with usage check

### Phase 2: Loyalty Tab
- [ ] Create points configuration form
- [ ] Implement pockets list
- [ ] Create add/edit pocket modal
- [ ] Add save functionality

### Phase 3: System Tab
- [ ] Create system settings form
- [ ] Implement risk threshold config
- [ ] Add maintenance mode toggle
- [ ] Implement feature flags

### Phase 4: Polish
- [ ] Add unsaved changes warning
- [ ] Implement form validation
- [ ] Add audit logging
- [ ] Test permission guards

---

## 10. Files to Create

| File | Purpose |
|------|---------|
| `src/app/(platform)/platform/settings/page.tsx` | Page |
| `src/domains/admin/components/settings/SettingsTabs.tsx` | Tab container |
| `src/domains/admin/components/settings/MasterDataTab.tsx` | Master data |
| `src/domains/admin/components/settings/MasterDataList.tsx` | Data list |
| `src/domains/admin/components/settings/MasterDataModal.tsx` | Add/edit modal |
| `src/domains/admin/components/settings/LoyaltyTab.tsx` | Loyalty config |
| `src/domains/admin/components/settings/PointsConfig.tsx` | Points settings |
| `src/domains/admin/components/settings/PocketList.tsx` | Rewards list |
| `src/domains/admin/components/settings/PocketModal.tsx` | Add/edit pocket |
| `src/domains/admin/components/settings/SystemTab.tsx` | System settings |
| `src/domains/admin/components/settings/RiskThresholdConfig.tsx` | Risk config |
| `src/domains/admin/components/settings/MaintenanceMode.tsx` | Maintenance toggle |
| `src/domains/admin/components/settings/FeatureFlags.tsx` | Feature toggles |
| `src/domains/admin/hooks/useMasterData.ts` | Master data hook |
| `src/domains/admin/hooks/useLoyaltyConfig.ts` | Loyalty hook |
| `src/domains/admin/hooks/useSystemSettings.ts` | System hook |

---

*End of ADM-R08 System Settings RIS v2.0*
