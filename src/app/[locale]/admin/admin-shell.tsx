"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { signOut } from "@/app/[locale]/(auth)/actions";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Bot,
  Star,
  Bell,
  Video,  UserCheck,
  CalendarClock,
  Activity,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  Shield,
  MessageSquare,
  Users2,
  Award,
  AlertCircle,
  RefreshCw,
  ClipboardList,
  FileCheck,
} from "lucide-react";
import { NotificationBell } from "@/components/shared/notification-bell";

const navItems = [
  { key: "sidebarDashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { key: "sidebarUsers", href: "/admin/users", icon: Users },
  { key: "sidebarCourses", href: "/admin/courses", icon: BookOpen },
  { key: "sidebarVideos", href: "/admin/videos", icon: Video },
  { key: "sidebarContentReview", href: "/admin/content-review", icon: FileCheck },
  { key: "sidebarClassRecordings", href: "/admin/class-recordings", icon: Video },
  { key: "sidebarMatches", href: "/admin/matches", icon: UserCheck },
  { key: "sidebarScheduleRequests", href: "/admin/schedule-requests", icon: CalendarClock },
  { key: "sidebarScheduleChanges", href: "/admin/schedule-change-requests", icon: RefreshCw },
  { key: "sidebarComplaints", href: "/admin/complaints", icon: AlertCircle },
  { key: "sidebarDarsCircles", href: "/admin/dars-circles", icon: Users2 },
  { key: "sidebarCertificates", href: "/admin/certificates", icon: Award },
  { key: "sidebarAgents", href: "/admin/agents", icon: Activity },
  { key: "sidebarAIMonitor", href: "/admin/ai-monitor", icon: Bot },
  { key: "sidebarReviews", href: "/admin/reviews", icon: Star },
  { key: "sidebarNotifications", href: "/admin/notifications", icon: Bell },
  {
    key: "sidebarParentReports",
    href: "/admin/parent-reports",
    icon: MessageSquare,
  },
  {
    key: "sidebarEnrollmentRequests",
    href: "/admin/enrollment-requests",
    icon: ClipboardList,
  },
];

export function AdminShell({
  children,
  userName,
  userEmail,
  userInitial,
}: {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  userInitial: string;
}) {
  const t = useTranslations("admin");
  const locale = useLocale();
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
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "w-[68px]" : "w-64"}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-sidebar-foreground font-bold text-lg">
              Admin
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
              (item.href !== "/admin/dashboard" &&
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
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">
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
            {/* Notifications */}
            <NotificationBell />

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="w-5 h-5 hidden dark:block" />
              <Moon className="w-5 h-5 dark:hidden" />
            </Button>

            {/* Logout */}
            <form action={signOut.bind(null, locale)}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
