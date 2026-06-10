export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="10" fill="#1c1c1c"/>
      <path d="M7 25 Q13 13 18 17 Q23 21 29 11" stroke="#ffffff" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      <path d="M7 29 Q13 19 18 22 Q23 25 29 17" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.25"/>
      <circle cx="29" cy="11" r="2.8" fill="#00e5a0"/>
    </svg>
  )
}
