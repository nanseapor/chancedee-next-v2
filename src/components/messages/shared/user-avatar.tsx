import { User } from "lucide-react";

export function UserAvatar() {
  return (
    <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-md">
      <User className="w-5 h-5 text-white" strokeWidth={2} />
    </div>
  );
}
