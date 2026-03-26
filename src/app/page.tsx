"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sparkles, ArrowRight, Shield, Zap, BarChart3 } from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (session) router.push("/dashboard");
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0f]">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-oura-500 to-accent-violet animate-pulse-slow" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-[#0a0a0f]">
      {/* Background effects — single subtle blob */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-oura-500/5 to-transparent" />
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-10 p-3 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-white/10 transition-all"
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-slate-600" />
        )}
      </button>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Logo & title */}
        <div className="animate-slide-up flex flex-col items-center mb-12">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-oura-500 via-oura-600 to-accent-violet flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-3">
            <span className="gradient-text">Oura</span>{" "}
            <span className="text-slate-400 dark:text-slate-500">Analytics</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 text-center max-w-md">
            Premium health insights powered by your Oura Ring data and AI analysis
          </p>
        </div>

        {/* Login card */}
        <div className="animate-slide-up w-full max-w-sm" style={{ animationDelay: "0.1s" }}>
          <div className="premium-card p-8">
            <button
              onClick={() => signIn("google")}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold transition-all duration-200 group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Sign in with Google</span>
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
            </button>

            <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-4">
              Sign in with any Google account to get started
            </p>
          </div>
        </div>

        {/* What you need */}
        <div className="animate-slide-up mt-16 max-w-2xl w-full" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wider text-center mb-4">What you need</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: BarChart3,
                title: "Google Account",
                desc: "Sign in with any Gmail or Google account",
                color: "#0c93e9",
                badge: "Required",
              },
              {
                icon: Shield,
                title: "Oura API Key",
                desc: "Personal access token from cloud.ouraring.com",
                color: "#10b981",
                badge: "Required",
              },
              {
                icon: Zap,
                title: "Anthropic API Key",
                desc: "For AI-powered health summaries (set by host)",
                color: "#8b5cf6",
                badge: "Optional",
              },
            ].map(({ icon: Icon, title, desc, color, badge }) => (
              <div
                key={title}
                className="premium-card p-5 text-center cursor-default relative"
              >
                <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badge === "Required" ? "bg-oura-500/10 text-oura-500" : "bg-slate-500/10 text-slate-400 dark:text-slate-500"}`}>
                  {badge}
                </span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold mb-1">{title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
