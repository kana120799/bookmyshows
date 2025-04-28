"use client";

import { Toaster } from "sonner";

const ToastProvider = () => {
  return (
    <Toaster
      position="top-center"
      richColors // Enhances default colors
      toastOptions={{
        classNames: {
          warning: "custom-warning-toast", // Custom class for warning toasts
        },
      }}
    />
  );
};

export default ToastProvider;
