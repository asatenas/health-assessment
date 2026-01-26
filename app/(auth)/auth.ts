import { compare } from 'bcrypt-ts';
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getUser, getUserById } from '@/lib/db/queries';
import { authConfig } from './auth.config';
import { DUMMY_PASSWORD } from '@/lib/shared/constants';
import type { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      platformAdmin?: boolean;
    } & DefaultSession['user'];
    impersonation?: {
      originalUserId: string;
      targetUserId: string;
      targetEmail: string;
      targetClinicName: string | null;
      startedAt: Date;
    };
  }

  interface User {
    id?: string;
    email?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    platformAdmin?: boolean;
    impersonation?: {
      originalUserId: string;
      targetUserId: string;
      targetEmail: string;
      targetClinicName: string | null;
      startedAt: string;
    };
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const users = await getUser(email);

        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;

        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) return null;

        // Check if email is verified
        if (!user.emailVerified) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;

        // Fetch user from database to check platformAdmin status
        if (user.id) {
          const dbUser = await getUserById({ userId: user.id });
          if (dbUser?.platformAdmin) {
            token.platformAdmin = true;
          }
        }
      }

      // Handle session updates (used for starting/stopping impersonation)
      if (trigger === 'update' && session) {
        if (session.impersonation !== undefined) {
          token.impersonation = session.impersonation;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;

        // Only include platformAdmin if true (omit for regular users)
        if (token.platformAdmin) {
          session.user.platformAdmin = true;
        }

        // Include impersonation data if present
        if (token.impersonation) {
          session.impersonation = {
            ...token.impersonation,
            startedAt: new Date(token.impersonation.startedAt),
          };
        }
      }

      return session;
    },
  },
});
