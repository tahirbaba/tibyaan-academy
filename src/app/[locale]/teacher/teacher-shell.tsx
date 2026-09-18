"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Users,
  Calendar,
  BookOpen,
  ClipboardCheck,
  DollarSign,
  Video,
  Disc,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  ChevronLeft,  TrendingUp,
  FileText,
} from "lucide-react";
import { NotificationBell } from "@/components/shared/notification-bell";

const navItems = [
  { key: "sidebarDashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
  { key: "sidebarStudents", href: "/teacher/students", icon: Users },
  { key: "sidebarSchedule", href: "/teacher/schedule", icon: Calendar },
  { key: "sidebarLessons", href: "/teacher/lessons", icon: BookOpen },
  { key: "sidebarTrackProgress", href: "/teacher/track-progress", icon: TrendingUp },
  { key: "sidebarTests", href: "/teacher/tests", icon: ClipboardCheck },
  { key: "sidebarTestsAssignments", href: "/teacher/tests-assignments", icon: FileText },
  { key: "sidebarVideos", href: "/teacher/videos", icon: Video },
  { key: "sidebarRecordings", href: "/teacher/recordings", icon: Disc },
  { key: "sidebarRevenue", href: "/teacher/revenue", icon: DollarSign },
];

export function TeacherShell({
  children,
  userName,
  userEmail,
  userInitial,
  userId,
  locale,
}: {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  userInitial: string;
  userId: string;
  locale: string;
}) {
  const t = useTranslations("teacher");
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 start-0 z-50 flex flex-col bg-sidebar border-e border-sidebar-border transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "w-[68px]" : "w-64"}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0">
            <span className="text-sidebar-accent-foreground font-bold text-sm">
              TA
            </span>
          </div>
          {!collapsed && (
            <span className="text-sidebar-foreground font-bold text-lg">
              Tibyaan
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex ms-auto text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ms-auto text-sidebar-foreground/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/teacher/dashboard" &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{t(item.key)}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-sidebar-border p-3 shrink-0">
          <div
            className={`flex items-center gap-3 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
              <span className="text-sidebar-accent-foreground text-xs font-bold">
                {userInitial}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {userName}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {userEmail}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-foreground hidden sm:block">
              {t("title")}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="w-5 h-5 hidden dark:block" />
              <Moon className="w-5 h-5 dark:hidden" />
            </Button>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                <LogOut className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
