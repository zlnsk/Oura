"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { StatusChip } from "@/components/ui/StatusChip";
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

function ConnectionStatus() {
  const { loading, isOffline, isStale, error, lastUpdated } = useOuraData();

  let variant: "synced" | "syncing" | "stale" | "offline" | "error" = "synced";
  let label: string | undefined;

  if (isOffline) {
    variant = "offline";
  } else if (error) {
    variant = "error";
    label = "Sync failed";
  } else if (loading) {
    variant = "syncing";
  } else if (isStale) {
    variant = "stale";
    if (lastUpdated) {
      const mins = Math.round((Date.now() - lastUpdated) / 60000);
      label = mins < 60 ? `${mins}m ago` : `${Math.round(mins / 60)}h ago`;
    }
  } else if (lastUpdated) {
    const mins = Math.round((Date.now() - lastUpdated) / 60000);
    if (mins < 2) label = "Just now";
    else if (mins < 60) label = `${mins}m ago`;
    else label = `${Math.round(mins / 60)}h ago`;
  }

  return (
    <div className="fixed top-4 right-8 z-40">
      <StatusChip variant={variant} label={label} />
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
      <ConnectionStatus />
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
