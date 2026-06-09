import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0f0f12] flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[400px] bg-[#7c6aff]/6 rounded-full blur-[140px]" />
      </div>
      <SignIn />
    </div>
  )
}
