import { SignIn } from "@clerk/nextjs"
import Logo from "@/components/ui/Logo"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0f0f12] flex flex-col items-center justify-center gap-6">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[400px] bg-[#7c6aff]/6 rounded-full blur-[140px]" />
      </div>
      <div className="relative z-10 flex items-center gap-3 mb-2">
        <Logo size={36} />
        <span className="text-white text-xl font-semibold tracking-tight">
          Collab<span className="text-[#00e5a0]">.io</span>
        </span>
      </div>
      <div className="relative z-10"><SignIn /></div>
    </div>
  )
}
