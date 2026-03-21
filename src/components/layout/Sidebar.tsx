"use client";

import Link from "next/link";
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
  Settings,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/sleep", icon: BedDouble, label: "Sleep" },
  { href: "/activity", icon: Activity, label: "Activity" },
  { href: "/readiness", icon: Zap, label: "Readiness" },
  { href: "/heart-rate", icon: Heart, label: "Heart Rate" },
  { href: "/stress", icon: Brain, label: "Stress" },
  { href: "/workouts", icon: Dumbbell, label: "Workouts" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen z-40 flex flex-col",
        "bg-white/90 dark:bg-[#0d0d14]/90 backdrop-blur-2xl",
        "border-r border-slate-200/60 dark:border-slate-800/40",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-200/60 dark:border-slate-800/40">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-oura-500 to-accent-violet flex items-center justify-center shadow-lg shadow-oura-500/20 flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="font-bold text-lg tracking-tight">Oura</h1>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Analytics
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "nav-link",
              pathname === href && "active",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}

        <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-800/40">
          <Link
            href="/settings"
            className={cn(
              "nav-link",
              pathname === "/settings" && "active",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </nav>

      {/* Bottom section */}
      <div className="p-3 space-y-2 border-t border-slate-200/60 dark:border-slate-800/40">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            "nav-link w-full",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : undefined}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 flex-shrink-0 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 flex-shrink-0 text-slate-500" />
          )}
          {!collapsed && (
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          )}
        </button>

        {/* User */}
        {session?.user && (
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl",
              "bg-slate-50 dark:bg-white/5",
              collapsed && "justify-center px-0"
            )}
          >
            {session.user.image && (
              <img
                src={session.user.image}
                alt=""
                className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-slate-800 flex-shrink-0"
              />
            )}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session.user.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {session.user.email}
                </p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "nav-link w-full text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="nav-link w-full justify-center"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
