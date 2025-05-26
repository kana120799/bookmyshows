import { loginWithCredentials, loginWithGoogle } from "@/action/authAction";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .refine((value) => value.endsWith("@gmail.com"), {
      message: "Email must end with @gmail.com",
    }),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[@$!%*?&]/,
      "Password must contain at least one special character (@$!%*?&)"
    ),
});

interface LoginProps {
  toggleCredential: boolean;
  isLoading: boolean;
  setIsLoginVisible: (value: boolean) => void;
  setToggleCredential: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
}

function Login({
  toggleCredential,
  setToggleCredential,
  setIsLoginVisible,
  setIsLoading,
  isLoading,
}: LoginProps) {
  const { update } = useSession();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  // const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   setErrors({});

  //   const formData = new FormData(e.currentTarget);
  //   const data = {
  //     email: formData.get("email") as string,
  //     password: formData.get("password") as string,
  //   };

  //   const validation = loginSchema.safeParse(data);

  //   if (!validation.success) {
  //     const fieldErrors: Record<string, string> = {};
  //     validation.error.issues.forEach((issue) => {
  //       fieldErrors[issue.path[0]] = issue.message;
  //     });
  //     setErrors(fieldErrors);
  //     setIsLoading(false);
  //     return;
  //   }

  //   try {
  //     await loginWithCredentials(data.email, data.password);
  //     setIsLoginVisible(false);
  //     await update(); // Ensure session is updated
  //     router.push("/");
  //     // router.refresh();  // forcing a re-render
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   } catch (error) {
  //     setErrors({
  //       general: "Login failed. Please check your credentials and try again.",
  //     });
  //     setIsLoading(false);
  //   }
  // };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validation = loginSchema.safeParse(data);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      await loginWithCredentials(data.email, data.password);

      // Update the session and wait for it to complete
      const updatedSession = await update();

      if (updatedSession?.user) {
        setIsLoginVisible(false);
        if (updatedSession.user.role === "ADMIN") {
          router.push("/admin/cinema");
        } else {
          router.push("/customer/home/mumbai");
        }
      } else {
        throw new Error("Session update failed");
      }
    } catch (error) {
      console.log(error);
      setErrors({
        general: "Login failed. Please check your credentials and try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto rounded-lg shadow-lg p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 min-w-[32rem]">
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">
        Login
      </h2>
      <form className="space-y-6" onSubmit={handleLogin}>
        <div>
          <Label
            htmlFor="email"
            className="text-lg font-medium text-gray-700 dark:text-gray-300"
          >
            Email Address
          </Label>
          <Input
            id="email"
            placeholder="example123@gmail.com"
            type="email"
            name="email"
            className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 h-14 rounded-md shadow-sm text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            style={{ fontSize: "1.5rem" }}
          />
          {errors.email && (
            <p className="mt-1 text-lg text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <Label
            htmlFor="password"
            className="text-lg font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </Label>
          <Input
            id="password"
            placeholder="password"
            type="password"
            name="password"
            className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 h-14 rounded-md shadow-sm text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            style={{ fontSize: "1.5rem" }}
          />
          {errors.password && (
            <p className="mt-1 text-lg text-red-600">{errors.password}</p>
          )}
        </div>

        {errors.general && (
          <p className="text-lg text-red-600 text-center">{errors.general}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Login..." : "Login →"}
        </button>

        <p className="text-center text-lg text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setToggleCredential(!toggleCredential)}
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Register
          </button>
        </p>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-lg">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-lg font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="mr-2"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 2a9.96 9.96 0 0 1 6.29 2.226a1 1 0 0 1 .04 1.52l-1.51 1.362a1 1 0 0 1 -1.265 .06a6 6 0 1 0 2.103 6.836l.001 -.004h-3.66a1 1 0 0 1 -.992 -.883l-.007 -.117v-2a1 1 0 0 1 1 -1h6.945a1 1 0 0 1 .994 .89c.04 .367 .061 .737 .061 1.11c0 5.523 -4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10z" />
          </svg>
          Continue with Google
        </button>
      </form>
    </div>
  );
}

export default Login;
