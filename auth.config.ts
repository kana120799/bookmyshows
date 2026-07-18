
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/",
        signOut: "/",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                if (session.user) {
                    session.user.id = token.id as string;
                    session.user.name = token.name as string;
                    session.user.email = token.email as string;
                    session.user.role = token.role as string;
                }
            }
            return session;
        },
        async redirect({ baseUrl }) {
            return baseUrl;
        },
    },
    providers: [], // Providers configured in auth.ts
    trustHost: true,
} satisfies NextAuthConfig;
