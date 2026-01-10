import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import GitLab from "next-auth/providers/gitlab";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/auth-utils";
import { z } from "zod";

// ============================================================================
// AUTH.JS CONFIGURATION
// ============================================================================

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,

  trustHost: true,
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login",
    verifyRequest: "/verify-request",
    newUser: "/app",
  },

  providers: [
    // OAuth Providers (only enabled if credentials are configured)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          allowDangerousEmailAccountLinking: true,
        })]
      : []),

    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [GitHub({
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          allowDangerousEmailAccountLinking: true,
        })]
      : []),

    ...(process.env.GITLAB_CLIENT_ID && process.env.GITLAB_CLIENT_SECRET
      ? [GitLab({
          clientId: process.env.GITLAB_CLIENT_ID,
          clientSecret: process.env.GITLAB_CLIENT_SECRET,
          allowDangerousEmailAccountLinking: true,
        })]
      : []),

    // Email OTP Provider
    Credentials({
      id: "email",
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            token: z.string().length(6),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, token } = parsedCredentials.data;

        // Verify OTP token
        const otpRecord = await prisma.oTPToken.findFirst({
          where: {
            email,
            token,
            expires: { gt: new Date() },
            used: false,
          },
        });

        if (!otpRecord) {
          return null;
        }

        // Mark token as used
        await prisma.oTPToken.update({
          where: { id: otpRecord.id },
          data: { used: true },
        });

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              emailVerified: new Date(),
            },
          });
        } else if (!user.emailVerified) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // ENFORCE: Only User table accounts can sign in to /app
      // ClientUser accounts MUST NOT use this auth flow
      if (!user.email) {
        return false;
      }

      // For OAuth providers, create user if doesn't exist
      if (account?.provider && ["google", "github", "gitlab"].includes(account.provider)) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              emailVerified: new Date(),
            },
          });
        }
        return true;
      }

      // For email OTP, user should already exist (created in authorize)
      const internalUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!internalUser) {
        return false;
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },

  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user.email}`);
    },
  },
});
