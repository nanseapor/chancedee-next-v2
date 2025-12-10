export interface FirebaseAuthError {
  code: string;
  message: string;
}

export function isFirebaseAuthError(
  error: unknown,
): error is FirebaseAuthError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as Record<string, unknown>).code === "string"
  );
}
