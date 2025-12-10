import type React from "react";

interface AvatarPlaceholderProps {
  size?: number;
}

const AvatarPlaceholder: React.FC<AvatarPlaceholderProps> = ({ size = 52 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="26"
        cy="26"
        r="25"
        fill="#E5E7EB"
        stroke="#D1D5DB"
        strokeWidth="2"
      />
      <path
        d="M26 28C29.3137 28 32 25.3137 32 22C32 18.6863 29.3137 16 26 16C22.6863 16 20 18.6863 20 22C20 25.3137 22.6863 28 26 28Z"
        fill="#9CA3AF"
      />
      <path
        d="M36 38C36 33.5817 31.5228 30 26 30C20.4772 30 16 33.5817 16 38"
        stroke="#9CA3AF"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default AvatarPlaceholder;
