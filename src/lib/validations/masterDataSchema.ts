import { DocumentReference, Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

// Assuming Tag is a simple string. If it's more complex, adjust accordingly.
// Create a custom validator for Firebase Timestamp
const firebaseTimestamp = z.custom<Timestamp>(
  (val) => val instanceof Timestamp,
  { message: "Expected Firebase Timestamp" },
);

const firebaseDocumentRef = z.custom<DocumentReference>(
  (val) => val instanceof DocumentReference,
  { message: "Expected Firebase DocumentReference" },
);

export const masterDataSchema = z.object({
  data: z
    .object({
      uid: z.string(),
      code: z.string(),
      label: z.string(),
      reference: z.string().optional(),
      icon: z.string().optional(),
      sort: z.number().optional(),
      members: z.string().array().optional(),
      is_active: z.boolean(),
      updated_at: firebaseTimestamp,
      created_at: firebaseTimestamp,
      updated_by: firebaseDocumentRef,
      created_by: firebaseDocumentRef,
    })
    .array(),
});

// Type inference
export type MasterData = z.infer<typeof masterDataSchema>;

// Usage example
export function validateMasterData(data: unknown): MasterData | null {
  try {
    return masterDataSchema.parse(data);
  } catch (error) {
    console.error("Invalid master data:", error);
    return null;
  }
}
