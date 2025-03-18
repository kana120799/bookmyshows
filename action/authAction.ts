"use server";
import { signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function loginWithCredentials(
  email: string | null,
  password: string | null
) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    throw new Error(
      "Login failed: " +
        (error instanceof Error ? error.message : "Unknown error")
    );
  }
}

export async function loginWithGoogle() {
  try {
    await signIn("google", { redirectTo: "/" });
  } catch (error) {
    // isRedirectError is a helper function from Next.js that tells us, "Hey, this error is just for redirecting, not a real problem."
    // signIn (e.g., for Google login), Next.js throws a NEXT_REDIRECT error to move the user to another page (like Google’s login page).
    // If you catch this error in a try/catch, the redirect stops unless you let it through. isRedirectError helps you say, "If it’s a redirect,
    //  let it happen; otherwise, handle the error.
    if (isRedirectError(error)) {
      throw error; // Next.js handle this redirect
    }
    throw error; //  other errors (e.g., network issues)
  }
}

export async function logout() {
  try {
    // await signOut();
    // redirect("/");
    await signOut({ redirect: true, redirectTo: "/" });
  } catch (error) {
    console.error("signOut error:", error);
    throw error;
  }
}
