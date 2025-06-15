"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  UtensilsCrossed,
  QrCode,
  ClipboardList,
  LogOut,
  Hotel,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Menu Management", href: "/admin/menu", icon: UtensilsCrossed },
  { name: "Tables", href: "/admin/tables", icon: QrCode },
  { name: "Orders", href: "/admin/orders", icon: ClipboardList },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-amber-600 shadow-md">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-2">
            <Hotel className="h-8 w-8 text-white" />
            <h1 className="text-xl font-bold text-white">Amber Hotels</h1>
          </div>
          <Button
            variant="ghost"
            className="text-white hover:bg-amber-700"
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:min-h-screen"
        )}
      >
        <div className="hidden lg:flex h-16 items-center justify-center border-b border-gray-200 bg-amber-600">
          <div className="flex items-center space-x-2">
            <Hotel className="h-8 w-8 text-white" />
            <h1 className="text-xl font-bold text-white">Amber Hotels</h1>
          </div>
        </div>

        <nav className="mt-8 px-4 space-y-2 lg:mt-8">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-amber-50 text-amber-700 border-r-2 border-amber-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full text-gray-600 border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64 pt-16 lg:pt-0">
        <main className="py-8 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};
