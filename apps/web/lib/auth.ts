import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";

const AUTH_SECRET_FALLBACK = "stadiumos-2026-fallback-secret-do-not-use-in-production";

function getSecret(): string {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || AUTH_SECRET_FALLBACK;
}

type UserRole = "super_admin" | "tournament_ops" | "stadium_manager" | "security_lead" | "mobility_lead" | "vendor_manager" | "volunteer_lead" | "support_agent" | "fan_user";

const demoUsers: Record<
  string,
  { id: string; name: string; role: UserRole; stadiumId: string | null }
> = {
  "admin@stadiumos.com": {
    id: "admin-1",
    name: "Ops-421",
    role: "super_admin",
    stadiumId: null,
  },
  "stadium@stadiumos.com": {
    id: "sm-1",
    name: "Ops-107",
    role: "stadium_manager",
    stadiumId: "metlife",
  },
};

async function getPrisma() {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma;
  } catch {
    return null;
  }
}

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const demoUser = demoUsers[credentials.email as string];
        if (demoUser && credentials.password === "password123") {
          return {
            id: demoUser.id,
            email: credentials.email as string,
            name: demoUser.name,
            role: demoUser.role,
            stadiumId: demoUser.stadiumId,
            language: "en",
          };
        }

        try {
          const prisma = await getPrisma();
          if (!prisma) return null;

          const user = await prisma.staffUser.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || user.isDeleted) return null;

          const valid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!valid) return null;

          await prisma.staffUser.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            stadiumId: user.stadiumId,
            language: user.language,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role;
        (token as any).stadiumId = (user as any).stadiumId;
        (token as any).language = (user as any).language || "en";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        (session.user as any).role = (token as any).role;
        (session.user as any).stadiumId = (token as any).stadiumId;
        (session.user as any).language = (token as any).language;
      }
      return session;
    },
  },
  secret: getSecret(),
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
});

/**
 * Get auth session from a Route Handler request using getToken().
 */
export async function getAuthFromRequest(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: getSecret(),
  });

  if (!token) return null;

  return {
    user: {
      id: token.sub!,
      email: token.email as string,
      name: token.name as string,
      role: (token.role as UserRole) ?? "fan_user",
      stadiumId: (token.stadiumId as string) ?? null,
      language: (token.language as string) ?? "en",
    },
  };
}
