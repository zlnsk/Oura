"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { OuraDataProvider } from "@/components/layout/OuraDataProvider";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ToastProvider>
          <OuraDataProvider>{children}</OuraDataProvider>
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
