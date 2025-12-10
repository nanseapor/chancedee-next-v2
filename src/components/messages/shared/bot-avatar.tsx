export function BotAvatar() {
  return (
    <div
      className="flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center shadow-md"
      style={{
        background: `
          radial-gradient(at 0% 0%, rgba(249, 115, 22, 0.9) 0px, transparent 50%),
          linear-gradient(135deg, rgba(219, 103, 38, 1), rgba(249, 115, 22, 0.95))
        `,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="w-5 h-5 stroke-white"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 8V4H8" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" />
        <path d="M20 14h2" />
        <path d="M15 13v2" />
        <path d="M9 13v2" />
      </svg>
    </div>
  );
}
