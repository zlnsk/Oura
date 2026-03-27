"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, memo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { StatusChip } from "@/components/ui/StatusChip";
import { useOuraData } from "@/components/layout/OuraDataProvider";

const LoadingBar = memo(function LoadingBar() {
  const { loading } = useOuraData();
  if (!loading) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px]">
      <div className="h-full bg-gray-900 dark:bg-white animate-loading-bar" />
    </div>
  );
});

const ConnectionStatus = memo(function ConnectionStatus() {
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
    <div className="fixed top-4 right-4 sm:right-8 z-40">
      <StatusChip variant={variant} label={label} />
    </div>
  );
});

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
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-white animate-spin" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <LoadingBar />
      <ConnectionStatus />
      <Sidebar />
      <main
        id="main-content"
        className="lg:ml-64 p-4 pt-16 sm:p-6 sm:pt-16 lg:p-8 lg:pt-8 xl:p-10 transition-all duration-200"
      >
        <div className="max-w-[1400px] mx-auto">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
