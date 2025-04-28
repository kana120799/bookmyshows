"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { handleSignOut } from "@/action/SignOut";
import axios from "axios";
import {
  User,
  Mail,
  Lock,
  Bell,
  Trash2,
  LogOut,
  Save,
  Edit,
} from "lucide-react";
import Loader from "./Loader";
import { toast } from "react-toastify";

interface UserProfile {
  name: string;
  email: string;
  password?: string;
  notificationsEnabled: boolean;
}

const UpdateProfile = () => {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState<UserProfile>({
    name: "",
    email: "",
    password: "",
    notificationsEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refetchUser, setRefetchUser] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function FetchUserDetails() {
    try {
      const response = await axios.get(
        `/api/users/profile?id=${session?.user.id}`
      );
      if (response.data?.user) {
        setFormData({
          name: response.data.user.name || "",
          email: response.data.user.email || "",
          password: "",
          notificationsEnabled: response.data.user.notificationsEnabled ?? true,
        });
        setFormData((prev) => ({
          ...prev,
          notificationsEnabled: response.data.user.notificationsEnabled,
        }));
        setSuccessMessage("");
      }
    } catch (error) {
      console.error("Error updating notification settings:", error);
    } finally {
      setIsLoading(false);
      setRefetchUser(false);
      setEditMode(false);
    }
  }

  useEffect(() => {
    if (session?.user.id) FetchUserDetails();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleNotifications = async () => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const newNotificationStatus = !formData.notificationsEnabled;
    setRefetchUser(true);
    try {
      await axios.put("/api/users/profile", {
        id: session.user.id,
        notificationsEnabled: newNotificationStatus,
      });
    } catch (error) {
      console.error("Error updating notification settings:", error);
    } finally {
      if (session?.user.id) await FetchUserDetails();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "authenticated" || !session?.user?.id) return;

    setIsLoading(true);

    try {
      const updateData = {
        id: session.user.id,
        name: formData.name,
        email: formData.email,
        ...(formData.password && { password: formData.password }),
      };

      const response = await axios.put("/api/users/profile", updateData);

      if (response.status === 200) {
        setSuccessMessage("Profile updated successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
        setEditMode(false);
        setFormData((prev) => ({ ...prev, password: "" }));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.warn("Failed to update profile", {
        toastId: "auth-warning",
      });
    } finally {
      setIsLoading(false);
      toast.warn("Profile updated successfully. Login Again... ", {
        toastId: "auth-warning",
      });
      handleSignOut();
    }
  };

  const handleDeleteAccount = async () => {
    toast.warn("This Service Not Available Now...", {
      toastId: "auth-warning",
    });
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          Please sign in to view your profile
        </p>
      </div>
    );
  }
  if (refetchUser) return <Loader />;
  return (
    <div className="max-w-4xl mx-auto my-8 p-6">
      <div className="flex flex-col space-y-4 mb-8">
        <h2 className="text-3xl font-bold text-gray-800">User Profile</h2>
        <p className="text-gray-600">Manage your account settings</p>
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <User className="text-gray-600" size={20} />
              <span>Personal Information</span>
            </h3>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>
            ) : (
              <button
                onClick={() => setEditMode(false)}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold">
                {formData?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-grow">
                {editMode ? (
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full h-12 px-4 text-lg rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                    required
                  />
                ) : (
                  <h4 className="text-xl font-semibold">{formData.name}</h4>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="flex items-center space-x-2 text-gray-600 mb-2 text-sm font-medium"
                >
                  <Mail size={16} />
                  <span>Email Address</span>
                </label>
                {editMode ? (
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                    required
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700">
                    {formData.email}
                  </p>
                )}
              </div>

              {editMode && (
                <div>
                  <label
                    htmlFor="password"
                    className="flex items-center space-x-2 text-gray-600 mb-2 text-sm font-medium"
                  >
                    <Lock size={16} />
                    <span>New Password (Optional)</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                    placeholder="Leave blank to keep current password"
                  />
                </div>
              )}
            </div>

            {editMode && (
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Settings Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
              <Bell className="text-gray-600" size={20} />
              <span>Notification Settings</span>
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Email Notifications</p>
                <p className="text-sm text-gray-500 mt-1">
                  {formData.notificationsEnabled
                    ? "Currently receiving notifications"
                    : "Notifications are disabled"}
                </p>
              </div>
              <button
                onClick={toggleNotifications}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  formData.notificationsEnabled
                    ? "bg-indigo-600"
                    : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.notificationsEnabled
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
              <LogOut className="text-gray-600" size={20} />
              <span>Session</span>
            </h3>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
              <Trash2 className="text-red-600" size={20} />
              <span>Danger Zone</span>
            </h3>
            <div className="space-y-4">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200 disabled:bg-gray-100 disabled:text-gray-400"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete Account</span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
