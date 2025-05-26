// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { prisma } from "@/lib/prisma";
// import { comparePassword, hashedPassword } from "./action/hash";
// // import { dbQueryErrors } from "@/lib/metrics";

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   trustHost: true,
//   providers: [
//     GoogleProvider({
//       clientId: process.env.AUTH_GOOGLE_ID,
//       clientSecret: process.env.AUTH_GOOGLE_SECRET,
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         try {
//           if (!credentials?.email || !credentials?.password) {
//             throw new Error("Missing email or password");
//           }

//           const { email, password } = credentials as {
//             email: string;
//             password: string;
//           };

//           // Admin login
//           if (
//             email === process.env.ADMIN_EMAIL &&
//             password === process.env.ADMIN_PASSWORD
//           ) {
//             let user = await prisma.user.findUnique({
//               where: { email },
//             });

//             if (user) {
//               if (await comparePassword(password, user.password as string)) {
//                 return {
//                   id: user.id,
//                   name: user.name,
//                   email: user.email,
//                   role: "ADMIN",
//                   // notificationsEnabled: user.notificationsEnabled,
//                 };
//               }
//             } else {
//               const hashedPw = await hashedPassword(password);
//               user = await prisma.user.create({
//                 data: {
//                   name: "Admin",
//                   email,
//                   password: hashedPw,
//                   role: "ADMIN",
//                 },
//               });
//               return {
//                 id: user.id,
//                 name: user.name,
//                 email: user.email,
//                 // notificationsEnabled: user.notificationsEnabled,
//                 role: "ADMIN",
//               };
//             }
//           }

//           // Regular user login
//           const user = await prisma.user.findUnique({ where: { email } });
//           if (!user || !user.password) {
//             // dbQueryErrors.inc({
//             //   model: "user",
//             //   error_type: "Invalid credentials",
//             // });

//             throw new Error("Invalid credentials");
//           }

//           if (!(await comparePassword(password, user.password))) {
//             throw new Error("Invalid credentials");
//           }

//           return {
//             id: user.id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             // notificationsEnabled: user.notificationsEnabled,
//           };
//         } catch (error) {
//           console.error("Authorize error:", error);
//           throw new Error("Authentication failed");
//         }
//       },
//     }),
//   ],
//   pages: {
//     signIn: "/",
//     signOut: "/",
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.name = user.name;
//         token.email = user.email;
//         token.role = user.role;
//         // token.notificationsEnabled = user.notificationsEnabled;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id as string;
//         session.user.name = token.name as string;
//         session.user.email = token.email as string;
//         session.user.role = token.role as string;
//         // session.user.notificationsEnabled = token.notificationsEnabled as boolean;
//       }
//       return session;
//     },
//     async signIn({ user, account }) {
//       if (account?.provider === "google") {
//         const email = user.email;
//         if (!email) return false;

//         let dbUser = await prisma.user.findUnique({ where: { email } });
//         if (!dbUser) {
//           dbUser = await prisma.user.create({
//             data: {
//               name: user?.name as string,
//               email,
//               role: "CUSTOMER",
//             },
//           });
//         }
//         user.id = dbUser.id;
//         user.name = dbUser.name;
//         user.email = dbUser.email;
//         user.role = dbUser.role;
//         // user.notificationsEnabled = dbUser.notificationsEnabled;

//         return true;
//       }
//       return true;
//     },
//     async redirect({ baseUrl }) {
//       console.log("Redirecting to:", baseUrl);
//       return baseUrl;
//     },
//   },
// });

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { comparePassword, hashedPassword } from "./action/hash";

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
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("Authorize: Missing email or password");
            return null; // Return null instead of throwing to avoid triggering stack frame requests
          }

          const { email, password } = credentials as {
            email: string;
            password: string;
          };

          // Validate environment variables
          if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
            console.error(
              "Authorize: Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variables"
            );
            return null;
          }

          // Admin login
          if (email === process.env.ADMIN_EMAIL) {
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
              console.error("Authorize: Invalid admin password");
              return null;
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
            console.error("Authorize: User not found or no password set");
            return null;
          }

          if (!(await comparePassword(password, user.password))) {
            console.error("Authorize: Invalid password");
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null; // Return null to prevent middleware errors
        }
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
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const email = user.email;
          if (!email) {
            console.error("Google signIn: Missing email");
            return false;
          }

          let dbUser = await prisma.user.findUnique({ where: { email } });
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                name: user?.name ?? "Google User", // Fallback if name is missing
                email,
                role: "CUSTOMER",
              },
            });
          }
          user.id = dbUser.id;
          user.name = dbUser.name;
          user.email = dbUser.email;
          user.role = dbUser.role;
          return true;
        } catch (error) {
          console.error("Google signIn error:", error);
          return false;
        }
      }
      return true;
    },
    async redirect({ baseUrl }) {
      console.log("Redirecting to:", baseUrl);
      return baseUrl;
    },
  },
});
