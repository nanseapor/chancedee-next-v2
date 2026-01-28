import { formatThaiDate } from "@/lib/utils/date-th";

/**
 * Welcome Header Component
 * Per CAND-R01 RIS §3.2.1
 *
 * Displays:
 * - Greeting based on time of day + candidate name
 * - Current date in Thai format
 */

export interface WelcomeHeaderProps {
  firstName: string;
  lastName: string;
}

export function WelcomeHeader({ firstName, lastName }: WelcomeHeaderProps) {
  const now = new Date();
  const hour = now.getHours();

  // Determine greeting based on time
  let greeting = "สวัสดี"; // Default
  if (hour >= 5 && hour < 12) {
    greeting = "สวัสดีตอนเช้า"; // Good morning
  } else if (hour >= 12 && hour < 17) {
    greeting = "สวัสดีตอนบ่าย"; // Good afternoon
  } else if (hour >= 17 && hour < 21) {
    greeting = "สวัสดีตอนเย็น"; // Good evening
  } else {
    greeting = "สวัสดีตอนกลางคืน"; // Good night
  }

  const thaiDate = formatThaiDate(now, "medium");

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <h1 className="text-lg sm:text-2xl font-bold text-gray-900 break-words">
        {greeting}, {firstName} {lastName}
      </h1>
      <p className="text-sm text-gray-500 mt-1">{thaiDate}</p>
    </div>
  );
}
