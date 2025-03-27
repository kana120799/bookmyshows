"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { handleSignOut } from "@/action/SignOut";
import axios from "axios";

interface UserProfile {
  name: string;
  email: string;
  password?: string;
}

const UpdateProfile = () => {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState<UserProfile>({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  // const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        password: "",
      });
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "authenticated" || !session?.user?.id) return;

    setIsLoading(true);

    try {
      const response = await axios.put("/api/users/profile", {
        id: session.user.id,
        ...formData,
      });

      if (response.status === 200) {
        alert("Profile updated successfully");
        await handleSignOut();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleDeleteAccount = async () => {
  //   if (status !== "authenticated" || !session?.user?.id) return;

  //   const confirmed = window.confirm(
  //     "Are you sure you want to delete your account? This action cannot be undone."
  //   );

  //   if (!confirmed) return;

  //   setIsDeleting(true);

  //   try {
  //     const response = await axios.delete("/api/user/profile", {
  //       data: { id: session.user.id },
  //     });

  //     if (response.status === 200) {
  //       alert("Account deleted successfully");
  //       await handleSignOut();
  //     }
  //   } catch (error) {
  //     console.error("Error deleting account:", error);
  //     alert("Failed to delete account");
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

  if (status === "loading") {
    return <div className="text-center mt-16">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="text-center mt-16">
        Please sign in to update your profile
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg min-h-[33rem] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Update Profile</h2>
        {/* <button
          onClick={handleDeleteAccount}
          disabled={isLoading || isDeleting}
          className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isDeleting ? "Deleting..." : "Delete Account"}
        </button> */}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 flex-grow">
        <div>
          <label
            htmlFor="name"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="block w-full h-12 px-4 text-lg rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
            required
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full h-12 px-4 text-lg rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            New Password (optional)
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="block w-full h-12 px-4 text-lg rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
            placeholder="Leave blank to keep current password"
          />
        </div>

        <button
          type="submit"
          // disabled={isLoading || isDeleting}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default UpdateProfile;
