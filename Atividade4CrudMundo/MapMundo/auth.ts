import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/src/lib/prisma"
import bcrypt from "bcryptjs"

const nextAuthResult = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email as string
        const password = credentials?.password as string

        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user) return null

        const senhaBate = await bcrypt.compare(password, user.password)
        if (!senhaBate) return null

        return user
          ? { id: String(user.id), email: user.email, password: user.password }
          : null
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/Login", // Alinhado com o seu 'Login' maiúsculo do log
  }
})

// 2. Extraímos explicitamente cada propriedade do resultado
export const handlers = nextAuthResult.handlers
export const auth = nextAuthResult.auth
export const signIn = nextAuthResult.signIn
export const signOut = nextAuthResult.signOut
        
