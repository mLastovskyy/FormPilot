import { cn } from "@/lib/cn";

export function Logo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fp-logo-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand)" />
          <stop offset="1" stopColor="var(--brand-2)" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#fp-logo-bg)" />
      <path
        d="M53 13 L10 28 L30 35 Z"
        fill="#ffffff"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M53 13 L30 35 L34 54 Z"
        fill="#cdc4ff"
        stroke="#cdc4ff"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
