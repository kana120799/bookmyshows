"use client";
import { Calendar, Home, LayoutDashboard, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Import usePathname

const items = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Cinema",
    url: "/admin/cinema",
    icon: Home,
  },
  {
    title: "Show",
    url: "/admin/show",
    icon: Calendar,
  },
  {
    title: "Booking",
    url: "/admin/booking",
    icon: Settings,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname(); // Get current pathname

  return (
    <Sidebar className="bg-gray-900 text-white w-64 min-h-screen border-r border-gray-800">
      <SidebarContent>
        <SidebarGroup className="py-6">
          <SidebarGroupLabel className="text-red-500 text-3xl font-bold px-6 mb-10 tracking-tight">
            BookMyShow
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                // Check if current item is active
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title} className="mb-2">
                    <SidebarMenuButton
                      asChild
                      className={`w-full justify-start px-6 py-3 rounded-lg group transition-colors duration-200
                        ${
                          isActive
                            ? "bg-gray-200 text-white border-r-2 border-l-2 border-gray-500"
                            : "text-gray-200 hover:bg-gray-200 hover:text-white"
                        }`}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        {/* <item.icon
                          className={`h-5 w-5 transition-colors duration-200
                            ${
                              isActive
                                ? "text-red-500"
                                : "text-gray-400 group-hover:text-red-500"
                            }`}
                        /> */}
                        <span
                          className={`text-xl font-semibold
                            ${"text-gray-700"}`}
                        >
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
