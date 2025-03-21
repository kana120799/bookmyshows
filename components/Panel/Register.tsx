import { loginWithCredentials } from "@/action/authAction";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, useState } from "react";
import { z } from "zod";

const registerSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "First name is required"),
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

function Register({
  toggleCredential,
  setToggleCredential,
  setIsLoginVisible,
  isLoading,
  setIsLoading,
}: LoginProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      firstname: formData.get("firstname") as string,
      lastname: formData.get("lastname") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // Validate form data with Zod
    const validation = registerSchema.safeParse(data);

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
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.firstname,
        }),
      });

      if (res.ok) {
        await loginWithCredentials(data.email, data.password);
        setIsLoginVisible(false);
      } else {
        const { error } = await res.json();
        alert(error);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setIsLoading(false);
      alert("An error occurred during registration");
    }
  };

  return (
    <div className="mx-auto rounded-lg shadow-lg p-8 bg-white dark:bg-gray-900 border border-gray-200 min-w-[36rem] dark:border-gray-700">
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">
        Register
      </h2>
      <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-6">
        Please provide all the necessary information
      </p>

      <form className="space-y-6" onSubmit={handleRegister}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label
              htmlFor="firstname"
              className="text-lg font-medium text-gray-700 dark:text-gray-300"
            >
              First Name
            </Label>
            <Input
              id="firstname"
              placeholder="Tyler"
              type="text"
              name="firstname"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 h-14 rounded-md shadow-sm text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              style={{ fontSize: "1.5rem" }}
            />
            {errors.firstname && (
              <p className="mt-1 text-sm text-red-600">{errors.firstname}</p>
            )}
          </div>
          <div className="flex-1">
            <Label
              htmlFor="lastname"
              className="text-lg font-medium text-gray-700 dark:text-gray-300"
            >
              Last Name
            </Label>
            <Input
              id="lastname"
              placeholder="Durden"
              type="text"
              name="lastname"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 h-14 rounded-md shadow-sm text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              style={{ fontSize: "1.5rem" }}
            />
            {errors.lastname && (
              <p className="mt-1 text-sm text-red-600">{errors.lastname}</p>
            )}
          </div>
        </div>

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
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
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
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Signing up..." : "Sign up →"}
        </button>
        <p className="text-center text-lg text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => setToggleCredential(!toggleCredential)}
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}

export default Register;
