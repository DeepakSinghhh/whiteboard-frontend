import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Protect dashboard and API routes — board rooms are public by default
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/boards(.*)",
])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
