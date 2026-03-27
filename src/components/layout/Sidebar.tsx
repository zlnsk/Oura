"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/components/layout/ThemeProvider";
import {
  LayoutDashboard,
  Moon,
  Sun,
  BedDouble,
  Activity,
  Heart,
  Zap,
  Brain,
  Dumbbell,
  Scale,
  Settings,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { StatusBar } from "@/components/ui/StatusBar";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Today" },
  { href: "/sleep", icon: BedDouble, label: "Sleep" },
  { href: "/activity", icon: Activity, label: "Activity" },
  { href: "/readiness", icon: Zap, label: "Readiness" },
  { href: "/heart-rate", icon: Heart, label: "Heart Rate" },
  { href: "/stress", icon: Brain, label: "Stress" },
  { href: "/workouts", icon: Dumbbell, label: "Workouts" },
  { href: "/weight", icon: Scale, label: "Weight" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    if (mobileOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [mobileOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [mobileOpen]);

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-[var(--border)]">
        <div className="w-9 h-9 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4.5 h-4.5 text-white dark:text-gray-900" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="font-bold text-lg tracking-tight">Oura</h1>
            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              Analytics
            </p>
          </div>
        )}
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors lg:hidden"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 px-3 py-4 space-y-1 overflow-y-auto"
        role="navigation"
        aria-label="Main navigation"
      >
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "nav-link",
              pathname === href && "active",
              collapsed && "justify-center px-0 lg:justify-center lg:px-0"
            )}
            title={collapsed ? label : undefined}
            aria-current={pathname === href ? "page" : undefined}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}

        <div className="pt-4 mt-4 border-t border-[var(--border)]">
          <Link
            href="/settings"
            className={cn(
              "nav-link",
              pathname === "/settings" && "active",
              collapsed && "justify-center px-0 lg:justify-center lg:px-0"
            )}
            title={collapsed ? "Settings" : undefined}
            aria-current={pathname === "/settings" ? "page" : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 space-y-3 border-t border-[var(--border)]">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            "nav-link w-full",
            collapsed && "justify-center px-0"
          )}
          title={
            collapsed
              ? `Switch to ${theme === "dark" ? "light" : "dark"} mode`
              : undefined
          }
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 flex-shrink-0 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 flex-shrink-0 text-gray-400" />
          )}
          {!collapsed && (
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          )}
        </button>

        {/* User */}
        {session?.user && (
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl",
              "bg-gray-50 dark:bg-white/[0.03] border border-[var(--border)]",
              collapsed &&
                "justify-center px-0 border-0 bg-transparent dark:bg-transparent"
            )}
          >
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User avatar"}
                width={32}
                height={32}
                className="rounded-full ring-2 ring-white dark:ring-gray-800 flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800 flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400">
                {(session.user.name || "U")[0].toUpperCase()}
              </div>
            )}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session.user.name}
                </p>
                <p className="text-[11px] text-gray-400 truncate">
                  {session.user.email}
                </p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSignOut}
          className={cn(
            "nav-link w-full text-rose-500 dark:text-rose-400 hover:bg-rose-50/70 dark:hover:bg-rose-950/20",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Sign Out" : undefined}
          aria-label="Sign out"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="nav-link w-full justify-center hidden lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Status bar */}
      <div className="border-t border-[var(--border)]">
        <StatusBar collapsed={collapsed} />
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-full bg-white dark:bg-[#1c1c24] border border-[var(--border)] lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen z-50 flex flex-col",
          "bg-white dark:bg-[#0d0d14]",
          "border-r border-[var(--border)]",
          "transition-all duration-200 ease-out",
          // Mobile: slide in/out
          "max-lg:-translate-x-full max-lg:w-64",
          mobileOpen && "max-lg:translate-x-0",
          // Desktop: collapse
          collapsed ? "lg:w-[72px]" : "lg:w-64"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
