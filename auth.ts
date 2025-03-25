import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { comparePassword, hashedPassword } from "./action/hash";
// import { dbQueryErrors } from "@/lib/metrics";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        // Admin login
        if (
          email === process.env.ADMIN_EMAIL &&
          password === process.env.ADMIN_PASSWORD
        ) {
          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            if (await comparePassword(password, user.password as string)) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: "ADMIN",
              };
            }
          } else {
            const hashedPw = await hashedPassword(password);
            user = await prisma.user.create({
              data: {
                name: "Admin",
                email,
                password: hashedPw,
                role: "ADMIN",
              },
            });
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: "ADMIN",
            };
          }
        }

        // Regular user login
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
          // dbQueryErrors.inc({
          //   model: "user",
          //   error_type: "Invalid credentials",
          // });

          throw new Error("Invalid credentials");
        }

        if (!(await comparePassword(password, user.password))) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/",
    signOut: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;

        let dbUser = await prisma.user.findUnique({ where: { email } });
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              name: user?.name as string,
              email,
              role: "CUSTOMER",
            },
          });
        }
        user.id = dbUser.id;
        user.role = dbUser.role;
        return true;
      }
      return true;
    },
    async redirect({ baseUrl }) {
      console.log("Redirecting to:", baseUrl);
      return baseUrl;
    },
  },
});
