import { compare } from 'bcrypt-ts';
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import {
  getUser,
  getUserById,
  getClinicByUserId,
  getClinicInvitationsByEmail,
  createUserFromInvitation,
} from '@/lib/db/queries';
import { authConfig } from './auth.config';
import { DUMMY_PASSWORD } from '@/lib/shared/constants';
import type { DefaultJWT } from 'next-auth/jwt';
import { getPermissionsForRole, type Permission } from '@/lib/permissions';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: 'secretary' | 'clinician' | 'admin' | 'owner';
      status?: 'active' | 'invited' | 'removed';
      permissions?: readonly Permission[];
      platformAdmin?: boolean;
    } & DefaultSession['user'];
    clinic: {
      id: string;
    };
    impersonation?: {
      user: {
        id: string;
        email: string;
        role: 'secretary' | 'clinician' | 'admin' | 'owner';
        permissions?: readonly Permission[];
        platformAdmin?: boolean;
      };
      clinic: {
        id: string;
      };
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
    email: string;
    role: 'secretary' | 'clinician' | 'admin' | 'owner';
    status: 'active' | 'invited' | 'removed';
    permissions?: readonly Permission[];
    platformAdmin?: boolean;
    clinicId: string;
    clinicName: string;
    impersonation?: {
      user: {
        id: string;
        email: string;
        role: 'secretary' | 'clinician' | 'admin' | 'owner';
        permissions?: readonly Permission[];
        platformAdmin?: boolean;
      };
      clinic: {
        id: string;
      };
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

        // Case 1: No existing user - check ClinicInvitation
        if (users.length === 0) {
          // Check for pending invitation with this email (case-insensitive)
          const [invitation] = await getClinicInvitationsByEmail({ email });

          if (!invitation) {
            // No invitation found
            await compare(password, DUMMY_PASSWORD); // Timing attack prevention
            return null;
          }

          // Only proceed if invitation has a temporary password (for new users)
          if (!invitation.temporaryPassword) {
            await compare(password, DUMMY_PASSWORD); // Timing attack prevention
            return null;
          }

          // Validate password against invitation's temporary password
          // Non-null assertion safe here because we checked above
          const passwordsMatch = await compare(
            password,
            invitation.temporaryPassword,
          );

          if (!passwordsMatch) {
            await compare(password, DUMMY_PASSWORD); // Timing attack prevention
            return null;
          }

          // Valid! Create User record from invitation
          const newUser = await createUserFromInvitation({
            invitationId: invitation.id,
          });

          return {
            id: newUser.id,
            email: newUser.email,
          };
        }

        // Case 2: Existing user - validate normally
        const [existingUser] = users;

        if (!existingUser.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, existingUser.password);

        if (!passwordsMatch) return null;

        // TODO: currently disable email verification since we don't send emails
        // // Check if email is verified
        // if (!existingUser.emailVerified) {
        //   return null;
        // }

        const clinic = await getClinicByUserId({
          userId: existingUser.id,
        });

        // If user is removed, allow login (they can access /create-clinic)
        if (existingUser.status === 'removed') {
          return {
            id: existingUser.id,
            email: existingUser.email,
          };
        }

        // For other statuses, check if clinic is authorized
        if (!clinic?.authorized) {
          return null;
        }

        return {
          id: existingUser.id,
          email: existingUser.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;

        // Fetch user from database to check platformAdmin status, role, and clinic
        if (user.id) {
          const dbUser = await getUserById({ userId: user.id });
          if (dbUser?.platformAdmin) {
            token.platformAdmin = true;
          }

          // Set role, status, and permissions
          if (dbUser?.role) {
            token.role = dbUser.role;
            token.status = dbUser.status;
            token.permissions = getPermissionsForRole(dbUser.role);
            token.clinicId = dbUser.clinicId;
          }

          // Fetch clinic name
          if (dbUser?.clinicId) {
            const clinic = await getClinicByUserId({ userId: dbUser.id });
            if (clinic?.clinicName) {
              token.clinicName = clinic.clinicName;
            }
          }
        }
      }

      // Handle session updates (used for starting/stopping impersonation and status changes)
      if (trigger === 'update') {
        // Refresh all user data from database (e.g., after status change, clinic change)
        if (token.id && !session?.impersonation) {
          const dbUser = await getUserById({ userId: token.id });
          if (dbUser) {
            token.status = dbUser.status;
            token.role = dbUser.role;
            token.clinicId = dbUser.clinicId;
            token.permissions = getPermissionsForRole(dbUser.role);
            token.platformAdmin = dbUser.platformAdmin;

            // Fetch updated clinic name
            const clinic = await getClinicByUserId({ userId: dbUser.id });
            if (clinic?.clinicName) {
              token.clinicName = clinic.clinicName;
            }
          }
        }

        if (session?.impersonation !== undefined) {
          // If starting impersonation, save original user data and swap to target user
          if (session.impersonation) {
            const targetUserId = session.impersonation.user.id;
            const targetEmail = session.impersonation.user.email;

            // Save original admin's data
            token.impersonation = {
              user: {
                id: token.id,
                email: token.email || '',
                role: token.role,
                permissions: token.permissions,
                platformAdmin: token.platformAdmin,
              },
              clinic: {
                id: token.clinicId,
              },
              startedAt: session.impersonation.startedAt,
            };

            // Swap token to target user's identity
            token.id = targetUserId;
            token.email = targetEmail;
            token.platformAdmin = undefined; // Don't pass platformAdmin when impersonating
            token.role = session.impersonation.user.role;
            token.permissions = getPermissionsForRole(
              session.impersonation.user.role,
            );

            // Use clinic from impersonation data (already complete from API)
            token.clinicId = session.impersonation.clinic.id;
            token.clinicName = session.impersonation.clinic.name;
          } else {
            // Exiting impersonation - restore original user's data
            if (token.impersonation) {
              token.id = token.impersonation.user.id;
              token.email = token.impersonation.user.email;
              token.platformAdmin = token.impersonation.user.platformAdmin;
              token.role = token.impersonation.user.role;
              token.permissions = token.impersonation.user.permissions;
              token.clinicId = token.impersonation.clinic.id;
            }
            // Clear impersonation
            token.impersonation = undefined;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email || '';

        // Only include platformAdmin if true (omit for regular users)
        if (token.platformAdmin) {
          session.user.platformAdmin = true;
        }

        // Add role, status, and permissions
        if (token.role) {
          session.user.role = token.role;
        }
        if (token.status) {
          session.user.status = token.status;
        }
        if (token.permissions) {
          session.user.permissions = token.permissions;
        }

        // Add clinic info
        if (token.clinicId) {
          session.clinic = {
            id: token.clinicId,
          };
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
