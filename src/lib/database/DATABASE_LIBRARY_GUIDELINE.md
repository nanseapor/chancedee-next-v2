# Firestore Database Access Library - Architecture Guideline

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Project:** chancedee-next

---

## Table of Contents

1. [Overview](#1-overview)
2. [Folder Structure](#2-folder-structure)
3. [Architecture Pattern](#3-architecture-pattern)
4. [Layer Descriptions](#4-layer-descriptions)
5. [File Relationships & Data Flow](#5-file-relationships--data-flow)
6. [Naming Conventions](#6-naming-conventions)
7. [Adding New Entities](#7-adding-new-entities)
8. [Best Practices](#8-best-practices)
9. [Performance Optimizations](#9-performance-optimizations)
10. [Improvement Opportunities](#10-improvement-opportunities)

---

## 1. Overview

This library provides a **type-safe, schema-first approach** to Firestore database access using Zod validation. It follows the **Repository Pattern** with clear separation between:

- **Firebase models** (snake_case, Firestore-native types)
- **App models** (camelCase, TypeScript-friendly types)

### Key Features

- ✅ Zod schema validation with type inference
- ✅ Automatic field transformation (Firebase ↔ App)
- ✅ Audit trail support (created_by, updated_by, timestamps)
- ✅ Batch operations for performance optimization
- ✅ Server actions for Next.js app router
- ✅ Selective critical field validation

---

## 2. Folder Structure

```
src/lib/database/
├── actions/                          # Server actions (API layer)
│   ├── address.ts
│   ├── admin-invite.ts
│   ├── candidate-information.ts
│   ├── candidate-preference.ts
│   ├── candidate-referral.ts
│   ├── candidate-screening.ts
│   ├── chats.ts
│   ├── company-information.ts
│   ├── company-requests.ts
│   ├── consent-records.ts
│   ├── contact.ts
│   ├── delete.ts
│   ├── fcm-token.ts
│   ├── job-applications.ts
│   ├── job-interviews.ts
│   ├── job-offers.ts
│   ├── jobs.ts
│   ├── messages.ts
│   ├── otp-codes.ts
│   ├── pockets-batch.ts
│   ├── pockets.ts
│   ├── user-accounts.ts
│   ├── user-info.ts
│   ├── user-transfer.ts
│   └── wallet-transactions.ts
│
├── repositories/                      # Data access layer
│   ├── interfaces/
│   │   └── repository.interface.ts    # Generic repository interface
│   ├── repository-factory.ts          # Factory for creating repositories
│   │
│   │   # Simple Repositories (single collection)
│   ├── address-repository.ts
│   ├── admin-invite-repository.ts
│   ├── candidate-information-repository.ts
│   ├── candidate-preference-repository.ts
│   ├── candidate-referral-repository.ts
│   ├── candidate-screening-repository.ts
│   ├── chat-repository.ts
│   ├── company-information-repository.ts
│   ├── company-requests-repository.ts
│   ├── consent-records-repository.ts
│   ├── contact-repository.ts
│   ├── delete-repository.ts
│   ├── fcm-token-repository.ts
│   ├── job-applications-repository.ts
│   ├── job-interviews-repository.ts
│   ├── job-offers-repository.ts
│   ├── jobs-repository.ts
│   ├── messages-repository.ts
│   ├── otp-codes-repository.ts
│   ├── pockets-repository.ts
│   ├── user-accounts-repository.ts
│   ├── user-info-repository.ts
│   ├── user-transfer-repository.ts
│   ├── wallet-transactions-repository.ts
│   │
│   │   # Composite Repositories (aggregate multiple collections)
│   ├── web-candidate-data-props.ts
│   ├── web-company-data-props.ts
│   ├── web-company-requests-data-props.ts
│   ├── web-job-data-props.ts
│   ├── web-master-data.ts
│   └── web-user-data-props.ts
│
├── schemas/                           # Zod schemas & type definitions
│   ├── base.schema.ts                 # Base schemas for all entities
│   ├── index.ts                       # Central export & registries
│   │
│   │   # Entity Schemas
│   ├── address.schema.ts
│   ├── admin-invitation.schema.ts
│   ├── candidate-information.schema.ts
│   ├── candidate-preference.schema.ts
│   ├── candidate-referral.schema.ts
│   ├── candidate-screening.schema.ts
│   ├── chat.schema.ts
│   ├── company-information.schema.ts
│   ├── company-requests.schema.ts
│   ├── consent-records.schema.ts
│   ├── contact.schema.ts
│   ├── delete.schema.ts
│   ├── fcm-token.schema.ts
│   ├── job-applications.schema.ts
│   ├── job-interviews.schema.ts
│   ├── job-offers.schema.ts
│   ├── jobs.schema.ts
│   ├── messages.schema.ts
│   ├── otp-codes.schema.ts
│   ├── pockets.schema.ts
│   ├── user-accounts.schema.ts
│   ├── user-info.schema.ts
│   ├── user-transfer.schema.ts
│   └── wallet-transactions.schema.ts
│
├── utils/                             # Utility functions
│   ├── data-mapper.ts                 # Generic field mapping utilities
│   ├── firebase-utils.ts              # Low-level Firestore operations
│   └── selective-validation.ts        # Critical field validation
│
├── batch-operations.ts                # Batch write utilities (N+1 prevention)
├── batch-reads.ts                     # Batch read utilities (chunked reads)
│
└── (data files)
    ├── new_data.json                  # (Development data)
    └── raw_database.json              # (Development data)
```

---

## 3. Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                             │
│                    (React Components, Server Components)                │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          ACTIONS LAYER                                  │
│                     (Server Actions - "use server")                     │
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │ user-accounts.ts│  │     jobs.ts     │  │  messages.ts    │   ...  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘        │
└───────────┼─────────────────────┼─────────────────────┼─────────────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        REPOSITORY LAYER                                 │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    repository-factory.ts                        │   │
│  │  createRepository<AppModel, FirebaseModel>(collection, ...)    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│  ┌───────────────────────────┼──────────────────────────────────────┐  │
│  │         SIMPLE REPOSITORIES         │   COMPOSITE REPOSITORIES   │  │
│  │  user-accounts-repository.ts        │  web-user-data-props.ts    │  │
│  │  jobs-repository.ts                 │  web-candidate-data-props  │  │
│  │  messages-repository.ts             │  web-company-data-props    │  │
│  │  ...                                │  web-job-data-props.ts     │  │
│  └─────────────────────────────────────┴────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
            │                                          │
            ▼                                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           UTILS LAYER                                   │
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │
│  │firebase-utils.ts│  │ data-mapper.ts  │  │selective-validation.ts │ │
│  │ getDocumentById │  │mapFirebaseToApp │  │validateCriticalFields  │ │
│  │ createDocument  │  │mapAppToFirebase │  │ batchValidate          │ │
│  │ updateDocument  │  │ toMillis        │  │ ValidationMetrics      │ │
│  │ deleteDocument  │  │toFirebaseTimestamp                          │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          SCHEMA LAYER                                   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      base.schema.ts                              │   │
│  │  BaseFirebaseSchema { uid, created_by, updated_by, timestamps } │   │
│  │  BaseAppSchema { uid, createdBy, updatedBy, createdAt, updatedAt}│   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│                    ┌─────────┴─────────┐                               │
│                    ▼                   ▼                               │
│  ┌─────────────────────┐    ┌─────────────────────┐                   │
│  │ FirebaseUserAccount │    │   UserDataProps     │                   │
│  │ Schema (snake_case) │    │ Schema (camelCase)  │                   │
│  │                     │    │                     │                   │
│  │ first_name_th       │◄──►│ firstnameTH         │                   │
│  │ is_active           │    │ isActive            │                   │
│  │ created_at          │    │ createdAt           │                   │
│  └─────────────────────┘    └─────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          FIRESTORE                                      │
│                     (Firebase Admin SDK)                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Layer Descriptions

### 4.1 Schemas Layer (`/schemas`)

**Purpose:** Define data structures and validation rules using Zod.

**Key Files:**

| File | Purpose |
|------|---------|
| `base.schema.ts` | Base schemas inherited by all entities |
| `index.ts` | Central exports, schema registry, critical fields registry |
| `{entity}.schema.ts` | Entity-specific schemas |

**Schema Types per Entity:**

```typescript
// 1. Firebase Schema (what's stored in Firestore)
export const FirebaseUserAccountSchema = UserAccountBaseSchema.extend({
  first_name_th: z.string().optional(),
  is_active: z.boolean(),
  // ... snake_case fields
});

// 2. App Schema (what's used in the application)
export const UserDataPropsSchema = BaseAppSchema.extend({
  firstnameTH: z.string().optional(),
  isActive: z.boolean(),
  // ... camelCase fields
});

// 3. Critical Schema (subset for validation)
export const UserAccountCriticalSchema = FirebaseUserAccountSchema.pick({
  uid: true,
  is_active: true,
  status: true,
});

// 4. Type Exports
export type FirebaseUserAccountType = z.infer<typeof FirebaseUserAccountSchema>;
export type UserDataProps = z.infer<typeof UserDataPropsSchema>;
```

### 4.2 Repositories Layer (`/repositories`)

**Purpose:** Handle data access, transformation, and CRUD operations.

#### 4.2.1 Simple Repositories

Handle single Firestore collection operations.

```typescript
// user-accounts-repository.ts
import { createRepository } from "./repository-factory";

function transformToAppModel(firebase, createTime, updateTime) {
  return {
    uid: firebase.uid,
    firstnameTH: firebase.first_name_th,  // snake_case → camelCase
    isActive: firebase.is_active,
    createdAt: createTime || 0,
    // ...
  };
}

function transformToFirebaseModel(app, actorId, isUpdate) {
  return {
    uid: app.uid,
    first_name_th: app.firstnameTH,  // camelCase → snake_case
    is_active: app.isActive,
    // ...
  };
}

export const userAccountsRepository = createRepository<AppModel, FirebaseModel>(
  "user_accounts",
  transformToAppModel,
  transformToFirebaseModel,
);
```

#### 4.2.2 Composite Repositories (`web-*-data-props.ts`)

Aggregate data from multiple collections into a unified view.

```typescript
// web-user-data-props.ts
export const getUserDataPropsById = async (uid: string) => {
  // Fetches from: user_accounts, user_info, user_transfer
  const completeData = await webUserAccountGetCompleteById(uid);
  
  return {
    ...userData,
    info: { ...userInfo },
    transfer: { ...userTransfer },
  };
};
```

### 4.3 Actions Layer (`/actions`)

**Purpose:** Provide server-side API functions using Next.js server actions.

```typescript
// user-accounts.ts
"use server";

import { userAccountsRepository } from "../repositories/user-accounts-repository";

export const webUserAccountGetById = async (uid: string) => {
  return await userAccountsRepository.getById(uid);
};

export const webUserAccountCreate = async (payload, actorId, uid?) => {
  return await userAccountsRepository.create(payload, actorId, uid);
};
```

### 4.4 Utils Layer (`/utils`)

| File | Purpose |
|------|---------|
| `firebase-utils.ts` | Low-level Firestore CRUD operations |
| `data-mapper.ts` | Generic field transformation utilities |
| `selective-validation.ts` | Critical field validation for performance |

### 4.5 Batch Operations

| File | Purpose |
|------|---------|
| `batch-operations.ts` | Parallel fetch utilities (prevents N+1 queries) |
| `batch-reads.ts` | Chunked batch reads respecting Firestore limits |

---

## 5. File Relationships & Data Flow

### 5.1 Entity File Relationship

For each entity (e.g., `user-accounts`), the files relate as follows:

```
┌─────────────────────────────────────────────────────────────────┐
│              SCHEMA: user-accounts.schema.ts                    │
│  ┌─────────────────────┐     ┌─────────────────────┐           │
│  │ FirebaseUserAccount │     │   UserDataProps     │           │
│  │ Schema              │     │   Schema            │           │
│  └──────────┬──────────┘     └──────────┬──────────┘           │
└─────────────┼──────────────────────────────┼────────────────────┘
              │                              │
              │         TRANSFORMS           │
              ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│           REPOSITORY: user-accounts-repository.ts               │
│                                                                 │
│  transformToAppModel()      transformToFirebaseModel()          │
│        │                              │                         │
│        ▼                              ▼                         │
│  userAccountsRepository = createRepository(...)                 │
│    .getById()                                                   │
│    .getByFilter()                                               │
│    .create()                                                    │
│    .update()                                                    │
│    .delete()                                                    │
└─────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│              ACTION: user-accounts.ts                           │
│                                                                 │
│  "use server"                                                   │
│                                                                 │
│  webUserAccountGetById()                                        │
│  webUserAccountGetByFilter()                                    │
│  webUserAccountCreate()                                         │
│  webUserAccountUpdate()                                         │
│  webUserAccountGetCompleteById()  // Optimized consolidated     │
└─────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│      COMPOSITE: web-user-data-props.ts (optional)               │
│                                                                 │
│  Aggregates: user-accounts + user-info + user-transfer          │
│  getUserDataPropsById()                                         │
│  updateUserDataProps()                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Import Dependency Graph

```
┌──────────────────────────────────────────────────────────────────────┐
│                         APPLICATION CODE                             │
│            (React Components, API Routes, Server Components)         │
└─────────────────────────────────────────────────────────────────────┘
                │
                │ imports
                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                            ACTIONS                                   │
│  actions/user-accounts.ts  ───────────────────────────────┐          │
│  actions/jobs.ts                                          │          │
│  actions/messages.ts                                      │          │
└───────────────────────────────────────────────────────────┼──────────┘
                │                                           │
                │ imports                                   │
                ▼                                           │
┌──────────────────────────────────────────────────────────┐│          │
│                      REPOSITORIES                         ││         │
│                                                           ││         │
│  repositories/user-accounts-repository.ts ◄───────────────┘│         │
│       │                                                    │         │
│       │ imports                                            │         │
│       ▼                                                    │         │
│  repositories/repository-factory.ts                        │         │
│       │                                                    │         │
└───────┼────────────────────────────────────────────────────┘         │
        │                                                              │
        │ imports                                                      │
        ▼                                                              │
┌──────────────────────────────────────────────────────────────────────┐
│                            UTILS                                     │
│  utils/firebase-utils.ts  ◄──────────────────────────────────────────┤
│  utils/data-mapper.ts                                                │
│  utils/selective-validation.ts                                       │
└──────────────────────────────────────────────────────────────────────┘
        │
        │ imports
        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                           SCHEMAS                                    │
│  schemas/base.schema.ts                                              │
│  schemas/user-accounts.schema.ts                                     │
│  schemas/index.ts                                                    │
└──────────────────────────────────────────────────────────────────────┘
        │
        │ imports
        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL DEPENDENCIES                           │
│  firebase-admin/firestore (Timestamp, DocumentReference, Filter)     │
│  zod (z)                                                             │
│  @/lib/firebase/firebase-admin (getFirebaseAdminFirestore)           │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 6. Naming Conventions

### 6.1 File Naming

| Layer | Pattern | Example |
|-------|---------|---------|
| Schema | `{entity}.schema.ts` | `user-accounts.schema.ts` |
| Repository | `{entity}-repository.ts` | `user-accounts-repository.ts` |
| Action | `{entity}.ts` | `user-accounts.ts` |
| Composite | `web-{entity}-data-props.ts` | `web-user-data-props.ts` |

### 6.2 Schema Naming

| Type | Pattern | Example |
|------|---------|---------|
| Firebase Schema | `Firebase{Entity}Schema` | `FirebaseUserAccountSchema` |
| App Schema | `{Entity}DataSchema` | `UserDataPropsSchema` |
| Critical Schema | `{Entity}CriticalSchema` | `UserAccountCriticalSchema` |
| Type | `Firebase{Entity}Type` or `{Entity}Data` | `FirebaseUserAccountType`, `UserDataProps` |

### 6.3 Function Naming

| Layer | Pattern | Example |
|-------|---------|---------|
| Action | `web{Entity}{Action}` | `webUserAccountGetById` |
| Repository | Method names follow IRepository | `getById`, `create`, `update` |
| Transform | `transformTo{Target}Model` | `transformToAppModel`, `transformToFirebaseModel` |

### 6.4 Field Naming

| Context | Case | Example |
|---------|------|---------|
| Firebase (Firestore) | snake_case | `first_name_th`, `is_active`, `created_at` |
| App (TypeScript) | camelCase | `firstnameTH`, `isActive`, `createdAt` |

---

## 7. Adding New Entities

### Step 1: Create Schema (`schemas/{entity}.schema.ts`)

```typescript
import { z } from 'zod';
import { BaseFirebaseSchema, BaseAppSchema } from './base.schema';

// Firebase Schema (Firestore structure)
export const FirebaseNewEntitySchema = BaseFirebaseSchema.extend({
  field_name: z.string(),
  is_enabled: z.boolean(),
  // Add entity-specific fields
});

// App Schema (Application structure)
export const NewEntityDataSchema = BaseAppSchema.extend({
  fieldName: z.string(),
  isEnabled: z.boolean(),
  // Mirror fields with camelCase
});

// Critical Schema (for validation)
export const NewEntityCriticalSchema = FirebaseNewEntitySchema.pick({
  uid: true,
  is_enabled: true,
});

// Export types
export type FirebaseNewEntityType = z.infer<typeof FirebaseNewEntitySchema>;
export type NewEntityData = z.infer<typeof NewEntityDataSchema>;
```

### Step 2: Export from Index (`schemas/index.ts`)

```typescript
export {
  FirebaseNewEntitySchema,
  NewEntityDataSchema,
  NewEntityCriticalSchema,
  type FirebaseNewEntityType,
  type NewEntityData,
} from './new-entity.schema';

// Add to schemaRegistry
export const schemaRegistry = {
  // ...existing
  newEntity: () => import('./new-entity.schema'),
};

// Add to criticalFieldsRegistry
export const criticalFieldsRegistry = {
  // ...existing
  new_entity: {
    firebase: () => import('./new-entity.schema').then(m => m.NewEntityCriticalSchema),
    app: () => import('./new-entity.schema').then(m => m.NewEntityDataSchema.pick({ /* ... */ })),
  },
};
```

### Step 3: Create Repository (`repositories/{entity}-repository.ts`)

```typescript
import { IRepository } from "./interfaces/repository.interface";
import { createRepository } from "./repository-factory";
import { FirebaseNewEntityType, NewEntityData } from "../schemas/new-entity.schema";

function transformToAppModel(
  firebase: FirebaseNewEntityType,
  createTime?: number,
  updateTime?: number
): NewEntityData {
  return {
    uid: firebase.uid,
    fieldName: firebase.field_name,
    isEnabled: firebase.is_enabled,
    createdBy: firebase.created_by?.id || "",
    updatedBy: firebase.updated_by?.id || "",
    createdAt: createTime || 0,
    updatedAt: updateTime || 0,
  };
}

function transformToFirebaseModel(
  app: NewEntityData,
  actorId: string,
  isUpdate = false
): FirebaseNewEntityType {
  return {
    uid: app.uid,
    field_name: app.fieldName,
    is_enabled: app.isEnabled,
    // Timestamps handled by firebase-utils
  };
}

export const newEntityRepository: IRepository<NewEntityData> =
  createRepository<NewEntityData, FirebaseNewEntityType>(
    "new_entity",  // Firestore collection name
    transformToAppModel,
    transformToFirebaseModel,
  );
```

### Step 4: Create Actions (`actions/{entity}.ts`)

```typescript
"use server";

import { Filter } from "firebase-admin/firestore";
import { newEntityRepository } from "../repositories/new-entity-repository";
import { NewEntityData } from "../schemas/new-entity.schema";

export const webNewEntityGetById = async (uid: string) => {
  return await newEntityRepository.getById(uid);
};

export const webNewEntityGetByFilter = async (filter?: Filter) => {
  return await newEntityRepository.getByFilter(filter);
};

export const webNewEntityCreate = async (
  payload: NewEntityData,
  actorId: string,
  uid?: string
) => {
  return await newEntityRepository.create(payload, actorId, uid);
};

export const webNewEntityUpdate = async (
  payload: NewEntityData,
  actorId: string,
  uid: string
) => {
  return await newEntityRepository.update(uid, payload, actorId);
};

export const webNewEntityDelete = async (uid: string) => {
  return await newEntityRepository.delete(uid);
};
```

---

## 8. Best Practices

### 8.1 Schema Design

- ✅ Always extend `BaseFirebaseSchema` or `UserAccountBaseSchema`
- ✅ Define separate Firebase and App schemas
- ✅ Create Critical schemas for performance-sensitive validations
- ✅ Use `z.custom<Type>()` for Firestore-specific types (Timestamp, DocumentReference)
- ✅ Export all types using `z.infer<typeof Schema>`

### 8.2 Repository Design

- ✅ Use `createRepository` factory for consistency
- ✅ Transform ALL fields in transform functions
- ✅ Handle `DocumentReference` → string ID conversion
- ✅ Handle `Timestamp` → number (milliseconds) conversion
- ✅ Always validate required fields with null checks

### 8.3 Action Design

- ✅ Mark all action files with `"use server";`
- ✅ Wrap repository calls in try-catch
- ✅ Use descriptive function names: `web{Entity}{Action}`
- ✅ Consider consolidated queries for related data (like `webUserAccountGetCompleteById`)

### 8.4 Error Handling

```typescript
try {
  return await repository.getById(uid);
} catch (e) {
  const error = e as Error;
  console.error(`Operation failed:`, error.message);
  throw error;  // Re-throw for caller handling
}
```

### 8.5 Type Safety

- ✅ Always use typed function parameters
- ✅ Use `Filter` type from `firebase-admin/firestore`
- ✅ Leverage Zod's type inference instead of manual types

---

## 9. Performance Optimizations

### 9.1 Consolidated Queries

Reduce multiple queries to a single read:

```typescript
// ❌ Before: 3 separate queries
const userData = await webUserAccountGetById(uid);
const userInfo = await webUserInfoGetById(uid);
const userTransfer = await webUserTransferGetById(uid);

// ✅ After: 1 consolidated query
const completeData = await webUserAccountGetCompleteById(uid);
```

### 9.2 Batch Operations

Use batch utilities for multiple documents:

```typescript
// ❌ Before: N+1 query pattern
const companies = await Promise.all(
  companyIds.map(id => getCompanyById(id))
);

// ✅ After: Parallel batch fetch
const companiesMap = await getCompaniesByIds(companyIds);
```

### 9.3 Field-Level Updates

The library uses `update()` instead of `set(merge: true)` to avoid preliminary reads:

```typescript
// firebase-utils.ts - updateDocument
await docRef.update(dataToWrite);  // No preliminary read needed
```

### 9.4 Selective Validation

For performance-critical paths, validate only essential fields:

```typescript
const result = await validateCriticalFields<UserData>(
  'user_accounts',
  rawData,
  { type: 'firebase', throwOnCriticalError: true }
);
```

---

## 10. Advanced Features (December 2025 Update)

### 10.1 Transaction Support

**Status:** ✅ Implemented
**Location:** `src/lib/database/utils/transaction-utils.ts`

Atomic operations across multiple collections with automatic rollback:

```typescript
import { runTransaction, createTransactionalOperations } from '../utils/transaction-utils';

// Example: Create user with all related data atomically
await runTransaction(async (ctx) => {
  const ops = createTransactionalOperations(ctx, actorId);

  ops.create('user_accounts', userId, userData);
  ops.create('user_info', userId, userInfo);
  ops.create('user_transfer', userId, transferData);

  // All succeed or all fail together
});
```

**Key Features:**
- All-or-nothing execution
- Automatic rollback on failure
- Actor-based audit trail integration
- Helper methods for CRUD operations

### 10.2 Custom Error Classes

**Status:** ✅ Implemented
**Location:** `src/lib/database/errors/repository-errors.ts`

Typed error hierarchy with full context:

```typescript
import { DocumentNotFoundError, ValidationError, wrapError } from '../errors';

// Specific error types
throw new DocumentNotFoundError('users', 'user123');
throw new ValidationError('users', 'create', ['email is required']);

// Auto-wrapping for consistent error handling
try {
  await operation();
} catch (error) {
  throw wrapError(error, 'users', 'update', documentId);
}
```

**Available Error Classes:**
- `RepositoryError` - Base error with context
- `DocumentNotFoundError` - Document doesn't exist
- `ValidationError` - Schema validation failure
- `DuplicateDocumentError` - Document already exists
- `PermissionDeniedError` - Access denied
- `TransactionError` - Transaction failure
- `QueryError` - Query execution failure
- `ConnectionError` - Network/connection issues

### 10.3 Field Mapping Utilities

**Status:** ✅ Implemented
**Location:** `src/lib/database/utils/field-mapping.ts`

Declarative field transformations to reduce boilerplate:

```typescript
import { createTransformFunctions, transformers } from '../utils/field-mapping';

const fieldMap: EntityFieldMap = {
  collectionName: 'user_accounts',
  fields: [
    { firebase: 'first_name', app: 'firstName' },
    { firebase: 'is_active', app: 'isActive' },
    {
      firebase: 'created_at',
      app: 'createdAt',
      toApp: transformers.timestampToMillis,
      toFirebase: transformers.millisToTimestamp
    },
  ],
};

const { toApp, toFirebase } = createTransformFunctions(fieldMap);
```

**Common Transformers:**
- `docRefToId` / `docRefToIdOptional`
- `timestampToMillis` / `millisToTimestamp`
- `createUserRef` / `createDocRef`
- `defaultEmpty` / `defaultEmptyArray`
- `defaultFalse` / `defaultTrue`

### 10.4 Pagination Support

**Status:** ✅ Implemented
**Location:** `src/lib/database/repositories/interfaces/repository.interface.ts`

Cursor-based pagination for large datasets:

```typescript
// Get first page
const page1 = await repository.getByFilterPaginated({
  filter: Filter.where('status', '==', 'active'),
  pagination: {
    limit: 20,
    orderBy: 'created_at',
    orderDirection: 'desc'
  }
});

// Get next page
const page2 = await repository.getByFilterPaginated({
  pagination: {
    limit: 20,
    cursor: page1.nextCursor, // Use cursor from previous page
  }
});

console.log(page1.hasMore); // true
console.log(page1.data.length); // 20
console.log(page2.hasMore); // false
```

**Features:**
- Cursor-based navigation (efficient, consistent)
- Automatic `hasMore` detection
- Configurable page size (max: 100)
- Custom ordering support
- Optional document count

### 10.5 Caching Layer

**Status:** ✅ Implemented
**Location:** `src/lib/database/cache/`

In-memory caching with automatic invalidation:

```typescript
import { createCachedRepository, getCache } from '../cache';

// Wrap any repository with caching
const cachedRepo = createCachedRepository(
  userRepository,
  'user_accounts',
  {
    getByIdTtl: 5 * 60 * 1000,    // 5 minutes
    getByFilterTtl: 60 * 1000,     // 1 minute
    cacheNulls: false              // Don't cache null results
  }
);

// Use as normal - caching is transparent
const user = await cachedRepo.getById('user123'); // Cached
const user2 = await cachedRepo.getById('user123'); // From cache

// Writes automatically invalidate cache
await cachedRepo.update('user123', userData, actorId); // Cache cleared
```

**Cache Features:**
- TTL (time-to-live) expiration
- LRU-style eviction when full
- Pattern-based invalidation
- Automatic invalidation on writes
- Configurable null result caching

**Manual Cache Control:**
```typescript
const cache = getCache();

cache.delete('user_accounts:getById:user123');
cache.invalidatePattern('user_accounts:*');
cache.clear();
```

### 10.6 Real-time Subscriptions

**Status:** ✅ Implemented
**Location:** `src/lib/database/subscriptions/subscription-manager.ts`

Managed Firestore listeners with automatic cleanup:

```typescript
import { getSubscriptionManager } from '../subscriptions/subscription-manager';

const manager = getSubscriptionManager();

// Subscribe to a document
const unsubscribe = manager.subscribeToDocument<User, FirebaseUser>(
  'user_accounts',
  'user123',
  transformToApp,
  {
    onNext: (user) => {
      console.log('User updated:', user);
    },
    onError: (error) => {
      console.error('Subscription error:', error);
    }
  }
);

// Subscribe to a query
const unsubscribe2 = manager.subscribeToQuery<User, FirebaseUser>(
  'user_accounts',
  transformToApp,
  {
    onNext: (users) => {
      console.log('Users updated:', users);
    }
  },
  {
    filter: Filter.where('is_active', '==', true),
    orderBy: { field: 'created_at', direction: 'desc' },
    limit: 10
  }
);

// Cleanup
unsubscribe();
manager.unsubscribeAll(); // Cleanup all subscriptions
```

**Or use repository extension:**
```typescript
import { createSubscriptionExtension } from '../subscriptions/subscription-manager';

const userSubscriptions = createSubscriptionExtension(
  'user_accounts',
  transformToApp
);

const unsubscribe = userSubscriptions.subscribeById(
  'user123',
  {
    onNext: (user) => console.log(user)
  }
);
```

### 10.7 Middleware/Hooks System

**Status:** ✅ Implemented
**Location:** `src/lib/database/middleware/repository-middleware.ts`

Pre/post operation hooks for logging, validation, and more:

```typescript
import { withMiddleware, createLoggingHooks, createValidationHooks } from '../middleware';

// Add logging to repository
const loggedRepo = withMiddleware(
  userRepository,
  'user_accounts',
  createLoggingHooks('UserRepo')
);

// Add validation
const validatedRepo = withMiddleware(
  userRepository,
  'user_accounts',
  createValidationHooks((data) => {
    if (!data.email) {
      return { valid: false, errors: ['Email is required'] };
    }
    return { valid: true };
  })
);

// Custom hooks
const customRepo = withMiddleware(
  userRepository,
  'user_accounts',
  {
    beforeCreate: async (ctx) => {
      console.log('Creating user:', ctx.data);
      // Send analytics event, etc.
    },
    afterCreate: async (ctx, result) => {
      console.log('User created:', result);
      // Clear cache, send notification, etc.
    },
    onError: async (ctx, error) => {
      console.error('Operation failed:', error);
      // Send to error tracking service
    }
  }
);

// Combine multiple hooks
import { combineHooks } from '../middleware';

const fullRepo = withMiddleware(
  userRepository,
  'user_accounts',
  combineHooks(
    createLoggingHooks(),
    createValidationHooks(validator),
    customHooks
  )
);
```

**Available Hooks:**
- `beforeCreate` / `afterCreate`
- `beforeRead` / `afterRead`
- `beforeUpdate` / `afterUpdate`
- `beforeDelete` / `afterDelete`
- `onError`

### 10.8 Updated Folder Structure

```
src/lib/database/
├── cache/                           # ✨ NEW: Caching layer
│   ├── cache-provider.ts
│   ├── cached-repository.ts
│   └── index.ts
│
├── errors/                          # ✨ NEW: Custom errors
│   ├── repository-errors.ts
│   └── index.ts
│
├── middleware/                      # ✨ NEW: Hooks system
│   ├── repository-middleware.ts
│   └── index.ts
│
├── subscriptions/                   # ✨ NEW: Real-time
│   └── subscription-manager.ts
│
├── utils/                           # Enhanced utilities
│   ├── field-mapping.ts             # ✨ NEW
│   ├── transaction-utils.ts         # ✨ NEW
│   ├── firebase-utils.ts            # Updated with errors
│   ├── data-mapper.ts
│   └── selective-validation.ts
│
├── repositories/                    # Enhanced
│   ├── interfaces/
│   │   └── repository.interface.ts  # ✨ Updated with pagination
│   ├── repository-factory.ts        # ✨ Updated with pagination
│   └── ...
│
└── [existing files]
```

### 10.9 Migration from Old to New Features

#### Adding Transactions to Existing Code

**Before:**
```typescript
await Promise.all([
  createUserAccount(data, actorId),
  createUserInfo(info, actorId),
  createUserTransfer(transfer, actorId)
]);
// ⚠️ If one fails, others might succeed - inconsistent state!
```

**After:**
```typescript
import { runTransaction, createTransactionalOperations } from '../utils/transaction-utils';

await runTransaction(async (ctx) => {
  const ops = createTransactionalOperations(ctx, actorId);
  ops.create('user_accounts', userId, data);
  ops.create('user_info', userId, info);
  ops.create('user_transfer', userId, transfer);
  // ✅ All succeed or all fail - atomic!
});
```

#### Adding Error Handling

**Before:**
```typescript
try {
  const user = await getUser(id);
} catch (e) {
  console.error('Error:', e);
  // Generic error, no context
}
```

**After:**
```typescript
import { DocumentNotFoundError, isDocumentNotFoundError } from '../errors';

try {
  const user = await getUser(id);
} catch (error) {
  if (isDocumentNotFoundError(error)) {
    // Handle specific error type
    console.log(`User ${error.documentId} not found in ${error.collection}`);
  }
  throw error; // Re-throw with full context
}
```

#### Adding Pagination

**Before:**
```typescript
const allUsers = await repository.getByFilter(filter);
// ⚠️ Loads all documents - can be slow/expensive
```

**After:**
```typescript
const page = await repository.getByFilterPaginated({
  filter,
  pagination: { limit: 20 }
});
// ✅ Only loads 20 documents
```

#### Adding Caching

**Before:**
```typescript
const repository = userAccountsRepository;
// Every call hits Firestore
```

**After:**
```typescript
import { createCachedRepository } from '../cache';

const repository = createCachedRepository(
  userAccountsRepository,
  'user_accounts'
);
// Reads are cached, writes auto-invalidate
```

---

## 11. Removed/Completed Improvements

The following items from the original "Improvement Opportunities" section have been **implemented** (December 2025):

| Original Suggestion | Status | New Location |
|---------------------|--------|--------------|
| Caching layer | ✅ Completed | Section 10.5 |
| Transaction support | ✅ Completed | Section 10.1 |
| Custom error classes | ✅ Completed | Section 10.2 |
| Pagination support | ✅ Completed | Section 10.4 |
| Real-time listener support | ✅ Completed | Section 10.6 |
| Middleware/hooks for operations | ✅ Completed | Section 10.7 |

### 11.1 Remaining Improvement Opportunities

| Area | Suggestion | Priority |
|------|------------|----------|
| **Code Generation** | Auto-generate repository/action boilerplate from schemas | High |
| **Testing** | Add unit tests with Firestore emulator | High |
| **Query Builder** | Type-safe query builder for complex filters | Medium |
| **Migration Tool** | Schema migration utilities for Firestore | Low |
| **Monitoring** | Integrate with APM (Application Performance Monitoring) | Medium |
| **Documentation** | Generate API docs from schema/type definitions | Low |
| **Field Mapping Adoption** | Convert more repositories to use declarative field mapping | Medium |

---

## Appendix A: Collection Reference

| Collection Name | Schema File | Repository | Action |
|-----------------|-------------|------------|--------|
| `user_accounts` | user-accounts.schema.ts | user-accounts-repository.ts | user-accounts.ts |
| `user_info` | user-info.schema.ts | user-info-repository.ts | user-info.ts |
| `user_transfer` | user-transfer.schema.ts | user-transfer-repository.ts | user-transfer.ts |
| `candidate_information` | candidate-information.schema.ts | candidate-information-repository.ts | candidate-information.ts |
| `candidate_preference` | candidate-preference.schema.ts | candidate-preference-repository.ts | candidate-preference.ts |
| `candidate_referral` | candidate-referral.schema.ts | candidate-referral-repository.ts | candidate-referral.ts |
| `candidate_screening` | candidate-screening.schema.ts | candidate-screening-repository.ts | candidate-screening.ts |
| `company_information` | company-information.schema.ts | company-information-repository.ts | company-information.ts |
| `company_requests` | company-requests.schema.ts | company-requests-repository.ts | company-requests.ts |
| `jobs` | jobs.schema.ts | jobs-repository.ts | jobs.ts |
| `job_applications` | job-applications.schema.ts | job-applications-repository.ts | job-applications.ts |
| `job_interviews` | job-interviews.schema.ts | job-interviews-repository.ts | job-interviews.ts |
| `job_offers` | job-offers.schema.ts | job-offers-repository.ts | job-offers.ts |
| `chats` | chat.schema.ts | chat-repository.ts | chats.ts |
| `messages` | messages.schema.ts | messages-repository.ts | messages.ts |
| `pockets` | pockets.schema.ts | pockets-repository.ts | pockets.ts |
| `wallet_transactions` | wallet-transactions.schema.ts | wallet-transactions-repository.ts | wallet-transactions.ts |
| `fcm_tokens` | fcm-token.schema.ts | fcm-token-repository.ts | fcm-token.ts |
| `otp_codes` | otp-codes.schema.ts | otp-codes-repository.ts | otp-codes.ts |
| `consent_records` | consent-records.schema.ts | consent-records-repository.ts | consent-records.ts |
| `addresses` | address.schema.ts | address-repository.ts | address.ts |
| `contacts` | contact.schema.ts | contact-repository.ts | contact.ts |
| `admin_invitations` | admin-invitation.schema.ts | admin-invite-repository.ts | admin-invite.ts |
| `delete_requests` | delete.schema.ts | delete-repository.ts | delete.ts |

---

## Appendix B: IRepository Interface

```typescript
interface IRepository<T> {
  getById(id: string): Promise<T | null>;
  getByFilter(filter?: Filter): Promise<T[] | null>;
  create(model: T, actorId: string, id?: string): Promise<string>;
  update(id: string, model: T, actorId: string): Promise<string>;
  delete(id: string): Promise<void>;
  deleteByFilter(field: string, value: string): Promise<boolean>;
  generateId(): string;
}
```

---

*This guideline is maintained by the development team. For questions or updates, please contact the architecture team.*
