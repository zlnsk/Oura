"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { OuraDataProvider } from "@/components/layout/OuraDataProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <OuraDataProvider>{children}</OuraDataProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
