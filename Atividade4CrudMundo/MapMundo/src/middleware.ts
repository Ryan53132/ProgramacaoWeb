// middleware.ts
import authConfig from "../auth.config" 
import NextAuth from "next-auth"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith("/Menu") || req.nextUrl.pathname.startsWith("/dashboard")
  const isOnLoginPage = req.nextUrl.pathname.startsWith("/Login")

  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/Login", req.nextUrl))
  }

  if (isOnLoginPage && isLoggedIn) {
    return Response.redirect(new URL("/Menu", req.nextUrl))
  }
})

export const config = {
  matcher: ["/Menu/:path*","/dashboard/:path*", "/Login"],
}