import React, { ReactNode } from "react";

interface AdminDashboardProps {
  children: ReactNode;
}

function AdminDashboard({ children }: AdminDashboardProps) {
  return <>{children}</>;
}

export default AdminDashboard;
