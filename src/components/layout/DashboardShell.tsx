"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useOuraData } from "@/components/layout/OuraDataProvider";

function LoadingBar() {
  const { loading } = useOuraData();

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px]">
      <div className="h-full bg-oura-500 animate-loading-bar" />
    </div>
  );
}

function OfflineBanner() {
  const { isOffline, isStale, lastUpdated } = useOuraData();

  if (!isOffline && !isStale) return null;

  const timeLabel = lastUpdated
    ? new Date(lastUpdated).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "unknown";

  return (
    <div className="fixed top-0 left-64 right-0 z-40 px-4 py-2 text-xs text-center font-medium bg-[var(--bg-elevated)] text-amber-700 dark:text-amber-300">
      {isOffline
        ? `You are offline. Showing cached data from ${timeLabel}.`
        : `Showing cached data from ${timeLabel}. Pull to refresh.`}
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-oura-50 dark:bg-oura-500/10 animate-pulse" />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <LoadingBar />
      <OfflineBanner />
      <Sidebar />
      <main className="ml-64 p-8 lg:p-10 transition-all duration-300">
        <div className="max-w-[1400px] mx-auto">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
