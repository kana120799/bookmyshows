"use client";

// import { updateProfile } from "@/app/api/profile/controller";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    setUserData({
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      password: "",
    });
  }, []);
  console.log(userData);
  //   const handleSubmit = async (data: typeof userData) => {
  //     try {
  //       console.log(data);
  //       // Replace "user-id-here" with actual user ID from auth
  //       //   await updateProfile("user-id-here", data);
  //       alert("Profile updated successfully!");
  //       // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     } catch (error) {
  //       alert("Failed to update profile");
  //     }
  //   };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {/* <ProfileForm initialData={userData} onSubmit={handleSubmit} /> */}
    </div>
  );
}
