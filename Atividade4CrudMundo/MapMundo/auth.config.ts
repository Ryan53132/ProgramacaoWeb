import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

export default {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        return null
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/Login",
  }
} satisfies NextAuthConfig