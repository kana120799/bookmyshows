import { Calendar, Home, Search, Settings } from "lucide-react";

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

// Menu items.
const items = [
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
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-red-500 text-2xl mb-7">
            BookMyShow
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="pb-5">
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <span className="text-xl ">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
