import { FileQuestion } from "lucide-react";

export default function UserNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <FileQuestion className="w-24 h-24 text-muted-foreground mb-4" />
      <h1 className="text-3xl font-bold mb-2">User Information Not Found</h1>
      <p className="text-lg text-muted-foreground">
        We couldn't locate the user data you're looking for.
      </p>
    </div>
  );
}
