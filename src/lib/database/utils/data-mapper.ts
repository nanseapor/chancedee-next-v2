import { Timestamp } from "firebase-admin/firestore";

// Convert Firebase timestamp to milliseconds
export function toMillis(timestamp?: Timestamp): number | undefined {
  return timestamp?.toMillis();
}

// Convert milliseconds to Firebase timestamp
export function toFirebaseTimestamp(millis?: number): Timestamp | undefined {
  return millis !== undefined ? Timestamp.fromMillis(millis) : undefined;
}

// Transform function type for field mapping
type TransformFunction<T> = (value: T) => any;

// Generic mapper function for Firebase to App model
export function mapFirebaseToAppModel<F, T>(
  firebaseModel: F,
  mapping: Record<string, string | TransformFunction<unknown>>,
  createTime?: number,
  updateTime?: number
): T {
  const result: Record<string, any> = {};

  // Map fields according to the mapping configuration
  for (const [firebaseField, appField] of Object.entries(mapping)) {
    if (firebaseModel[firebaseField as keyof F] !== undefined) {
      if (typeof appField === 'function') {
        result[firebaseField] = appField(firebaseModel[firebaseField as keyof F]);
      } else {
        result[appField] = firebaseModel[firebaseField as keyof F];
      }
    }
  }

  // Add standard fields
  result.createdAt = createTime || toMillis(firebaseModel['created_at' as keyof F] as unknown as Timestamp) || 0;
  result.updatedAt = updateTime || toMillis(firebaseModel['updated_at' as keyof F] as unknown as Timestamp) || 0;
  result.createdBy = firebaseModel['created_by' as keyof F];
  result.updatedBy = firebaseModel['updated_by' as keyof F];

  return result as T;
}

// Generic mapper function for App to Firebase model
export function mapAppToFirebaseModel<T, F>(
  appModel: T,
  mapping: Record<string, string | TransformFunction<unknown>>,
  actorId: string,
  isUpdate = false
): F {
  const result: Record<string, any> = {};

  // Map fields according to the mapping configuration
  for (const [appField, firebaseField] of Object.entries(mapping)) {
    if (appModel[appField as keyof T] !== undefined) {
      if (typeof firebaseField === 'function') {
        result[appField] = firebaseField(appModel[appField as keyof T]);
      } else {
        result[firebaseField] = appModel[appField as keyof T];
      }
    }
  }

  // Add standard fields
  if (!isUpdate) {
    result.created_by = actorId;
    result.created_at = Timestamp.now();
  }

  result.updated_by = actorId;
  result.updated_at = Timestamp.now();

  return result as F;
}